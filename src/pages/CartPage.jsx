import React from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  Minus,
  Plus,
  X,
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  Gift,
  ArrowRight,
  Star,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateLocalItem, removeLocalItem } from "../store/cartSlice";
import { useWishlist } from "../contexts/WishlistContext";
import { useAuthRedux } from "../hooks/useAuthRedux";
import { useNavigateWithScroll } from "../utils/navigation";
import {
  useGetCartQuery,
  useUpdateItemMutation,
  useRemoveItemMutation,
  useClearCartMutation,
} from "../services/api";

export const CartPage = () => {
  const { isAuthenticated } = useAuthRedux();
  // Prefer server-backed RTK Query cart; fallback to Redux guest cart (`s.cart.localItems`)
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateItemTrigger] = useUpdateItemMutation();
  const [removeItemTrigger] = useRemoveItemMutation();
  const [clearCartTrigger] = useClearCartMutation();

  const dispatch = useDispatch();
  const ctxItems = useSelector((s) => s.cart?.localItems || []);

  const cartItems = cartResponse?.data?.items || ctxItems || [];

  const subtotal = cartItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
  const itemCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);
  const shipping = subtotal > 100 ? 0 : subtotal > 0 ? 10 : 0;
  const totals = { subtotal, itemCount, shipping, total: subtotal + shipping };
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigateWithScroll();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      // fallback to redux guest cart
      dispatch(removeLocalItem(itemId));
    }
  };

  const handleMoveToWishlist = async (item) => {
    const product = {
      id: item.product_id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      rating: 4.5, // Default rating
      reviews: 100, // Default reviews
      colors: ["#000000", "#FFFFFF", "#FF6B9D"], // Default colors
    };

    await addToWishlist(product);
    try {
      await removeItemTrigger(item.id).unwrap();
    } catch (e) {
      dispatch(removeLocalItem(item.id));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        await clearCartTrigger().unwrap();
      } catch (e) {
        // clear local guest cart
        dispatch({ type: "cart/clearLocalItems" });
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Could trigger auth modal or redirect to login
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  // Recommended products (mock data)
  const recommendedProducts = [
    {
      id: "rec-1",
      name: "Silk Scarf",
      brand: "HERMÈS",
      price: 299,
      originalPrice: 399,
      image:
        "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=300",
      rating: 4.9,
    },
    {
      id: "rec-2",
      name: "Leather Wallet",
      brand: "COACH",
      price: 149,
      image:
        "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=300",
      rating: 4.7,
    },
    {
      id: "rec-3",
      name: "Designer Sunglasses",
      brand: "RAY-BAN",
      price: 199,
      originalPrice: 249,
      image:
        "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300",
      rating: 4.8,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-purple-600" />
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-1">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in your cart
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              Clear Cart
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start
              shopping to fill it up!
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Cart Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cartItems.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex gap-6">
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-32 h-32 object-cover rounded-xl"
                          />
                          {item.originalPrice && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              SALE
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">
                                {item.brand}
                              </p>
                              <h3 className="font-bold text-gray-900 text-xl leading-tight">
                                {item.name}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                Size: {item.size} • Color: {item.color}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-gray-900">
                                ${item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-lg text-gray-400 line-through">
                                  ${item.originalPrice}
                                </span>
                              )}
                              {item.originalPrice && (
                                <span className="text-sm font-bold text-green-600">
                                  Save ${item.originalPrice - item.price}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="w-8 h-8 rounded-full hover:bg-white"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-bold text-lg">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="w-8 h-8 rounded-full hover:bg-white"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Move to Wishlist */}
                              <Button
                                variant="outline"
                                onClick={() => handleMoveToWishlist(item)}
                                className={`rounded-xl ${
                                  isInWishlist(item.product_id)
                                    ? "bg-red-50 border-red-200 text-red-600"
                                    : "hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                                }`}
                              >
                                <Heart
                                  className={`w-4 h-4 mr-2 ${
                                    isInWishlist(item.product_id)
                                      ? "fill-current"
                                      : ""
                                  }`}
                                />
                                {isInWishlist(item.product_id)
                                  ? "Saved for Later"
                                  : "Save for Later"}
                              </Button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Subtotal:{" "}
                              <span className="font-bold text-gray-900">
                                ${formatPrice(item.price * item.quantity)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < cartItems.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommended Products */}
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>You might also like</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {recommendedProducts.map((product) => (
                      <div key={product.id} className="group cursor-pointer">
                        <div className="relative overflow-hidden rounded-xl mb-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.originalPrice && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              SALE
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-purple-600 font-bold uppercase">
                            {product.brand}
                          </p>
                          <h4 className="font-semibold text-gray-900">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">
                              ({product.rating})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              ${product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 rounded-xl text-sm">
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Order Summary */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Subtotal ({totals.itemCount} items)
                        </span>
                        <span className="font-semibold">
                          ${formatPrice(totals.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-semibold text-green-600">
                          {totals.shipping === 0
                            ? "Free"
                            : `$${formatPrice(totals.shipping)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-semibold">$0.00</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${formatPrice(totals.total)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="w-full rounded-xl py-3"
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Truck className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Free Shipping
                        </p>
                        <p className="text-gray-600">On orders over $100</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Secure Payment
                        </p>
                        <p className="text-gray-600">256-bit SSL encryption</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Gift className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Easy Returns
                        </p>
                        <p className="text-gray-600">30-day return policy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Promo Code */}
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Promo Code</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Button className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter a valid promo code to get a discount on your order
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
