import React, { useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  ArrowRight,
  Heart,
  BarChart3,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateLocalItem, removeLocalItem } from "../../store/cartSlice";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCompare } from "../../contexts/CompareContext";
import { useNavigate } from "react-router-dom";
import {
  useGetCartQuery,
  useUpdateItemMutation,
  useRemoveItemMutation,
} from "../../services/api";

// Memoized cart item component
const CartItem = React.memo(({ item, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="p-6 border-b border-gray-50 last:border-b-0">
      <div className="flex gap-4">
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-xl"
            loading="lazy"
          />
          {item.originalPrice && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              SALE
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs text-purple-600 font-bold uppercase">
              {item.brand}
            </p>
            <h4 className="font-semibold text-gray-900 leading-tight">
              {item.name}
            </h4>
            <p className="text-sm text-gray-500">
              Size: {item.size} • Color: {item.color}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">${item.price}</span>
              {item.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${item.originalPrice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border-gray-200"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border-gray-200"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onRemoveItem(item.id)}
                className="w-8 h-8 rounded-full border-gray-200 hover:border-red-300 hover:bg-red-50"
              >
                <X className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = "CartItem";

export const CartDropdown = ({ isOpen, onClose }) => {
  // Prefer reading cart directly from RTK Query for this UI component.
  const { data: cartResponse } = useGetCartQuery();
  const [updateItemTrigger] = useUpdateItemMutation();
  const [removeItemTrigger] = useRemoveItemMutation();

  // Fallback to Redux local cart for guest users
  const dispatch = useDispatch();
  const ctxItems = useSelector((s) => s.cart?.localItems || []);
  const navigate = useNavigate();

  const cartItems = cartResponse?.data?.items || ctxItems || [];

  const handleUpdateQuantity = useCallback(
    async (itemId, newQuantity) => {
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
          // fallback to local redux cart
          dispatch(
            updateLocalItem({ id: itemId, changes: { quantity: newQuantity } })
          );
        }
      }
    },
    [updateItemTrigger, removeItemTrigger]
  );

  const handleRemoveItem = useCallback(
    async (itemId) => {
      try {
        await removeItemTrigger(itemId).unwrap();
      } catch (e) {
        dispatch(removeLocalItem(itemId));
      }
    },
    [removeItemTrigger]
  );

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-96 z-[55]">
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-gray-900 text-lg">Shopping Cart</h3>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                {cartItems.length}
              </span>
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

          {/* Cart Items */}
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Discover amazing products and add them to your cart to get
                  started!
                </p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-xl"
                >
                  Start Shopping
                </Button>
              </div>
            )}
          </div>

          {/* Summary - only show when cart has items */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-gray-50 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    $
                    {cartItems
                      .reduce((s, it) => s + it.price * it.quantity, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">
                    {(() => {
                      const subtotal = cartItems.reduce(
                        (s, it) => s + it.price * it.quantity,
                        0
                      );
                      return subtotal > 100
                        ? "Free"
                        : `$${subtotal > 0 ? 10 : 0}`;
                    })()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    $
                    {(() => {
                      const subtotal = cartItems.reduce(
                        (s, it) => s + it.price * it.quantity,
                        0
                      );
                      const shipping =
                        subtotal > 100 ? 0 : subtotal > 0 ? 10 : 0;
                      return (subtotal + shipping).toFixed(2);
                    })()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    navigate("/checkout");
                    onClose();
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl"
                >
                  Checkout
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/cart");
                    onClose();
                  }}
                  className="w-full rounded-xl py-3"
                >
                  View Full Cart
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
