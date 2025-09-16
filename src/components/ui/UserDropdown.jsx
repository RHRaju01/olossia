import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
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
import { useAuth } from "../../contexts/AuthContext";

export const UserDropdown = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { login, register, error, clearError } = useAuth();

  const handleInputChange = (e) => {
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
    if (error) {
      clearError();
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e) => {
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
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setPasswordStrength(0);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
    clearError();
  };

  const passwordsMatch = formData.password === formData.confirmPassword;

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full right-0 mt-2 w-96 z-50"
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">
              {isSignUp ? "Join OLOSSIA" : "Welcome Back"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/20 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-purple-100 mt-2 text-sm">
            {isSignUp
              ? "Create your account to start your fashion journey"
              : "Sign in to access your personalized shopping experience"}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name fields for sign up */}
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className="pl-10 pr-3 py-2 text-sm rounded-lg border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="px-3 py-2 text-sm rounded-lg border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="pl-10 pr-3 py-2 text-sm rounded-lg border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={
                    isSignUp
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                  className="pl-10 pr-10 py-2 text-sm rounded-lg border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password strength indicator for sign up */}
              {isSignUp && formData.password && (
                <div className="space-y-1">
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
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password for sign up */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={`pl-10 pr-10 py-2 text-sm rounded-lg border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 ${
                      formData.confirmPassword && !passwordsMatch
                        ? "border-red-300 focus:border-red-400"
                        : ""
                    }`}
                    required
                  />
                  {formData.confirmPassword && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {passwordsMatch ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
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
                  <span className="ml-2 text-xs text-gray-600">
                    Remember me
                  </span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
                >
                  Forgot password?
                </Button>
              </div>
            )}

            {/* Terms for sign up */}
            {isSignUp && (
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  required
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Button
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-700 p-0 h-auto text-xs underline"
                  >
                    Terms of Service
                  </Button>{" "}
                  and{" "}
                  <Button
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-700 p-0 h-auto text-xs underline"
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </div>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle between sign in and sign up */}
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={toggleMode}
              className="text-purple-600 hover:text-purple-700 font-bold mt-1 p-0 h-auto text-sm"
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
