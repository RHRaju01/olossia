import { memo } from 'react';
import { Button } from '../ui/button';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export const FooterSection = memo(() => {
  const footerSections = [
    {
      title: 'Shop',
      links: [
        "Women's Fashion",
        "Men's Style",
        'Kids & Baby',
        'Beauty & Care',
        'Home & Living',
        'Accessories',
        'Shoes & Bags',
        'Sale & Outlet',
      ],
    },
    {
      title: 'Customer Care',
      links: [
        'Help Center',
        'Size Guide',
        'Shipping Info',
        'Returns & Exchanges',
        'Track Your Order',
        'Contact Support',
        'Live Chat',
        'FAQ',
      ],
    },
    {
      title: 'About Olossia',
      links: [
        'Our Story',
        'Careers',
        'Press & Media',
        'Sustainability',
        'Brand Partners',
        'Investor Relations',
        'Affiliate Program',
        'Gift Cards',
      ],
    },
    {
      title: 'Connect',
      links: [
        'Store Locator',
        'Personal Stylist',
        'VIP Membership',
        'Student Discount',
        'Refer a Friend',
        'Brand Partnerships',
        'Influencer Program',
        'Newsletter',
      ],
    },
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-500' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-500' },
  ];

  return (
    <footer className='bg-gray-900 text-white'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Main footer content */}
        <div className='py-16'>
          <div className='grid grid-cols-1 gap-12 lg:grid-cols-6'>
            {/* Brand section */}
            <div className='space-y-6 lg:col-span-2'>
              <h3 className='bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-black text-transparent'>
                OLOSSIA
              </h3>
              <p className='max-w-md text-lg leading-relaxed text-gray-300'>
                Your destination for premium fashion from the world's most coveted brands. Discover,
                shop, and express your unique style.
              </p>

              {/* Contact info */}
              <div className='space-y-3'>
                <div className='flex items-center gap-3 text-gray-300'>
                  <MapPin className='h-5 w-5 text-purple-400' />
                  <span>123 Fashion Ave, New York, NY 10001</span>
                </div>
                <div className='flex items-center gap-3 text-gray-300'>
                  <Phone className='h-5 w-5 text-purple-400' />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className='flex items-center gap-3 text-gray-300'>
                  <Mail className='h-5 w-5 text-purple-400' />
                  <span>hello@olossia.com</span>
                </div>
              </div>

              {/* Social links */}
              <div className='flex items-center gap-4 pt-4'>
                {socialLinks.map(social => (
                  <Button
                    key={social.label}
                    variant='ghost'
                    size='icon'
                    className={`h-12 w-12 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 ${social.color} transition-all duration-300 hover:scale-110`}
                  >
                    <social.icon className='h-5 w-5' />
                  </Button>
                ))}
              </div>
            </div>

            {/* Footer links */}
            {footerSections.map(section => (
              <div key={section.title} className='space-y-4'>
                <h4 className='text-lg font-black text-white'>{section.title}</h4>
                <ul className='space-y-3'>
                  {section.links.map(link => (
                    <li key={link}>
                      <Button
                        variant='ghost'
                        className='h-auto justify-start p-0 text-base font-medium text-gray-300 transition-colors duration-200 hover:text-white'
                      >
                        {link}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className='border-t border-gray-800 py-8'>
          <div className='flex flex-col items-center justify-between gap-6 lg:flex-row'>
            <div className='flex flex-col items-center gap-6 text-gray-400 sm:flex-row'>
              <p className='text-sm'>© 2025 Olossia. All rights reserved.</p>
              <div className='flex items-center gap-6 text-sm'>
                <Button
                  variant='ghost'
                  className='h-auto p-0 text-gray-400 transition-colors hover:text-white'
                >
                  Privacy Policy
                </Button>
                <Button
                  variant='ghost'
                  className='h-auto p-0 text-gray-400 transition-colors hover:text-white'
                >
                  Terms of Service
                </Button>
                <Button
                  variant='ghost'
                  className='h-auto p-0 text-gray-400 transition-colors hover:text-white'
                >
                  Cookie Settings
                </Button>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <p className='text-sm text-gray-400'>Trusted by millions worldwide</p>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-500'>
                  <span className='text-xs font-bold text-white'>✓</span>
                </div>
                <span className='text-sm font-medium text-gray-300'>Verified Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

FooterSection.displayName = 'FooterSection';
