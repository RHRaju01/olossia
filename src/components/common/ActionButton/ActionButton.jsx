import React from 'react';
import { Button } from '../../ui/button';
import { Heart, ShoppingBag, BarChart3, Eye, Check } from 'lucide-react';

export const ActionButton = React.memo(({ 
  type, 
  isActive, 
  onClick, 
  className = "",
  size = "icon",
  showText = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'wishlist':
        return <Heart className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />;
      case 'cart':
        return isActive ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />;
      case 'compare':
        return <BarChart3 className="w-4 h-4" />;
      case 'quickview':
        return <Eye className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActiveStyles = () => {
    switch (type) {
      case 'wishlist':
        return isActive 
          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white lg:hover:from-red-600 lg:hover:to-pink-600' 
          : 'bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-red-500';
      case 'cart':
        return isActive
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white lg:hover:from-purple-600 lg:hover:to-pink-600'
          : 'bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-purple-600';
      case 'compare':
        return isActive 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white lg:hover:from-blue-600 lg:hover:to-indigo-600' 
          : 'bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-blue-500';
      case 'quickview':
        return 'bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-blue-500';
      default:
        return 'bg-white/90 lg:hover:bg-white text-gray-700';
    }
  };

  const getText = () => {
    switch (type) {
      case 'wishlist':
        return isActive ? 'Saved for Later' : 'Save for Later';
      case 'cart':
        return isActive ? 'Added to Cart' : 'Add to Cart';
      case 'compare':
        return isActive ? 'In Compare' : 'Compare';
      case 'quickview':
        return 'Quick View';
      default:
        return '';
    }
  };

  return (
    <Button 
      size={size}
      onClick={onClick}
      className={`rounded-full shadow-lg border-0 transition-all duration-300 ${getActiveStyles()} ${className}`}
    >
      {getIcon()}
      {showText && <span className="ml-2">{getText()}</span>}
    </Button>
  );
});

ActionButton.displayName = 'ActionButton';