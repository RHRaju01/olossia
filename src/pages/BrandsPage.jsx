import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, Filter, Grid, List, Star, TrendingUp, Award, Users } from 'lucide-react';
import { SearchBar } from '../components/common/SearchBar/SearchBar';
import { useNavigateWithScroll } from '../utils/navigation';

export const BrandsPage = () => {
  const navigate = useNavigateWithScroll();

  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Mock brands data
  const brands = [
    {
      id: 'zara',
      name: 'ZARA',
      description: 'Contemporary fashion with the latest trends',
      image:
        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'fashion',
      productCount: 2847,
      rating: 4.6,
      reviews: 15420,
      followers: 2400000,
      isVerified: true,
      isTrending: true,
      priceRange: '$15 - $299',
      founded: '1975',
      country: 'Spain',
    },
    {
      id: 'hm',
      name: 'H&M',
      description: 'Affordable fashion for everyone',
      image:
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'fashion',
      productCount: 3156,
      rating: 4.4,
      reviews: 18750,
      followers: 1800000,
      isVerified: true,
      isTrending: false,
      priceRange: '$8 - $199',
      founded: '1947',
      country: 'Sweden',
    },
    {
      id: 'nike',
      name: 'NIKE',
      description: 'Just Do It - Athletic wear and footwear',
      image:
        'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'sports',
      productCount: 1892,
      rating: 4.8,
      reviews: 24680,
      followers: 3200000,
      isVerified: true,
      isTrending: true,
      priceRange: '$25 - $599',
      founded: '1964',
      country: 'USA',
    },
    {
      id: 'gucci',
      name: 'GUCCI',
      description: 'Italian luxury fashion house',
      image:
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'luxury',
      productCount: 567,
      rating: 4.9,
      reviews: 8940,
      followers: 1500000,
      isVerified: true,
      isTrending: false,
      priceRange: '$299 - $4999',
      founded: '1921',
      country: 'Italy',
    },
    {
      id: 'uniqlo',
      name: 'UNIQLO',
      description: 'Essential basics and innovative fabrics',
      image:
        'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'fashion',
      productCount: 1234,
      rating: 4.5,
      reviews: 12340,
      followers: 980000,
      isVerified: true,
      isTrending: true,
      priceRange: '$12 - $149',
      founded: '1949',
      country: 'Japan',
    },
    {
      id: 'adidas',
      name: 'ADIDAS',
      description: 'Impossible is Nothing - Sports and lifestyle',
      image:
        'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'sports',
      productCount: 1678,
      rating: 4.7,
      reviews: 19850,
      followers: 2800000,
      isVerified: true,
      isTrending: false,
      priceRange: '$30 - $449',
      founded: '1949',
      country: 'Germany',
    },
    {
      id: 'prada',
      name: 'PRADA',
      description: 'Italian luxury fashion and leather goods',
      image:
        'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'luxury',
      productCount: 423,
      rating: 4.8,
      reviews: 6780,
      followers: 1200000,
      isVerified: true,
      isTrending: true,
      priceRange: '$399 - $6999',
      founded: '1913',
      country: 'Italy',
    },
    {
      id: 'mango',
      name: 'MANGO',
      description: 'Mediterranean fashion with global appeal',
      image:
        'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'fashion',
      productCount: 1567,
      rating: 4.3,
      reviews: 11250,
      followers: 750000,
      isVerified: true,
      isTrending: false,
      priceRange: '$18 - $299',
      founded: '1984',
      country: 'Spain',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Brands', count: brands.length },
    { id: 'fashion', name: 'Fashion', count: brands.filter(b => b.category === 'fashion').length },
    {
      id: 'sports',
      name: 'Sports & Athletic',
      count: brands.filter(b => b.category === 'sports').length,
    },
    { id: 'luxury', name: 'Luxury', count: brands.filter(b => b.category === 'luxury').length },
  ];

  const handleBrandClick = brandId => {
    navigate(`/products?brand=${brandId}`);
  };

  const filteredBrands = brands.filter(brand => {
    const matchesCategory = selectedCategory === 'all' || brand.category === selectedCategory;
    const matchesSearch =
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const sortedBrands = [...filteredBrands].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'products':
        return b.productCount - a.productCount;
      case 'followers':
        return b.followers - a.followers;
      default: // popular
        return b.reviews - a.reviews;
    }
  });

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
              <h1 className='text-3xl font-black text-gray-900'>Premium Brands</h1>
              <p className='mt-1 text-gray-600'>{sortedBrands.length} brands found</p>
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
              <option value='popular'>Most Popular</option>
              <option value='name'>Name A-Z</option>
              <option value='rating'>Highest Rated</option>
              <option value='products'>Most Products</option>
              <option value='followers'>Most Followers</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
          {/* Filters Sidebar */}
          <div className='space-y-6 lg:col-span-1'>
            <Card className='rounded-2xl border-0 shadow-lg'>
              <CardContent className='p-6'>
                <h3 className='mb-4 flex items-center gap-2 font-bold text-gray-900'>
                  <Filter className='h-5 w-5' />
                  Filters
                </h3>

                {/* Search */}
                <div className='mb-6'>
                  <label className='mb-2 block text-sm font-semibold text-gray-700'>
                    Search Brands
                  </label>
                  <SearchBar
                    onSearch={query => setSearchQuery(query)}
                    placeholder='Search brands...'
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

                <Button
                  variant='outline'
                  className='w-full rounded-xl'
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSortBy('popular');
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Brands Grid */}
          <div className='lg:col-span-3'>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-6'
              }
            >
              {sortedBrands.map(brand => (
                <Card
                  key={brand.id}
                  className={`group cursor-pointer overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-xl ${
                    viewMode === 'grid' ? 'rounded-2xl' : 'rounded-xl'
                  }`}
                  onClick={() => handleBrandClick(brand.id)}
                >
                  <CardContent className='p-0'>
                    {viewMode === 'grid' ? (
                      // Grid view
                      <>
                        <div className='relative overflow-hidden'>
                          <img
                            src={brand.image}
                            alt={brand.name}
                            className='h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105'
                          />

                          {/* Badges */}
                          <div className='absolute left-4 top-4 flex flex-col gap-2'>
                            {brand.isVerified && (
                              <span className='flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white'>
                                <Award className='h-3 w-3' />
                                VERIFIED
                              </span>
                            )}
                            {brand.isTrending && (
                              <span className='flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white'>
                                <TrendingUp className='h-3 w-3' />
                                TRENDING
                              </span>
                            )}
                          </div>
                        </div>

                        <div className='space-y-4 p-6'>
                          <div>
                            <h3 className='text-xl font-bold leading-tight text-gray-900'>
                              {brand.name}
                            </h3>
                            <p className='mt-1 text-sm text-gray-600'>{brand.description}</p>
                          </div>

                          {/* Stats */}
                          <div className='grid grid-cols-2 gap-4 text-sm'>
                            <div>
                              <p className='text-gray-500'>Products</p>
                              <p className='font-bold text-gray-900'>
                                {brand.productCount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className='text-gray-500'>Followers</p>
                              <p className='font-bold text-gray-900'>
                                {(brand.followers / 1000000).toFixed(1)}M
                              </p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className='flex items-center gap-2'>
                            <div className='flex items-center gap-1'>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(brand.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                            <span className='text-sm font-medium text-gray-600'>
                              {brand.rating} ({brand.reviews.toLocaleString()} reviews)
                            </span>
                          </div>

                          {/* Price Range */}
                          <div className='rounded-xl bg-gray-50 p-3'>
                            <p className='text-sm text-gray-600'>Price Range</p>
                            <p className='font-bold text-gray-900'>{brand.priceRange}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      // List view
                      <div className='flex gap-6 p-6'>
                        <div className='relative flex-shrink-0'>
                          <img
                            src={brand.image}
                            alt={brand.name}
                            className='h-24 w-24 rounded-xl object-cover'
                          />
                          {brand.isVerified && (
                            <div className='absolute -right-2 -top-2 rounded-full bg-blue-500 p-1 text-white'>
                              <Award className='h-3 w-3' />
                            </div>
                          )}
                        </div>

                        <div className='flex-1 space-y-3'>
                          <div className='flex items-start justify-between'>
                            <div>
                              <div className='flex items-center gap-2'>
                                <h3 className='text-xl font-bold text-gray-900'>{brand.name}</h3>
                                {brand.isTrending && (
                                  <span className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700'>
                                    <TrendingUp className='h-3 w-3' />
                                    TRENDING
                                  </span>
                                )}
                              </div>
                              <p className='mt-1 text-gray-600'>{brand.description}</p>
                              <p className='mt-1 text-sm text-gray-500'>
                                Founded {brand.founded} • {brand.country}
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center gap-6'>
                            <div className='flex items-center gap-1'>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(brand.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                            <span className='text-sm text-gray-600'>
                              {brand.rating} ({brand.reviews.toLocaleString()} reviews)
                            </span>
                          </div>

                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-6 text-sm'>
                              <div>
                                <span className='text-gray-500'>Products: </span>
                                <span className='font-bold text-gray-900'>
                                  {brand.productCount.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className='text-gray-500'>Followers: </span>
                                <span className='font-bold text-gray-900'>
                                  {(brand.followers / 1000000).toFixed(1)}M
                                </span>
                              </div>
                              <div>
                                <span className='text-gray-500'>Price: </span>
                                <span className='font-bold text-gray-900'>{brand.priceRange}</span>
                              </div>
                            </div>

                            <Button className='rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 font-semibold text-white hover:from-purple-700 hover:to-pink-700'>
                              View Products
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {sortedBrands.length === 0 && (
              <div className='py-20 text-center'>
                <div className='mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gray-100'>
                  <Search className='h-16 w-16 text-gray-400' />
                </div>
                <h2 className='mb-4 text-2xl font-bold text-gray-900'>No brands found</h2>
                <p className='mb-8 text-gray-600'>Try adjusting your search or filters</p>
                <Button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className='rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white hover:from-purple-700 hover:to-pink-700'
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
