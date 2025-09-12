import { memo } from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles, Shield, Truck, Heart } from 'lucide-react';
import { useNavigateWithScroll } from '../../utils/navigation';

export const HeroSection = memo(() => {
  const navigate = useNavigateWithScroll();

  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50'>
      {/* Background decorations */}
      <div className='absolute left-10 top-20 h-32 w-32 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-3xl'></div>
      <div className='absolute bottom-20 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-pink-200/30 to-purple-200/30 blur-3xl'></div>

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid min-h-[700px] items-center gap-16 py-20 lg:grid-cols-2'>
          {/* Left content */}
          <div className='space-y-10'>
            <div className='space-y-6'>
              <div className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-semibold text-purple-700'>
                <Sparkles className='h-4 w-4' />
                New Spring Collection 2025
              </div>

              <h1 className='text-5xl font-black leading-[0.9] tracking-tight text-gray-900 lg:text-7xl'>
                Fashion
                <span className='block bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent'>
                  Reimagined
                </span>
              </h1>

              <p className='max-w-xl text-xl leading-relaxed text-gray-600 lg:text-2xl'>
                Discover curated collections from 500+ premium brands.
                <span className='font-semibold text-gray-800'> Express your unique style</span> with
                confidence.
              </p>
            </div>

            <div className='flex flex-col gap-4 sm:flex-row'>
              <Button
                size='lg'
                onClick={() => navigate('/products')}
                className='rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl'
              >
                Explore Collection
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='rounded-full border-2 px-10 py-4 text-lg font-semibold transition-all duration-300 hover:bg-gray-50'
              >
                Watch Lookbook
              </Button>
            </div>

            {/* Trust indicators */}
            <div className='flex items-center gap-8 pt-8'>
              <div className='flex items-center gap-2 text-gray-600'>
                <Shield className='h-5 w-5 text-green-500' />
                <span className='text-sm font-medium'>Secure Shopping</span>
              </div>
              <div className='flex items-center gap-2 text-gray-600'>
                <Truck className='h-5 w-5 text-blue-500' />
                <span className='text-sm font-medium'>Free Shipping</span>
              </div>
              <div className='flex items-center gap-2 text-gray-600'>
                <Heart className='h-5 w-5 text-red-500' />
                <span className='text-sm font-medium'>Easy Returns</span>
              </div>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-8 border-t border-gray-100 pt-8'>
              <div className='text-center lg:text-left'>
                <div className='text-3xl font-black text-gray-900'>500+</div>
                <div className='text-sm font-medium text-gray-600'>Premium Brands</div>
              </div>
              <div className='text-center lg:text-left'>
                <div className='text-3xl font-black text-gray-900'>50K+</div>
                <div className='text-sm font-medium text-gray-600'>Curated Products</div>
              </div>
              <div className='text-center lg:text-left'>
                <div className='text-3xl font-black text-gray-900'>1M+</div>
                <div className='text-sm font-medium text-gray-600'>Happy Customers</div>
              </div>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className='relative'>
            <div className='relative z-10'>
              <div className='grid h-[600px] grid-cols-2 gap-4'>
                {/* Main large image */}
                <div className='relative col-span-2 row-span-2 overflow-hidden rounded-3xl'>
                  <img
                    src='https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800'
                    alt='Fashion model'
                    className='h-full w-full object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                </div>
              </div>

              {/* Floating product card */}
              <div className='absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-sm'>
                <div className='flex items-center gap-3'>
                  <img
                    src='https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=100'
                    alt='Product'
                    className='h-14 w-14 rounded-xl object-cover'
                  />
                  <div>
                    <p className='font-bold text-gray-900'>Silk Midi Dress</p>
                    <p className='font-semibold text-purple-600'>
                      $129 <span className='text-sm text-gray-400 line-through'>$189</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating discount badge */}
              <div className='absolute right-6 top-6 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 p-4 text-white shadow-xl'>
                <div className='text-center'>
                  <p className='text-2xl font-black'>70%</p>
                  <p className='text-xs font-semibold'>OFF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
