import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Heart, 
  Settings, 
  Shield, 
  CreditCard,
  Truck,
  Calendar,
  Edit,
  Plus,
  Eye,
  Star,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigateWithScroll } from '../utils/navigation';

// Handle URL tab parameter
const useTabFromURL = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['profile', 'orders', 'addresses', 'wishlist', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
  
  return [activeTab, setActiveTab];
};

export const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigateWithScroll();
  
  const [activeTab, setActiveTab] = useTabFromURL();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-01'
  });

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock data for demo
  const mockOrders = [
    {
      id: 'ORD-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 258.00,
      items: [
        {
          id: 1,
          name: 'Silk Midi Dress',
          brand: 'ZARA',
          price: 129,
          quantity: 1,
          image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=200'
        },
        {
          id: 2,
          name: 'Premium Cotton Blazer',
          brand: 'H&M',
          price: 89,
          quantity: 1,
          image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=200'
        }
      ]
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-10',
      status: 'shipped',
      total: 399.00,
      items: [
        {
          id: 3,
          name: 'Designer Silk Scarf',
          brand: 'GUCCI',
          price: 399,
          quantity: 1,
          image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=200'
        }
      ]
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-05',
      status: 'processing',
      total: 179.00,
      items: [
        {
          id: 4,
          name: 'Vintage Denim Jacket',
          brand: "LEVI'S",
          price: 159,
          quantity: 1,
          image: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=200'
        }
      ]
    }
  ];

  const mockAddresses = [
    {
      id: 1,
      type: 'shipping',
      isDefault: true,
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Fashion Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      type: 'billing',
      isDefault: false,
      firstName: 'John',
      lastName: 'Doe',
      address: '456 Business Ave',
      apartment: '',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'United States',
      phone: '+1 (555) 987-6543'
    }
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleProfileSave = () => {
    // In real app, save to backend
    setIsEditing(false);
    // Show success message
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">My Account</h1>
            <p className="text-gray-600">Manage your profile and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* User Info Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-purple-100 text-sm">{user?.email}</p>
                      <p className="text-purple-200 text-xs mt-1">Member since 2024</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-purple-50 text-purple-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-6 h-6 text-purple-600" />
                    Personal Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-xl"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.firstName}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, firstName: e.target.value }))}
                          className="rounded-xl"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{user?.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.lastName}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, lastName: e.target.value }))}
                          className="rounded-xl"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{user?.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="rounded-xl"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium py-2">{user?.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      {isEditing ? (
                        <Input
                          type="tel"
                          value={editedProfile.phone}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="rounded-xl"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{editedProfile.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedProfile.dateOfBirth}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="rounded-xl"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">
                          {new Date(editedProfile.dateOfBirth).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={handleProfileSave}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-xl"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-purple-600" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">{order.id}</h3>
                          <p className="text-sm text-gray-600">
                            Ordered on {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <p className="text-lg font-bold text-gray-900 mt-1">${order.total}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="text-xs text-purple-600 font-bold uppercase">{item.brand}</p>
                              <h4 className="font-semibold text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">Qty: {item.quantity} • ${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Track Order
                        </Button>
                        {order.status === 'delivered' && (
                          <Button
                            variant="outline"
                            className="rounded-xl hover:bg-yellow-50 hover:border-yellow-200"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Write Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {mockOrders.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                      <Button
                        onClick={() => navigate('/')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl"
                      >
                        Start Shopping
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    Saved Addresses
                  </CardTitle>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockAddresses.map((address) => (
                    <div key={address.id} className="border border-gray-100 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 capitalize">{address.type} Address</h3>
                            {address.isDefault && (
                              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <div className="text-gray-700 space-y-1">
                            <p className="font-medium">{address.firstName} {address.lastName}</p>
                            <p>{address.address}</p>
                            {address.apartment && <p>{address.apartment}</p>}
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Edit className="w-3 h-3 text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-red-50 hover:border-red-200"
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-red-500" />
                    My Wishlist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-6">Save items you love for later</p>
                    <Button
                      onClick={() => navigate('/wishlist')}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl"
                    >
                      Browse Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Account Settings */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-6 h-6 text-purple-600" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates about orders and promotions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-600">Get text updates for order status</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-gray-900">Marketing Emails</h4>
                        <p className="text-sm text-gray-600">Receive style tips and exclusive offers</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-purple-600" />
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl py-3"
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl py-3"
                    >
                      <CreditCard className="w-4 h-4 mr-3" />
                      Manage Payment Methods
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl py-3"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Privacy Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-0 shadow-lg rounded-2xl border-red-100">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-red-800 mb-2">Delete Account</h4>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};