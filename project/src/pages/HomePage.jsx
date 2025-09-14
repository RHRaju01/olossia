import React from 'react';
import { HeroSection } from '../screens/LandingPage/sections/HeroSection/HeroSection';
import { LiveSection } from '../screens/LandingPage/sections/LiveSection/LiveSection';
import { CategorySection } from '../screens/LandingPage/sections/CategorySection/CategorySection';
import { FeaturedSection } from '../screens/LandingPage/sections/FeaturedSection/FeaturedSection';
import { BrandsSection } from '../screens/LandingPage/sections/BrandsSection/BrandsSection';
import { TrendingSection } from '../screens/LandingPage/sections/TrendingSection/TrendingSection';
import { NewsletterSection } from '../screens/LandingPage/sections/NewsletterSection/NewsletterSection';

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      <LiveSection />
      <HeroSection />
      <CategorySection />
      <FeaturedSection />
      <BrandsSection />
      <TrendingSection />
      <NewsletterSection />
    </div>
  );
};