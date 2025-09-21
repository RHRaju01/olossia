import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  MapPin,
  User,
  Mail,
  Phone,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import { useGetCartQuery, useClearCartMutation } from "../services/api";
import {
  updateLocalItem,
  removeLocalItem,
  clearLocalItems,
} from "../store/cartSlice";
import { useUpdateItemMutation, useRemoveItemMutation } from "../services/api";
import { useNavigateWithScroll } from "../utils/navigation";

export const CheckoutPage = () => {
  const localItems = useSelector((s) => s.cart?.localItems || []);
  const { isAuthenticated } = useAuth();
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const serverItems = cartResponse?.data?.items || [];
  const cartItems = isAuthenticated ? serverItems : localItems;

  const totals = React.useMemo(() => {
    const subtotal = cartItems.reduce((s, it) => s + it.price * it.quantity, 0);
    const itemCount = cartItems.reduce((s, it) => s + it.quantity, 0);
    const shipping = subtotal > 100 ? 0 : subtotal > 0 ? 10 : 0;
    return { subtotal, itemCount, shipping, total: subtotal + shipping };
  }, [cartItems]);

  const dispatch = useDispatch();
  const [clearCartTrigger] = useClearCartMutation();

  const clearCart = async () => {
    // prefer server clear if authenticated; otherwise clear local
    if (isAuthenticated) {
      try {
        await clearCartTrigger().unwrap();
        return { success: true };
      } catch (e) {
        return { success: false, error: e };
      }
    }
    dispatch(clearLocalItems());
    return { success: true };
  };
  const [updateItemTrigger] = useUpdateItemMutation();
  const [removeItemTrigger] = useRemoveItemMutation();
  const { user } = useAuth();
  const navigate = useNavigateWithScroll();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    billingAddress: "same",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems.length, navigate]);

  const handleShippingChange = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      try {
        await removeItemTrigger(itemId).unwrap();
      } catch (e) {
        dispatch(removeLocalItem(itemId));
      }
    } else {
      try {
        await updateItemTrigger({
          itemId,
          update: { quantity: newQuantity },
        }).unwrap();
      } catch (e) {
        dispatch(
          updateLocalItem({ id: itemId, changes: { quantity: newQuantity } })
        );
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItemTrigger(itemId).unwrap();
    } catch (e) {
      dispatch(removeLocalItem(itemId));
    }
  };

  const validateShipping = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "state",
      "zipCode",
    ];
    return required.every((field) => shippingInfo[field].trim() !== "");
  };

  const validatePayment = () => {
    const required = ["cardNumber", "expiryDate", "cvv", "nameOnCard"];
    return required.every((field) => paymentInfo[field].trim() !== "");
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear cart and redirect to success page
    await clearCart();
    navigate("/order-success");

    setIsProcessing(false);
  };

  const nextStep = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
    } else if (step === 2 && validatePayment()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (cartItems.length === 0) {
    return null; // Will redirect via useEffect
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
            <h1 className="text-3xl font-black text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your purchase</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            {[
              { number: 1, title: "Shipping", icon: Truck },
              { number: 2, title: "Payment", icon: CreditCard },
              { number: 3, title: "Review", icon: Shield },
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    step >= stepItem.number
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  <stepItem.icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-semibold ${
                      step >= stepItem.number
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  >
                    Step {stepItem.number}
                  </p>
                  <p
                    className={`text-xs ${
                      step >= stepItem.number
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {stepItem.title}
                  </p>
                </div>
                {index < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-8 ${
                      step > stepItem.number ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-purple-600" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        value={shippingInfo.firstName}
                        onChange={(e) =>
                          handleShippingChange("firstName", e.target.value)
                        }
                        placeholder="Enter first name"
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={shippingInfo.lastName}
                        onChange={(e) =>
                          handleShippingChange("lastName", e.target.value)
                        }
                        placeholder="Enter last name"
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          handleShippingChange("email", e.target.value)
                        }
                        placeholder="Enter email address"
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          handleShippingChange("phone", e.target.value)
                        }
                        placeholder="Enter phone number"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      value={shippingInfo.address}
                      onChange={(e) =>
                        handleShippingChange("address", e.target.value)
                      }
                      placeholder="Enter street address"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Apartment, suite, etc. (optional)
                    </label>
                    <Input
                      value={shippingInfo.apartment}
                      onChange={(e) =>
                        handleShippingChange("apartment", e.target.value)
                      }
                      placeholder="Apartment, suite, etc."
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <Input
                        value={shippingInfo.city}
                        onChange={(e) =>
                          handleShippingChange("city", e.target.value)
                        }
                        placeholder="Enter city"
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State
                      </label>
                      <Input
                        value={shippingInfo.state}
                        onChange={(e) =>
                          handleShippingChange("state", e.target.value)
                        }
                        placeholder="Enter state"
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <Input
                        value={shippingInfo.zipCode}
                        onChange={(e) =>
                          handleShippingChange("zipCode", e.target.value)
                        }
                        placeholder="Enter ZIP code"
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number
                    </label>
                    <Input
                      value={paymentInfo.cardNumber}
                      onChange={(e) =>
                        handlePaymentChange("cardNumber", e.target.value)
                      }
                      placeholder="1234 5678 9012 3456"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <Input
                        value={paymentInfo.expiryDate}
                        onChange={(e) =>
                          handlePaymentChange("expiryDate", e.target.value)
                        }
                        placeholder="MM/YY"
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                      </label>
                      <Input
                        value={paymentInfo.cvv}
                        onChange={(e) =>
                          handlePaymentChange("cvv", e.target.value)
                        }
                        placeholder="123"
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Name on Card
                    </label>
                    <Input
                      value={paymentInfo.nameOnCard}
                      onChange={(e) =>
                        handlePaymentChange("nameOnCard", e.target.value)
                      }
                      placeholder="Enter name as it appears on card"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span>
                        Your payment information is encrypted and secure
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Address */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    <p className="text-gray-700">
                      {shippingInfo.firstName} {shippingInfo.lastName}
                      <br />
                      {shippingInfo.address}
                      <br />
                      {shippingInfo.apartment && `${shippingInfo.apartment}\n`}
                      {shippingInfo.city}, {shippingInfo.state}{" "}
                      {shippingInfo.zipCode}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </h4>
                    <p className="text-gray-700">
                      **** **** **** {paymentInfo.cardNumber.slice(-4)}
                      <br />
                      {paymentInfo.nameOnCard}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="rounded-xl px-8 py-3"
              >
                Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    step === 1 ? !validateShipping() : !validatePayment()
                  }
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg rounded-2xl sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.brand} • Size: {item.size}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-gray-900">
                            ${item.price}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-6 h-6 rounded-full"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-semibold w-6 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-6 h-6 rounded-full"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">
                      {totals.shipping === 0 ? "Free" : `$${totals.shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${totals.total}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-green-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Secure Checkout</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Your information is protected with 256-bit SSL encryption
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
