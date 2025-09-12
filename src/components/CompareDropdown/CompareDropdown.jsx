import { useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { BarChart3, X, Star, ArrowRight, Eye, Heart, ShoppingBag } from 'lucide-react';
import { useCompare } from '../../contexts/CompareContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

// Memoized compare item component
const CompareItem = React.memo(
  ({ item, onRemoveFromCompare, onAddToWishlist, onAddToCart, isInWishlist, isInCart }) => {
    return (
      <div className='border-b border-gray-50 p-6 last:border-b-0'>
        <div className='flex gap-4'>
          <div className='relative'>
            <img
              src={item.image}
              alt={item.name}
              className='h-20 w-20 rounded-xl object-cover'
              loading='lazy'
            />
          </div>

          <div className='flex-1 space-y-2'>
            <div>
              <p className='text-xs font-bold uppercase text-blue-600'>{item.brand}</p>
              <h4 className='font-semibold leading-tight text-gray-900'>{item.name}</h4>
            </div>

            {/* Rating */}
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(item.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className='text-xs text-gray-500'>({item.reviews})</span>
            </div>

            {/* Colors */}
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-500'>Colors:</span>
              <div className='flex gap-1'>
                {item.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className='h-4 w-4 rounded-full border border-gray-200'
                    style={{ backgroundColor: color }}
                  />
                ))}
                {item.colors.length > 3 && (
                  <span className='text-xs text-gray-500'>+{item.colors.length - 3}</span>
                )}
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='font-bold text-gray-900'>${item.price}</span>
                {item.originalPrice && (
                  <span className='text-sm text-gray-400 line-through'>${item.originalPrice}</span>
                )}
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => onAddToWishlist(item)}
                  className={`h-8 w-8 rounded-full border-gray-200 ${
                    isInWishlist(item.product_id)
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <Heart
                    className={`h-3 w-3 text-red-600 ${
                      isInWishlist(item.product_id) ? 'fill-current' : ''
                    }`}
                  />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => onAddToCart(item)}
                  className={`h-8 w-8 rounded-full border-gray-200 ${
                    isInCart(item.product_id)
                      ? 'border-purple-300 bg-purple-50 text-purple-600'
                      : 'hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <ShoppingBag className='h-3 w-3 text-purple-600' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => onRemoveFromCompare(item.id)}
                  className='h-8 w-8 rounded-full border-gray-200 hover:border-red-300 hover:bg-red-50'
                >
                  <X className='h-3 w-3 text-red-500' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CompareItem.displayName = 'CompareItem';

export const CompareDropdown = ({ isOpen, onClose }) => {
  const { items: compareItems, removeItem, clearError, error } = useCompare();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const handleRemoveFromCompare = useCallback(
    async itemId => {
      await removeItem(itemId);
    },
    [removeItem]
  );

  const handleAddToWishlist = useCallback(
    async item => {
      const product = {
        id: item.product_id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        rating: item.rating,
        reviews: item.reviews,
        colors: item.colors,
      };

      await addToWishlist(product);
    },
    [addToWishlist]
  );

  const handleAddToCart = useCallback(
    async item => {
      const product = {
        id: item.product_id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
      };

      await addToCart(product);
    },
    [addToCart]
  );

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
      className='absolute right-0 top-full z-[55] mt-2 w-96'
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <Card className='overflow-hidden rounded-2xl border-0 bg-white shadow-2xl'>
        <CardContent className='p-0'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
            <div className='flex items-center gap-3'>
              <BarChart3 className='h-6 w-6 text-blue-600' />
              <h3 className='text-lg font-bold text-gray-900'>Compare Products</h3>
              <span className='rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700'>
                {compareItems.length}/4
              </span>
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-8 w-8 rounded-full hover:bg-gray-100'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className='border-b border-red-100 bg-red-50 p-4'>
              <p className='text-sm font-medium text-red-700'>{error}</p>
            </div>
          )}

          {/* Compare Items */}
          <div className='scrollbar-hide max-h-80 overflow-y-auto'>
            {compareItems.length > 0 ? (
              compareItems.map(item => (
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
              <div className='p-12 text-center'>
                <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
                  <BarChart3 className='h-10 w-10 text-gray-400' />
                </div>
                <h3 className='mb-2 text-lg font-semibold text-gray-900'>No products to compare</h3>
                <p className='mx-auto mb-6 max-w-sm text-gray-500'>
                  Add products to compare their features, prices, and specifications!
                </p>
                <Button
                  onClick={onClose}
                  className='rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-2 font-semibold text-white hover:from-blue-600 hover:to-indigo-600'
                >
                  Discover Products
                </Button>
              </div>
            )}
          </div>

          {/* Footer - only show when compare has items */}
          {compareItems.length > 0 && (
            <div className='space-y-3 bg-gray-50 p-6'>
              <Button
                onClick={handleViewComparison}
                disabled={compareItems.length < 2}
                className='w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 font-bold text-white hover:from-blue-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <BarChart3 className='mr-2 h-4 w-4' />
                Compare Products ({compareItems.length})
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
              <p className='text-center text-xs text-gray-500'>
                {compareItems.length < 2
                  ? `Add ${2 - compareItems.length} more product${
                      2 - compareItems.length > 1 ? 's' : ''
                    } to compare`
                  : 'Compare features, prices, and specifications'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
