import React from "react";
import { Button } from "../ui/button";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export const FooterSection = React.memo(() => {
  const footerSections = [
    {
      title: "Shop",
      links: [
        "Women's Fashion",
        "Men's Style",
        "Kids & Baby",
        "Beauty & Care",
        "Home & Living",
        "Accessories",
        "Shoes & Bags",
        "Sale & Outlet",
      ],
    },
    {
      title: "Customer Care",
      links: [
        "Help Center",
        "Size Guide",
        "Shipping Info",
        "Returns & Exchanges",
        "Track Your Order",
        "Contact Support",
        "Live Chat",
        "FAQ",
      ],
    },
    {
      title: "About Olossia",
      links: [
        "Our Story",
        "Careers",
        "Press & Media",
        "Sustainability",
        "Brand Partners",
        "Investor Relations",
        "Affiliate Program",
        "Gift Cards",
      ],
    },
    {
      title: "Connect",
      links: [
        "Store Locator",
        "Personal Stylist",
        "VIP Membership",
        "Student Discount",
        "Refer a Friend",
        "Brand Partnerships",
        "Influencer Program",
        "Newsletter",
      ],
    },
  ];

  const socialLinks = [
    {
      icon: Instagram,
      href: "#",
      label: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      icon: Facebook,
      href: "#",
      label: "Facebook",
      color: "hover:text-blue-500",
    },
    {
      icon: Twitter,
      href: "#",
      label: "Twitter",
      color: "hover:text-blue-400",
    },
    { icon: Youtube, href: "#", label: "YouTube", color: "hover:text-red-500" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
            {/* Brand section */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                OLOSSIA
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                Your destination for premium fashion from the world's most
                coveted brands. Discover, shop, and express your unique style.
              </p>

              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <span>123 Fashion Ave, New York, NY 10001</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-purple-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <span>hello@olossia.com</span>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4 pt-4">
                {socialLinks.map((social) => (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="icon"
                    className={`w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 ${social.color} transition-all duration-300 hover:scale-110`}
                  >
                    <social.icon className="w-5 h-5" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Footer links */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="font-black text-white text-lg">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Button
                        variant="ghost"
                        className="h-auto py-0 px-2 text-gray-30 font-medium text-base justify-start transition-colors duration-200"
                      >
                        {link}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-gray-400">
              <p className="text-sm">© 2025 Olossia. All rights reserved.</p>
              <div className="flex items-center gap-6 text-sm">
                <Button
                  variant="ghost"
                  className="h-auto py-0 px-2 text-gray-400 transition-colors"
                >
                  Privacy Policy
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto py-0 px-2 text-gray-400 transition-colors"
                >
                  Terms of Service
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto py-0 px-2 text-gray-400 transition-colors"
                >
                  Cookie Settings
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-400">
                Trusted by millions worldwide
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-sm text-gray-300 font-medium">
                  Verified Secure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

FooterSection.displayName = "FooterSection";
