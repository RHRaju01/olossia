import { useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Heart, BarChart3 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCompare } from '../../contexts/CompareContext';
import { useNavigate } from 'react-router-dom';

// Memoized cart item component
const CartItem = React.memo(({ item, onUpdateQuantity, onRemoveItem }) => {
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
        </div>

        <div className='flex-1 space-y-2'>
          <div>
            {item.brand && (
              <p className='text-xs font-bold uppercase text-purple-600'>{item.brand}</p>
            )}
            <h4 className='font-semibold leading-tight text-gray-900'>
              {item.name || (item.products && item.products.name) || 'Unknown Product'}
            </h4>
            <p className='text-sm text-gray-500'>
              Size: {item.size || 'N/A'} • Color: {item.color || 'N/A'}
            </p>
          </div>

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
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() =>
                    onUpdateQuantity(
                      item.product_id || (item.products && item.products.id),
                      item.quantity - 1
                    )
                  }
                  className='h-8 w-8 rounded-full border-gray-200'
                >
                  <Minus className='h-3 w-3' />
                </Button>
                <span className='w-8 text-center font-semibold'>{item.quantity}</span>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() =>
                    onUpdateQuantity(
                      item.product_id || (item.products && item.products.id),
                      item.quantity + 1
                    )
                  }
                  className='h-8 w-8 rounded-full border-gray-200'
                >
                  <Plus className='h-3 w-3' />
                </Button>
              </div>

              <Button
                variant='outline'
                size='icon'
                onClick={() => onRemoveItem(item.product_id || (item.products && item.products.id))}
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
});

CartItem.displayName = 'CartItem';

export const CartDropdown = ({ isOpen, onClose }) => {
  const { items: cartItems, subtotal, shipping, total, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const handleUpdateQuantity = useCallback(
    async (itemId, newQuantity) => {
      if (newQuantity <= 0) {
        await removeItem(itemId);
      } else {
        await updateItem(itemId, newQuantity);
      }
    },
    [updateItem, removeItem]
  );

  const handleRemoveItem = useCallback(
    async itemId => {
      await removeItem(itemId);
    },
    [removeItem]
  );

  if (!isOpen) return null;

  return (
    <div className='absolute right-0 top-full z-[55] mt-2 w-96'>
      <Card className='overflow-hidden rounded-2xl border-0 bg-white shadow-2xl'>
        <CardContent className='p-0'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6'>
            <div className='flex items-center gap-3'>
              <ShoppingBag className='h-6 w-6 text-purple-600' />
              <h3 className='text-lg font-bold text-gray-900'>Shopping Cart</h3>
              <span className='rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700'>
                {cartItems.length}
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

          {/* Cart Items */}
          <div className='scrollbar-hide max-h-80 overflow-y-auto'>
            {cartItems.length > 0 ? (
              cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              ))
            ) : (
              <div className='p-12 text-center'>
                <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
                  <ShoppingBag className='h-10 w-10 text-gray-400' />
                </div>
                <h3 className='mb-2 text-lg font-semibold text-gray-900'>Your cart is empty</h3>
                <p className='mx-auto mb-6 max-w-sm text-gray-500'>
                  Discover amazing products and add them to your cart to get started!
                </p>
                <Button
                  onClick={onClose}
                  className='rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 font-semibold text-white hover:from-purple-700 hover:to-pink-700'
                >
                  Start Shopping
                </Button>
              </div>
            )}
          </div>

          {/* Summary - only show when cart has items */}
          {cartItems.length > 0 && (
            <div className='space-y-4 bg-gray-50 p-6'>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='font-semibold'>${subtotal}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Shipping</span>
                  <span className='font-semibold text-green-600'>
                    {shipping === 0 ? 'Free' : `$${shipping}`}
                  </span>
                </div>
                <Separator />
                <div className='flex justify-between text-lg font-bold'>
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>

              <div className='space-y-3'>
                <Button
                  onClick={() => {
                    navigate('/checkout');
                    onClose();
                  }}
                  className='w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-bold text-white hover:from-purple-700 hover:to-pink-700'
                >
                  Checkout
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    navigate('/cart');
                    onClose();
                  }}
                  className='w-full rounded-xl py-3'
                >
                  View Full Cart
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
