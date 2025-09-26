import React, { useCallback, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Heart, ShoppingBag, X, Star, BarChart3 } from "lucide-react";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCompare } from "../../contexts/CompareContext";
import { useSelector } from "react-redux";
import { useAuthRedux } from "../../hooks/useAuthRedux";
import { useGetCartQuery } from "../../services/api";
import { useAddItemMutation, useRemoveItemMutation } from "../../services/api";
import { useCart } from "../../contexts/Cart/CartContext";
import { useNavigate } from "react-router-dom";

// Memoized wishlist item component
const WishlistItem = React.memo(
  ({
    item,
    onRemoveFromWishlist,
    onAddToCart,
    onAddToCompare,
    isInCompare, // boolean
    isInCart, // boolean
    isPending,
  }) => {
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
            {!item.inStock && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-red-600 font-bold uppercase">
                {item.brand}
              </p>
              <h4 className="font-semibold text-gray-900 leading-tight">
                {item.name}
              </h4>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(item.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({item.reviews?.length || item.reviewsCount || 0})</span>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Colors:</span>
              <div className="flex gap-1">
                {item.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onRemoveFromWishlist(item.id)}
                  className="w-8 h-8 rounded-full border-gray-200 hover:border-red-300 hover:bg-red-50"
                >
                  <X className="w-3 h-3 text-red-500" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onAddToCompare(item)}
                  className={`w-8 h-8 rounded-full border-gray-200 ${
                    isInCompare
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <BarChart3 className="w-3 h-3 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onAddToCart(item)}
                  className={`w-8 h-8 rounded-full border-gray-200 ${
                    isInCart
                      ? "bg-purple-50 border-purple-300 text-purple-600"
                      : "hover:border-purple-300 hover:bg-purple-50"
                  }`}
                  disabled={isPending}
                >
                  {isPending ? (
                    <svg
                      className="w-3 h-3 animate-spin text-purple-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <ShoppingBag className="w-3 h-3 text-purple-600" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WishlistItem.displayName = "WishlistItem";

export const WishlistDropdown = ({ isOpen, onClose }) => {
  const { items: wishlistItems, removeItem } = useWishlist();
  const { isAuthenticated } = useAuthRedux();
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const serverItems = cartResponse?.data?.items || [];
  const { items: cartItems, addItem: addLocalCartItem, toggleItem: toggleLocalItem, removeItem: removeLocalCartItem } = useCart();
  const sourceItems = isAuthenticated ? serverItems : cartItems;
  // helper: build candidate id set for a wishlist item
  const buildCandidatesFromItem = (item) => {
    const s = new Set();
    if (!item) return s;
    if (item.product_id) s.add(String(item.product_id));
    if (item.id) s.add(String(item.id));
    if (item.sku) s.add(String(item.sku));
    if (item.product) {
      if (item.product.id) s.add(String(item.product.id));
      if (item.product.slug) s.add(String(item.product.slug));
    }
    return s;
  };

  // Reuse buildCandidatesFromItem for robust matching
  const isInCart = (productId) => {
    const pid = String(productId);
    return sourceItems.some((item) => {
      if (!item) return false;
      const ids = buildCandidatesFromItem(item);
      return ids.has(pid);
    });
  };

  const [addItemTrigger] = useAddItemMutation();
  const [removeItemTrigger] = useRemoveItemMutation ? useRemoveItemMutation() : [null];
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigate();


  // helper: find existing cart/server item by matching any candidate id
  const findExistingByCandidates = (items, wishlistItem) => {
    const candidates = buildCandidatesFromItem(wishlistItem);
    if (candidates.size === 0) return null;
    return items.find((it) => {
      if (!it) return false;
      const ids = new Set();
      if (it.product_id) ids.add(String(it.product_id));
      if (it.id) ids.add(String(it.id));
      if (it.sku) ids.add(String(it.sku));
      if (it.product) {
        if (it.product.id) ids.add(String(it.product.id));
        if (it.product.slug) ids.add(String(it.product.slug));
      }
      for (const c of candidates) {
        if (ids.has(c) || ids.has(String(c))) return true;
      }
      return false;
    });
  };

  const handleRemoveFromWishlist = useCallback(
    async (itemId) => {
      await removeItem(itemId);
    },
    [removeItem]
  );

  // track pending product ids to avoid duplicate rapid clicks
  const [pendingToggles, setPendingToggles] = useState(new Set());
  // ref for synchronous reads/writes to avoid race conditions between rapid clicks
  const pendingRef = useRef(new Set());

  const handleAddToCart = useCallback(
    async (item) => {
      if (!item.inStock) return;

      // derive canonical/product keys to match cart normalization
      const canonicalId = String(
        item.product?.id ?? item.product_id ?? item.sku ?? item.product?.slug ?? item.id ?? ("p-" + (item.product_id ?? item.id ?? Date.now()))
      );
      const productKey = String(item.product?.id ?? item.product_id ?? item.sku ?? item.product?.slug ?? item.id ?? "");
      const pendingKey = canonicalId;

      // prevent duplicate concurrent toggles for same wishlist item using ref for sync
      if (pendingRef.current.has(pendingKey)) return;
      pendingRef.current.add(pendingKey);
      setPendingToggles(new Set(pendingRef.current));

      try {
        // server toggle for authenticated users
        if (isAuthenticated) {
          // find server-side item using robust candidate matching
          const existing = findExistingByCandidates(serverItems, item);

          if (existing && removeItemTrigger) {
            try {
              await removeItemTrigger(existing.id).unwrap();
              return;
            } catch (e) {
              console.warn('server remove failed, falling back to local remove', e);
            }
          }

          try {
            await addItemTrigger({ product_id: productKey, quantity: 1 }).unwrap();
            return;
          } catch (e) {
            console.warn('server add failed, falling back to local', e);
          }
        }

        // Guest/local toggle: try to find existing local item by canonicalId/productKey
        const localExisting = cartItems.find((it) => {
          if (!it) return false;
          const ids = [String(it.product_id), String(it.id), String(it.sku)];
          if (it.product) {
            if (it.product.id) ids.push(String(it.product.id));
            if (it.product.slug) ids.push(String(it.product.slug));
          }
          return ids.includes(productKey) || ids.includes(canonicalId);
        });

        if (localExisting) {
          // If present, remove it to toggle off
          removeLocalCartItem(localExisting.id);
          return;
        }

        // Otherwise add using canonical id so cart dedupes consistently
        addLocalCartItem({
          id: canonicalId,
          product_id: canonicalId,
          variant_id: null,
          quantity: 1,
          name: item.name,
          brand: item.brand,
          price: item.price,
          originalPrice: item.originalPrice || null,
          image: item.image,
          rating: item.rating || null,
          reviews: item.reviews || null,
          inStock: item.inStock !== undefined ? item.inStock : true,
          colors: item.colors || [],
        });

        return;
      } finally {
        // clear pending flag for this wishlist item (sync + state for UI)
        pendingRef.current.delete(pendingKey);
        setPendingToggles(new Set(pendingRef.current));
      }
    },
    [addItemTrigger, addLocalCartItem, cartItems, isAuthenticated, serverItems, removeItemTrigger, removeLocalCartItem]
  );

  const handleAddToCompare = useCallback(
    async (item) => {
      const product = {
        id: item.product_id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        rating: item.rating,
        reviews: item.reviews,
        colors: item.colors,
      };

      await addToCompare(product);
    },
    [addToCompare]
  );

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
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="font-bold text-gray-900 text-lg">Wishlist</h3>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                {wishlistItems.length}
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

          {/* Wishlist Items */}
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {wishlistItems.length > 0 ? (
              wishlistItems.map((item) => {
                // canonicalId / productKey to compare consistently against cart & wishlist entries
                const canonicalId = String(
                  item.product?.id ?? item.product_id ?? item.sku ?? item.product?.slug ?? item.id ?? ("p-" + (item.product_id ?? item.id ?? Date.now()))
                );
                const productKey = String(item.product?.id ?? item.product_id ?? item.sku ?? item.product?.slug ?? item.id ?? "");
                const boolInCompare = isInCompare(productKey);
                const boolInCart = isInCart(productKey);
                const isPending = pendingToggles.has(canonicalId);
                return (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                    onAddToCart={handleAddToCart}
                    onAddToCompare={handleAddToCompare}
                    isInCompare={boolInCompare}
                    isInCart={boolInCart}
                    isPending={isPending}
                  />
                );
              })
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Save items you love by clicking the heart icon on any product!
                </p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-xl"
                >
                  Discover Products
                </Button>
              </div>
            )}
          </div>

          {/* Footer - only show when wishlist has items */}
          {wishlistItems.length > 0 && (
            <div className="p-6 bg-gray-50 space-y-3">
              <Button
                onClick={() => {
                  navigate("/wishlist");
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl"
              >
                View Full Wishlist
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Items in your wishlist are saved for 30 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
