import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigateWithScroll } from '../utils/navigation';

export const CategoriesPage = () => {
  const navigate = useNavigateWithScroll();

  const categories = [
    {
      id: 'women',
      label: "Women's Fashion",
      image:
        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '2,500+ items',
      description: "Discover the latest trends in women's fashion",
      subcategories: ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Lingerie'],
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      id: 'men',
      label: "Men's Fashion",
      image:
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '1,800+ items',
      description: 'Elevate your style with premium menswear',
      subcategories: ['Shirts', 'Pants', 'Suits', 'Casual', 'Activewear'],
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'kids',
      label: 'Kids & Baby',
      image:
        'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '900+ items',
      description: 'Comfortable and stylish clothing for little ones',
      subcategories: ['Baby (0-2)', 'Toddler (2-4)', 'Kids (4-12)', 'Teen (12+)', 'Accessories'],
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'beauty',
      label: 'Beauty & Care',
      image:
        'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '1,200+ items',
      description: 'Premium beauty products and skincare',
      subcategories: ['Skincare', 'Makeup', 'Fragrance', 'Hair Care', 'Tools'],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'shoes',
      label: 'Shoes & Footwear',
      image:
        'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '800+ items',
      description: 'Step up your game with premium footwear',
      subcategories: ['Sneakers', 'Dress Shoes', 'Boots', 'Sandals', 'Athletic'],
      gradient: 'from-gray-700 to-gray-900',
    },
    {
      id: 'bags',
      label: 'Bags & Accessories',
      image:
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '600+ items',
      description: 'Complete your look with designer accessories',
      subcategories: ['Handbags', 'Backpacks', 'Wallets', 'Jewelry', 'Watches'],
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'jewelry',
      label: 'Jewelry & Watches',
      image:
        'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '450+ items',
      description: 'Exquisite jewelry and timepieces',
      subcategories: ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Watches'],
      gradient: 'from-amber-500 to-yellow-500',
    },
    {
      id: 'home',
      label: 'Home & Living',
      image:
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',
      count: '750+ items',
      description: 'Transform your space with stylish home goods',
      subcategories: ['Decor', 'Bedding', 'Kitchen', 'Bath', 'Furniture'],
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const handleCategoryClick = categoryId => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate(-1)}
            className='rounded-full hover:bg-gray-100'
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-4xl font-black text-gray-900'>Shop by Category</h1>
            <p className='mt-2 text-xl text-gray-600'>
              Discover our carefully curated collections from the world's most beloved brands
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {categories.map(category => (
            <Card
              key={category.id}
              className='group cursor-pointer overflow-hidden rounded-3xl border-0 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl'
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className='p-0'>
                <div className='relative overflow-hidden'>
                  <img
                    src={category.image}
                    alt={category.label}
                    className='h-64 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110'
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-70`}
                  />

                  {/* Category info overlay */}
                  <div className='absolute inset-0 flex flex-col justify-end p-6 text-white'>
                    <div className='translate-y-2 transform rounded-2xl bg-black/30 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0'>
                      <h3 className='mb-2 text-xl font-black'>{category.label}</h3>
                      <p className='mb-3 text-sm opacity-90'>{category.description}</p>
                      <div className='flex items-center justify-between'>
                        <span className='rounded-full bg-white/20 px-3 py-1 text-sm font-bold'>
                          {category.count}
                        </span>
                        <ArrowRight className='h-5 w-5 transition-transform duration-200 group-hover:translate-x-1' />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                <div className='space-y-4 p-6'>
                  <h4 className='font-bold text-gray-900'>Popular in {category.label}</h4>
                  <div className='flex flex-wrap gap-2'>
                    {category.subcategories.map((sub, index) => (
                      <span
                        key={index}
                        className='cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-purple-100 hover:text-purple-700'
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  <Button
                    className='mt-4 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white hover:from-purple-700 hover:to-pink-700'
                    onClick={e => {
                      e.stopPropagation();
                      handleCategoryClick(category.id);
                    }}
                  >
                    Explore {category.label}
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Collections */}
        <div className='mt-20'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-black text-gray-900'>
              Featured{' '}
              <span className='bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                Collections
              </span>
            </h2>
            <p className='text-lg text-gray-600'>Curated selections from our fashion experts</p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            <Card className='overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'>
              <CardContent className='p-8 text-center'>
                <h3 className='mb-4 text-2xl font-bold'>New Arrivals</h3>
                <p className='mb-6 opacity-90'>Fresh styles just landed from top designers</p>
                <Button
                  variant='outline'
                  className='border-white/30 bg-white/20 text-white hover:bg-white/30'
                  onClick={() => navigate('/products?filter=new')}
                >
                  Shop New Arrivals
                </Button>
              </CardContent>
            </Card>

            <Card className='overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg'>
              <CardContent className='p-8 text-center'>
                <h3 className='mb-4 text-2xl font-bold'>Sale Items</h3>
                <p className='mb-6 opacity-90'>Up to 70% off on selected items</p>
                <Button
                  variant='outline'
                  className='border-white/30 bg-white/20 text-white hover:bg-white/30'
                  onClick={() => navigate('/products?filter=sale')}
                >
                  Shop Sale
                </Button>
              </CardContent>
            </Card>

            <Card className='overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'>
              <CardContent className='p-8 text-center'>
                <h3 className='mb-4 text-2xl font-bold'>Trending Now</h3>
                <p className='mb-6 opacity-90'>Most popular items this week</p>
                <Button
                  variant='outline'
                  className='border-white/30 bg-white/20 text-white hover:bg-white/30'
                  onClick={() => navigate('/trending')}
                >
                  Shop Trending
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
