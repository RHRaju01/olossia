import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, BarChart3, X, Star, ShoppingBag, Heart, Check, Minus, Eye } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNavigateWithScroll } from '../utils/navigation';

export const ComparePage = () => {
  const { items: compareItems, removeItem, clearCompare } = useCompare();
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigateWithScroll();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemoveFromCompare = async itemId => {
    await removeItem(itemId);
  };

  const handleClearCompare = async () => {
    if (window.confirm('Are you sure you want to clear all products from comparison?')) {
      await clearCompare();
    }
  };

  const handleAddToCart = async item => {
    const product = {
      id: item.product_id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
    };

    await addToCart(product);
  };

  const handleAddToWishlist = async item => {
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
  };

  const handleViewProduct = productId => {
    navigate(`/product/${productId}`);
  };

  // Comparison attributes
  const comparisonAttributes = [
    { key: 'price', label: 'Price', type: 'price' },
    { key: 'rating', label: 'Customer Rating', type: 'rating' },
    { key: 'reviews', label: 'Total Reviews', type: 'number' },
    { key: 'colors', label: 'Available Colors', type: 'colors' },
    { key: 'features', label: 'Key Features', type: 'features' },
    { key: 'specifications', label: 'Specifications', type: 'specifications' },
  ];

  const renderAttributeValue = (item, attribute) => {
    switch (attribute.type) {
      case 'price':
        return (
          <div className='space-y-1 text-center'>
            <div className='flex items-center justify-center gap-2'>
              <span className='text-2xl font-bold text-gray-900'>${item.price}</span>
              {item.originalPrice && (
                <span className='text-lg text-gray-400 line-through'>${item.originalPrice}</span>
              )}
            </div>
            {item.originalPrice && (
              <span className='text-sm font-bold text-green-600'>
                Save ${item.originalPrice - item.price}
              </span>
            )}
          </div>
        );
      case 'rating':
        return (
          <div className='space-y-2 text-center'>
            <div className='flex items-center justify-center gap-1'>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <p className='text-sm font-semibold text-gray-600'>{item.rating} out of 5</p>
          </div>
        );
      case 'number':
        return (
          <div className='text-center'>
            <span className='text-xl font-bold text-gray-900'>
              {item[attribute.key].toLocaleString()}
            </span>
            <p className='text-sm text-gray-600'>reviews</p>
          </div>
        );
      case 'colors':
        return (
          <div className='space-y-2'>
            <div className='flex flex-wrap justify-center gap-1'>
              {item.colors.slice(0, 6).map((color, index) => (
                <div
                  key={index}
                  className='h-6 w-6 rounded-full border border-gray-200'
                  style={{ backgroundColor: color }}
                  title={`Color ${index + 1}`}
                />
              ))}
            </div>
            <p className='text-center text-sm text-gray-600'>
              {item.colors.length} color{item.colors.length !== 1 ? 's' : ''} available
              {item.colors.length > 6 && ` (+${item.colors.length - 6} more)`}
            </p>
          </div>
        );
      case 'features':
        return (
          <ul className='space-y-1'>
            {item.features.slice(0, 4).map((feature, index) => (
              <li key={index} className='flex items-start gap-2 text-sm'>
                <Check className='mt-0.5 h-3 w-3 flex-shrink-0 text-green-500' />
                <span className='text-gray-700'>{feature}</span>
              </li>
            ))}
            {item.features.length > 4 && (
              <li className='ml-5 text-sm text-gray-500'>
                +{item.features.length - 4} more features
              </li>
            )}
          </ul>
        );
      case 'specifications':
        return (
          <div className='space-y-2'>
            {Object.entries(item.specifications)
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className='text-sm'>
                  <span className='font-medium text-gray-700'>{key}:</span>
                  <span className='ml-1 text-gray-600'>{value}</span>
                </div>
              ))}
            {Object.keys(item.specifications).length > 3 && (
              <p className='text-sm text-gray-500'>
                +{Object.keys(item.specifications).length - 3} more specs
              </p>
            )}
          </div>
        );
      default:
        return <span className='text-gray-700'>{item[attribute.key]}</span>;
    }
  };

  // Redirect if no items to compare
  React.useEffect(() => {
    if (compareItems.length === 0) {
      navigate('/');
    }
  }, [compareItems.length, navigate]);

  if (compareItems.length === 0) {
    return null; // Will redirect via useEffect
  }

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
                <BarChart3 className='h-8 w-8 text-blue-600' />
                Product Comparison
              </h1>
              <p className='mt-1 text-gray-600'>
                Comparing {compareItems.length} product{compareItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Button
            variant='outline'
            onClick={handleClearCompare}
            className='rounded-xl hover:border-red-200 hover:bg-red-50 hover:text-red-600'
          >
            Clear All
          </Button>
        </div>

        {/* Comparison Table */}
        <Card className='overflow-hidden rounded-2xl border-0 shadow-lg'>
          <CardContent className='p-0'>
            {/* Product Headers */}
            <div
              className={`grid grid-cols-1 gap-0 border-b border-gray-100 ${
                compareItems.length === 1
                  ? 'lg:grid-cols-2'
                  : compareItems.length === 2
                    ? 'lg:grid-cols-3'
                    : compareItems.length === 3
                      ? 'lg:grid-cols-4'
                      : 'lg:grid-cols-5'
              }`}
            >
              <div className='border-r border-gray-100 bg-gray-50 p-6 lg:col-span-1'>
                <h3 className='text-lg font-bold text-gray-900'>Products</h3>
                <p className='mt-1 text-sm text-gray-600'>
                  Comparing {compareItems.length} item{compareItems.length !== 1 ? 's' : ''}
                </p>
              </div>

              {compareItems.map(item => (
                <div
                  key={item.id}
                  className='border-r border-gray-100 p-6 text-center last:border-r-0'
                >
                  <div className='relative mb-4'>
                    <img
                      src={item.image}
                      alt={item.name}
                      className='mx-auto h-24 w-24 rounded-xl object-cover'
                    />
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => handleRemoveFromCompare(item.id)}
                      className='absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white shadow-lg hover:border-red-200 hover:bg-red-50'
                    >
                      <X className='h-3 w-3 text-red-500' />
                    </Button>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-xs font-bold uppercase text-blue-600'>{item.brand}</p>
                    <h4 className='font-semibold leading-tight text-gray-900'>{item.name}</h4>
                    <div className='flex items-center justify-center gap-2'>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleAddToWishlist(item)}
                        className={`h-8 w-8 rounded-full ${
                          isInWishlist(item.product_id)
                            ? 'border-red-200 bg-red-50 text-red-500'
                            : 'hover:border-red-200 hover:text-red-500'
                        }`}
                      >
                        <Heart
                          className={`h-3 w-3 ${isInWishlist(item.product_id) ? 'fill-current' : ''}`}
                        />
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleViewProduct(item.product_id)}
                        className='h-8 w-8 rounded-full hover:border-blue-200 hover:text-blue-600'
                      >
                        <Eye className='h-3 w-3' />
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className='rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1 text-sm font-semibold text-white hover:from-blue-600 hover:to-indigo-600'
                      >
                        <ShoppingBag className='mr-1 h-3 w-3' />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Attributes */}
            <div className='divide-y divide-gray-100'>
              {comparisonAttributes.map(attribute => (
                <div
                  key={attribute.key}
                  className={`grid grid-cols-1 gap-0 ${
                    compareItems.length === 1
                      ? 'lg:grid-cols-2'
                      : compareItems.length === 2
                        ? 'lg:grid-cols-3'
                        : compareItems.length === 3
                          ? 'lg:grid-cols-4'
                          : 'lg:grid-cols-5'
                  }`}
                >
                  <div className='border-r border-gray-100 bg-gray-50 p-6 lg:col-span-1'>
                    <h4 className='font-semibold text-gray-900'>{attribute.label}</h4>
                  </div>

                  {compareItems.map(item => (
                    <div key={item.id} className='border-r border-gray-100 p-6 last:border-r-0'>
                      {renderAttributeValue(item, attribute)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Insights */}
        {compareItems.length >= 2 && (
          <Card className='mt-8 rounded-2xl border-0 shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5 text-blue-600' />
                Comparison Insights
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Best Value */}
              <div className='rounded-xl bg-green-50 p-4'>
                <h4 className='mb-2 font-semibold text-green-800'>💰 Best Value</h4>
                {(() => {
                  const bestValue = compareItems.reduce((best, item) => {
                    const valueScore = (item.rating * item.reviews) / item.price;
                    const bestScore = (best.rating * best.reviews) / best.price;
                    return valueScore > bestScore ? item : best;
                  });
                  return (
                    <p className='text-green-700'>
                      <span className='font-bold'>{bestValue.name}</span> by {bestValue.brand}{' '}
                      offers the best value for money
                    </p>
                  );
                })()}
              </div>

              {/* Highest Rated */}
              <div className='rounded-xl bg-yellow-50 p-4'>
                <h4 className='mb-2 font-semibold text-yellow-800'>⭐ Highest Rated</h4>
                {(() => {
                  const highestRated = compareItems.reduce((best, item) =>
                    item.rating > best.rating ? item : best
                  );
                  return (
                    <p className='text-yellow-700'>
                      <span className='font-bold'>{highestRated.name}</span> has the highest
                      customer rating at {highestRated.rating}/5
                    </p>
                  );
                })()}
              </div>

              {/* Most Popular */}
              <div className='rounded-xl bg-blue-50 p-4'>
                <h4 className='mb-2 font-semibold text-blue-800'>🔥 Most Popular</h4>
                {(() => {
                  const mostPopular = compareItems.reduce((best, item) =>
                    item.reviews > best.reviews ? item : best
                  );
                  return (
                    <p className='text-blue-700'>
                      <span className='font-bold'>{mostPopular.name}</span> is the most popular with{' '}
                      {mostPopular.reviews.toLocaleString()} reviews
                    </p>
                  );
                })()}
              </div>

              {/* Price Range */}
              <div className='rounded-xl bg-purple-50 p-4'>
                <h4 className='mb-2 font-semibold text-purple-800'>💵 Price Range</h4>
                {(() => {
                  const prices = compareItems.map(item => item.price);
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  return (
                    <p className='text-purple-700'>
                      Price range:{' '}
                      <span className='font-bold'>
                        ${minPrice} - ${maxPrice}
                      </span>
                      {minPrice !== maxPrice && (
                        <span className='ml-2'>
                          ({Math.round(((maxPrice - minPrice) / minPrice) * 100)}% difference)
                        </span>
                      )}
                    </p>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {compareItems.length === 0 && (
          <div className='py-20 text-center'>
            <div className='mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gray-100'>
              <BarChart3 className='h-16 w-16 text-gray-400' />
            </div>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>No products to compare</h2>
            <p className='mx-auto mb-8 max-w-md text-gray-600'>
              Add products to your comparison list to see detailed side-by-side comparisons of
              features, prices, and specifications.
            </p>
            <Button
              onClick={() => navigate('/')}
              className='rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-3 font-semibold text-white hover:from-blue-600 hover:to-indigo-600'
            >
              Discover Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
