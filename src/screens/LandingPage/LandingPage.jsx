import React from "react";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { HeaderSection } from "./sections/HeaderSection/HeaderSection";
import { LiveSection } from "./sections/LiveSection/LiveSection";
import { CategorySection } from "./sections/CategorySection/CategorySection";
import { FeaturedSection } from "./sections/FeaturedSection/FeaturedSection";
import { BrandsSection } from "./sections/BrandsSection/BrandsSection";
import { TrendingSection } from "./sections/TrendingSection/TrendingSection";
import { NewsletterSection } from "./sections/NewsletterSection/NewsletterSection";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { AuthModal } from "../../components/AuthModal/AuthModal";

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