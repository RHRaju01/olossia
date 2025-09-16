import React from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import {
  Bell,
  X,
  Package,
  Heart,
  ShoppingBag,
  Star,
  Clock,
} from "lucide-react";

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const notifications = [
    {
      id: 1,
      type: "order",
      title: "Order Shipped",
      message: "Your order #ORD-1234 has been shipped and is on its way!",
      time: "2 minutes ago",
      icon: Package,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      isRead: false,
    },
    {
      id: 2,
      type: "wishlist",
      title: "Price Drop Alert",
      message: "Silk Midi Dress from ZARA is now 30% off - only $129!",
      time: "1 hour ago",
      icon: Heart,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      isRead: false,
    },
    {
      id: 3,
      type: "review",
      title: "Review Reminder",
      message: "How was your recent purchase? Share your experience!",
      time: "3 hours ago",
      icon: Star,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      isRead: true,
    },
    {
      id: 4,
      type: "cart",
      title: "Cart Reminder",
      message: "You have 3 items waiting in your cart. Complete your purchase!",
      time: "6 hours ago",
      icon: ShoppingBag,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
      isRead: true,
    },
    {
      id: 5,
      type: "sale",
      title: "Flash Sale Started",
      message: "24-hour flash sale: Up to 70% off selected items!",
      time: "1 day ago",
      icon: Clock,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      isRead: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full right-0 mt-2 w-96 z-[55]"
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                  !notification.isRead ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`w-10 h-10 ${notification.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <notification.icon
                      className={`w-5 h-5 ${notification.iconColor}`}
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h4
                        className={`font-semibold text-gray-900 text-sm ${
                          !notification.isRead ? "font-bold" : ""
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl py-2 text-sm font-medium hover:bg-blue-50 hover:border-blue-200"
              >
                Mark All Read
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl py-2 text-sm">
                View All
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Get notified about orders, sales, and exclusive offers
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
