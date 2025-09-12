import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Bell, X, Package, Heart, ShoppingBag, Star, Clock } from 'lucide-react';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order #ORD-1234 has been shipped and is on its way!',
      time: '2 minutes ago',
      icon: Package,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      isRead: false,
    },
    {
      id: 2,
      type: 'wishlist',
      title: 'Price Drop Alert',
      message: 'Silk Midi Dress from ZARA is now 30% off - only $129!',
      time: '1 hour ago',
      icon: Heart,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      isRead: false,
    },
    {
      id: 3,
      type: 'review',
      title: 'Review Reminder',
      message: 'How was your recent purchase? Share your experience!',
      time: '3 hours ago',
      icon: Star,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      isRead: true,
    },
    {
      id: 4,
      type: 'cart',
      title: 'Cart Reminder',
      message: 'You have 3 items waiting in your cart. Complete your purchase!',
      time: '6 hours ago',
      icon: ShoppingBag,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      isRead: true,
    },
    {
      id: 5,
      type: 'sale',
      title: 'Flash Sale Started',
      message: '24-hour flash sale: Up to 70% off selected items!',
      time: '1 day ago',
      icon: Clock,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      isRead: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div
      className='absolute right-0 top-full z-[55] mt-2 w-96'
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <Card className='overflow-hidden rounded-2xl border-0 bg-white shadow-2xl'>
        <CardContent className='p-0'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
            <div className='flex items-center gap-3'>
              <Bell className='h-6 w-6 text-blue-600' />
              <h3 className='text-lg font-bold text-gray-900'>Notifications</h3>
              {unreadCount > 0 && (
                <span className='rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700'>
                  {unreadCount} new
                </span>
              )}
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-8 w-8 rounded-full hover:bg-gray-100'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Notifications List */}
          <div className='scrollbar-hide max-h-80 overflow-y-auto'>
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`cursor-pointer border-b border-gray-50 p-4 transition-colors duration-200 last:border-b-0 hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className='flex gap-4'>
                  <div
                    className={`h-10 w-10 ${notification.bgColor} flex flex-shrink-0 items-center justify-center rounded-full`}
                  >
                    <notification.icon className={`h-5 w-5 ${notification.iconColor}`} />
                  </div>

                  <div className='flex-1 space-y-1'>
                    <div className='flex items-start justify-between'>
                      <h4
                        className={`text-sm font-semibold text-gray-900 ${!notification.isRead ? 'font-bold' : ''}`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className='mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500'></div>
                      )}
                    </div>
                    <p className='text-sm leading-relaxed text-gray-600'>{notification.message}</p>
                    <p className='text-xs font-medium text-gray-400'>{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className='space-y-3 bg-gray-50 p-6'>
            <div className='flex gap-3'>
              <Button
                variant='outline'
                className='flex-1 rounded-xl py-2 text-sm font-medium hover:border-blue-200 hover:bg-blue-50'
              >
                Mark All Read
              </Button>
              <Button className='flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-indigo-600'>
                View All
              </Button>
            </div>
            <p className='text-center text-xs text-gray-500'>
              Get notified about orders, sales, and exclusive offers
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
