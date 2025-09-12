import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Handle authentication logic here
    console.log('Form submitted:', formData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle className='text-center'>
            {isSignUp ? 'Join OLOSSIA' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className='text-center'>
            {isSignUp
              ? 'Create your account to start your fashion journey'
              : 'Sign in to access your personalized shopping experience'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-1'>
          {/* Name field for sign up */}
          {isSignUp && (
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700'>Full Name</label>
              <div className='relative'>
                <User className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                <Input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='Enter your full name'
                  className='rounded-xl border-gray-200 py-3 pl-12 pr-4 transition-all duration-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className='space-y-1'>
            <label className='text-sm font-medium text-gray-700'>Email Address</label>
            <div className='relative'>
              <Mail className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
              <Input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='Enter your email'
                className='rounded-xl border-gray-200 py-3 pl-12 pr-4 transition-all duration-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className='space-y-1'>
            <label className='text-sm font-medium text-gray-700'>Password</label>
            <div className='relative'>
              <Lock className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
              <Input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                placeholder='Enter your password'
                className='rounded-xl border-gray-200 py-3 pl-12 pr-12 transition-all duration-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600'
              >
                {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
              </button>
            </div>
          </div>

          {/* Confirm password for sign up */}
          {isSignUp && (
            <div className='space-y-1'>
              <label className='text-sm font-medium text-gray-700'>Confirm Password</label>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder='Confirm your password'
                  className='rounded-xl border-gray-200 py-3 pl-12 pr-4 transition-all duration-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  required
                />
              </div>
            </div>
          )}

          {/* Forgot password link for sign in */}
          {!isSignUp && (
            <div className='text-right'>
              <Button
                type='button'
                variant='ghost'
                className='h-auto p-0 text-sm font-medium text-purple-600 hover:text-purple-700'
              >
                Forgot password?
              </Button>
            </div>
          )}

          {/* Submit button */}
          <Button
            type='submit'
            className='group w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl'
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
            <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1' />
          </Button>

          {/* Terms for sign up */}
          {isSignUp && (
            <p className='text-center text-xs leading-relaxed text-gray-500'>
              By creating an account, you agree to our{' '}
              <Button
                variant='ghost'
                className='h-auto p-0 text-xs text-purple-600 underline hover:text-purple-700'
              >
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button
                variant='ghost'
                className='h-auto p-0 text-xs text-purple-600 underline hover:text-purple-700'
              >
                Privacy Policy
              </Button>
            </p>
          )}
        </form>

        {/* Divider */}
        <div className='relative my-4'>
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
            <div className='mr-3 flex h-5 w-5 items-center justify-center rounded-sm bg-black'>
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
          <Button
            type='button'
            variant='ghost'
            onClick={toggleMode}
            className='mt-2 h-auto p-0 font-bold text-purple-600 hover:text-purple-700'
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
