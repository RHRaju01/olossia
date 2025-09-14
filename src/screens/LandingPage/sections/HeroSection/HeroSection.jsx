import React from "react";
import { Button } from "../../../../components/ui/button";
import { ArrowRight, Sparkles, Shield, Truck, Heart } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[700px] py-20">
          {/* Left content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-semibold rounded-full">
                <Sparkles className="w-4 h-4" />
                New Spring Collection 2025
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[0.9] tracking-tight">
                Fashion
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800">
                  Reimagined
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-xl">
                Discover curated collections from 500+ premium brands. 
                <span className="font-semibold text-gray-800"> Express your unique style</span> with confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-4 rounded-full text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
              >
                Watch Lookbook
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Secure Shopping</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">Easy Returns</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-100">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-black text-gray-900">500+</div>
                <div className="text-sm text-gray-600 font-medium">Premium Brands</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-black text-gray-900">50K+</div>
                <div className="text-sm text-gray-600 font-medium">Curated Products</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-black text-gray-900">1M+</div>
                <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
              </div>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className="relative">
            <div className="relative z-10">
              <div className="grid grid-cols-2 gap-4 h-[600px]">
                {/* Main large image */}
                <div className="col-span-2 row-span-2 relative overflow-hidden rounded-3xl">
                  <img
                    src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Fashion model"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
              
              {/* Floating product card */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=100"
                    alt="Product"
                    className="w-14 h-14 object-cover rounded-xl"
                  />
                  <div>
                    <p className="font-bold text-gray-900">Silk Midi Dress</p>
                    <p className="text-purple-600 font-semibold">$129 <span className="text-gray-400 line-through text-sm">$189</span></p>
                  </div>
                </div>
              </div>

              {/* Floating discount badge */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-2xl shadow-xl">
                <div className="text-center">
                  <p className="text-2xl font-black">70%</p>
                  <p className="text-xs font-semibold">OFF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};