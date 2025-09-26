import React from "react";
import { Button } from "./button";
import { Heart, ShoppingBag, BarChart3, Eye } from "lucide-react";

export const ActionButton = React.memo(
  ({
    type,
    isActive,
    onClick,
    className = "",
    size = "icon",
    showText = false,
    ...rest
  }) => {
    const getIcon = () => {
      switch (type) {
        case "wishlist":
          // use fill-current so the heart takes the button's text color (white when active)
          return <Heart className={`w-4 h-4 ${isActive ? "fill-current" : ""}`} />;
        case "cart":
          // always show ShoppingBag; make it white when active to match ProductCard
          return <ShoppingBag className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />;
        case "compare":
          // make compare icon white when active
          return <BarChart3 className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />;
        case "quickview":
          return <Eye className="w-4 h-4" />;
        default:
          return null;
      }
    };

    const getActiveStyles = () => {
      switch (type) {
        case "wishlist":
          return isActive
            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white lg:hover:from-red-600 lg:hover:to-pink-600"
            : "bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-red-500";
        case "cart":
          return isActive
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white lg:hover:from-purple-600 lg:hover:to-pink-600"
            : "bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-purple-600";
        case "compare":
          return isActive
            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white lg:hover:from-blue-600 lg:hover:to-indigo-600"
            : "bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-blue-500";
        case "quickview":
          return "bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-blue-500";
        default:
          return "bg-white/90 lg:hover:bg-white text-gray-700";
      }
    };

    const getText = () => {
      switch (type) {
        case "wishlist":
          return isActive ? "Saved for Later" : "Save for Later";
        case "cart":
          return isActive ? "Added to Cart" : "Add to Cart";
        case "compare":
          return isActive ? "In Compare" : "Compare";
        case "quickview":
          return "Quick View";
        default:
          return "";
      }
    };

    return (
      <Button
        size={size}
        onClick={onClick}
        className={`rounded-full shadow-lg border-0 transition-all duration-300 ${getActiveStyles()} ${className}`}
        {...rest}
      >
        {getIcon()}
        {showText && <span className="ml-2">{getText()}</span>}
      </Button>
    );
  }
);

ActionButton.displayName = "ActionButton";
