import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  ArrowLeft,
  TrendingUp,
  Heart,
  ShoppingBag,
  Star,
  Eye,
  Filter,
  Grid,
  List,
  BarChart3,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCompare } from '../contexts/CompareContext';
import { useNavigateWithScroll } from '../utils/navigation';
import { ProductDetailsOverlay } from '../components/ProductDetailsOverlay/ProductDetailsOverlay';

export const TrendingPage = () => {
  const { addItem: addToCart, isInCart } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigateWithScroll();

  const [viewMode, setViewMode] = useState('grid');
  const [timeFilter, setTimeFilter] = useState('week');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Mock trending products data
  const trendingProducts = [
    {
      id: 1,
      name: 'Oversized Blazer',
      brand: 'ZARA',
      price: 149,
      rating: 4.8,
      reviews: 324,
      image:
        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500',
      colors: ['#000000', '#8B4513', '#708090'],
      trending: '+127% this week',
      trendingScore: 127,
      category: 'women',
    },
    {
      id: 2,
      name: 'Vintage High-Waist Jeans',
      brand: "LEVI'S",
      price: 89,
      rating: 4.9,
      reviews: 189,
      image:
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500',
      colors: ['#4169E1', '#000080', '#87CEEB'],
      trending: '+89% this week',
      trendingScore: 89,
      category: 'women',
    },
    {
      id: 3,
      name: 'Cashmere Knit Sweater',
      brand: 'UNIQLO',
      price: 79,
      rating: 4.7,
      reviews: 256,
      image:
        'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=500',
      colors: ['#F5F5DC', '#D2B48C', '#A0522D'],
      trending: '+156% this week',
      trendingScore: 156,
      category: 'unisex',
    },
    {
      id: 4,
      name: 'Silk Summer Dress',
      brand: 'H&M',
      price: 99,
      rating: 4.6,
      reviews: 203,
      image:
        'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500',
      colors: ['#FFB6C1', '#FFC0CB', '#FF69B4'],
      trending: '+203% this week',
      trendingScore: 203,
      category: 'women',
    },
    {
      id: 5,
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
      trendingScore: 78,
      category: 'unisex',
    },
    {
      id: 6,
      name: 'Designer Silk Scarf',
      brand: 'GUCCI',
      price: 399,
      rating: 5.0,
      reviews: 89,
      image:
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500',
      colors: ['#FFD700', '#FF6347', '#9370DB'],
      trending: '+234% this week',
      trendingScore: 234,
      category: 'accessories',
    },
    {
      id: 7,
      name: 'Athletic Sneakers',
      brand: 'NIKE',
      price: 129,
      rating: 4.8,
      reviews: 445,
      image:
        'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=500',
      colors: ['#FFFFFF', '#000000', '#FF6B9D'],
      trending: '+312% this week',
      trendingScore: 312,
      category: 'shoes',
    },
    {
      id: 8,
      name: 'Minimalist Watch',
      brand: 'DANIEL WELLINGTON',
      price: 199,
      originalPrice: 249,
      rating: 4.7,
      reviews: 178,
      image:
        'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=500',
      colors: ['#C0C0C0', '#FFD700', '#8B4513'],
      trending: '+95% this week',
      trendingScore: 95,
      category: 'accessories',
    },
  ];

  const handleAddToWishlist = async product => {
    await addToWishlist(product);
  };

  const handleAddToCompare = async product => {
    await addToCompare(product);
  };

  const handleAddToCart = async product => {
    await addToCart(product);
  };

  const handleViewProduct = productId => {
    navigate(`/product/${productId}`);
  };

  const handleQuickView = product => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // Sort products by trending score
  const sortedProducts = [...trendingProducts].sort((a, b) => b.trendingScore - a.trendingScore);

  const getTrendingColor = score => {
    if (score >= 200) return 'text-red-500';
    if (score >= 100) return 'text-orange-500';
    return 'text-green-500';
  };

  const getTrendingBadgeColor = score => {
    if (score >= 200) return 'from-red-500 to-pink-500';
    if (score >= 100) return 'from-orange-500 to-red-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 flex items-center justify-between'>
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
              <div className='mb-2 flex items-center gap-3'>
                <TrendingUp className='h-8 w-8 text-green-500' />
                <h1 className='text-4xl font-black text-gray-900'>
                  Trending{' '}
                  <span className='bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent'>
                    Now
                  </span>
                </h1>
              </div>
              <p className='text-xl text-gray-600'>
                Most loved items this {timeFilter} by our community
              </p>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            {/* Time filter */}
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              className='rounded-xl border border-gray-200 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500'
            >
              <option value='day'>Today</option>
              <option value='week'>This Week</option>
              <option value='month'>This Month</option>
              <option value='year'>This Year</option>
            </select>

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
          </div>
        </div>

        {/* Trending Stats */}
        <div className='mb-12 grid grid-cols-1 gap-6 md:grid-cols-4'>
          <Card className='rounded-2xl border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'>
            <CardContent className='p-6 text-center'>
              <TrendingUp className='mx-auto mb-2 h-8 w-8' />
              <p className='text-2xl font-bold'>+156%</p>
              <p className='text-sm opacity-90'>Average Growth</p>
            </CardContent>
          </Card>
          <Card className='rounded-2xl border-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'>
            <CardContent className='p-6 text-center'>
              <Eye className='mx-auto mb-2 h-8 w-8' />
              <p className='text-2xl font-bold'>2.4M</p>
              <p className='text-sm opacity-90'>Total Views</p>
            </CardContent>
          </Card>
          <Card className='rounded-2xl border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'>
            <CardContent className='p-6 text-center'>
              <Heart className='mx-auto mb-2 h-8 w-8' />
              <p className='text-2xl font-bold'>45K</p>
              <p className='text-sm opacity-90'>Added to Wishlist</p>
            </CardContent>
          </Card>
          <Card className='rounded-2xl border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'>
            <CardContent className='p-6 text-center'>
              <ShoppingBag className='mx-auto mb-2 h-8 w-8' />
              <p className='text-2xl font-bold'>12K</p>
              <p className='text-sm opacity-90'>Items Sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-6'
          }
        >
          {sortedProducts.map((product, index) => (
            <Card
              key={product.id}
              className={`group cursor-pointer overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-xl ${
                viewMode === 'grid' ? 'rounded-2xl' : 'rounded-xl'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className='p-0'>
                {viewMode === 'grid' ? (
                  // Grid view
                  <>
                    <div className='relative overflow-hidden'>
                      <img
                        src={product.image}
                        alt={product.name}
                        className='h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105'
                      />

                      {/* Trending rank */}
                      <div className='absolute left-4 top-4'>
                        <div className='rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-gray-900 shadow-lg backdrop-blur-sm'>
                          #{index + 1}
                        </div>
                      </div>

                      {/* Trending indicator */}
                      <div className='absolute right-4 top-4'>
                        <div
                          className={`bg-gradient-to-r ${getTrendingBadgeColor(
                            product.trendingScore
                          )} flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white`}
                        >
                          <TrendingUp className='h-3 w-3' />
                          {product.trending}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className='absolute right-4 top-4 flex flex-col gap-2 opacity-100 transition-all duration-300 lg:opacity-0 lg:group-hover:opacity-100'>
                        <Button
                          size='icon'
                          onClick={e => {
                            e.stopPropagation();
                            handleAddToWishlist(product);
                          }}
                          className={`h-10 w-10 rounded-full border-0 bg-white/90 shadow-lg lg:hover:bg-white ${
                            isInWishlist(product.id)
                              ? 'bg-red-50 text-red-500 lg:hover:bg-red-100'
                              : 'text-gray-700 lg:hover:text-red-500'
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`}
                          />
                        </Button>
                        <Button
                          size='icon'
                          onClick={e => {
                            e.stopPropagation();
                            handleQuickView(product);
                          }}
                          className='h-10 w-10 rounded-full border-0 bg-white/90 text-gray-700 shadow-lg lg:hover:bg-white lg:hover:text-blue-600'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          size='icon'
                          onClick={e => {
                            e.stopPropagation();
                            handleAddToCompare(product);
                          }}
                          className={`h-10 w-10 rounded-full border-0 bg-white/90 shadow-lg lg:hover:bg-white ${
                            isInCompare(product.id)
                              ? 'bg-blue-50 text-blue-500 lg:hover:bg-blue-100'
                              : 'text-gray-700 lg:hover:text-blue-500'
                          }`}
                        >
                          <BarChart3 className='h-4 w-4' />
                        </Button>
                        <Button
                          size='icon'
                          onClick={e => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className={`h-10 w-10 rounded-full border-0 shadow-lg transition-all duration-300 ${
                            isInCart(product.id)
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white lg:hover:from-green-600 lg:hover:to-emerald-600'
                              : 'bg-white/90 text-gray-700 lg:hover:bg-white lg:hover:text-green-600'
                          }`}
                        >
                          <ShoppingBag className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    <div
                      className='cursor-pointer space-y-4 p-6'
                      onClick={() => handleViewProduct(product.id)}
                    >
                      <div>
                        <p className='text-sm font-bold uppercase tracking-wider text-green-600'>
                          {product.brand}
                        </p>
                        <h3 className='mt-1 text-lg font-bold leading-tight text-gray-900'>
                          {product.name}
                        </h3>
                      </div>

                      {/* Rating */}
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1'>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className='text-sm font-medium text-gray-600'>
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      {/* Trending info */}
                      <div className='rounded-xl bg-green-50 p-3'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-semibold text-green-700'>
                            Trending Score
                          </span>
                          <span
                            className={`text-lg font-bold ${getTrendingColor(
                              product.trendingScore
                            )}`}
                          >
                            +{product.trendingScore}%
                          </span>
                        </div>
                        <p className='mt-1 text-xs text-green-600'>Growth this week</p>
                      </div>

                      {/* Colors */}
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-gray-500'>Colors:</span>
                        <div className='flex gap-1'>
                          {product.colors.map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className='h-5 w-5 cursor-pointer rounded-full border-2 border-gray-200 transition-colors hover:border-gray-400'
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='text-2xl font-black text-gray-900'>
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className='text-lg text-gray-400 line-through'>
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // List view
                  <div className='flex gap-6 p-6'>
                    <div className='relative flex-shrink-0'>
                      <img
                        src={product.image}
                        alt={product.name}
                        className='h-32 w-32 rounded-xl object-cover'
                      />
                      <div className='absolute -left-2 -top-2 rounded-full bg-white/95 px-2 py-1 text-sm font-bold text-gray-900 shadow-lg backdrop-blur-sm'>
                        #{index + 1}
                      </div>
                      <div
                        className={`absolute -right-2 -top-2 bg-gradient-to-r ${getTrendingBadgeColor(
                          product.trendingScore
                        )} rounded-full px-2 py-1 text-xs font-bold text-white`}
                      >
                        +{product.trendingScore}%
                      </div>
                    </div>

                    <div className='flex-1 space-y-3'>
                      <div>
                        <p className='text-sm font-bold uppercase tracking-wider text-green-600'>
                          {product.brand}
                        </p>
                        <h3 className='text-xl font-bold leading-tight text-gray-900'>
                          {product.name}
                        </h3>
                      </div>

                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-1'>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className='text-sm text-gray-600'>({product.reviews} reviews)</span>
                        <div className='rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700'>
                          {product.trending}
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-500'>Available colors:</span>
                        <div className='flex gap-1'>
                          {product.colors.map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className='h-5 w-5 rounded-full border border-gray-200'
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <span className='text-2xl font-bold text-gray-900'>${product.price}</span>
                          {product.originalPrice && (
                            <span className='text-lg text-gray-400 line-through'>
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className='flex items-center gap-3'>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleAddToWishlist(product)}
                            className={`h-10 w-10 rounded-full ${
                              isInWishlist(product.id)
                                ? 'border-red-200 bg-red-50 text-red-500'
                                : 'hover:border-red-200 hover:text-red-500'
                            }`}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                isInWishlist(product.id) ? 'fill-current' : ''
                              }`}
                            />
                          </Button>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleViewProduct(product.id)}
                            className='h-10 w-10 rounded-full hover:border-blue-200 hover:text-blue-600'
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleAddToCompare(product)}
                            className={`h-10 w-10 rounded-full ${
                              isInCompare(product.id)
                                ? 'border-blue-200 bg-blue-50 text-blue-500'
                                : 'hover:border-blue-200 hover:text-blue-500'
                            }`}
                          >
                            <BarChart3 className='h-4 w-4' />
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className={`rounded-xl px-6 py-2 font-semibold ${
                              isInCart(product.id)
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                            }`}
                          >
                            <ShoppingBag className='mr-2 h-4 w-4' />
                            {isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
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
      </div>

      <ProductDetailsOverlay
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
        onViewFullDetails={handleViewProduct}
      />
    </div>
  );
};
