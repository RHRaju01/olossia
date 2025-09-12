import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  ArrowLeft,
  Filter,
  Grid,
  List,
  Heart,
  ShoppingBag,
  Star,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  BarChart3,
  Search,
} from 'lucide-react';
import { SearchBar } from '../components/common/SearchBar/SearchBar';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCompare } from '../contexts/CompareContext';
import { useNavigateWithScroll } from '../utils/navigation';
import { ProductDetailsOverlay } from '../components/ProductDetailsOverlay/ProductDetailsOverlay';
import { ProductActions } from '../components/common/ProductActions/ProductActions';

export const ProductsPage = () => {
  const { addItem: addToCart, isInCart } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigateWithScroll();

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Mock products data
  const products = [
    {
      id: 1,
      name: 'Silk Midi Dress',
      brand: 'ZARA',
      price: 129,
      originalPrice: 189,
      image:
        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'women',
      isNew: true,
      discount: 32,
      rating: 4.8,
      reviews: 124,
      colors: ['#FF6B9D', '#000000', '#FFFFFF'],
    },
    {
      id: 2,
      name: 'Premium Cotton Blazer',
      brand: 'H&M',
      price: 89,
      image:
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'men',
      isNew: false,
      discount: 0,
      rating: 4.6,
      reviews: 89,
      colors: ['#8B4513', '#000000', '#708090'],
    },
    {
      id: 3,
      name: 'Vintage Denim Jacket',
      brand: "LEVI'S",
      price: 159,
      originalPrice: 199,
      image:
        'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'women',
      isNew: false,
      discount: 20,
      rating: 4.9,
      reviews: 203,
      colors: ['#4169E1', '#000080', '#87CEEB'],
    },
    {
      id: 4,
      name: 'Floral Maxi Dress',
      brand: 'MANGO',
      price: 99,
      image:
        'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'women',
      isNew: true,
      discount: 0,
      rating: 4.7,
      reviews: 156,
      colors: ['#FFB6C1', '#FFC0CB', '#FF69B4'],
    },
    {
      id: 5,
      name: 'Leather Crossbody Bag',
      brand: 'COACH',
      price: 299,
      originalPrice: 399,
      image:
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'accessories',
      isNew: false,
      discount: 25,
      rating: 4.9,
      reviews: 67,
      colors: ['#8B4513', '#000000', '#D2691E'],
    },
    {
      id: 6,
      name: 'Minimalist Sneakers',
      brand: 'NIKE',
      price: 119,
      image:
        'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'shoes',
      isNew: true,
      discount: 0,
      rating: 4.8,
      reviews: 234,
      colors: ['#FFFFFF', '#000000', '#FF6B9D'],
    },
  ];

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    {
      id: 'women',
      name: "Women's Fashion",
      count: products.filter(p => p.category === 'women').length,
    },
    {
      id: 'men',
      name: "Men's Fashion",
      count: products.filter(p => p.category === 'men').length,
    },
    {
      id: 'accessories',
      name: 'Accessories',
      count: products.filter(p => p.category === 'accessories').length,
    },
    {
      id: 'shoes',
      name: 'Shoes',
      count: products.filter(p => p.category === 'shoes').length,
    },
  ];

  const brands = [
    { id: 'all', name: 'All Brands', count: products.length },
    {
      id: 'ZARA',
      name: 'ZARA',
      count: products.filter(p => p.brand === 'ZARA').length,
    },
    {
      id: 'H&M',
      name: 'H&M',
      count: products.filter(p => p.brand === 'H&M').length,
    },
    {
      id: "LEVI'S",
      name: "LEVI'S",
      count: products.filter(p => p.brand === "LEVI'S").length,
    },
    {
      id: 'MANGO',
      name: 'MANGO',
      count: products.filter(p => p.brand === 'MANGO').length,
    },
    {
      id: 'COACH',
      name: 'COACH',
      count: products.filter(p => p.brand === 'COACH').length,
    },
    {
      id: 'NIKE',
      name: 'NIKE',
      count: products.filter(p => p.brand === 'NIKE').length,
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

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesRating = product.rating >= minRating;

    return matchesCategory && matchesBrand && matchesSearch && matchesPrice && matchesRating;
  });

  // Handle search from URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    const brandParam = urlParams.get('brand');

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (brandParam) setSelectedBrand(brandParam);
  }, []);

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
              <h1 className='text-3xl font-black text-gray-900'>All Products</h1>
              <p className='mt-1 text-gray-600'>{filteredProducts.length} products found</p>
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

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className='rounded-xl border border-gray-200 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              <option value='newest'>Newest First</option>
              <option value='price-low'>Price: Low to High</option>
              <option value='price-high'>Price: High to Low</option>
              <option value='rating'>Highest Rated</option>
              <option value='popular'>Most Popular</option>
            </select>

            {/* Mobile filter toggle */}
            <Button
              variant='outline'
              onClick={() => setShowFilters(!showFilters)}
              className='rounded-xl lg:hidden'
            >
              <Filter className='mr-2 h-4 w-4' />
              Filters
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
          {/* Filters Sidebar */}
          <div className={`space-y-6 lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className='rounded-2xl border-0 shadow-lg'>
              <CardContent className='p-6'>
                <h3 className='mb-4 flex items-center gap-2 font-bold text-gray-900'>
                  <SlidersHorizontal className='h-5 w-5' />
                  Filters
                </h3>

                {/* Search */}
                <div className='mb-6'>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>Search</label>
                  <SearchBar
                    onSearch={query => setSearchQuery(query)}
                    placeholder='Search products...'
                    showButton={false}
                  />
                </div>

                {/* Categories */}
                <div className='mb-6'>
                  <label className='mb-3 block text-sm font-semibold text-gray-700'>
                    Categories
                  </label>
                  <div className='space-y-2'>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-purple-100 font-semibold text-purple-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <span>{category.name}</span>
                          <span className='text-sm text-gray-500'>({category.count})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className='mb-6'>
                  <label className='mb-3 block text-sm font-semibold text-gray-700'>Brands</label>
                  <div className='max-h-48 space-y-2 overflow-y-auto'>
                    {brands.map(brand => (
                      <button
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                          selectedBrand === brand.id
                            ? 'bg-purple-100 font-semibold text-purple-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <span>{brand.name}</span>
                          <span className='text-sm text-gray-500'>({brand.count})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className='mb-6'>
                  <label className='mb-3 block text-sm font-semibold text-gray-700'>
                    Minimum Rating
                  </label>
                  <div className='space-y-2'>
                    {[4, 3, 2, 1, 0].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                          minRating === rating
                            ? 'bg-purple-100 font-semibold text-purple-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-center gap-1'>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span>{rating > 0 ? `${rating}+ Stars` : 'All Ratings'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className='mb-6'>
                  <label className='mb-3 block text-sm font-semibold text-gray-700'>
                    Price Range
                  </label>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Input
                        type='number'
                        value={priceRange[0]}
                        onChange={e => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        placeholder='Min'
                        className='rounded-lg'
                      />
                      <span className='text-gray-500'>to</span>
                      <Input
                        type='number'
                        value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        placeholder='Max'
                        className='rounded-lg'
                      />
                    </div>
                    <p className='text-sm text-gray-500'>
                      ${priceRange[0]} - ${priceRange[1]}
                    </p>
                  </div>
                </div>

                <Button
                  variant='outline'
                  className='w-full rounded-xl'
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                    setSearchQuery('');
                    setPriceRange([0, 500]);
                    setMinRating(0);
                    setSortBy('newest');
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className='lg:col-span-3'>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-6'
              }
            >
              {filteredProducts.map(product => (
                <Card
                  key={product.id}
                  className={`group cursor-pointer overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-xl ${
                    viewMode === 'grid' ? 'rounded-2xl' : 'rounded-xl'
                  }`}
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
                          <div className='absolute right-4 top-4 flex translate-x-0 transform flex-col gap-2 opacity-100 transition-all duration-300 lg:translate-x-2 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100'>
                            <Button
                              size='icon'
                              onClick={e => {
                                e.stopPropagation();
                                handleAddToWishlist(product);
                              }}
                              className={`h-10 w-10 rounded-full border-0 shadow-lg transition-all duration-300 ${
                                isInWishlist(product.id)
                                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white lg:hover:from-red-600 lg:hover:to-pink-600'
                                  : 'bg-white/90 text-gray-700 lg:hover:bg-white lg:hover:text-red-500'
                              }`}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  isInWishlist(product.id) ? 'fill-current' : ''
                                }`}
                              />
                            </Button>

                            <Button
                              size='icon'
                              onClick={e => {
                                e.stopPropagation();
                                handleQuickView(product);
                              }}
                              className='h-10 w-10 rounded-full border-0 bg-white/90 text-gray-700 shadow-lg lg:hover:bg-white lg:hover:text-blue-500'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>

                            <Button
                              size='icon'
                              onClick={e => {
                                e.stopPropagation();
                                handleAddToCompare(product);
                              }}
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
                              onClick={e => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              className={`h-10 w-10 rounded-full border-0 shadow-lg transition-all duration-300 ${
                                isInCart(product.id)
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white lg:hover:from-purple-600 lg:hover:to-pink-600'
                                  : 'bg-white/90 text-gray-700 lg:hover:bg-white lg:hover:text-purple-600'
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
                            <p className='text-sm font-bold uppercase tracking-wider text-purple-600'>
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
                              <span className='text-2xl font-black text-gray-900'>
                                ${product.price}
                              </span>
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
                          {product.isNew && (
                            <div className='absolute -right-2 -top-2 rounded-full bg-purple-500 px-2 py-1 text-xs font-bold text-white'>
                              NEW
                            </div>
                          )}
                          {product.discount > 0 && (
                            <div className='absolute -left-2 -top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white'>
                              -{product.discount}%
                            </div>
                          )}
                        </div>

                        <div className='flex-1 space-y-3'>
                          <div>
                            <p className='text-sm font-bold uppercase tracking-wider text-purple-600'>
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
                            <span className='text-sm text-gray-600'>
                              ({product.reviews} reviews)
                            </span>
                          </div>

                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-gray-500'>Available colors:</span>
                            <div className='flex gap-1'>
                              {product.colors.map((color, index) => (
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
                              <span className='text-2xl font-bold text-gray-900'>
                                ${product.price}
                              </span>
                              {product.originalPrice && (
                                <span className='text-lg text-gray-400 line-through'>
                                  ${product.originalPrice}
                                </span>
                              )}
                            </div>

                            <Button
                              variant='outline'
                              size='icon'
                              onClick={e => {
                                e.stopPropagation();
                                handleAddToWishlist(product);
                              }}
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
                              onClick={e => {
                                e.stopPropagation();
                                handleViewProduct(product.id);
                              }}
                              className='h-10 w-10 rounded-full hover:border-blue-200 hover:text-blue-600'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={e => {
                                e.stopPropagation();
                                handleAddToCompare(product);
                              }}
                              className={`h-10 w-10 rounded-full ${
                                isInCompare(product.id)
                                  ? 'border-blue-200 bg-blue-50 text-blue-500'
                                  : 'hover:border-blue-200 hover:text-blue-500'
                              }`}
                            >
                              <BarChart3 className='h-4 w-4' />
                            </Button>
                            <Button
                              onClick={e => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              className={`rounded-xl px-6 py-2 font-semibold ${
                                isInCart(product.id)
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                              }`}
                            >
                              <ShoppingBag className='mr-2 h-4 w-4' />
                              {isInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className='py-20 text-center'>
                <div className='mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gray-100'>
                  <Search className='h-16 w-16 text-gray-400' />
                </div>
                <h2 className='mb-4 text-2xl font-bold text-gray-900'>No products found</h2>
                <p className='mb-8 text-gray-600'>Try adjusting your filters or search terms</p>
                <Button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setPriceRange([0, 500]);
                  }}
                  className='rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white hover:from-purple-700 hover:to-pink-700'
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          <ProductDetailsOverlay
            product={quickViewProduct}
            isOpen={isQuickViewOpen}
            onClose={handleCloseQuickView}
            onViewFullDetails={handleViewProduct}
          />
        </div>
      </div>
    </div>
  );
};
