import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Eye,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useNavigateWithScroll } from '../utils/navigation';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigateWithScroll();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    {
      title: 'Total Users',
      value: '12,543',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Products',
      value: '8,921',
      change: '+5%',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Orders Today',
      value: '234',
      change: '+18%',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+23%',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  const quickActions = [
    { title: 'Add Product', icon: Package, href: '/admin/products/new' },
    { title: 'Manage Users', icon: Users, href: '/admin/users' },
    { title: 'View Orders', icon: ShoppingCart, href: '/admin/orders' },
    { title: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { title: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-black text-gray-900'>
            Welcome back, {user?.firstName}!
          </h1>
          <p className='text-gray-600'>Here's what's happening with your platform today.</p>
        </div>

        {/* Stats Grid */}
        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {stats.map(stat => (
            <Card key={stat.title} className='overflow-hidden rounded-2xl border-0 shadow-lg'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='mb-1 text-sm font-medium text-gray-600'>{stat.title}</p>
                    <p className='text-3xl font-black text-gray-900'>{stat.value}</p>
                    <p className='mt-1 text-sm font-semibold text-green-600'>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 ${stat.bgColor} flex items-center justify-center rounded-xl`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className='mb-8 overflow-hidden rounded-2xl border-0 shadow-lg'>
          <CardHeader className='bg-gradient-to-r from-purple-600 to-pink-600 text-white'>
            <CardTitle className='text-xl font-bold'>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
              {quickActions.map(action => (
                <Button
                  key={action.title}
                  variant='outline'
                  className='flex h-auto flex-col items-center gap-3 p-6 transition-all duration-300 hover:border-purple-200 hover:bg-purple-50'
                >
                  <action.icon className='h-8 w-8 text-purple-600' />
                  <span className='font-semibold text-gray-700'>{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <Card className='overflow-hidden rounded-2xl border-0 shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5 text-green-600' />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                {[1, 2, 3, 4].map(order => (
                  <div
                    key={order}
                    className='flex items-center justify-between rounded-xl bg-gray-50 p-4'
                  >
                    <div>
                      <p className='font-semibold text-gray-900'>Order #ORD-{1000 + order}</p>
                      <p className='text-sm text-gray-600'>Customer Name • 2 items</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-bold text-gray-900'>$129.99</p>
                      <span className='inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800'>
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className='overflow-hidden rounded-2xl border-0 shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Eye className='h-5 w-5 text-blue-600' />
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                {[1, 2, 3, 4].map(product => (
                  <div key={product} className='flex items-center gap-4 rounded-xl bg-gray-50 p-4'>
                    <img
                      src={`https://images.pexels.com/photos/192676${product}/pexels-photo-192676${product}.jpeg?auto=compress&cs=tinysrgb&w=100`}
                      alt='Product'
                      className='h-12 w-12 rounded-lg object-cover'
                    />
                    <div className='flex-1'>
                      <p className='font-semibold text-gray-900'>Product Name {product}</p>
                      <p className='text-sm text-gray-600'>{50 + product * 10} sales this week</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-bold text-gray-900'>$99.99</p>
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
