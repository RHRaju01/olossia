import React from "react";
import { HeroSection } from "../components/sections/HeroSection";
import { LiveSection } from "../components/sections/LiveSection";
import { CategorySection } from "../components/sections/CategorySection";
import { FeaturedSection } from "../components/sections/FeaturedSection";
import { FeaturedArtSection } from "../components/sections/FeaturedArtSection";
import { BrandsSection } from "../components/sections/BrandsSection";
import { TrendingSection } from "../components/sections/TrendingSection";
import { NewsletterSection } from "../components/sections/NewsletterSection";

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      <LiveSection />
      <HeroSection />
      <CategorySection />
      <FeaturedSection />
      <BrandsSection />
      <TrendingSection />
      <FeaturedArtSection />
      <NewsletterSection />
    </div>
  );
};
