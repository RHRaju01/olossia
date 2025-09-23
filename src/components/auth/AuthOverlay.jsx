import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthRedux } from "../../hooks/useAuthRedux";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

export const AuthOverlay = ({ isOpen, onClose, authOverride = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine mode based on current URL
  const isSignUp = location.pathname === "/register";

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overlayRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const auth = authOverride || useAuthRedux();
  const { login, register, error, errors, clearError } = auth;

  const [fieldErrors, setFieldErrors] = useState(null);
  const [hideRateLimitBanner, setHideRateLimitBanner] = useState(false);

  // Refs for focusing on first invalid field
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const topAlertRef = useRef(null);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Calculate password strength for sign up
      if (name === "password" && isSignUp) {
        calculatePasswordStrength(value);
      }

      // Clear error when user starts typing
      if (error || fieldErrors) {
        clearError();
        setFieldErrors(null);
      }
    },
    [isSignUp, error, clearError, fieldErrors]
  );

  const calculatePasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, []);

  const getPasswordStrengthColor = useMemo(() => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  }, [passwordStrength]);

  const getPasswordStrengthText = useMemo(() => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  }, [passwordStrength]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (isSignUp && formData.password !== formData.confirmPassword) {
        return;
      }

      setIsSubmitting(true);

      let result;
      if (isSignUp) {
        result = await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
      } else {
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      }

      if (result.success) {
        onClose();
        resetForm();
      } else {
        // If server returned field-level validation errors, surface them
        if (result.errors) {
          // express-validator style: array of { param, msg }
          const byField = {};
          if (Array.isArray(result.errors)) {
            result.errors.forEach((it) => {
              const key = it.param || it.path || "_form";
              byField[key] = byField[key] || [];
              byField[key].push(it.msg || it.message || it);
            });
          } else if (
            typeof result.errors === "object" &&
            result.errors !== null
          ) {
            Object.keys(result.errors).forEach((k) => {
              byField[k] = Array.isArray(result.errors[k])
                ? result.errors[k]
                : [result.errors[k]];
            });
          }
          setFieldErrors(byField);
        }
      }

      setIsSubmitting(false);
    },
    [isSignUp, formData, register, login, onClose]
  );

  // Focus first invalid field or top alert when fieldErrors change
  useEffect(() => {
    if (!fieldErrors) return;
    // If there is a top-level/form error, focus the alert
    if (fieldErrors._form && topAlertRef.current) {
      try {
        topAlertRef.current.focus();
      } catch (e) {}
      return;
    }

    const order = [
      { key: "firstName", ref: firstNameRef },
      { key: "lastName", ref: lastNameRef },
      { key: "email", ref: emailRef },
      { key: "password", ref: passwordRef },
      { key: "confirmPassword", ref: confirmPasswordRef },
    ];

    for (const o of order) {
      if (fieldErrors[o.key] && o.ref && o.ref.current) {
        try {
          o.ref.current.focus();
        } catch (e) {}
        break;
      }
    }
  }, [fieldErrors]);

  const resetForm = useCallback(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setPasswordStrength(0);
  }, []);

  const toggleMode = useCallback(() => {
    const newPath = isSignUp ? "/login" : "/register";
    navigate(newPath, { replace: true });
    resetForm();
    clearError();
  }, [isSignUp, navigate, resetForm, clearError]);

  const handleClose = useCallback(() => {
    onClose();
    resetForm();
    clearError();
  }, [onClose, resetForm, clearError]);

  const passwordsMatch = useMemo(
    () => formData.password === formData.confirmPassword,
    [formData.password, formData.confirmPassword]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal content */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold mx-auto">
                {isSignUp ? "Join OLOSSIA" : "Welcome Back"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-purple-100 mt-2">
              {isSignUp
                ? "Create your account to start your fashion journey"
                : "Sign in to access your personalized shopping experience"}
            </p>
          </CardHeader>

          <CardContent className="p-8">
            {/* Accessible live region for global errors */}
            {error && (
              <div>
                {/* Rate limit specific banner (dismissible) */}
                {error ===
                  "Too many authentication attempts, please try again later" &&
                !hideRateLimitBanner ? (
                  <div
                    ref={topAlertRef}
                    tabIndex={-1}
                    role="alert"
                    aria-live="assertive"
                    className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-yellow-800 text-sm">{error}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setHideRateLimitBanner(true)}
                      aria-label="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}
            {/* Top-level field/_form errors */}
            {fieldErrors && fieldErrors._form && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded"
              >
                <p className="text-red-700 text-sm">
                  {fieldErrors._form.join(", ")}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name fields for sign up */}
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        className="pl-12 pr-4 py-3 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        required
                        aria-invalid={fieldErrors?.firstName ? "true" : "false"}
                        aria-describedby={
                          fieldErrors?.firstName ? "firstName-error" : undefined
                        }
                        ref={firstNameRef}
                      />
                    </div>
                    {fieldErrors?.firstName && (
                      <p
                        id="firstName-error"
                        className="text-sm text-red-500 mt-1"
                      >
                        {fieldErrors.firstName.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>
                    <div>
                      <Input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        className="px-4 py-3 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        required
                        aria-invalid={fieldErrors?.lastName ? "true" : "false"}
                        aria-describedby={
                          fieldErrors?.lastName ? "lastName-error" : undefined
                        }
                        ref={lastNameRef}
                      />
                    </div>
                    {fieldErrors?.lastName && (
                      <p
                        id="lastName-error"
                        className="text-sm text-red-500 mt-1"
                      >
                        {fieldErrors.lastName.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="pl-12 pr-4 py-3 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    required
                    aria-invalid={fieldErrors?.email ? "true" : "false"}
                    aria-describedby={
                      fieldErrors?.email ? "email-error" : undefined
                    }
                    ref={emailRef}
                  />
                </div>
                {fieldErrors?.email && (
                  <p id="email-error" className="text-sm text-red-500 mt-1">
                    {fieldErrors.email.join(", ")}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={
                      isSignUp
                        ? "Create a strong password"
                        : "Enter your password"
                    }
                    className="pl-12 pr-12 py-3 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    required
                    aria-invalid={fieldErrors?.password ? "true" : "false"}
                    aria-describedby={
                      fieldErrors?.password ? "password-error" : undefined
                    }
                    ref={passwordRef}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors?.password && (
                  <p id="password-error" className="text-sm text-red-500 mt-1">
                    {fieldErrors.password.join(", ")}
                  </p>
                )}

                {/* Password strength indicator for sign up */}
                {isSignUp && formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Password strength:
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength <= 2
                            ? "text-red-500"
                            : passwordStrength <= 3
                            ? "text-yellow-500"
                            : passwordStrength <= 4
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      >
                        {getPasswordStrengthText}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password for sign up */}
              {isSignUp && (
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={`pl-12 pr-12 py-3 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 ${
                        formData.confirmPassword && !passwordsMatch
                          ? "border-red-300 focus:border-red-400"
                          : ""
                      }`}
                      required
                      aria-invalid={!passwordsMatch ? "true" : "false"}
                      aria-describedby={
                        !passwordsMatch ? "confirmPassword-error" : undefined
                      }
                      ref={confirmPasswordRef}
                    />
                    {formData.confirmPassword && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {passwordsMatch ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p
                      id="confirmPassword-error"
                      className="text-sm text-red-500"
                    >
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}

              {/* Remember me / Forgot password for sign in */}
              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              {/* Terms for sign up */}
              {isSignUp && (
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    required
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Button
                      variant="ghost"
                      className="text-purple-600 hover:text-purple-700 p-0 h-auto text-sm underline"
                    >
                      Terms of Service
                    </Button>{" "}
                    and{" "}
                    <Button
                      variant="ghost"
                      className="text-purple-600 hover:text-purple-700 p-0 h-auto text-sm underline"
                    >
                      Privacy Policy
                    </Button>
                  </span>
                </label>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  (isSignUp && (!passwordsMatch || passwordStrength < 3))
                }
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </div>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  or
                </span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="w-5 h-5 mr-3"
                />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-5 h-5 mr-3 bg-blue-600 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                Continue with Facebook
              </Button>
            </div>

            {/* Toggle between sign in and sign up */}
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </p>
              <Link
                to={isSignUp ? "/login" : "/register"}
                onClick={toggleMode}
                className="inline-block text-purple-600 hover:text-purple-700 font-bold mt-2 transition-colors duration-200"
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
