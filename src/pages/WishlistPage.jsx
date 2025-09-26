import React from "react";
import { Button, Card, CardContent } from "../components/ui";
import {
  Heart,
  ShoppingBag,
  X,
  Star,
  ArrowLeft,
  Filter,
  Grid,
  List,
  BarChart3,
} from "lucide-react";
import { useWishlist } from "../contexts/WishlistContext";
import { useSelector } from "react-redux";
import { useAuthRedux } from "../hooks/useAuthRedux";
import { useGetCartQuery } from "../services/api";
import { useCompare } from "../contexts/CompareContext";
import { useNavigateWithScroll } from "../utils/navigation";
import { useNavigate } from "react-router-dom";
import { useDispatch /* removed */ } from "react-redux";
import { useCart } from "../contexts/Cart/CartContext";
import { useAddItemMutation } from "../services/api";

export const WishlistPage = () => {
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlist();
  const { items: localItems } = useCart();
  const { isAuthenticated } = useAuthRedux();
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const serverItems = cartResponse?.data?.items || [];
  const sourceItems = isAuthenticated ? serverItems : localItems;

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
  const { addItem: addLocalCartItem, removeItem: removeLocalCartItem, toggleItem: toggleLocalCartItem } = useCart();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigateWithScroll();
  const [viewMode, setViewMode] = React.useState("grid");

  // Scroll to top when component mounts or ID changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemoveFromWishlist = async (itemId) => {
    await removeItem(itemId);
  };

  const handleAddToCart = async (item) => {
    if (!item.inStock) return;
    const productId = item.product_id;
    const existingId = findCartItemId(productId);

    // If authenticated, toggle on server
    if (isAuthenticated) {
      if (existingId && removeItemTrigger) {
        try {
          await removeItemTrigger(existingId).unwrap();
          return;
        } catch (e) {
          console.warn('server remove failed, falling back to local remove', e);
        }
      }

      try {
        await addItemTrigger({ product_id: productId, quantity: 1 }).unwrap();
        return;
      } catch (e) {
        console.warn('server add failed, falling back to local', e);
        // fallthrough to local add
      }
    }

    // Guest/local toggle
    const localExists = localItems.some((it) => (it.product_id || it.id) === productId);
    if (localExists) {
      const localId = localItems.find((it) => (it.product_id || it.id) === productId).id;
      addLocalCartItem({}); // ensure function referenced; actual removal below
      // remove via context API
      const removed = removeLocalCartItem(localId);
      return removed;
    }

    addLocalCartItem({
      id: `local-${Date.now()}`,
      product_id: productId,
      variant_id: null,
      quantity: 1,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  const handleAddToCompare = async (item) => {
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
  };

  const handleClearWishlist = async () => {
    if (
      window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      await clearWishlist();
    }
  };

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
                <Heart className="w-8 h-8 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "item" : "items"} saved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View mode toggle */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-lg"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-lg"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {wishlistItems.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                className="rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding items you love by clicking the heart icon on any
              product!
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-xl"
            >
              Discover Products
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "space-y-6"
            }
          >
            {wishlistItems.map((item) => (
              <Card
                key={item.id}
                className={`group border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden ${
                  viewMode === "grid" ? "rounded-2xl" : "rounded-xl"
                }`}
              >
                <CardContent className="p-0">
                  {viewMode === "grid" ? (
                    // Grid view
                    <>
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {item.originalPrice && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            SALE
                          </div>
                        )}

                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold bg-black/70 px-4 py-2 rounded-full">
                              OUT OF STOCK
                            </span>
                          </div>
                        )}

                        <Button
                          size="icon"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <p className="text-sm text-red-600 font-bold uppercase tracking-wider">
                            {item.brand}
                          </p>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">
                            {item.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(item.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({item.reviews?.length || item.reviewsCount || 0})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Colors:</span>
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
                            <span className="text-xl font-bold text-gray-900">
                              ${item.price}
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                ${item.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleAddToCompare(item)}
                            className={`flex-1 py-2 rounded-xl font-semibold ${
                              isInCompare(item.product_id)
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                            }`}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            {isInCompare(item.product_id)
                              ? "In Compare"
                              : "Compare"}
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.inStock}
                            className={`flex-1 font-semibold py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                              isInCart(item.product_id)
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                            }`}
                          >
                            <ShoppingBag className={`w-4 h-4 mr-2 ${isInCart(item.product_id) ? 'text-white' : ''}`} />
                            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List view
                    <div className="flex gap-6 p-6">
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
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              OUT OF STOCK
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm text-red-600 font-bold uppercase tracking-wider">
                            {item.brand}
                          </p>
                          <h3 className="font-bold text-gray-900 text-xl leading-tight">
                            {item.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(item.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({item.reviews?.length || item.reviewsCount || 0} reviews)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Available colors:
                          </span>
                          <div className="flex gap-1">
                            {item.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-5 h-5 rounded-full border border-gray-200"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
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
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              className="w-10 h-10 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleAddToCompare(item)}
                              className={`w-10 h-10 rounded-full ${
                                isInCompare(item.product_id)
                                  ? "bg-blue-50 border-blue-200 text-blue-600"
                                  : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                              }`}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleAddToCart(item)}
                              disabled={!item.inStock}
                                className={`font-semibold px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isInCart(item.product_id)
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                                }`}
                            >
                                <ShoppingBag className={`w-4 h-4 mr-2 ${isInCart(item.product_id) ? 'text-white' : ''}`} />
                              {item.inStock ? "Add to Cart" : "Out of Stock"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
