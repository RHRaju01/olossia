import React, { useCallback } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Heart, ShoppingBag, Star, Eye, BarChart3, Check } from 'lucide-react';
import { useNavigateWithScroll } from '../../../utils/navigation';

export const ProductCard = React.memo(({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  onAddToCompare, 
  onQuickView,
  isInWishlist,
  isInCompare,
  isInCart,
  showQuickView = true,
  className = ""
}) => {
  const navigate = useNavigateWithScroll();

  const handleCardClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id || product.product_id}`);
  }, [navigate, product.id]);

  const handleActionClick = useCallback((e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  }, []);

  return (
    <Card
      className={`group cursor-pointer border-0 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl overflow-hidden ${className}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                NEW
              </span>
            )}
            {product.discount > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
            <Button 
              size="icon" 
              onClick={(e) => handleActionClick(e, () => onAddToWishlist(product))}
              className={`w-10 h-10 rounded-full shadow-lg border-0 transition-all duration-300 ${
                isInWishlist(product.id) 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white lg:hover:from-red-600 lg:hover:to-pink-600' 
                  : 'bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
            
            {showQuickView && (
              <Button 
                size="icon" 
                onClick={(e) => handleActionClick(e, () => onQuickView(product))}
                className="w-10 h-10 rounded-full bg-white/90 lg:hover:bg-white shadow-lg border-0 text-gray-700 lg:hover:text-blue-500"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            
            <Button 
              size="icon" 
              onClick={(e) => handleActionClick(e, () => onAddToCompare(product))}
              className={`w-10 h-10 rounded-full shadow-lg border-0 transition-all duration-300 ${
                isInCompare(product.id) 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white lg:hover:from-blue-600 lg:hover:to-indigo-600' 
                  : 'bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-blue-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            
            <Button 
              size="icon" 
              onClick={(e) => handleActionClick(e, () => onAddToCart(product))}
              className={`w-10 h-10 rounded-full shadow-lg border-0 transition-all duration-300 stroke-white ${
                isInCart(product.id)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white lg:hover:from-purple-600 lg:hover:to-pink-600'
                  : 'bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-purple-600'
              }`}
            >
              <ShoppingBag className={`w-4 h-4 ${isInCart(product.id) ? 'stroke-white' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">{product.brand}</p>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mt-1">{product.name}</h3>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">{product.rating} ({product.reviews})</span>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Colors:</span>
            <div className="flex gap-1">
              {product.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-5 h-5 rounded-full border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition-colors"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900">${product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
              )}
            </div>
            {product.discount > 0 && (
              <span className="text-sm font-bold text-green-600">Save ${product.originalPrice - product.price}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';