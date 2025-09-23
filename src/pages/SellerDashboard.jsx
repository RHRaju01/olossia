import React from "react";
import { useAuthRedux } from "../hooks/useAuthRedux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  DollarSign,
  Eye,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useNavigateWithScroll } from "../utils/navigation";

export const SellerDashboard = () => {
  const { user } = useAuthRedux();
  const navigate = useNavigateWithScroll();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    {
      title: "My Products",
      value: "328",
      change: "+8%",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Orders",
      value: "1,234",
      change: "+3%",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Revenue",
      value: "$12,450",
      change: "+11%",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Visitors",
      value: "9,421",
      change: "+5%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  const quickActions = [
    { title: "Add Listing", icon: Package, href: "/seller/products/new" },
    { title: "Manage Listings", icon: Package, href: "/seller/products" },
    { title: "View Orders", icon: ShoppingCart, href: "/seller/orders" },
    { title: "Analytics", icon: BarChart3, href: "/seller/analytics" },
    { title: "Settings", icon: Settings, href: "/seller/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Good to see you, {user?.firstName} {user?.lastName}!
          </h1>
          <p className="text-gray-600">Manage your products and orders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="border-0 shadow-lg rounded-2xl overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  onClick={() => navigate(action.href)}
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300"
                >
                  <action.icon className="w-8 h-8 text-purple-600" />
                  <span className="font-semibold text-gray-700">
                    {action.title}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" /> Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((order) => (
                  <div
                    key={order}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        Order #ORD-{1000 + order}
                      </p>
                      <p className="text-sm text-gray-600">
                        Customer Name • 2 items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">$129.99</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" /> Top Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((product) => (
                  <div
                    key={product}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <img
                      src={`https://images.pexels.com/photos/192676${product}/pexels-photo-192676${product}.jpeg?auto=compress&cs=tinysrgb&w=100`}
                      alt="Product"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Product Name {product}
                      </p>
                      <p className="text-sm text-gray-600">
                        {50 + product * 10} sales this week
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">$99.99</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
