import { memo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail, Gift, Sparkles } from 'lucide-react';

export const NewsletterSection = memo(() => {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 py-24'>
      {/* Background decorations */}
      <div className='absolute left-0 top-0 h-full w-full'>
        <div className='absolute left-20 top-20 h-32 w-32 rounded-full bg-white/10 blur-3xl'></div>
        <div className='absolute bottom-20 right-20 h-40 w-40 rounded-full bg-white/10 blur-3xl'></div>
        <div className='absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white/5 blur-3xl'></div>
      </div>

      <div className='relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8'>
        <div className='space-y-8'>
          <div className='mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
            <Mail className='h-10 w-10 text-white' />
          </div>

          <div className='space-y-4'>
            <h2 className='text-4xl font-black leading-tight text-white lg:text-6xl'>
              Join the Fashion
              <span className='block'>Revolution</span>
            </h2>

            <p className='mx-auto max-w-3xl text-xl leading-relaxed text-white/90 lg:text-2xl'>
              Get exclusive access to new arrivals, insider deals, and style inspiration from top
              designers
            </p>
          </div>

          <div className='mx-auto flex max-w-lg flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Input
                placeholder='Enter your email address'
                className='w-full rounded-full border-0 bg-white/95 py-4 pl-4 pr-4 text-lg text-gray-900 backdrop-blur-sm placeholder:text-gray-500 focus:ring-4 focus:ring-white/30'
              />
            </div>
            <Button className='rounded-full bg-white px-10 py-4 text-lg font-bold text-purple-600 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-2xl'>
              Subscribe
            </Button>
          </div>

          {/* Benefits */}
          <div className='grid grid-cols-1 gap-6 pt-12 md:grid-cols-3'>
            <div className='flex flex-col items-center space-y-2 text-white/90'>
              <Gift className='h-8 w-8 text-yellow-300' />
              <p className='font-semibold'>Exclusive Offers</p>
              <p className='text-sm text-white/70'>Up to 70% off for subscribers</p>
            </div>
            <div className='flex flex-col items-center space-y-2 text-white/90'>
              <Sparkles className='h-8 w-8 text-pink-300' />
              <p className='font-semibold'>Early Access</p>
              <p className='text-sm text-white/70'>Shop new collections first</p>
            </div>
            <div className='flex flex-col items-center space-y-2 text-white/90'>
              <Mail className='h-8 w-8 text-blue-300' />
              <p className='font-semibold'>Style Tips</p>
              <p className='text-sm text-white/70'>Weekly fashion inspiration</p>
            </div>
          </div>

          <p className='pt-4 text-sm text-white/70'>
            Join 100,000+ fashion lovers worldwide • Unsubscribe anytime • No spam, ever
          </p>
        </div>
      </div>
    </section>
  );
});

NewsletterSection.displayName = 'NewsletterSection';
