import React, { useState } from "react";
import { Search, ShoppingBag, Heart, User, Menu, X, Bell, ChevronRight, Package, Star } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { CartDropdown } from "../../../../components/CartDropdown/CartDropdown";
import { WishlistDropdown } from "../../../../components/WishlistDropdown/WishlistDropdown";
import { NotificationDropdown } from "../../../../components/NotificationDropdown/NotificationDropdown";
import { AuthOverlay } from "../../../../components/AuthOverlay/AuthOverlay";
import { useCart } from "../../../../contexts/CartContext";
import { useWishlist } from "../../../../contexts/WishlistContext";

export const HeaderSection = ({ onAuthModalOpen }) => {
  const { totals } = useCart();
  const { items: wishlistItems } = useWishlist();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileWishlistOpen, setIsMobileWishlistOpen] = useState(false);
  const [isMobileNotificationOpen, setIsMobileNotificationOpen] = useState(false);

  const navItems = [
    "Women",
    "Men", 
    "Kids",
    "Beauty",
    "Home"
  ];

  // Handle clicking outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.cart-dropdown-container')) {
        setIsCartOpen(false);
      }
      if (!event.target.closest('.wishlist-dropdown-container')) {
        setIsWishlistOpen(false);
      }
      if (!event.target.closest('.notification-dropdown-container')) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close other dropdowns when one opens
  const handleDropdownOpen = (dropdownType) => {
    setIsCartOpen(dropdownType === 'cart');
    setIsWishlistOpen(dropdownType === 'wishlist');
    setIsNotificationOpen(dropdownType === 'notification');
  };

  const handleUserClick = () => {
    onAuthModalOpen();
    // Close other dropdowns
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsNotificationOpen(false);
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
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              OLOSSIA
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item}
                variant="ghost"
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium px-6 py-2 rounded-full transition-all duration-200"
              >
                {item}
              </Button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search 50,000+ products from 500+ brands..."
                className="pl-12 pr-4 py-3 w-full border-gray-200 rounded-full focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
              />
            </div>
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
                onMouseEnter={() => handleDropdownOpen('notification')}
                onClick={() => handleDropdownOpen(isNotificationOpen ? null : 'notification')}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  3
                </span>
              </Button>
              <NotificationDropdown 
                isOpen={isNotificationOpen} 
                onClose={() => handleDropdownOpen(null)} 
              />
            </div>
            
            {/* User button with dropdown */}
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
                onMouseEnter={() => handleDropdownOpen('wishlist')}
                onClick={() => handleDropdownOpen(isWishlistOpen ? null : 'wishlist')}
              >
                <Heart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              </Button>
              <WishlistDropdown 
                isOpen={isWishlistOpen} 
                onClose={() => handleDropdownOpen(null)} 
              />
            </div>

            {/* Cart button with dropdown */}
            <div className="relative cart-dropdown-container z-50">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-gray-100"
                onMouseEnter={() => handleDropdownOpen('cart')}
                onClick={() => handleDropdownOpen(isCartOpen ? null : 'cart')}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totals.itemCount}
                </span>
              </Button>
              <CartDropdown 
                isOpen={isCartOpen} 
                onClose={() => handleDropdownOpen(null)} 
              />
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search products..."
              className="pl-12 pr-4 py-3 w-full border-gray-200 rounded-full"
            />
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md relative z-50">
            {/* Mobile navigation */}
            <nav className="flex flex-col py-4">
              <div className="px-4 pb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</p>
              </div>
              {navItems.map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className="justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50 mx-4 rounded-xl py-4 text-lg font-medium"
                >
                  <span>{item}</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ))}
            </nav>

            {/* Mobile action buttons */}
            <div className="border-t border-gray-100 py-4 relative z-50">
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
              <div className="relative z-40">
                <Button
                  variant="ghost"
                  onClick={() => setIsMobileWishlistOpen(!isMobileWishlistOpen)}
                  className="justify-between text-gray-700 hover:text-red-600 hover:bg-red-50 mx-4 rounded-xl py-4 text-lg font-medium w-auto"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5" />
                    <span>Wishlist</span>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full ml-1">
                      {wishlistItems.length}
                    </span>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isMobileWishlistOpen ? 'rotate-90' : ''}`} />
                </Button>
                
                {/* Mobile wishlist items */}
                {isMobileWishlistOpen && (
                  <div className="mx-4 mt-2 bg-gray-50 rounded-xl p-4 space-y-3 relative z-40">
                    {wishlistItems.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.brand} • ${item.price}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-red-500">
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                    ))}
                    {wishlistItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium mb-1">Your wishlist is empty</p>
                        <p className="text-xs">Start adding items you love!</p>
                      </div>
                    )}
                    {wishlistItems.length > 0 && (
                      <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 rounded-lg text-sm">
                        View Full Wishlist
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Notifications */}
              <div className="relative z-40">
                <Button
                  variant="ghost"
                  onClick={() => setIsMobileNotificationOpen(!isMobileNotificationOpen)}
                  className="justify-between text-gray-700 hover:text-blue-600 hover:bg-blue-50 mx-4 rounded-xl py-4 text-lg font-medium w-auto"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full ml-1">
                      3
                    </span>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isMobileNotificationOpen ? 'rotate-90' : ''}`} />
                </Button>
                
                {/* Mobile notification items */}
                {isMobileNotificationOpen && (
                  <div className="mx-4 mt-2 bg-gray-50 rounded-xl p-4 space-y-3 relative z-40">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">Order Shipped</p>
                        <p className="text-xs text-gray-600">Your order #ORD-1234 has been shipped</p>
                        <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">Price Drop Alert</p>
                        <p className="text-xs text-gray-600">Silk Midi Dress is now 30% off</p>
                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">Review Reminder</p>
                        <p className="text-xs text-gray-600">Share your experience with recent purchase</p>
                        <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 rounded-lg text-sm">
                      View All Notifications
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile footer links */}
            <div className="border-t border-gray-100 py-4 relative z-50">
              <div className="px-4 pb-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Links</p>
              </div>
              
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50 mx-4 rounded-xl py-3 text-base font-medium w-auto"
                >
                  <span>Help & Support</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50 mx-4 rounded-xl py-3 text-base font-medium w-auto"
                >
                  <span>Track Your Order</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50 mx-4 rounded-xl py-3 text-base font-medium w-auto"
                >
                  <span>Store Locator</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};