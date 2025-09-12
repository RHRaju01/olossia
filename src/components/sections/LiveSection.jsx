import { memo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Radio, Users, Eye, Clock } from 'lucide-react';

export const LiveSection = memo(() => {
  const liveShows = [
    {
      id: 1,
      brand: 'ZARA',
      title: 'Spring Collection Launch',
      host: 'Maria Rodriguez',
      viewers: 12500,
      duration: '45 min',
      image:
        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: "Women's Fashion",
      discount: '30% OFF Live Exclusive',
    },
    {
      id: 2,
      brand: 'NIKE',
      title: 'New Sneaker Drop',
      host: 'Alex Chen',
      viewers: 8900,
      duration: '30 min',
      image:
        'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Athletic Wear',
      discount: 'Limited Edition',
    },
    {
      id: 3,
      brand: 'H&M',
      title: 'Sustainable Fashion Show',
      host: 'Emma Thompson',
      viewers: 6700,
      duration: '60 min',
      image:
        'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Eco-Friendly',
      discount: 'Buy 2 Get 1 Free',
    },
    {
      id: 4,
      brand: 'GUCCI',
      title: 'Luxury Accessories Preview',
      host: 'Isabella Rossi',
      viewers: 15200,
      duration: '25 min',
      image:
        'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: 'Luxury',
      discount: 'VIP Early Access',
    },
  ];

  return (
    <section className='relative overflow-hidden bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 py-16'>
      {/* Animated background elements */}
      <div className='absolute left-0 top-0 h-full w-full'>
        <div className='absolute left-10 top-10 h-20 w-20 animate-pulse rounded-full bg-white/10'></div>
        <div
          className='absolute bottom-10 right-10 h-32 w-32 animate-pulse rounded-full bg-white/10'
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className='absolute left-1/4 top-1/2 h-16 w-16 animate-pulse rounded-full bg-white/10'
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 text-center'>
          <div className='mb-6 inline-flex items-center gap-3'>
            <div className='relative'>
              <Radio className='h-8 w-8 animate-pulse text-white' />
              <div className='absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-red-400'></div>
            </div>
            <h2 className='text-4xl font-black text-white lg:text-5xl'>
              Live <span className='text-yellow-300'>Shows</span>
            </h2>
          </div>
          <p className='mx-auto max-w-3xl text-xl text-white/90'>
            Join exclusive live shopping events with your favorite brands and get special deals
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {liveShows.map(show => (
            <Card
              key={show.id}
              className='group cursor-pointer overflow-hidden rounded-2xl border-0 bg-white/95 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-2xl'
            >
              <CardContent className='p-0'>
                <div className='relative'>
                  <img src={show.image} alt={show.title} className='h-48 w-full object-cover' />

                  {/* Live indicator */}
                  <div className='absolute left-3 top-3'>
                    <div className='flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white'>
                      <div className='h-2 w-2 animate-pulse rounded-full bg-white'></div>
                      LIVE
                    </div>
                  </div>

                  {/* Viewers count */}
                  <div className='absolute right-3 top-3'>
                    <div className='flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm'>
                      <Eye className='h-3 w-3' />
                      {show.viewers.toLocaleString()}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className='absolute bottom-3 right-3'>
                    <div className='flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm'>
                      <Clock className='h-3 w-3' />
                      {show.duration}
                    </div>
                  </div>
                </div>

                <div className='space-y-3 p-4'>
                  <div>
                    <p className='text-sm font-bold uppercase tracking-wider text-purple-600'>
                      {show.brand}
                    </p>
                    <h3 className='font-bold leading-tight text-gray-900'>{show.title}</h3>
                    <p className='text-sm text-gray-600'>with {show.host}</p>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700'>
                      {show.category}
                    </span>
                  </div>

                  <div className='rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 p-2'>
                    <p className='text-center text-xs font-bold text-orange-700'>{show.discount}</p>
                  </div>

                  <Button className='w-full rounded-xl bg-gradient-to-r from-red-500 to-pink-500 font-semibold text-white hover:from-red-600 hover:to-pink-600'>
                    Join Live Show
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='mt-12 text-center'>
          <Button
            variant='outline'
            size='lg'
            className='rounded-full border-white/30 bg-white/20 px-8 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/30'
          >
            View All Live Shows
          </Button>
        </div>
      </div>
    </section>
  );
});

LiveSection.displayName = 'LiveSection';
