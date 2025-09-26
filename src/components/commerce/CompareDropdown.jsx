import React, { useCallback, useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  BarChart3,
  X,
  Star,
  ArrowRight,
  Eye,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { useCompare } from "../../contexts/CompareContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useSelector /* local cart via context now */ } from "react-redux";
import { useAuthRedux } from "../../hooks/useAuthRedux";
import { useGetCartQuery } from "../../services/api";
import { useAddItemMutation, useRemoveItemMutation } from "../../services/api";
import { useCart } from "../../contexts/Cart/CartContext";
import { useNavigate } from "react-router-dom";

// Memoized compare item component
const CompareItem = React.memo(
  ({
    item,
    onRemoveFromCompare,
    onAddToWishlist,
    onAddToCart,
    isInWishlist, // boolean
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
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase">
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
              <span className="text-xs text-gray-500">({item.reviews})</span>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Colors:</span>
              <div className="flex gap-1">
                {item.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {item.colors.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{item.colors.length - 3}
                  </span>
                )}
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
                  onClick={() => onAddToWishlist(item)}
                  className={`w-8 h-8 rounded-full border-gray-200 ${
                    isInWishlist
                      ? "bg-red-50 border-red-300 text-red-600"
                      : "hover:border-red-300 hover:bg-red-50"
                  }`}
                >
                  <Heart
                    className={`w-3 h-3 text-red-600 ${isInWishlist ? "fill-current" : ""}`}
                  />
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onRemoveFromCompare(item.id)}
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
  }
);

CompareItem.displayName = "CompareItem";

export const CompareDropdown = ({ isOpen, onClose }) => {
  const { items: compareItems, removeItem, clearError, error } = useCompare();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuthRedux();
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { items: cartItems, addItem: addLocalCartItem, removeItem: removeLocalCartItem } = useCart();
  const serverItems = cartResponse?.data?.items || [];
  const sourceItems = isAuthenticated ? serverItems : cartItems;

  // pending toggles to prevent duplicate add/remove requests for the same product
  const pendingRef = useRef(new Set());
  const [, setTick] = useState(0); // state tick to force rerenders when pendingRef changes
  const cartItemsRef = useRef(cartItems);
  const serverItemsRef = useRef(serverItems);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    serverItemsRef.current = serverItems;
  }, [serverItems]);

  // small helper to wait for a condition (polling)
  const waitFor = async (fn, timeout = 1000, interval = 50) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (fn()) return true;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, interval));
    }
    return false;
  };

  const isInCart = (productId) =>
    sourceItems.some((item) => {
      if (!item) return false;
      const candidateIds = new Set();
      if (item.product_id) candidateIds.add(item.product_id);
      if (item.id) candidateIds.add(item.id);
      if (item.sku) candidateIds.add(item.sku);
      if (item.product) {
        if (item.product.id) candidateIds.add(item.product.id);
        if (item.product.slug) candidateIds.add(item.product.slug);
      }
      return candidateIds.has(productId) || candidateIds.has(String(productId));
    });
  const [addItemTrigger] = useAddItemMutation();
  const [removeItemTrigger] = useRemoveItemMutation ? useRemoveItemMutation() : [null];
  // dispatch not needed for local cart fallbacks
  const navigate = useNavigate();

  const handleRemoveFromCompare = useCallback(
    async (itemId) => {
      await removeItem(itemId);
    },
    [removeItem]
  );

  const handleAddToWishlist = useCallback(
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

      const existing = wishlistItems.find((it) => {
        if (!it) return false;
        const ids = [it.product_id, it.id, it.sku];
        if (it.product) ids.push(it.product.id, it.product.slug);
        return ids.some((x) => x === product.id || String(x) === String(product.id));
      });

      if (existing) {
        await removeFromWishlist(existing.id);
        return;
      }

      await addToWishlist(product);
    },
    [addToWishlist, removeFromWishlist, wishlistItems]
  );

  const handleAddToCart = useCallback(
    async (item) => {
      // prefer product-level ids; fall back to entry id only as last resort
      const productId = item.product?.id ?? item.product_id ?? item.sku ?? item.id;
      const canonicalId = String(item.product?.id ?? item.product_id ?? item.sku ?? item.product?.slug ?? item.id ?? ("p-" + (item.product_id ?? item.id ?? Date.now())));
      const pendingKey = canonicalId;

      // if a toggle is already in-flight for this product, ignore
      if (pendingRef.current.has(pendingKey)) return;
      pendingRef.current.add(pendingKey);
      setTick((t) => t + 1);

      if (isAuthenticated) {
        const existing = serverItems.find((it) => {
          if (!it) return false;
          const ids = [it.product_id, it.id, it.sku];
          if (it.product) ids.push(it.product.id, it.product.slug);
          return ids.some((x) => x === productId || String(x) === canonicalId);
        });
        if (existing && removeItemTrigger) {
          try {
            await removeItemTrigger(existing.id).unwrap();
            // wait for serverItems to reflect removal
            await waitFor(() => !serverItemsRef.current.some((it) => {
              if (!it) return false;
              const ids = [it.product_id, it.id, it.sku];
              if (it.product) ids.push(it.product.id, it.product.slug);
              return ids.some((x) => x === productId || String(x) === canonicalId);
            }), 1500);
            pendingRef.current.delete(pendingKey);
            setTick((t) => t + 1);
            return;
          } catch (e) {
            console.warn('server remove failed, falling back to local remove', e);
          }
        }

        try {
          await addItemTrigger({ product_id: productId, quantity: 1 }).unwrap();
          // wait for serverItems to reflect addition
          await waitFor(() => serverItemsRef.current.some((it) => {
            if (!it) return false;
            const ids = [it.product_id, it.id, it.sku];
            if (it.product) ids.push(it.product.id, it.product.slug);
            return ids.some((x) => x === productId || String(x) === canonicalId);
          }), 1500);
          pendingRef.current.delete(pendingKey);
          setTick((t) => t + 1);
          return;
        } catch (e) {
          console.warn('server add failed, falling back to local', e);
        }
      }

      // Local guest toggle: check robustly and use cart context API
      const localExists = cartItems.find((it) => {
        if (!it) return false;
        const ids = [it.product_id, it.id, it.sku];
        if (it.product) ids.push(it.product.id, it.product.slug);
        return ids.some((x) => x === productId || String(x) === canonicalId);
      });

      if (localExists) {
        removeLocalCartItem(localExists.id);
        // wait for cartItems to reflect removal
        await waitFor(() => !cartItemsRef.current.some((it) => {
          if (!it) return false;
          const ids = [it.product_id, it.id, it.sku];
          if (it.product) ids.push(it.product.id, it.product.slug);
          return ids.some((x) => x === productId || String(x) === canonicalId);
        }), 1000);
        pendingRef.current.delete(pendingKey);
        setTick((t) => t + 1);
        return;
      }

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

      // wait for cartItems to reflect addition
      await waitFor(() => cartItemsRef.current.some((it) => {
        if (!it) return false;
        const ids = [it.product_id, it.id, it.sku];
        if (it.product) ids.push(it.product.id, it.product.slug);
        return ids.some((x) => x === productId || String(x) === canonicalId);
      }), 1000);

      pendingRef.current.delete(pendingKey);
      setTick((t) => t + 1);
    },
    [addItemTrigger, addLocalCartItem, cartItems, isAuthenticated, serverItems, removeLocalCartItem]
  );

  const handleViewComparison = useCallback(() => {
    navigate("/compare");
    onClose();
  }, [navigate, onClose]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

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
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-lg">
                Compare Products
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {compareItems.length}/4
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

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Compare Items */}
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {compareItems.length > 0 ? (
              compareItems.map((item) => {
                const canonicalId = String(item.product?.id ?? item.product_id ?? item.sku ?? item.product?.slug ?? item.id ?? ("p-" + (item.product_id ?? item.id ?? Date.now())));
                const pendingKey = canonicalId;
                const isPending = pendingRef.current.has(pendingKey);
                // productKey is the preferred product-level identifier (stringified)
                const productKey = String(item.product?.id ?? item.product_id ?? item.sku ?? item.product?.slug ?? item.id ?? "");

                const boolInWishlist = wishlistItems.some((it) => {
                  if (!it) return false;
                  const ids = [it.product_id, it.id, it.sku];
                  if (it.product) ids.push(it.product.id, it.product.slug);
                  // robust string comparison against productKey or canonicalId
                  return ids.some((x) => String(x) === productKey || String(x) === canonicalId);
                });

                const boolInCart = sourceItems.some((it) => {
                  if (!it) return false;
                  const ids = [it.product_id, it.id, it.sku];
                  if (it.product) ids.push(it.product.id, it.product.slug);
                  return ids.some((x) => String(x) === productKey || String(x) === canonicalId);
                });

                return (
                  <CompareItem
                    key={item.id}
                    item={item}
                    onRemoveFromCompare={handleRemoveFromCompare}
                    onAddToWishlist={handleAddToWishlist}
                    onAddToCart={handleAddToCart}
                    isInWishlist={boolInWishlist}
                    isInCart={boolInCart}
                    isPending={isPending}
                  />
                );
              })
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products to compare
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Add products to compare their features, prices, and
                  specifications!
                </p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6 py-2 rounded-xl"
                >
                  Discover Products
                </Button>
                {/* <p className="text-xs text-gray-500 text-center">
                  Add products to compare features and specifications
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Add products to compare features and specifications
                </p> */}
              </div>
            )}
          </div>

          {/* Footer - only show when compare has items */}
          {compareItems.length > 0 && (
            <div className="p-6 bg-gray-50 space-y-3">
              <Button
                onClick={handleViewComparison}
                disabled={compareItems.length < 2}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare Products ({compareItems.length})
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 text-center">
                {compareItems.length < 2
                  ? `Add ${2 - compareItems.length} more product${
                      2 - compareItems.length > 1 ? "s" : ""
                    } to compare`
                  : "Compare features, prices, and specifications"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
