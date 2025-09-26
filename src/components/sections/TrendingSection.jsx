import React, { useState, useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import { TrendingUp } from "lucide-react";
import { ProductCard } from "../commerce/ProductCard";
import { useSelector /* dispatch removed */ } from "react-redux";
import { useCart } from "../../contexts/Cart/CartContext";
import { useAuthRedux } from "../../hooks/useAuthRedux";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCompare } from "../../contexts/CompareContext";
import { useAddItemMutation } from "../../services/api";
import { useNavigateWithScroll } from "../../utils/navigation";
import { ProductDetailsOverlay } from "../commerce/ProductDetailsOverlay";

// Trending Product Card with trending badge
const TrendingProductCard = React.memo(({ product, index, ...props }) => (
  <div className="relative" style={{ animationDelay: `${index * 100}ms` }}>
    <ProductCard product={product} {...props} />
    {/* Trending badge overlay */}
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {product.trending}
      </div>
    </div>
  </div>
));

TrendingProductCard.displayName = "TrendingProductCard";

export const TrendingSection = React.memo(() => {
  const { items: cartItems, addItem: addLocalCartItem, toggleItem, isInCart: isInCartLocal } = useCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
    items: wishlistItems,
  } = useWishlist();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigateWithScroll();
  const [addItemTrigger] = useAddItemMutation();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const products = useMemo(
    () => [
      {
        id: "oversized-blazer",
        name: "Oversized Blazer",
        brand: "ZARA",
        price: 149,
        rating: 4.8,
        reviews: 324,
        image:
          "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500",
        colors: ["#000000", "#8B4513", "#708090"],
        trending: "+127% this week",
      },
      {
        id: "vintage-high-waist-jeans",
        name: "Vintage High-Waist Jeans",
        brand: "LEVI'S",
        price: 89,
        rating: 4.9,
        reviews: 189,
        image:
          "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500",
        colors: ["#4169E1", "#000080", "#87CEEB"],
        trending: "+89% this week",
      },
      {
        id: "cashmere-knit-sweater",
        name: "Cashmere Knit Sweater",
        brand: "UNIQLO",
        price: 79,
        rating: 4.7,
        reviews: 256,
        image:
          "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=500",
        colors: ["#F5F5DC", "#D2B48C", "#A0522D"],
        trending: "+156% this week",
      },
      {
        id: "silk-summer-dress",
        name: "Silk Summer Dress",
        brand: "H&M",
        price: 99,
        rating: 4.6,
        reviews: 203,
        image:
          "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500",
        colors: ["#FFB6C1", "#FFC0CB", "#FF69B4"],
        trending: "+203% this week",
      },
      {
        id: "premium-leather-jacket",
        name: "Premium Leather Jacket",
        brand: "MANGO",
        price: 299,
        originalPrice: 399,
        rating: 4.9,
        reviews: 167,
        image:
          "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=500",
        colors: ["#000000", "#8B4513", "#2F4F4F"],
        trending: "+78% this week",
      },
      {
        id: "designer-silk-scarf",
        name: "Designer Silk Scarf",
        brand: "GUCCI",
        price: 399,
        rating: 5.0,
        reviews: 89,
        image:
          "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500",
        colors: ["#FFD700", "#FF6347", "#9370DB"],
        trending: "+234% this week",
      },
    ],
    []
  );

  const handleAddToWishlist = useCallback(
    async (product) => {
      if (isInWishlist(product.id)) {
        const wishlistItem = wishlistItems.find((item) => {
          if (!item) return false;
          const ids = [item.product_id, item.id, item.sku];
          if (item.product) ids.push(item.product.id, item.product.slug);
          return ids.some((x) => x === product.id || String(x) === String(product.id));
        });
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
        }
      } else {
        await addToWishlist(product);
      }
    },
    [isInWishlist, wishlistItems, removeFromWishlist, addToWishlist]
  );

  const handleAddToCompare = useCallback(
    async (product) => {
      await addToCompare(product);
    },
    [addToCompare]
  );

  const { isAuthenticated } = useAuthRedux();

  const handleAddToCart = useCallback(
    async (product) => {
      if (isAuthenticated) {
        try {
          await addItemTrigger({ product_id: product.id, quantity: 1 }).unwrap();
          return;
        } catch (e) {
          console.warn("server add failed, falling back to local toggle", e);
        }
      }

      // Use local toggle to mirror wishlist behavior for guests
      toggleItem(product);
    },
    [isAuthenticated, addItemTrigger, toggleItem]
  );

  const isInCart = useCallback(
    (productId) => {
      return cartItems.some((item) => {
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
    },
    [cartItems]
  );

  const handleViewProduct = useCallback(
    (productId) => {
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900">
                Trending{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                  Now
                </span>
              </h2>
            </div>
            <p className="text-xl text-gray-600">
              Most loved items this week by our community
            </p>

            {/* Mobile button - below description */}
            <div className="mt-6 lg:hidden">
              <Button
                variant="outline"
                onClick={() => navigate("/trending")}
                className="rounded-full px-8 py-3 border-2 hover:bg-green-50 hover:border-green-200 transition-all duration-300"
              >
                View All Trending
              </Button>
            </div>
          </div>

          {/* Desktop button - right side */}
          <div className="hidden lg:block">
            <Button
              variant="outline"
              onClick={() => navigate("/trending")}
              className="rounded-full px-8 py-3 border-2 hover:bg-green-50 hover:border-green-200 transition-all duration-300"
            >
              View All Trending
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <TrendingProductCard
              key={product.id}
              product={product}
              index={index}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onAddToCompare={handleAddToCompare}
              onQuickView={handleQuickView}
              isInWishlist={isInWishlist}
              isInCompare={isInCompare}
              isInCart={isInCart}
            />
          ))}
        </div>
      </div>

      <ProductDetailsOverlay
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
        onViewFullDetails={handleViewProduct}
      />
    </section>
  );
});

TrendingSection.displayName = "TrendingSection";
