import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export const AuthModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log("Form submitted:", formData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
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
          <DialogTitle className="text-center">
            {isSignUp ? "Join OLOSSIA" : "Welcome Back"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignUp 
              ? "Create your account to start your fashion journey" 
              : "Sign in to access your personalized shopping experience"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name field for sign up */}
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="pl-12 pr-4 py-3 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="pl-12 pr-4 py-3 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="pl-12 pr-12 py-3 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm password for sign up */}
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="pl-12 pr-4 py-3 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                  required
                />
              </div>
            </div>
          )}

          {/* Forgot password link for sign in */}
          {!isSignUp && (
            <div className="text-right">
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
              >
                Forgot password?
              </Button>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            {isSignUp ? "Create Account" : "Sign In"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>

          {/* Terms for sign up */}
          {isSignUp && (
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By creating an account, you agree to our{" "}
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0 h-auto text-xs underline">
                Terms of Service
              </Button>{" "}
              and{" "}
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0 h-auto text-xs underline">
                Privacy Policy
              </Button>
            </p>
          )}
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">or</span>
          </div>
        </div>

        {/* Social login buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5 mr-3" />
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200"
          >
            <div className="w-5 h-5 mr-3 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">f</span>
            </div>
            Continue with Facebook
          </Button>
        </div>

        {/* Toggle between sign in and sign up */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={toggleMode}
            className="text-purple-600 hover:text-purple-700 font-bold mt-2 p-0 h-auto"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};