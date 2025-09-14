import React from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Mail, Gift, Sparkles } from "lucide-react";

export const NewsletterSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
              Join the Fashion
              <span className="block">Revolution</span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Get exclusive access to new arrivals, insider deals, and style inspiration from top designers
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Input
                placeholder="Enter your email address"
                className="pl-4 pr-4 py-4 w-full bg-white/95 backdrop-blur-sm border-0 rounded-full text-gray-900 placeholder:text-gray-500 focus:ring-4 focus:ring-white/30 text-lg"
              />
            </div>
            <Button className="bg-white text-purple-600 hover:bg-gray-50 font-bold px-10 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Subscribe
            </Button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center text-white/90 space-y-2">
              <Gift className="w-8 h-8 text-yellow-300" />
              <p className="font-semibold">Exclusive Offers</p>
              <p className="text-sm text-white/70">Up to 70% off for subscribers</p>
            </div>
            <div className="flex flex-col items-center text-white/90 space-y-2">
              <Sparkles className="w-8 h-8 text-pink-300" />
              <p className="font-semibold">Early Access</p>
              <p className="text-sm text-white/70">Shop new collections first</p>
            </div>
            <div className="flex flex-col items-center text-white/90 space-y-2">
              <Mail className="w-8 h-8 text-blue-300" />
              <p className="font-semibold">Style Tips</p>
              <p className="text-sm text-white/70">Weekly fashion inspiration</p>
            </div>
          </div>

          <p className="text-sm text-white/70 pt-4">
            Join 100,000+ fashion lovers worldwide • Unsubscribe anytime • No spam, ever
          </p>
        </div>
      </div>
    </section>
  );
};