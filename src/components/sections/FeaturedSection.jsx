import React, { useState, useCallback, useMemo } from "react";
import { Button } from "../ui";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "../commerce/ProductCard";
import { useSelector /* dispatch removed */ } from "react-redux";
import { useCart } from "../../contexts/Cart/CartContext";
import { useAuthRedux } from "../../hooks/useAuthRedux";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCompare } from "../../contexts/CompareContext";
import { useAddItemMutation } from "../../services/api";
import { useNavigateWithScroll } from "../../utils/navigation";
import { ProductDetailsOverlay } from "../commerce/ProductDetailsOverlay";

export const FeaturedSection = React.memo(() => {
  const { items: cartItems, addItem: addLocalCartItem, removeItem: removeLocalCartItem, toggleItem } = useCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
    items: wishlistItems,
  } = useWishlist();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const [addItemTrigger] = useAddItemMutation();
  const navigate = useNavigateWithScroll();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const products = useMemo(
    () => [
      {
        id: "silk-midi-dress",
        name: "Silk Midi Dress",
        brand: "ZARA",
        price: 129,
        originalPrice: 189,
        image:
          "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500",
        isNew: true,
        discount: 32,
        rating: 4.8,
        reviews: 124,
        colors: ["#FF6B9D", "#000000", "#FFFFFF"],
      },
      {
        id: "premium-cotton-blazer",
        name: "Premium Cotton Blazer",
        brand: "H&M",
        price: 89,
        image:
          "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500",
        isNew: false,
        discount: 0,
        rating: 4.6,
        reviews: 89,
        colors: ["#8B4513", "#000000", "#708090"],
      },
      {
        id: "vintage-denim-jacket",
        name: "Vintage Denim Jacket",
        brand: "LEVI'S",
        price: 159,
        originalPrice: 199,
        image:
          "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=500",
        isNew: false,
        discount: 20,
        rating: 4.9,
        reviews: 203,
        colors: ["#4169E1", "#000080", "#87CEEB"],
      },
      {
        id: "floral-maxi-dress",
        name: "Floral Maxi Dress",
        brand: "MANGO",
        price: 99,
        image:
          "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500",
        isNew: true,
        discount: 0,
        rating: 4.7,
        reviews: 156,
        colors: ["#FFB6C1", "#FFC0CB", "#FF69B4"],
      },
      {
        id: "leather-crossbody-bag",
        name: "Leather Crossbody Bag",
        brand: "COACH",
        price: 299,
        originalPrice: 399,
        image:
          "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500",
        isNew: false,
        discount: 25,
        rating: 4.9,
        reviews: 67,
        colors: ["#8B4513", "#000000", "#D2691E"],
      },
      {
        id: "minimalist-sneakers",
        name: "Minimalist Sneakers",
        brand: "NIKE",
        price: 119,
        image:
          "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=500",
        isNew: true,
        discount: 0,
        rating: 4.8,
        reviews: 234,
        colors: ["#FFFFFF", "#000000", "#FF6B9D"],
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
      // For authenticated users prefer server mutation; try to toggle server-side
      if (isAuthenticated) {
        try {
          // there may be a server toggle path elsewhere; keep add behavior
          await addItemTrigger({ product_id: product.id, quantity: 1 }).unwrap();
          return;
        } catch (e) {
          console.warn("server add failed, falling back to local toggle", e);
        }
      }

      // For guests, use CartContext.toggleItem which mirrors wishlist behaviour
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

  const handleCloseQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Editor's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Picks
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Handpicked favorites from our fashion experts, featuring the
            season's must-have pieces
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
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

        <div className="text-center mt-16">
          <Button
            size="lg"
            onClick={() => navigate("/products")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Discover More Products
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
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

FeaturedSection.displayName = "FeaturedSection";
