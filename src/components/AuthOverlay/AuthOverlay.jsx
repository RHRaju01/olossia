import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
} from 'lucide-react';

export const AuthOverlay = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine mode based on current URL
  const isSignUp = location.pathname === '/register';

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overlayRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { login, register, error, clearError } = useAuth();

  const handleInputChange = useCallback(
    e => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // Calculate password strength for sign up
      if (name === 'password' && isSignUp) {
        calculatePasswordStrength(value);
      }

      // Clear error when user starts typing
      if (error) {
        clearError();
      }
    },
    [isSignUp, error, clearError]
  );

  const calculatePasswordStrength = useCallback(password => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, []);

  const getPasswordStrengthColor = useMemo(() => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  }, [passwordStrength]);

  const getPasswordStrengthText = useMemo(() => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  }, [passwordStrength]);

  const handleSubmit = useCallback(
    async e => {
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
    },
    [isSignUp, formData, register, login, onClose]
  );

  const resetForm = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setPasswordStrength(0);
  }, []);

  const toggleMode = useCallback(() => {
    const newPath = isSignUp ? '/login' : '/register';
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
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={handleClose} />

      {/* Modal content */}
      <div className='scrollbar-hide relative max-h-[95vh] w-full max-w-md overflow-y-auto'>
        <Card className='overflow-hidden rounded-3xl border-0 bg-white shadow-2xl'>
          <CardHeader className='bg-gradient-to-r from-purple-600 to-pink-600 py-6 text-center text-white'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-2xl font-bold'>
                {isSignUp ? 'Join OLOSSIA' : 'Welcome Back'}
              </CardTitle>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleClose}
                className='h-8 w-8 rounded-full text-white hover:bg-white/20'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
            <p className='mt-2 text-purple-100'>
              {isSignUp
                ? 'Create your account to start your fashion journey'
                : 'Sign in to access your personalized shopping'}
            </p>
          </CardHeader>

          <CardContent className='p-8'>
            {error && (
              <div className='mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4'>
                <AlertCircle className='h-5 w-5 flex-shrink-0 text-red-500' />
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Name fields for sign up */}
              {isSignUp && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-gray-700'>First Name</label>
                    <div className='relative'>
                      <User className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                      <Input
                        type='text'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder='First name'
                        className='rounded-xl border-gray-200 py-3 pl-12 pr-4 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                        required
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-semibold text-gray-700'>Last Name</label>
                    <Input
                      type='text'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder='Last name'
                      className='rounded-xl border-gray-200 px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700'>Email Address</label>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='Enter your email'
                    className='rounded-xl border-gray-200 py-3 pl-12 pr-4 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-700'>Password</label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                    className='rounded-xl border-gray-200 py-3 pl-12 pr-12 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                  >
                    {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                  </button>
                </div>

                {/* Password strength indicator for sign up */}
                {isSignUp && formData.password && (
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-500'>Password strength:</span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength <= 2
                            ? 'text-red-500'
                            : passwordStrength <= 3
                              ? 'text-yellow-500'
                              : passwordStrength <= 4
                                ? 'text-blue-500'
                                : 'text-green-500'
                        }`}
                      >
                        {getPasswordStrengthText}
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password for sign up */}
              {isSignUp && (
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-gray-700'>Confirm Password</label>
                  <div className='relative'>
                    <Lock className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder='Confirm your password'
                      className={`rounded-xl border-gray-200 py-3 pl-12 pr-12 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 ${
                        formData.confirmPassword && !passwordsMatch
                          ? 'border-red-300 focus:border-red-400'
                          : ''
                      }`}
                      required
                    />
                    {formData.confirmPassword && (
                      <div className='absolute right-4 top-1/2 -translate-y-1/2 transform'>
                        {passwordsMatch ? (
                          <CheckCircle className='h-5 w-5 text-green-500' />
                        ) : (
                          <AlertCircle className='h-5 w-5 text-red-500' />
                        )}
                      </div>
                    )}
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className='text-sm text-red-500'>Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Remember me / Forgot password for sign in */}
              {!isSignUp && (
                <div className='flex items-center justify-between'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                    />
                    <span className='ml-2 text-sm text-gray-600'>Remember me</span>
                  </label>
                  <Button
                    type='button'
                    variant='ghost'
                    className='h-auto p-0 text-sm font-medium text-purple-600 hover:text-purple-700'
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              {/* Terms for sign up */}
              {isSignUp && (
                <label className='flex items-start gap-3'>
                  <input
                    type='checkbox'
                    className='mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                    required
                  />
                  <span className='text-sm leading-relaxed text-gray-600'>
                    I agree to the{' '}
                    <Button
                      variant='ghost'
                      className='h-auto p-0 text-sm text-purple-600 underline hover:text-purple-700'
                    >
                      Terms of Service
                    </Button>{' '}
                    and{' '}
                    <Button
                      variant='ghost'
                      className='h-auto p-0 text-sm text-purple-600 underline hover:text-purple-700'
                    >
                      Privacy Policy
                    </Button>
                  </span>
                </label>
              )}

              {/* Submit button */}
              <Button
                type='submit'
                disabled={isSubmitting || (isSignUp && (!passwordsMatch || passwordStrength < 3))}
                className='group w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
                    <div className='mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white'></div>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1' />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-200' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white px-4 font-medium text-gray-500'>or</span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className='space-y-3'>
              <Button
                type='button'
                variant='outline'
                className='w-full rounded-xl border-2 py-3 transition-all duration-200 hover:bg-gray-50'
              >
                <img
                  src='https://developers.google.com/identity/images/g-logo.png'
                  alt='Google'
                  className='mr-3 h-5 w-5'
                />
                Continue with Google
              </Button>
              <Button
                type='button'
                variant='outline'
                className='w-full rounded-xl border-2 py-3 transition-all duration-200 hover:bg-gray-50'
              >
                <div className='mr-3 flex h-5 w-5 items-center justify-center rounded-sm bg-blue-600'>
                  <span className='text-xs font-bold text-white'>f</span>
                </div>
                Continue with Facebook
              </Button>
            </div>

            {/* Toggle between sign in and sign up */}
            <div className='mt-8 border-t border-gray-100 pt-6 text-center'>
              <p className='text-gray-600'>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <Link
                to={isSignUp ? '/login' : '/register'}
                onClick={toggleMode}
                className='mt-2 inline-block font-bold text-purple-600 transition-colors duration-200 hover:text-purple-700'
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
