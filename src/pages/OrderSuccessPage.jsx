import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, Package, Truck, Mail, ArrowRight, Download } from 'lucide-react';
import { useNavigateWithScroll } from '../utils/navigation';

export const OrderSuccessPage = () => {
  const navigate = useNavigateWithScroll();
  
  // Mock order data
  const orderData = {
    orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    total: 258.00,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    email: 'customer@example.com'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-12 px-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-black mb-4">Order Confirmed!</h1>
              <p className="text-green-100 text-lg">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
            </div>

            {/* Order Details */}
            <div className="p-8 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order #{orderData.orderNumber}</h2>
                <p className="text-gray-600">
                  A confirmation email has been sent to <span className="font-semibold">{orderData.email}</span>
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">${orderData.total}</span>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">What happens next?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Order Processing</h4>
                      <p className="text-sm text-gray-600">We're preparing your items for shipment. You'll receive an email when your order ships.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Estimated Delivery</h4>
                      <p className="text-sm text-gray-600">Your order will arrive by <span className="font-semibold">{orderData.estimatedDelivery}</span></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Order Updates</h4>
                      <p className="text-sm text-gray-600">We'll keep you updated via email and SMS about your order status.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="rounded-xl py-3 font-semibold"
                    onClick={() => window.print()}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl py-3 font-semibold"
                    onClick={() => navigate('/profile/orders')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Track Order
                  </Button>
                </div>

                <Button
                  onClick={() => navigate('/')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl"
                >
                  Continue Shopping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Support */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-gray-600 mb-4">Need help with your order?</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
                    Contact Support
                  </Button>
                  <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
                    Live Chat
                  </Button>
                  <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
                    FAQ
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};