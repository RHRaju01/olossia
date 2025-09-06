import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigateWithScroll } from "../../utils/navigation";
import { Search, ShoppingBag, Heart, User, Menu, X, Bell, ChevronRight, Package, Star, Eye } from "lucide-react";
import { BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { SearchBar } from "../common/SearchBar/SearchBar";
import { CartDropdown } from "../CartDropdown/CartDropdown";
import { WishlistDropdown } from "../WishlistDropdown/WishlistDropdown";
import { NotificationDropdown } from "../NotificationDropdown/NotificationDropdown";
import { CompareDropdown } from "../CompareDropdown/CompareDropdown";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCompare } from "../../contexts/CompareContext";

export const HeaderSection = React.memo(({ onAuthModalOpen }) => {
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
    { name: "Women", path: "/products?category=women" },
    { name: "Men", path: "/products?category=men" },
    { name: "Kids", path: "/products?category=kids" },
    { name: "Beauty", path: "/products?category=beauty" },
    { name: "Home", path: "/products?category=home" }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  // Handle clicking outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event) => {
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

  // Desktop dropdown handlers - only work when hamburger menu is closed
  const handleDesktopDropdownOpen = (dropdownType) => {
    if (isMenuOpen) return; // Prevent desktop dropdowns when hamburger is open
    
    setIsCartOpen(dropdownType === 'cart');
    setIsWishlistOpen(dropdownType === 'wishlist');
    setIsNotificationOpen(dropdownType === 'notification');
    setIsCompareOpen(dropdownType === 'compare');
  };

  // Mobile menu dropdown toggle (doesn't close mobile menu)
  const handleMobileDropdownToggle = (dropdownType) => {
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
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsNotificationOpen(false);
    setIsCompareOpen(false);
  };

  const handleMobileMenuToggle = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    
    if (newMenuState) {
      setIsCartOpen(false);
      setIsWishlistOpen(false);
      setIsNotificationOpen(false);
      setIsCompareOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100/50">
      {/* Top promotional bar */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center">
        <p className="text-sm font-medium">
          ✨ Spring Sale: Up to 70% off + Free shipping worldwide
        </p>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 
              className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate('/')}
            >
              OLOSSIA
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                onClick={() => handleNavClick(item.path)}
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium px-6 py-2 rounded-full transition-all duration-200"
              >
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <SearchBar className="w-full" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 relative">
            {/* Desktop action buttons - hidden on mobile */}
            {/* Notification button with dropdown */}
            <div className="relative hidden sm:block notification-dropdown-container z-50">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-gray-100"
                onMouseEnter={() => handleDesktopDropdownOpen('notification')}
                onClick={() => handleDesktopDropdownOpen(isNotificationOpen ? null : 'notification')}
              >
                <Bell className="w-5 h-5" />
                {5 > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    5
                  </span>
                )}
              </Button>
              {!isMenuOpen && (
                <NotificationDropdown 
                  isOpen={isNotificationOpen} 
                  onClose={() => setIsNotificationOpen(false)} 
                />
              )}
            </div>
            
            {/* User button */}
            <div className="relative hidden sm:block z-50">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-gray-100"
                onClick={handleUserClick}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Wishlist button with dropdown */}
            <div className="relative hidden sm:block wishlist-dropdown-container z-50">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-gray-100"
                onMouseEnter={() => handleDesktopDropdownOpen('wishlist')}
                onClick={() => handleDesktopDropdownOpen(isWishlistOpen ? null : 'wishlist')}
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
              {!isMenuOpen && (
                <WishlistDropdown 
                  isOpen={isWishlistOpen} 
                  onClose={() => setIsWishlistOpen(false)} 
                />
              )}
            </div>

            {/* Compare button with dropdown */}
            <div className="relative hidden sm:block compare-dropdown-container z-50">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-gray-100"
                onMouseEnter={() => handleDesktopDropdownOpen('compare')}
                onClick={() => handleDesktopDropdownOpen(isCompareOpen ? null : 'compare')}
              >
                <BarChart3 className="w-5 h-5" />
                {compareItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {compareItems.length}
                  </span>
                )}
              </Button>
              {!isMenuOpen && (
                <CompareDropdown 
                  isOpen={isCompareOpen} 
                  onClose={() => setIsCompareOpen(false)} 
                />
              )}
            </div>

            {/* Cart button with dropdown */}
            <div className="relative cart-dropdown-container z-50">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-gray-100"
                onMouseEnter={() => handleDesktopDropdownOpen('cart')}
                onClick={() => handleDesktopDropdownOpen(isCartOpen ? null : 'cart')}
              >
                <ShoppingBag className="w-5 h-5" />
                {totals.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totals.itemCount}
                  </span>
                )}
              </Button>
              {!isMenuOpen && (
                <CartDropdown 
                  isOpen={isCartOpen} 
                  onClose={() => setIsCartOpen(false)} 
                />
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={handleMobileMenuToggle}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <SearchBar 
            placeholder="Search products..."
            className="w-full"
          />
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md relative z-50 max-h-[70vh] overflow-y-auto scrollbar-hide">
            {/* Mobile navigation */}
            <nav className="flex flex-col py-4">
              <div className="px-4 pb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</p>
              </div>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => {
                    handleNavClick(item.path);
                    setIsMenuOpen(false);
                  }}
                  className="justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50 mx-4 rounded-xl py-4 text-lg font-medium"
                >
                  <span>{item.name}</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ))}
            </nav>

            {/* Mobile action buttons */}
            <div className="border-t border-gray-100 py-4">
              <div className="px-4 pb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Account & More</p>
              </div>
              
              {/* User account */}
              <Button
                variant="ghost"
                onClick={() => {
                  onAuthModalOpen();
                  setIsMenuOpen(false);
                }}
                className="justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50 mx-4 rounded-xl py-4 text-lg font-medium w-auto"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <span>Sign In / Register</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              {/* Wishlist */}
              <Button
                variant="ghost"
                onClick={() => handleMobileDropdownToggle('wishlist')}
                className="justify-between text-gray-700 hover:text-red-600 hover:bg-red-50 mx-4 rounded-xl py-4 text-lg font-medium w-auto"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                  {wishlistItems.length > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full ml-1">
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isWishlistOpen ? 'rotate-90' : ''}`} />
              </Button>
              
              {/* Wishlist content in mobile menu */}
              {isWishlistOpen && (
                <div className="mx-4 mb-4 bg-gray-50 rounded-xl overflow-hidden">
                  {wishlistItems.length > 0 ? (
                    <>
                      <div className="max-h-60 overflow-y-auto">
                        {wishlistItems.slice(0, 3).map((item) => (
                          <div key={item.id} className="p-4 border-b border-gray-200 last:border-b-0">
                            <div className="flex gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-xs text-red-600 font-bold uppercase">{item.brand}</p>
                                <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                                <p className="text-sm font-bold text-gray-900">${item.price}</p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="w-8 h-8 rounded-full hover:bg-purple-50 hover:border-purple-200"
                                >
                                  <ShoppingBag className="w-3 h-3 text-purple-600" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="w-8 h-8 rounded-full hover:bg-blue-50 hover:border-blue-200"
                                >
                                  <BarChart3 className="w-3 h-3 text-blue-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200">
                        <Button 
                          onClick={() => {
                            navigate('/wishlist');
                            setIsMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl"
                        >
                          View Full Wishlist
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Your wishlist is empty</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Compare Products */}
              <Button
                variant="ghost"
                onClick={() => handleMobileDropdownToggle('compare')}
                className="justify-between text-gray-700 hover:text-blue-600 hover:bg-blue-50 mx-4 rounded-xl py-4 text-lg font-medium w-auto"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Compare Products</span>
                  {compareItems.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full ml-1">
                      {compareItems.length}
                    </span>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isCompareOpen ? 'rotate-90' : ''}`} />
              </Button>
              
              {/* Compare content in mobile menu */}
              {isCompareOpen && (
                <div className="mx-4 mb-4 bg-gray-50 rounded-xl overflow-hidden">
                  {compareItems.length > 0 ? (
                    <>
                      <div className="max-h-60 overflow-y-auto">
                        {compareItems.map((item) => (
                          <div key={item.id} className="p-4 border-b border-gray-200 last:border-b-0">
                            <div className="flex gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-xs text-blue-600 font-bold uppercase">{item.brand}</p>
                                <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                                <p className="text-sm font-bold text-gray-900">${item.price}</p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="w-8 h-8 rounded-full hover:bg-red-50 hover:border-red-200"
                                >
                                  <Heart className="w-3 h-3 text-red-600" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="w-8 h-8 rounded-full hover:bg-purple-50 hover:border-purple-200"
                                >
                                  <ShoppingBag className="w-3 h-3 text-purple-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200">
                        <Button 
                          onClick={() => {
                            navigate('/compare');
                            setIsMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl"
                        >
                          View Product Comparison
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No products to compare</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Notifications */}
              <Button
                variant="ghost"
                onClick={() => handleMobileDropdownToggle('notification')}
                className="justify-between text-gray-700 hover:text-blue-600 hover:bg-blue-50 mx-4 rounded-xl py-4 text-lg font-medium w-auto"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                  {5 > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full ml-1">
                      5
                    </span>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isNotificationOpen ? 'rotate-90' : ''}`} />
              </Button>
              
              {/* Notification content in mobile menu */}
              {isNotificationOpen && (
                <div className="mx-4 mb-4 bg-gray-50 rounded-xl overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {[1, 2, 3].map((notif) => (
                      <div key={notif} className="p-4 border-b border-gray-200 last:border-b-0">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">Order Update</h4>
                            <p className="text-xs text-gray-600">Your order has been shipped</p>
                            <p className="text-xs text-gray-400">2 hours ago</p>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <Button 
                      onClick={() => {
                        // Navigate to notifications page (when implemented)
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl"
                    >
                      View All Notifications
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile footer links */}
            <div className="border-t border-gray-100 py-4">
              <div className="px-4 pb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Links</p>
              </div>
              
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/categories');
                    setIsMenuOpen(false);
                  }}
                  className="justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50 mx-4 rounded-xl py-3 text-base font-medium w-auto"
                >
                  <span>All Categories</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/brands');
                    setIsMenuOpen(false);
                  }}
                  className="justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50 mx-4 rounded-xl py-3 text-base font-medium w-auto"
                >
                  <span>All Brands</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/trending');
                    setIsMenuOpen(false);
                  }}
                  className="justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50 mx-4 rounded-xl py-3 text-base font-medium w-auto"
                >
                  <span>Trending Now</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
});

HeaderSection.displayName = 'HeaderSection';