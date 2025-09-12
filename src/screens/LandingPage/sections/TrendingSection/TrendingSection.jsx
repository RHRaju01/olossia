import { useState, useCallback, useMemo } from 'react';
import { Button } from '../../../../components/ui/button';
import { TrendingUp } from 'lucide-react';
import { ProductCard } from '../../../../components/common/ProductCard/ProductCard';
import { useCart } from '../../../../contexts/CartContext';
import { useWishlist } from '../../../../contexts/WishlistContext';
import { useCompare } from '../../../../contexts/CompareContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigateWithScroll } from '../../../../utils/navigation';
import { ProductDetailsOverlay } from '../../../../components/ProductDetailsOverlay/ProductDetailsOverlay';

// Trending Product Card with trending badge
const TrendingProductCard = React.memo(({ product, index, ...props }) => (
  <div className='relative' style={{ animationDelay: `${index * 100}ms` }}>
    <ProductCard product={product} {...props} />
    {/* Trending badge overlay */}
    <div className='absolute left-4 top-4 z-10'>
      <div className='flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-bold text-white'>
        <TrendingUp className='h-3 w-3' />
        {product.trending}
      </div>
    </div>
  </div>
));

TrendingProductCard.displayName = 'TrendingProductCard';

export const TrendingSection = () => {
  const { addItem: addToCart, items: cartItems } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigateWithScroll();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const products = useMemo(
    () => [
      {
        id: 7,
        name: 'Oversized Blazer',
        brand: 'ZARA',
        price: 149,
        rating: 4.8,
        reviews: 324,
        image:
          'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500',
        colors: ['#000000', '#8B4513', '#708090'],
        trending: '+127% this week',
      },
      {
        id: 8,
        name: 'Vintage High-Waist Jeans',
        brand: "LEVI'S",
        price: 89,
        rating: 4.9,
        reviews: 189,
        image:
          'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500',
        colors: ['#4169E1', '#000080', '#87CEEB'],
        trending: '+89% this week',
      },
      {
        id: 9,
        name: 'Cashmere Knit Sweater',
        brand: 'UNIQLO',
        price: 79,
        rating: 4.7,
        reviews: 256,
        image:
          'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=500',
        colors: ['#F5F5DC', '#D2B48C', '#A0522D'],
        trending: '+156% this week',
      },
      {
        id: 10,
        name: 'Silk Summer Dress',
        brand: 'H&M',
        price: 99,
        rating: 4.6,
        reviews: 203,
        image:
          'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500',
        colors: ['#FFB6C1', '#FFC0CB', '#FF69B4'],
        trending: '+203% this week',
      },
      {
        id: 11,
        name: 'Premium Leather Jacket',
        brand: 'MANGO',
        price: 299,
        originalPrice: 399,
        rating: 4.9,
        reviews: 167,
        image:
          'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=500',
        colors: ['#000000', '#8B4513', '#2F4F4F'],
        trending: '+78% this week',
      },
      {
        id: 12,
        name: 'Designer Silk Scarf',
        brand: 'GUCCI',
        price: 399,
        rating: 5.0,
        reviews: 89,
        image:
          'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500',
        colors: ['#FFD700', '#FF6347', '#9370DB'],
        trending: '+234% this week',
      },
    ],
    []
  );

  const handleAddToWishlist = useCallback(
    async product => {
      if (isInWishlist(product.id)) {
        const wishlistItem = useWishlist().items.find(item => item.product_id === product.id);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
        }
      } else {
        await addToWishlist(product);
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist]
  );

  const handleAddToCompare = useCallback(
    async product => {
      await addToCompare(product);
    },
    [addToCompare]
  );

  const handleAddToCart = useCallback(
    async product => {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === product.id);
      if (existingItem) {
        // Item already in cart, could show a message or do nothing
        return;
      }

      const result = await addToCart(product);
      if (!result.success) {
        alert(result.error);
      }
    },
    [cartItems, addToCart]
  );

  const isInCart = useCallback(
    productId => {
      return cartItems.some(item => item.product_id === productId);
    },
    [cartItems]
  );

  const handleViewProduct = useCallback(
    productId => {
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  const handleQuickView = useCallback(product => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);

  return (
    <section className='bg-white py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='relative mb-16'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
            <div className='mb-4 flex items-center gap-3'>
              <TrendingUp className='h-8 w-8 text-green-500' />
              <h2 className='text-4xl font-black text-gray-900 lg:text-5xl'>
                Trending{' '}
                <span className='bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent'>
                  Now
                </span>
              </h2>
            </div>
            <p className='text-xl text-gray-600'>Most loved items this week by our community</p>

            {/* Mobile button - below description */}
            <div className='mt-6 lg:hidden'>
              <Button
                variant='outline'
                onClick={() => navigate('/trending')}
                className='rounded-full border-2 px-8 py-3 transition-all duration-300 hover:border-green-200 hover:bg-green-50'
              >
                View All Trending
              </Button>
            </div>
          </div>

          {/* Desktop button - right side */}
          <div className='hidden lg:block'>
            <Button
              variant='outline'
              onClick={() => navigate('/trending')}
              className='rounded-full border-2 px-8 py-3 transition-all duration-300 hover:border-green-200 hover:bg-green-50'
            >
              View All Trending
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {products.map((product, index) => (
            <TrendingProductCard
              key={product.id}
              product={product}
              index={index}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onAddToCompare={handleAddToCompare}
              onQuickView={handleQuickView}
              isInWishlist={isInWishlist}
              isInCompare={isInCompare}
              isInCart={isInCart}
            />
          ))}
        </div>
      </div>

      <ProductDetailsOverlay
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
        onViewFullDetails={handleViewProduct}
      />
    </section>
  );
};
