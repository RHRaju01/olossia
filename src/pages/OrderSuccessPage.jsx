import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, Package, Truck, Mail, ArrowRight, Download } from 'lucide-react';
import { useNavigateWithScroll } from '../utils/navigation';

export const OrderSuccessPage = () => {
  const navigate = useNavigateWithScroll();

  // Mock order data
  const orderData = {
    orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    total: 258.0,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    email: 'customer@example.com',
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 py-12'>
      <div className='mx-auto max-w-2xl px-4 sm:px-6 lg:px-8'>
        <Card className='overflow-hidden rounded-3xl border-0 bg-white shadow-2xl'>
          <CardContent className='p-0'>
            {/* Success Header */}
            <div className='bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-12 text-center text-white'>
              <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20'>
                <CheckCircle className='h-12 w-12 text-white' />
              </div>
              <h1 className='mb-4 text-3xl font-black'>Order Confirmed!</h1>
              <p className='text-lg text-green-100'>
                Thank you for your purchase. Your order has been successfully placed.
              </p>
            </div>

            {/* Order Details */}
            <div className='space-y-8 p-8'>
              <div className='text-center'>
                <h2 className='mb-2 text-2xl font-bold text-gray-900'>
                  Order #{orderData.orderNumber}
                </h2>
                <p className='text-gray-600'>
                  A confirmation email has been sent to{' '}
                  <span className='font-semibold'>{orderData.email}</span>
                </p>
              </div>

              {/* Order Summary */}
              <div className='rounded-2xl bg-gray-50 p-6'>
                <h3 className='mb-4 font-bold text-gray-900'>Order Summary</h3>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Total Amount</span>
                  <span className='text-2xl font-bold text-gray-900'>${orderData.total}</span>
                </div>
              </div>

              {/* Next Steps */}
              <div className='space-y-4'>
                <h3 className='text-lg font-bold text-gray-900'>What happens next?</h3>

                <div className='space-y-4'>
                  <div className='flex items-start gap-4 rounded-xl bg-blue-50 p-4'>
                    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100'>
                      <Package className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>Order Processing</h4>
                      <p className='text-sm text-gray-600'>
                        We're preparing your items for shipment. You'll receive an email when your
                        order ships.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4 rounded-xl bg-purple-50 p-4'>
                    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100'>
                      <Truck className='h-5 w-5 text-purple-600' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>Estimated Delivery</h4>
                      <p className='text-sm text-gray-600'>
                        Your order will arrive by{' '}
                        <span className='font-semibold'>{orderData.estimatedDelivery}</span>
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4 rounded-xl bg-green-50 p-4'>
                    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100'>
                      <Mail className='h-5 w-5 text-green-600' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>Order Updates</h4>
                      <p className='text-sm text-gray-600'>
                        We'll keep you updated via email and SMS about your order status.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <Button
                    variant='outline'
                    className='rounded-xl py-3 font-semibold'
                    onClick={() => window.print()}
                  >
                    <Download className='mr-2 h-4 w-4' />
                    Download Receipt
                  </Button>
                  <Button
                    variant='outline'
                    className='rounded-xl py-3 font-semibold'
                    onClick={() => navigate('/profile/orders')}
                  >
                    <Package className='mr-2 h-4 w-4' />
                    Track Order
                  </Button>
                </div>

                <Button
                  onClick={() => navigate('/')}
                  className='w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 font-bold text-white hover:from-purple-700 hover:to-pink-700'
                >
                  Continue Shopping
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </div>

              {/* Support */}
              <div className='border-t border-gray-100 pt-6 text-center'>
                <p className='mb-4 text-gray-600'>Need help with your order?</p>
                <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                  <Button variant='ghost' className='text-purple-600 hover:text-purple-700'>
                    Contact Support
                  </Button>
                  <Button variant='ghost' className='text-purple-600 hover:text-purple-700'>
                    Live Chat
                  </Button>
                  <Button variant='ghost' className='text-purple-600 hover:text-purple-700'>
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
