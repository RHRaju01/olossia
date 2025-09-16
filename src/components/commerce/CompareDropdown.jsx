import React, { useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { BarChart3, X, Star, ArrowRight, Eye, Heart, ShoppingBag } from "lucide-react";
import { useCompare } from "../../contexts/CompareContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

// Memoized compare item component
const CompareItem = React.memo(({ item, onRemoveFromCompare, onAddToWishlist, onAddToCart, isInWishlist, isInCart }) => {
  return (
    <div className="p-6 border-b border-gray-50 last:border-b-0">
      <div className="flex gap-4">
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-xl"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs text-blue-600 font-bold uppercase">{item.brand}</p>
            <h4 className="font-semibold text-gray-900 leading-tight">{item.name}</h4>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({item.reviews})</span>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Colors:</span>
            <div className="flex gap-1">
              {item.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: color }}
                />
              ))}
              {item.colors.length > 3 && (
                <span className="text-xs text-gray-500">+{item.colors.length - 3}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">${item.price}</span>
              {item.originalPrice && (
                <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onAddToWishlist(item)}
                className={`w-8 h-8 rounded-full border-gray-200 ${
                  isInWishlist(item.product_id)
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-3 h-3 text-red-600 ${isInWishlist(item.product_id) ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onAddToCart(item)}
                className={`w-8 h-8 rounded-full border-gray-200 ${
                  isInCart(item.product_id)
                    ? 'bg-purple-50 border-purple-300 text-purple-600'
                    : 'hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <ShoppingBag className="w-3 h-3 text-purple-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onRemoveFromCompare(item.id)}
                className="w-8 h-8 rounded-full border-gray-200 hover:border-red-300 hover:bg-red-50"
              >
                <X className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CompareItem.displayName = 'CompareItem';

export const CompareDropdown = ({ isOpen, onClose }) => {
  const { items: compareItems, removeItem, clearError, error } = useCompare();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const handleRemoveFromCompare = useCallback(async (itemId) => {
    await removeItem(itemId);
  }, [removeItem]);

  const handleAddToWishlist = useCallback(async (item) => {
    const product = {
      id: item.product_id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      rating: item.rating,
      reviews: item.reviews,
      colors: item.colors
    };
    
    await addToWishlist(product);
  }, [addToWishlist]);

  const handleAddToCart = useCallback(async (item) => {
    const product = {
      id: item.product_id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image
    };
    
    await addToCart(product);
  }, [addToCart]);

  const handleViewComparison = useCallback(() => {
    navigate('/compare');
    onClose();
  }, [navigate, onClose]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-full right-0 mt-2 w-96 z-[55]"
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-lg">Compare Products</h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {compareItems.length}/4
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Compare Items */}
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {compareItems.length > 0 ? (
              compareItems.map((item) => (
                <CompareItem
                  key={item.id}
                  item={item}
                  onRemoveFromCompare={handleRemoveFromCompare}
                  onAddToWishlist={handleAddToWishlist}
                  onAddToCart={handleAddToCart}
                  isInWishlist={isInWishlist}
                  isInCart={isInCart}
                />
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products to compare</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Add products to compare their features, prices, and specifications side by side!
                </p>
                <Button 
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6 py-2 rounded-xl"
                >
                  Discover Products
                </Button>
               <p className="text-xs text-gray-500 text-center">
                 Add products to compare features and specifications
               </p>
                <p className="text-xs text-gray-500 text-center">
                  Add products to compare features and specifications
                </p>
              </div>
            )}
          </div>

          {/* Footer - only show when compare has items */}
          {compareItems.length > 0 && (
            <div className="p-6 bg-gray-50 space-y-3">
              <Button 
                onClick={handleViewComparison}
                disabled={compareItems.length < 2}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare Products ({compareItems.length})
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 text-center">
                {compareItems.length < 2 
                  ? `Add ${2 - compareItems.length} more product${2 - compareItems.length > 1 ? 's' : ''} to compare`
                  : 'Compare features, prices, and specifications'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};