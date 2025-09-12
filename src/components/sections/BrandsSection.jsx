import { memo } from 'react';
import { Button } from '../ui/button';
import { useNavigateWithScroll } from '../../utils/navigation';

export const BrandsSection = memo(() => {
  const navigate = useNavigateWithScroll();

  const handleBrandClick = brandId => {
    navigate(`/products?brand=${brandId}`);
  };

  const brands = [
    {
      name: 'ZARA',
      image:
        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Contemporary Fashion',
    },
    {
      name: 'H&M',
      image:
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Affordable Style',
    },
    {
      name: 'UNIQLO',
      image:
        'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Essential Basics',
    },
    {
      name: 'NIKE',
      image:
        'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Athletic Wear',
    },
    {
      name: 'ADIDAS',
      image:
        'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Sports & Lifestyle',
    },
    {
      name: 'PUMA',
      image:
        'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Performance Gear',
    },
    {
      name: 'GUCCI',
      image:
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Luxury Fashion',
    },
    {
      name: 'PRADA',
      image:
        'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Italian Elegance',
    },
    {
      name: 'VERSACE',
      image:
        'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Bold & Glamorous',
    },
    {
      name: 'BALENCIAGA',
      image:
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Avant-garde Design',
    },
    {
      name: 'DIOR',
      image:
        'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Timeless Luxury',
    },
    {
      name: 'CHANEL',
      image:
        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Classic Elegance',
    },
  ];

  return (
    <section className='bg-gradient-to-b from-white to-gray-50 py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-16 text-center'>
          <h2 className='mb-6 text-4xl font-black text-gray-900 lg:text-5xl'>
            Premium{' '}
            <span className='bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              Brands
            </span>
          </h2>
          <p className='mx-auto max-w-3xl text-xl text-gray-600'>
            Shop from the world's most prestigious fashion houses and emerging designers
          </p>
        </div>

        <div className='grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
          {brands.map(brand => (
            <div
              key={brand.name}
              className='group cursor-pointer'
              onClick={() => handleBrandClick(brand.name)}
            >
              <div className='relative overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-500 hover:-translate-y-2 hover:border-gray-200 hover:shadow-xl'>
                <div className='relative aspect-square'>
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent'></div>

                  {/* Brand overlay */}
                  <div className='absolute inset-0 flex flex-col justify-end p-4'>
                    <div className='translate-y-2 transform rounded-2xl bg-white/95 p-3 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0'>
                      <h3 className='text-lg font-black text-gray-900'>{brand.name}</h3>
                      <p className='text-sm font-medium text-gray-600'>{brand.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-16 text-center'>
          <Button
            variant='outline'
            size='lg'
            onClick={() => navigate('/brands')}
            className='rounded-full border-2 px-12 py-4 text-lg font-semibold transition-all duration-300 hover:border-purple-200 hover:bg-purple-50'
          >
            View All Brands
          </Button>
        </div>
      </div>
    </section>
  );
});

BrandsSection.displayName = 'BrandsSection';
