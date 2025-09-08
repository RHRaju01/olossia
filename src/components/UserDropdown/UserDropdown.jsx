import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  MapPin, 
  CreditCard,
  Bell,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const UserDropdown = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/');
  };

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      path: '/profile',
      description: 'Manage your personal information'
    },
    {
      icon: Package,
      label: 'Order History',
      path: '/profile?tab=orders',
      description: 'Track your orders and purchases'
    },
    {
      icon: Heart,
      label: 'Wishlist',
      path: '/wishlist',
      description: 'View your saved items'
    },
    {
      icon: MapPin,
      label: 'Addresses',
      path: '/profile?tab=addresses',
      description: 'Manage shipping addresses'
    },
    {
      icon: CreditCard,
      label: 'Payment Methods',
      path: '/profile?tab=settings',
      description: 'Manage payment options'
    },
    {
      icon: Bell,
      label: 'Notifications',
      path: '/profile?tab=settings',
      description: 'Notification preferences'
    },
    {
      icon: Settings,
      label: 'Account Settings',
      path: '/profile?tab=settings',
      description: 'Privacy and security settings'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 z-[55]">
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{user?.firstName} {user?.lastName}</h3>
                <p className="text-purple-100 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <item.icon className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 justify-start"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};