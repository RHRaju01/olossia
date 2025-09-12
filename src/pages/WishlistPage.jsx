import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Heart,
  ShoppingBag,
  X,
  Star,
  ArrowLeft,
  Filter,
  Grid,
  List,
  BarChart3,
} from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useCompare } from '../contexts/CompareContext';
import { useNavigateWithScroll } from '../utils/navigation';
import { useNavigate } from 'react-router-dom';

export const WishlistPage = () => {
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigateWithScroll();
  const [viewMode, setViewMode] = React.useState('grid');

  // Scroll to top when component mounts or ID changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemoveFromWishlist = async itemId => {
    await removeItem(itemId);
  };

  const handleAddToCart = async item => {
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
  };

  const handleAddToCompare = async item => {
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
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

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
                <Heart className='h-8 w-8 text-red-500' />
                My Wishlist
              </h1>
              <p className='mt-1 text-gray-600'>
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            {/* View mode toggle */}
            <div className='flex items-center rounded-xl border border-gray-200 bg-white p-1'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
                className='rounded-lg'
              >
                <Grid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='rounded-lg'
              >
                <List className='h-4 w-4' />
              </Button>
            </div>

            {wishlistItems.length > 0 && (
              <Button
                variant='outline'
                onClick={handleClearWishlist}
                className='rounded-xl hover:border-red-200 hover:bg-red-50 hover:text-red-600'
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {wishlistItems.length === 0 ? (
          <div className='py-20 text-center'>
            <div className='mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gray-100'>
              <Heart className='h-16 w-16 text-gray-400' />
            </div>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>Your wishlist is empty</h2>
            <p className='mx-auto mb-8 max-w-md text-gray-600'>
              Start adding items you love by clicking the heart icon on any product!
            </p>
            <Button
              onClick={() => navigate('/')}
              className='rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-8 py-3 font-semibold text-white hover:from-red-600 hover:to-pink-600'
            >
              Discover Products
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-6'
            }
          >
            {wishlistItems.map(item => (
              <Card
                key={item.id}
                className={`group overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-xl ${
                  viewMode === 'grid' ? 'rounded-2xl' : 'rounded-xl'
                }`}
              >
                <CardContent className='p-0'>
                  {viewMode === 'grid' ? (
                    // Grid view
                    <>
                      <div className='relative overflow-hidden'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105'
                        />

                        {item.originalPrice && (
                          <div className='absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white'>
                            SALE
                          </div>
                        )}

                        {!item.inStock && (
                          <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                            <span className='rounded-full bg-black/70 px-4 py-2 font-bold text-white'>
                              OUT OF STOCK
                            </span>
                          </div>
                        )}

                        <Button
                          size='icon'
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className='absolute right-3 top-3 h-8 w-8 rounded-full bg-white/90 text-red-500 shadow-lg hover:bg-white hover:text-red-600'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>

                      <div className='space-y-4 p-6'>
                        <div>
                          <p className='text-sm font-bold uppercase tracking-wider text-red-600'>
                            {item.brand}
                          </p>
                          <h3 className='text-lg font-bold leading-tight text-gray-900'>
                            {item.name}
                          </h3>
                        </div>

                        <div className='flex items-center gap-2'>
                          <div className='flex items-center gap-1'>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <span className='text-sm text-gray-600'>({item.reviews})</span>
                        </div>

                        <div className='flex items-center gap-2'>
                          <span className='text-sm text-gray-500'>Colors:</span>
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

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='text-xl font-bold text-gray-900'>${item.price}</span>
                            {item.originalPrice && (
                              <span className='text-sm text-gray-400 line-through'>
                                ${item.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            onClick={() => handleAddToCompare(item)}
                            className={`flex-1 rounded-xl py-2 font-semibold ${
                              isInCompare(item.product_id)
                                ? 'border-blue-200 bg-blue-50 text-blue-600'
                                : 'hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            <BarChart3 className='mr-2 h-4 w-4' />
                            {isInCompare(item.product_id) ? 'In Compare' : 'Compare'}
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.inStock}
                            className='flex-1 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 py-2 font-semibold text-white hover:from-red-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            <ShoppingBag className='mr-2 h-4 w-4' />
                            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List view
                    <div className='flex gap-6 p-6'>
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
                        {!item.inStock && (
                          <div className='absolute inset-0 flex items-center justify-center rounded-xl bg-black/50'>
                            <span className='text-xs font-bold text-white'>OUT OF STOCK</span>
                          </div>
                        )}
                      </div>

                      <div className='flex-1 space-y-3'>
                        <div>
                          <p className='text-sm font-bold uppercase tracking-wider text-red-600'>
                            {item.brand}
                          </p>
                          <h3 className='text-xl font-bold leading-tight text-gray-900'>
                            {item.name}
                          </h3>
                        </div>

                        <div className='flex items-center gap-4'>
                          <div className='flex items-center gap-1'>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <span className='text-sm text-gray-600'>({item.reviews} reviews)</span>
                        </div>

                        <div className='flex items-center gap-2'>
                          <span className='text-sm text-gray-500'>Available colors:</span>
                          <div className='flex gap-1'>
                            {item.colors.map((color, index) => (
                              <div
                                key={index}
                                className='h-5 w-5 rounded-full border border-gray-200'
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <span className='text-2xl font-bold text-gray-900'>${item.price}</span>
                            {item.originalPrice && (
                              <span className='text-lg text-gray-400 line-through'>
                                ${item.originalPrice}
                              </span>
                            )}
                          </div>

                          <div className='flex items-center gap-3'>
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              className='h-10 w-10 rounded-full hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={() => handleAddToCompare(item)}
                              className={`h-10 w-10 rounded-full ${
                                isInCompare(item.product_id)
                                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                                  : 'hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                            >
                              <BarChart3 className='h-4 w-4' />
                            </Button>
                            <Button
                              onClick={() => handleAddToCart(item)}
                              disabled={!item.inStock}
                              className='rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-6 py-2 font-semibold text-white hover:from-red-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              <ShoppingBag className='mr-2 h-4 w-4' />
                              {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
