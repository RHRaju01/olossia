import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import React from "react";
import {
  User,
  Package,
  Heart,
  Settings,
  X,
  MapPin,
  CreditCard,
  Bell,
  LogOut,
  ChevronRight,
  Star,
  Shield,
  HelpCircle,
  Gift,
} from "lucide-react";
import { useAuthRedux } from "../../hooks/useAuthRedux";
import { useNavigate } from "react-router-dom";

export const UserDropdown = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthRedux();
  const navigate = useNavigate();

  // Mount/unmount logging removed to reduce console noise.

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/");
  };

  const menuItems = [
    {
      icon: User,
      label: "My Profile",
      path: "/profile",
      description: "Manage your personal information",
      color: "text-purple-600",
    },
    {
      icon: Package,
      label: "Order History",
      path: "/profile?tab=orders",
      description: "Track your orders and purchases",
      color: "text-blue-600",
    },
    {
      icon: Heart,
      label: "Wishlist",
      path: "/wishlist",
      description: "View your saved items",
      color: "text-red-600",
    },
    {
      icon: MapPin,
      label: "Addresses",
      path: "/profile?tab=addresses",
      description: "Manage shipping addresses",
      color: "text-green-600",
    },
    {
      icon: Settings,
      label: "Account Settings",
      path: "/profile?tab=settings",
      description: "Privacy and security settings",
      color: "text-gray-600",
    },
  ];

  const quickActions = [
    {
      icon: Star,
      label: "Reviews",
      path: "/profile?tab=reviews",
      color: "text-yellow-600",
    },
    {
      icon: Gift,
      label: "Rewards",
      path: "/profile?tab=rewards",
      color: "text-purple-600",
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      path: "/help",
      color: "text-blue-600",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full z-[55] mt-2 w-96">
      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
        {/* limit height to viewport and allow internal vertical scrolling when needed */}
        <CardContent className="p-0 max-h-[80vh] overflow-y-auto">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white relative">
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/20 text-white"
                aria-label="Close user menu"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <span className="text-xl font-bold">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
              <h3 className="mb-1 text-xl font-bold">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="mb-3 text-sm text-purple-100">{user?.email}</p>
              <Badge className="border-white/30 bg-white/20 text-white">
                {user?.role || "Customer"}
              </Badge>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="group flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-gray-50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-purple-100`}
                >
                  <item.icon
                    className={`h-5 w-5 ${item.color} group-hover:text-purple-600`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 group-hover:text-purple-700">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-purple-600" />
              </button>
            ))}
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Quick Actions
            </p>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => handleNavigation(action.path)}
                  className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-purple-100">
                    <action.icon
                      className={`h-4 w-4 ${action.color} group-hover:text-purple-600`}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="border-t border-gray-100 p-4">
            <div className="mb-4 rounded-xl bg-purple-50 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    Account Verified
                  </p>
                  <p className="text-xs text-purple-700">
                    Your account is secure and verified
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-center rounded-xl font-semibold hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
