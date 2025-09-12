import { useCallback } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Heart, ShoppingBag, Star, Eye, BarChart3, Check } from 'lucide-react';
import { useNavigateWithScroll } from '../../../utils/navigation';

export const ProductCard = React.memo(
  ({
    product,
    onAddToCart,
    onAddToWishlist,
    onAddToCompare,
    onQuickView,
    isInWishlist,
    isInCompare,
    isInCart,
    showQuickView = true,
    className = '',
  }) => {
    const navigate = useNavigateWithScroll();

    const handleCardClick = useCallback(
      e => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/product/${product.id || product.product_id}`);
      },
      [navigate, product.id]
    );

    const handleActionClick = useCallback((e, action) => {
      e.preventDefault();
      e.stopPropagation();
      action();
    }, []);

    return (
      <Card
        className={`group cursor-pointer overflow-hidden rounded-3xl border-0 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl ${className}`}
        onClick={handleCardClick}
      >
        <CardContent className='p-0'>
          <div className='relative overflow-hidden'>
            <img
              src={product.image}
              alt={product.name}
              className='h-80 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110'
              loading='lazy'
            />

            {/* Badges */}
            <div className='absolute left-4 top-4 flex flex-col gap-2'>
              {product.isNew && (
                <span className='rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white'>
                  NEW
                </span>
              )}
              {product.discount > 0 && (
                <span className='rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 text-xs font-bold text-white'>
                  -{product.discount}%
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className='absolute right-4 top-4 flex flex-col gap-2 opacity-100 transition-all duration-300 lg:opacity-0 lg:group-hover:opacity-100'>
              <Button
                size='icon'
                onClick={e => handleActionClick(e, () => onAddToWishlist(product))}
                className={`h-10 w-10 rounded-full border-0 shadow-lg transition-all duration-300 ${
                  isInWishlist(product.id)
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white lg:hover:from-red-600 lg:hover:to-pink-600'
                    : 'bg-white/90 text-gray-700 lg:hover:bg-white lg:hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </Button>

              {showQuickView && (
                <Button
                  size='icon'
                  onClick={e => handleActionClick(e, () => onQuickView(product))}
                  className='h-10 w-10 rounded-full border-0 bg-white/90 text-gray-700 shadow-lg lg:hover:bg-white lg:hover:text-blue-500'
                >
                  <Eye className='h-4 w-4' />
                </Button>
              )}

              <Button
                size='icon'
                onClick={e => handleActionClick(e, () => onAddToCompare(product))}
                className={`h-10 w-10 rounded-full border-0 shadow-lg transition-all duration-300 ${
                  isInCompare(product.id)
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white lg:hover:from-blue-600 lg:hover:to-indigo-600'
                    : 'bg-white/90 text-gray-700 lg:hover:bg-white lg:hover:text-blue-500'
                }`}
              >
                <BarChart3 className='h-4 w-4' />
              </Button>

              <Button
                size='icon'
                onClick={e => handleActionClick(e, () => onAddToCart(product))}
                className={`h-10 w-10 rounded-full border-0 stroke-white shadow-lg transition-all duration-300 ${
                  isInCart(product.id)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white lg:hover:from-purple-600 lg:hover:to-pink-600'
                    : 'bg-white/90 text-gray-700 lg:hover:bg-white lg:hover:text-purple-600'
                }`}
              >
                <ShoppingBag className={`h-4 w-4 ${isInCart(product.id) ? 'stroke-white' : ''}`} />
              </Button>
            </div>
          </div>

          <div className='space-y-4 p-6'>
            <div>
              <p className='text-sm font-bold uppercase tracking-wider text-purple-600'>
                {product.brand}
              </p>
              <h3 className='mt-1 text-lg font-bold leading-tight text-gray-900'>{product.name}</h3>
            </div>

            {/* Rating */}
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className='text-sm font-medium text-gray-600'>
                {product.rating} ({product.reviews})
              </span>
            </div>

            {/* Colors */}
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-gray-500'>Colors:</span>
              <div className='flex gap-1'>
                {product.colors.map((color, index) => (
                  <div
                    key={index}
                    className='h-5 w-5 cursor-pointer rounded-full border-2 border-gray-200 transition-colors hover:border-gray-400'
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Price */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-2xl font-black text-gray-900'>${product.price}</span>
                {product.originalPrice && (
                  <span className='text-lg text-gray-400 line-through'>
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              {product.discount > 0 && (
                <span className='text-sm font-bold text-green-600'>
                  Save ${product.originalPrice - product.price}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = 'ProductCard';
