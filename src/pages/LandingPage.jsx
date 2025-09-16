import React from "react";
import { HeroSection } from "../components/sections/HeroSection";
import { HeaderSection } from "../components/sections/HeaderSection";
import { LiveSection } from "../components/sections/LiveSection";
import { CategorySection } from "../components/sections/CategorySection";
import { FeaturedSection } from "../components/sections/FeaturedSection";
import { BrandsSection } from "../components/sections/BrandsSection";
import { TrendingSection } from "../components/sections/TrendingSection";
import { NewsletterSection } from "../components/sections/NewsletterSection";
import { FooterSection } from "../components/sections/FooterSection";
import { AuthModal } from "../components/auth/AuthModal";

export const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSection onAuthModalOpen={() => setIsAuthModalOpen(true)} />
      <LiveSection />
      <HeroSection />
      <CategorySection />
      <FeaturedSection />
      <BrandsSection />
      <TrendingSection />
      <NewsletterSection />
      <FooterSection />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
