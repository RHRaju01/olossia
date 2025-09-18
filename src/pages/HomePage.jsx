import React from "react";
import { HeroSection } from "../components/sections/HeroSection";
import { LiveSection } from "../components/sections/LiveSection";
import { CategorySection } from "../components/sections/CategorySection";
import { FeaturedSection } from "../components/sections/FeaturedSection";
import { BrandsSection } from "../components/sections/BrandsSection";
import { TrendingSection } from "../components/sections/TrendingSection";
import { NewsletterSection } from "../components/sections/NewsletterSection";
import { isFeatureEnabled, logFeatureFlags } from "../config/featureFlags";

export const HomePage = () => {
  // Debug: Log cart implementation on page load (development only)
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(
        `🛒 Cart Implementation: ${
          isFeatureEnabled("USE_REDUX_CART") ? "Redux" : "Context API"
        }`
      );
      // Uncomment next line to see all feature flags
      // logFeatureFlags();
    }
  }, []);

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
