import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft,
  Minus,
  Plus,
  X,
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  Gift,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigateWithScroll } from '../utils/navigation';

export const CartPage = () => {
  const { items: cartItems, totals, updateItem, removeItem, clearCart } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigateWithScroll();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
    } else {
      await updateItem(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async itemId => {
    await removeItem(itemId);
  };

  const handleMoveToWishlist = async item => {
    const product = {
      id: item.product_id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      rating: 4.5, // Default rating
      reviews: 100, // Default reviews
      colors: ['#000000', '#FFFFFF', '#FF6B9D'], // Default colors
    };

    await addToWishlist(product);
    await removeItem(item.id);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Could trigger auth modal or redirect to login
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  // Recommended products (mock data)
  const recommendedProducts = [
    {
      id: 'rec-1',
      name: 'Silk Scarf',
      brand: 'HERMÈS',
      price: 299,
      originalPrice: 399,
      image:
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.9,
    },
    {
      id: 'rec-2',
      name: 'Leather Wallet',
      brand: 'COACH',
      price: 149,
      image:
        'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.7,
    },
    {
      id: 'rec-3',
      name: 'Designer Sunglasses',
      brand: 'RAY-BAN',
      price: 199,
      originalPrice: 249,
      image:
        'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.8,
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate(-1)}
              className='rounded-full hover:bg-gray-100'
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h1 className='flex items-center gap-3 text-3xl font-black text-gray-900'>
                <ShoppingBag className='h-8 w-8 text-purple-600' />
                Shopping Cart
              </h1>
              <p className='mt-1 text-gray-600'>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant='outline'
              onClick={handleClearCart}
              className='rounded-xl hover:border-red-200 hover:bg-red-50 hover:text-red-600'
            >
              Clear Cart
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className='py-20 text-center'>
            <div className='mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gray-100'>
              <ShoppingBag className='h-16 w-16 text-gray-400' />
            </div>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>Your cart is empty</h2>
            <p className='mx-auto mb-8 max-w-md text-gray-600'>
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <Button
              onClick={() => navigate('/')}
              className='rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white hover:from-purple-700 hover:to-pink-700'
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-12 lg:grid-cols-3'>
            {/* Cart Items */}
            <div className='space-y-6 lg:col-span-2'>
              <Card className='rounded-2xl border-0 shadow-lg'>
                <CardHeader>
                  <CardTitle>Cart Items</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {cartItems.map((item, index) => (
                    <div key={item.id}>
                      <div className='flex gap-6'>
                        <div className='relative flex-shrink-0'>
                          <img
                            src={item.image}
                            alt={item.name}
                            className='h-32 w-32 rounded-xl object-cover'
                          />
                          {item.originalPrice && (
                            <div className='absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white'>
                              SALE
                            </div>
                          )}
                        </div>

                        <div className='flex-1 space-y-4'>
                          <div className='flex justify-between'>
                            <div>
                              <p className='text-sm font-bold uppercase tracking-wider text-purple-600'>
                                {item.brand}
                              </p>
                              <h3 className='text-xl font-bold leading-tight text-gray-900'>
                                {item.name}
                              </h3>
                              <p className='mt-1 text-gray-600'>
                                Size: {item.size} • Color: {item.color}
                              </p>
                            </div>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleRemoveItem(item.id)}
                              className='h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-600'
                            >
                              <X className='h-5 w-5' />
                            </Button>
                          </div>

                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <span className='text-2xl font-bold text-gray-900'>
                                ${item.price}
                              </span>
                              {item.originalPrice && (
                                <span className='text-lg text-gray-400 line-through'>
                                  ${item.originalPrice}
                                </span>
                              )}
                              {item.originalPrice && (
                                <span className='text-sm font-bold text-green-600'>
                                  Save ${item.originalPrice - item.price}
                                </span>
                              )}
                            </div>

                            <div className='flex items-center gap-4'>
                              {/* Quantity Controls */}
                              <div className='flex items-center gap-3 rounded-xl bg-gray-50 p-2'>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className='h-8 w-8 rounded-full hover:bg-white'
                                >
                                  <Minus className='h-4 w-4' />
                                </Button>
                                <span className='w-8 text-center text-lg font-bold'>
                                  {item.quantity}
                                </span>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className='h-8 w-8 rounded-full hover:bg-white'
                                >
                                  <Plus className='h-4 w-4' />
                                </Button>
                              </div>

                              {/* Move to Wishlist */}
                              <Button
                                variant='outline'
                                onClick={() => handleMoveToWishlist(item)}
                                className={`rounded-xl ${
                                  isInWishlist(item.product_id)
                                    ? 'border-red-200 bg-red-50 text-red-600'
                                    : 'hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                                }`}
                              >
                                <Heart
                                  className={`mr-2 h-4 w-4 ${isInWishlist(item.product_id) ? 'fill-current' : ''}`}
                                />
                                {isInWishlist(item.product_id)
                                  ? 'Saved for Later'
                                  : 'Save for Later'}
                              </Button>
                            </div>
                          </div>

                          <div className='text-right'>
                            <p className='text-sm text-gray-600'>
                              Subtotal:{' '}
                              <span className='font-bold text-gray-900'>
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < cartItems.length - 1 && <Separator className='mt-6' />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommended Products */}
              <Card className='rounded-2xl border-0 shadow-lg'>
                <CardHeader>
                  <CardTitle>You might also like</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
                    {recommendedProducts.map(product => (
                      <div key={product.id} className='group cursor-pointer'>
                        <div className='relative mb-3 overflow-hidden rounded-xl'>
                          <img
                            src={product.image}
                            alt={product.name}
                            className='h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105'
                          />
                          {product.originalPrice && (
                            <div className='absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white'>
                              SALE
                            </div>
                          )}
                        </div>
                        <div className='space-y-2'>
                          <p className='text-xs font-bold uppercase text-purple-600'>
                            {product.brand}
                          </p>
                          <h4 className='font-semibold text-gray-900'>{product.name}</h4>
                          <div className='flex items-center gap-1'>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                            <span className='ml-1 text-xs text-gray-500'>({product.rating})</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span className='font-bold text-gray-900'>${product.price}</span>
                            {product.originalPrice && (
                              <span className='text-sm text-gray-400 line-through'>
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          <Button className='w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-700'>
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className='lg:col-span-1'>
              <div className='sticky top-8 space-y-6'>
                {/* Order Summary */}
                <Card className='rounded-2xl border-0 shadow-lg'>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-3'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Subtotal ({totals.itemCount} items)</span>
                        <span className='font-semibold'>${totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Shipping</span>
                        <span className='font-semibold text-green-600'>
                          {totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Tax</span>
                        <span className='font-semibold'>$0.00</span>
                      </div>
                      <Separator />
                      <div className='flex justify-between text-lg font-bold'>
                        <span>Total</span>
                        <span>${totals.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className='w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl'
                    >
                      Proceed to Checkout
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </Button>

                    <Button
                      variant='outline'
                      onClick={() => navigate('/')}
                      className='w-full rounded-xl py-3'
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <Card className='rounded-2xl border-0 shadow-lg'>
                  <CardContent className='space-y-4 p-6'>
                    <div className='flex items-center gap-3 text-sm'>
                      <Truck className='h-5 w-5 text-blue-500' />
                      <div>
                        <p className='font-semibold text-gray-900'>Free Shipping</p>
                        <p className='text-gray-600'>On orders over $100</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 text-sm'>
                      <Shield className='h-5 w-5 text-green-500' />
                      <div>
                        <p className='font-semibold text-gray-900'>Secure Payment</p>
                        <p className='text-gray-600'>256-bit SSL encryption</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 text-sm'>
                      <Gift className='h-5 w-5 text-purple-500' />
                      <div>
                        <p className='font-semibold text-gray-900'>Easy Returns</p>
                        <p className='text-gray-600'>30-day return policy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Promo Code */}
                <Card className='rounded-2xl border-0 shadow-lg'>
                  <CardHeader>
                    <CardTitle className='text-lg'>Promo Code</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        placeholder='Enter promo code'
                        className='flex-1 rounded-xl border border-gray-200 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
                      />
                      <Button className='rounded-xl bg-gray-900 px-6 py-2 text-white hover:bg-gray-800'>
                        Apply
                      </Button>
                    </div>
                    <p className='text-xs text-gray-500'>
                      Enter a valid promo code to get a discount on your order
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
