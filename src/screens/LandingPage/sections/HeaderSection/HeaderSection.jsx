import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigateWithScroll } from '../../../../utils/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Bell,
  ChevronRight,
  Package,
  Star,
  Eye,
} from 'lucide-react';
import { BarChart3 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { SearchBar } from '../../../../components/common/SearchBar/SearchBar';
import { CartDropdown } from '../../../../components/CartDropdown/CartDropdown';
import { WishlistDropdown } from '../../../../components/WishlistDropdown/WishlistDropdown';
import { NotificationDropdown } from '../../../../components/NotificationDropdown/NotificationDropdown';
import { CompareDropdown } from '../../../../components/CompareDropdown/CompareDropdown';
import { AuthOverlay } from '../../../../components/AuthOverlay/AuthOverlay';
import { useCart } from '../../../../contexts/CartContext';
import { useWishlist } from '../../../../contexts/WishlistContext';
import { useCompare } from '../../../../contexts/CompareContext';

export const HeaderSection = ({ onAuthModalOpen }) => {
  const navigate = useNavigateWithScroll();
  const { totals } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { items: compareItems } = useCompare();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const navItems = [
    { name: 'Women', path: '/products?category=women' },
    { name: 'Men', path: '/products?category=men' },
    { name: 'Kids', path: '/products?category=kids' },
    { name: 'Beauty', path: '/products?category=beauty' },
    { name: 'Home', path: '/products?category=home' },
  ];

  const handleNavClick = path => {
    navigate(path);
  };

  // Handle clicking outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = event => {
      // Only handle outside clicks for desktop dropdowns when hamburger menu is closed
      if (!isMenuOpen && !event.target.closest('.cart-dropdown-container')) {
        setIsCartOpen(false);
      }
      if (!isMenuOpen && !event.target.closest('.wishlist-dropdown-container')) {
        setIsWishlistOpen(false);
      }
      if (!isMenuOpen && !event.target.closest('.notification-dropdown-container')) {
        setIsNotificationOpen(false);
      }
      if (!isMenuOpen && !event.target.closest('.compare-dropdown-container')) {
        setIsCompareOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close other dropdowns when one opens
  const handleDropdownOpen = dropdownType => {
    // Close mobile menu when opening desktop dropdowns
    setIsMenuOpen(false);

    setIsCartOpen(dropdownType === 'cart');
    setIsWishlistOpen(dropdownType === 'wishlist');
    setIsNotificationOpen(dropdownType === 'notification');
    setIsCompareOpen(dropdownType === 'compare');
  };

  // Handle dropdown open from desktop icons (should close mobile menu)
  const handleDesktopDropdownOpen = dropdownType => {
    // Only open dropdowns if hamburger menu is closed
    if (isMenuOpen) return;

    setIsCartOpen(dropdownType === 'cart');
    setIsWishlistOpen(dropdownType === 'wishlist');
    setIsNotificationOpen(dropdownType === 'notification');
    setIsCompareOpen(dropdownType === 'compare');
  };

  // Handle mobile menu dropdown toggle (doesn't close mobile menu)
  const handleMobileDropdownToggle = dropdownType => {
    // Close all desktop dropdowns first
    setIsCartOpen(false);

    if (dropdownType === 'wishlist') {
      setIsWishlistOpen(!isWishlistOpen);
      setIsNotificationOpen(false);
      setIsCompareOpen(false);
    } else if (dropdownType === 'notification') {
      setIsNotificationOpen(!isNotificationOpen);
      setIsWishlistOpen(false);
      setIsCompareOpen(false);
    } else if (dropdownType === 'compare') {
      setIsCompareOpen(!isCompareOpen);
      setIsWishlistOpen(false);
      setIsNotificationOpen(false);
    }
  };

  const handleUserClick = () => {
    onAuthModalOpen();
    setIsMenuOpen(false);
    // Close other dropdowns
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsNotificationOpen(false);
    setIsCompareOpen(false);
  };

  // Close dropdowns when mobile menu opens
  const handleMobileMenuToggle = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);

    if (newMenuState) {
      // Close all dropdowns when opening mobile menu
      setIsCartOpen(false);
      setIsWishlistOpen(false);
      setIsNotificationOpen(false);
      setIsCompareOpen(false);
    }
  };

  return (
    <header className='sticky top-0 z-40 border-b border-gray-100/50 bg-white/95 backdrop-blur-md'>
      {/* Top promotional bar */}
      <div className='bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-center text-white'>
        <p className='text-sm font-medium'>
          ✨ Spring Sale: Up to 70% off + Free shipping worldwide
        </p>
      </div>

      {/* Main header */}
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-20 items-center justify-between'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <h1
              className='cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-black text-transparent'
              onClick={() => navigate('/')}
            >
              OLOSSIA
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden items-center space-x-1 lg:flex'>
            {navItems.map(item => (
              <Button
                key={item.name}
                variant='ghost'
                onClick={() => handleNavClick(item.path)}
                className='rounded-full px-6 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-purple-50 hover:text-purple-600'
              >
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className='mx-8 hidden max-w-xl flex-1 md:flex'>
            <SearchBar className='w-full' />
          </div>

          {/* Action buttons */}
          <div className='relative flex items-center space-x-2'>
            {/* Desktop action buttons - hidden on mobile */}
            {/* Notification button with dropdown */}
            <div className='notification-dropdown-container relative z-50 hidden sm:block'>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full hover:bg-gray-100'
                onMouseEnter={() => handleDesktopDropdownOpen('notification')}
                onClick={() =>
                  handleDesktopDropdownOpen(isNotificationOpen ? null : 'notification')
                }
              >
                <Bell className='h-5 w-5' />
                {5 > 0 && (
                  <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-xs font-bold text-white'>
                    5
                  </span>
                )}
              </Button>
              {!isMenuOpen && (
                <NotificationDropdown
                  isOpen={isNotificationOpen}
                  onClose={() => handleDropdownOpen(null)}
                />
              )}
            </div>

            {/* User button with dropdown */}
            <div className='relative z-50 hidden sm:block'>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full hover:bg-gray-100'
                onClick={handleUserClick}
              >
                <User className='h-5 w-5' />
              </Button>
            </div>

            {/* Wishlist button with dropdown */}
            <div className='wishlist-dropdown-container relative z-50 hidden sm:block'>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full hover:bg-gray-100'
                onMouseEnter={() => handleDesktopDropdownOpen('wishlist')}
                onClick={() => handleDesktopDropdownOpen(isWishlistOpen ? null : 'wishlist')}
              >
                <Heart className='h-5 w-5' />
                {wishlistItems.length > 0 && (
                  <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white'>
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
              {!isMenuOpen && (
                <WishlistDropdown
                  isOpen={isWishlistOpen}
                  onClose={() => handleDropdownOpen(null)}
                />
              )}
            </div>

            {/* Compare button with dropdown */}
            <div className='compare-dropdown-container relative z-50 hidden sm:block'>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full hover:bg-gray-100'
                onMouseEnter={() => handleDesktopDropdownOpen('compare')}
                onClick={() => handleDesktopDropdownOpen(isCompareOpen ? null : 'compare')}
              >
                <BarChart3 className='h-5 w-5' />
                {compareItems.length > 0 && (
                  <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-xs font-bold text-white'>
                    {compareItems.length}
                  </span>
                )}
              </Button>
              {!isMenuOpen && (
                <CompareDropdown isOpen={isCompareOpen} onClose={() => handleDropdownOpen(null)} />
              )}
            </div>
            {/* Cart button with dropdown */}
            <div className='cart-dropdown-container relative z-50'>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full hover:bg-gray-100'
                onMouseEnter={() => handleDesktopDropdownOpen('cart')}
                onClick={() => handleDesktopDropdownOpen(isCartOpen ? null : 'cart')}
              >
                <ShoppingBag className='h-5 w-5' />
                {totals.itemCount > 0 && (
                  <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-bold text-white'>
                    {totals.itemCount}
                  </span>
                )}
              </Button>
              {!isMenuOpen && (
                <CartDropdown isOpen={isCartOpen} onClose={() => handleDropdownOpen(null)} />
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full lg:hidden'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className='pb-4 md:hidden'>
          <SearchBar placeholder='Search products...' className='w-full' />
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className='scrollbar-hide relative z-50 max-h-[70vh] overflow-y-auto border-t border-gray-100 bg-white/95 backdrop-blur-md lg:hidden'>
            {/* Mobile navigation */}
            <nav className='flex flex-col py-4'>
              <div className='px-4 pb-4'>
                <p className='mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Categories
                </p>
              </div>
              {navItems.map(item => (
                <Button
                  key={item.name}
                  variant='ghost'
                  onClick={() => {
                    handleNavClick(item.path);
                    setIsMenuOpen(false);
                  }}
                  className='mx-4 justify-between rounded-xl py-4 text-lg font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                >
                  <span>{item.name}</span>
                  <ChevronRight className='h-5 w-5' />
                </Button>
              ))}
            </nav>

            {/* Mobile action buttons */}
            <div className='border-t border-gray-100 py-4'>
              <div className='px-4 pb-4'>
                <p className='mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Account & More
                </p>
              </div>

              {/* User account */}
              <Button
                variant='ghost'
                onClick={() => {
                  onAuthModalOpen();
                  onClick = { handleMobileMenuToggle };
                }}
                className='mx-4 w-auto justify-between rounded-xl py-4 text-lg font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              >
                <div className='flex items-center gap-3'>
                  <User className='h-5 w-5' />
                  <span>Sign In / Register</span>
                </div>
                <ChevronRight className='h-5 w-5' />
              </Button>

              {/* Wishlist */}
              <Button
                variant='ghost'
                onClick={() => handleMobileDropdownToggle('wishlist')}
                className='mx-4 w-auto justify-between rounded-xl py-4 text-lg font-medium text-gray-700 hover:bg-red-50 hover:text-red-600'
              >
                <div className='flex items-center gap-3'>
                  <Heart className='h-5 w-5' />
                  <span>Wishlist</span>
                  {wishlistItems.length > 0 && (
                    <span className='ml-1 rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700'>
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${isWishlistOpen ? 'rotate-90' : ''}`}
                />
              </Button>

              {/* Wishlist content in mobile menu */}
              {isWishlistOpen && (
                <div className='mx-4 mb-4 overflow-hidden rounded-xl bg-gray-50'>
                  {wishlistItems.length > 0 ? (
                    <>
                      <div className='max-h-60 overflow-y-auto'>
                        {wishlistItems.slice(0, 3).map(item => (
                          <div
                            key={item.id}
                            className='border-b border-gray-200 p-4 last:border-b-0'
                          >
                            <div className='flex gap-3'>
                              <img
                                src={item.image}
                                alt={item.name}
                                className='h-12 w-12 rounded-lg object-cover'
                              />
                              <div className='flex-1'>
                                <p className='text-xs font-bold uppercase text-red-600'>
                                  {item.brand}
                                </p>
                                <h4 className='text-sm font-semibold text-gray-900'>{item.name}</h4>
                                <p className='text-sm font-bold text-gray-900'>${item.price}</p>
                              </div>
                              <div className='flex flex-col gap-1'>
                                <Button
                                  variant='outline'
                                  size='icon'
                                  className='h-8 w-8 rounded-full hover:border-purple-200 hover:bg-purple-50'
                                >
                                  <ShoppingBag className='h-3 w-3 text-purple-600' />
                                </Button>
                                <Button
                                  variant='outline'
                                  size='icon'
                                  className='h-8 w-8 rounded-full hover:border-blue-200 hover:bg-blue-50'
                                >
                                  <BarChart3 className='h-3 w-3 text-blue-600' />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className='border-t border-gray-200 p-4'>
                        <Button
                          onClick={() => {
                            navigate('/wishlist');
                            setIsMenuOpen(false);
                          }}
                          className='w-full rounded-xl bg-gradient-to-r from-red-500 to-pink-500 py-3 font-bold text-white hover:from-red-600 hover:to-pink-600'
                        >
                          View Full Wishlist
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className='p-6 text-center'>
                      <Heart className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                      <p className='text-sm text-gray-600'>Your wishlist is empty</p>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant='ghost'
                onClick={() => handleMobileDropdownToggle('compare')}
                className='mx-4 w-auto justify-between rounded-xl py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              >
                <div className='flex items-center gap-3'>
                  <BarChart3 className='h-5 w-5' />
                  <span>Compare Products</span>
                  {compareItems.length > 0 && (
                    <span className='ml-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700'>
                      {compareItems.length}
                    </span>
                  )}
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${isCompareOpen ? 'rotate-90' : ''}`}
                />
              </Button>

              {/* Compare content in mobile menu */}
              {isCompareOpen && (
                <div className='mx-4 mb-4 overflow-hidden rounded-xl bg-gray-50'>
                  {compareItems.length > 0 ? (
                    <>
                      <div className='max-h-60 overflow-y-auto'>
                        {compareItems.map(item => (
                          <div
                            key={item.id}
                            className='border-b border-gray-200 p-4 last:border-b-0'
                          >
                            <div className='flex gap-3'>
                              <img
                                src={item.image}
                                alt={item.name}
                                className='h-12 w-12 rounded-lg object-cover'
                              />
                              <div className='flex-1'>
                                <p className='text-xs font-bold uppercase text-blue-600'>
                                  {item.brand}
                                </p>
                                <h4 className='text-sm font-semibold text-gray-900'>{item.name}</h4>
                                <p className='text-sm font-bold text-gray-900'>${item.price}</p>
                              </div>
                              <div className='flex flex-col gap-1'>
                                <Button
                                  variant='outline'
                                  size='icon'
                                  className='h-8 w-8 rounded-full hover:border-red-200 hover:bg-red-50'
                                >
                                  <Heart className='h-3 w-3 text-red-600' />
                                </Button>
                                <Button
                                  variant='outline'
                                  size='icon'
                                  className='h-8 w-8 rounded-full hover:border-purple-200 hover:bg-purple-50'
                                >
                                  <ShoppingBag className='h-3 w-3 text-purple-600' />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className='border-t border-gray-200 p-4'>
                        <Button
                          onClick={() => {
                            navigate('/compare');
                            setIsMenuOpen(false);
                          }}
                          className='w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 font-bold text-white hover:from-blue-600 hover:to-indigo-600'
                        >
                          View Product Comparison
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className='p-6 text-center'>
                      <BarChart3 className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                      <p className='text-sm text-gray-600'>No products to compare</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications */}
              <Button
                variant='ghost'
                onClick={() => handleMobileDropdownToggle('notification')}
                className='mx-4 w-auto justify-between rounded-xl py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              >
                <div className='flex items-center gap-3'>
                  <Bell className='h-5 w-5' />
                  <span>Notifications</span>
                  {5 > 0 && (
                    <span className='ml-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700'>
                      5
                    </span>
                  )}
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${isNotificationOpen ? 'rotate-90' : ''}`}
                />
              </Button>

              {/* Notification content in mobile menu */}
              {isNotificationOpen && (
                <div className='mx-4 mb-4 overflow-hidden rounded-xl bg-gray-50'>
                  <>
                    <div className='max-h-60 overflow-y-auto'>
                      {[1, 2, 3].map(notif => (
                        <div key={notif} className='border-b border-gray-200 p-4 last:border-b-0'>
                          <div className='flex gap-3'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                              <Package className='h-4 w-4 text-blue-600' />
                            </div>
                            <div className='flex-1'>
                              <h4 className='text-sm font-semibold text-gray-900'>Order Update</h4>
                              <p className='text-xs text-gray-600'>Your order has been shipped</p>
                              <p className='text-xs text-gray-400'>2 hours ago</p>
                            </div>
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-8 w-8 rounded-full hover:border-blue-200 hover:bg-blue-50'
                            >
                              <Eye className='h-3 w-3 text-blue-600' />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='border-t border-gray-200 p-4'>
                      <Button
                        onClick={() => {
                          // Navigate to notifications page (when implemented)
                          setIsMenuOpen(false);
                        }}
                        className='w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 font-bold text-white hover:from-blue-600 hover:to-indigo-600'
                      >
                        View All Notifications
                      </Button>
                    </div>
                  </>
                </div>
              )}
            </div>

            {/* Mobile footer links */}
            <div className='border-t border-gray-100 py-4'>
              <div className='px-4 pb-4'>
                <p className='mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Quick Links
                </p>
              </div>

              <div className='space-y-1'>
                <Button
                  variant='ghost'
                  onClick={() => {
                    navigate('/categories');
                    setIsMenuOpen(false);
                  }}
                  className='mx-4 w-auto justify-between rounded-xl py-3 text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                >
                  <span>All Categories</span>
                  <ChevronRight className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => {
                    navigate('/brands');
                    setIsMenuOpen(false);
                  }}
                  className='mx-4 w-auto justify-between rounded-xl py-3 text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                >
                  <span>All Brands</span>
                  <ChevronRight className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => {
                    navigate('/trending');
                    setIsMenuOpen(false);
                  }}
                  className='mx-4 w-auto justify-between rounded-xl py-3 text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                >
                  <span>Trending Now</span>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
