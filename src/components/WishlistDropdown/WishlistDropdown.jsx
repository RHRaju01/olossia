import { useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Heart, ShoppingBag, X, Star, BarChart3 } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

// Memoized wishlist item component
const WishlistItem = React.memo(
  ({ item, onRemoveFromWishlist, onAddToCart, onAddToCompare, isInCompare }) => {
    return (
      <div className='border-b border-gray-50 p-6 last:border-b-0'>
        <div className='flex gap-4'>
          <div className='relative'>
            <img
              src={
                item.image ||
                (item.images && item.images[0]) ||
                (item.products && item.products.images && item.products.images[0]) ||
                '/placeholder-image.jpg'
              }
              alt={item.name || 'Product'}
              className='h-20 w-20 rounded-xl object-cover'
              loading='lazy'
            />
            {item.originalPrice && (
              <div className='absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white'>
                SALE
              </div>
            )}
            {!item.inStock && (
              <div className='absolute inset-0 flex items-center justify-center rounded-xl bg-black/50'>
                <span className='text-xs font-bold text-white'>OUT OF STOCK</span>
              </div>
            )}
          </div>

          <div className='flex-1 space-y-2'>
            <div>
              {item.brand && (
                <p className='text-xs font-bold uppercase text-red-600'>{item.brand}</p>
              )}
              <h4 className='font-semibold leading-tight text-gray-900'>
                {item.name || (item.products && item.products.name) || 'Unknown Product'}
              </h4>
            </div>

            {/* Rating */}
            {(item.rating || item.reviews) && (
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(item.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {item.reviews && <span className='text-xs text-gray-500'>({item.reviews})</span>}
              </div>
            )}

            {/* Colors */}
            {item.colors && item.colors.length > 0 && (
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500'>Colors:</span>
                <div className='flex gap-1'>
                  {item.colors.map((color, index) => (
                    <div
                      key={index}
                      className='h-4 w-4 rounded-full border border-gray-200'
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='font-bold text-gray-900'>
                  ${item.price || (item.products && item.products.price) || 0}
                </span>
                {item.originalPrice && (
                  <span className='text-sm text-gray-400 line-through'>${item.originalPrice}</span>
                )}
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() =>
                    onRemoveFromWishlist(item.product_id || (item.products && item.products.id))
                  }
                  className='h-8 w-8 rounded-full border-gray-200 hover:border-red-300 hover:bg-red-50'
                >
                  <X className='h-3 w-3 text-red-500' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => onAddToCompare(item)}
                  className={`h-8 w-8 rounded-full border-gray-200 ${
                    isInCompare(item.product_id)
                      ? 'border-blue-300 bg-blue-50 text-blue-600'
                      : 'hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <BarChart3 className='h-3 w-3 text-blue-600' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => onAddToCart(item)}
                  className='h-8 w-8 rounded-full border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  disabled={!item.inStock}
                >
                  <ShoppingBag className='h-3 w-3 text-purple-600' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WishlistItem.displayName = 'WishlistItem';

export const WishlistDropdown = ({ isOpen, onClose }) => {
  const { items: wishlistItems, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigate();

  const handleRemoveFromWishlist = useCallback(
    async itemId => {
      await removeItem(itemId);
    },
    [removeItem]
  );

  const handleAddToCart = useCallback(
    async item => {
      if (!item.inStock) return;

      const product = {
        id: item.product_id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
      };

      const result = await addToCart(product);
      if (result.success) {
        // Optionally remove from wishlist after adding to cart
        // await removeItem(item.id);
      }
    },
    [addToCart]
  );

  const handleAddToCompare = useCallback(
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

      await addToCompare(product);
    },
    [addToCompare]
  );

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
          <div className='flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50 p-6'>
            <div className='flex items-center gap-3'>
              <Heart className='h-6 w-6 text-red-500' />
              <h3 className='text-lg font-bold text-gray-900'>Wishlist</h3>
              <span className='rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700'>
                {wishlistItems.length}
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

          {/* Wishlist Items */}
          <div className='scrollbar-hide max-h-80 overflow-y-auto'>
            {wishlistItems.length > 0 ? (
              wishlistItems.map(item => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  onAddToCart={handleAddToCart}
                  onAddToCompare={handleAddToCompare}
                  isInCompare={isInCompare}
                />
              ))
            ) : (
              <div className='p-12 text-center'>
                <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
                  <Heart className='h-10 w-10 text-gray-400' />
                </div>
                <h3 className='mb-2 text-lg font-semibold text-gray-900'>Your wishlist is empty</h3>
                <p className='mx-auto mb-6 max-w-sm text-gray-500'>
                  Save items you love by clicking the heart icon on any product!
                </p>
                <Button
                  onClick={onClose}
                  className='rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-6 py-2 font-semibold text-white hover:from-red-600 hover:to-pink-600'
                >
                  Discover Products
                </Button>
              </div>
            )}
          </div>

          {/* Footer - only show when wishlist has items */}
          {wishlistItems.length > 0 && (
            <div className='space-y-3 bg-gray-50 p-6'>
              <Button
                onClick={() => {
                  navigate('/wishlist');
                  onClose();
                }}
                className='w-full rounded-xl bg-gradient-to-r from-red-500 to-pink-500 py-3 font-bold text-white hover:from-red-600 hover:to-pink-600'
              >
                View Full Wishlist
              </Button>
              <p className='text-center text-xs text-gray-500'>
                Items in your wishlist are saved for 30 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
