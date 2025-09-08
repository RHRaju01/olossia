import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  MapPin, 
  CreditCard,
  Bell,
  LogOut,
  ChevronRight,
  Star,
  Shield,
  HelpCircle,
  Gift
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
      description: 'Manage your personal information',
      color: 'text-purple-600'
    },
    {
      icon: Package,
      label: 'Order History',
      path: '/profile?tab=orders',
      description: 'Track your orders and purchases',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      label: 'Wishlist',
      path: '/wishlist',
      description: 'View your saved items',
      color: 'text-red-600'
    },
    {
      icon: MapPin,
      label: 'Addresses',
      path: '/profile?tab=addresses',
      description: 'Manage shipping addresses',
      color: 'text-green-600'
    },
    {
      icon: Settings,
      label: 'Account Settings',
      path: '/profile?tab=settings',
      description: 'Privacy and security settings',
      color: 'text-gray-600'
    }
  ];

  const quickActions = [
    {
      icon: Star,
      label: 'Reviews',
      path: '/profile?tab=reviews',
      color: 'text-yellow-600'
    },
    {
      icon: Gift,
      label: 'Rewards',
      path: '/profile?tab=rewards',
      color: 'text-purple-600'
    },
    {
      icon: HelpCircle,
      label: 'Help Center',
      path: '/help',
      color: 'text-blue-600'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-96 z-[55]">
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <h3 className="font-bold text-xl mb-1">{user?.firstName} {user?.lastName}</h3>
              <p className="text-purple-100 text-sm mb-3">{user?.email}</p>
              <Badge className="bg-white/20 text-white border-white/30">
                {user?.role || 'Customer'}
              </Badge>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors`}>
                  <item.icon className={`w-5 h-5 ${item.color} group-hover:text-purple-600`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 group-hover:text-purple-700">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </button>
            ))}
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="p-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => handleNavigation(action.path)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <action.icon className={`w-4 h-4 ${action.color} group-hover:text-purple-600`} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-purple-50 p-4 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900 text-sm">Account Verified</p>
                  <p className="text-xs text-purple-700">Your account is secure and verified</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 justify-center font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};