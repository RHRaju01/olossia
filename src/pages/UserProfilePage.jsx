import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api/authAPI';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit2, 
  Save, 
  X, 
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  Lock,
  Trash2,
  Plus,
  Star,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Heart,
  BarChart3,
  Download,
  Eye,
  Phone,
  Home
} from 'lucide-react';
import { useNavigateWithScroll } from '../utils/navigation';

export const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigateWithScroll();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  });

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle URL tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'orders', 'addresses', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      if (response.success) {
        setProfile(response.data.user);
        setEditForm({
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          dateOfBirth: response.data.user.dateOfBirth || ''
        });
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      dateOfBirth: profile?.dateOfBirth || ''
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Implement profile update API
      console.log('Saving profile:', editForm);
      setIsEditing(false);
      setProfile(prev => ({
        ...prev,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        dateOfBirth: editForm.dateOfBirth
      }));
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  // Mock data for orders, addresses, etc.
  const mockOrders = [
    {
      id: 'ORD-2025-001',
      date: '2025-01-15',
      status: 'delivered',
      total: 258.00,
      items: 3,
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2025-01-18'
    },
    {
      id: 'ORD-2025-002',
      date: '2025-01-10',
      status: 'shipped',
      total: 149.99,
      items: 2,
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2025-01-16'
    },
    {
      id: 'ORD-2025-003',
      date: '2025-01-05',
      status: 'processing',
      total: 89.50,
      items: 1,
      trackingNumber: null,
      estimatedDelivery: '2025-01-20'
    }
  ];

  const mockAddresses = [
    {
      id: 1,
      type: 'home',
      isDefault: true,
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      type: 'work',
      isDefault: false,
      firstName: 'John',
      lastName: 'Doe',
      address: '456 Business Ave',
      apartment: 'Suite 200',
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
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'shipped': return Truck;
      case 'processing': return Clock;
      case 'cancelled': return AlertCircle;
      default: return Package;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchProfile} className="w-full">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
            <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* User Info Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-lg">{profile?.firstName} {profile?.lastName}</h3>
                    <p className="text-purple-100 text-sm">{profile?.email}</p>
                    <Badge className="mt-2 bg-white/20 text-white border-white/30">
                      {profile?.role || 'Customer'}
                    </Badge>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-purple-50 text-purple-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 justify-start"
                  >
                    <X className="w-4 h-4 mr-3" />
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
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-6 h-6 text-purple-600" />
                      Personal Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        onClick={handleEdit}
                        className="flex items-center gap-2 rounded-xl"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          className="flex items-center gap-2 rounded-xl"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 rounded-xl"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {profile?.firstName} {profile?.lastName}
                      </h3>
                      <p className="text-gray-600">{profile?.email}</p>
                      <Button variant="outline" size="sm" className="mt-2 rounded-xl">
                        <Edit2 className="w-3 h-3 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <Input
                          value={editForm.firstName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Enter first name"
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border">
                          {profile?.firstName || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <Input
                          value={editForm.lastName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Enter last name"
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border">
                          {profile?.lastName || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border">
                          {profile?.email || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <Input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border">
                          {profile?.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editForm.dateOfBirth}
                          onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border">
                          {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="p-3 bg-gray-50 rounded-xl border">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">24</p>
                      <p className="text-sm text-gray-600">Wishlist Items</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">8</p>
                      <p className="text-sm text-gray-600">Reviews Written</p>
                    </div>
                  </div>
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
                  {mockOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">Order {order.id}</h3>
                            <p className="text-gray-600">Placed on {new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} border-0 font-semibold`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="font-bold text-gray-900">${order.total}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Items</p>
                            <p className="font-bold text-gray-900">{order.items} item{order.items !== 1 ? 's' : ''}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              {order.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}
                            </p>
                            <p className="font-bold text-gray-900">
                              {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {order.trackingNumber && (
                          <div className="bg-blue-50 p-4 rounded-xl mb-4">
                            <p className="text-sm text-blue-700 font-medium">
                              Tracking Number: <span className="font-mono">{order.trackingNumber}</span>
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button variant="outline" className="rounded-xl">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {order.status === 'delivered' && (
                            <Button variant="outline" className="rounded-xl">
                              <Download className="w-4 h-4 mr-2" />
                              Download Invoice
                            </Button>
                          )}
                          {order.trackingNumber && (
                            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                              <Truck className="w-4 h-4 mr-2" />
                              Track Package
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-purple-600" />
                      Saved Addresses
                    </CardTitle>
                    <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockAddresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            {address.type === 'home' ? <Home className="w-5 h-5 text-purple-600" /> : <MapPin className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 capitalize">{address.type} Address</h3>
                            {address.isDefault && (
                              <Badge className="bg-green-100 text-green-800 border-0 text-xs">Default</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-gray-700">
                        <p className="font-medium">{address.firstName} {address.lastName}</p>
                        <p>{address.address}</p>
                        {address.apartment && <p>{address.apartment}</p>}
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                        {address.phone && (
                          <p className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4" />
                            {address.phone}
                          </p>
                        )}
                      </div>

                      {!address.isDefault && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="rounded-xl">
                            Set as Default
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Security Settings */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-purple-600" />
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Password</p>
                          <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl">
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700 rounded-xl">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Privacy Settings</p>
                          <p className="text-sm text-gray-600">Control your data and visibility</p>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl">
                        Manage Privacy
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-6 h-6 text-purple-600" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { id: 'order_updates', label: 'Order Updates', description: 'Get notified about your order status' },
                      { id: 'promotions', label: 'Promotions & Offers', description: 'Receive exclusive deals and discounts' },
                      { id: 'new_arrivals', label: 'New Arrivals', description: 'Be first to know about new products' },
                      { id: 'price_drops', label: 'Price Drop Alerts', description: 'Get notified when wishlist items go on sale' },
                      { id: 'newsletter', label: 'Newsletter', description: 'Weekly fashion tips and trends' }
                    ].map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">{setting.label}</p>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-6 h-6 text-purple-600" />
                      Account Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start rounded-xl">
                      <Download className="w-4 h-4 mr-3" />
                      Download My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-xl">
                      <Shield className="w-4 h-4 mr-3" />
                      Privacy Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 rounded-xl">
                      <Trash2 className="w-4 h-4 mr-3" />
                      Delete Account
                    </Button>
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