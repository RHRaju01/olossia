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
  BarChart3,
  X,
  Star,
  ShoppingBag,
  Heart,
  Check,
  Minus,
  Eye,
} from "lucide-react";
import { useCompare } from "../contexts/CompareContext";
import { useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import { useGetCartQuery } from "../services/api";
import { useDispatch } from "react-redux";
import { addLocalItem } from "../store/cartSlice";
import { useAddItemMutation } from "../services/api";
import { useWishlist } from "../contexts/WishlistContext";
import { useNavigateWithScroll } from "../utils/navigation";

export const ComparePage = () => {
  const { items: compareItems, removeItem, clearCompare } = useCompare();
  const localItems = useSelector((s) => s.cart?.localItems || []);
  const { isAuthenticated } = useAuth();
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const serverItems = cartResponse?.data?.items || [];
  const sourceItems = isAuthenticated ? serverItems : localItems;

  const isInCart = (productId) =>
    sourceItems.some((item) => item.product_id === productId);
  const dispatch = useDispatch();
  const [addItemTrigger] = useAddItemMutation();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigateWithScroll();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemoveFromCompare = async (itemId) => {
    await removeItem(itemId);
  };

  const handleClearCompare = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all products from comparison?"
      )
    ) {
      await clearCompare();
    }
  };

  const handleAddToCart = async (item) => {
    const product = {
      id: item.product_id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
    };

    try {
      await addItemTrigger({ product_id: product.id, quantity: 1 }).unwrap();
    } catch (e) {
      dispatch(
        addLocalItem({
          id: `local-${Date.now()}`,
          product_id: product.id,
          variant_id: null,
          quantity: 1,
          name: product.name,
          price: product.price,
          image: product.image,
        })
      );
    }
  };

  const handleAddToWishlist = async (item) => {
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

    await addToWishlist(product);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Comparison attributes
  const comparisonAttributes = [
    { key: "price", label: "Price", type: "price" },
    { key: "rating", label: "Customer Rating", type: "rating" },
    { key: "reviews", label: "Total Reviews", type: "number" },
    { key: "colors", label: "Available Colors", type: "colors" },
    { key: "features", label: "Key Features", type: "features" },
    { key: "specifications", label: "Specifications", type: "specifications" },
  ];

  const renderAttributeValue = (item, attribute) => {
    switch (attribute.type) {
      case "price":
        return (
          <div className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${item.price}
              </span>
              {item.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ${item.originalPrice}
                </span>
              )}
            </div>
            {item.originalPrice && (
              <span className="text-sm font-bold text-green-600">
                Save ${item.originalPrice - item.price}
              </span>
            )}
          </div>
        );
      case "rating":
        return (
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-1">
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
            <p className="text-sm text-gray-600 font-semibold">
              {item.rating} out of 5
            </p>
          </div>
        );
      case "number":
        return (
          <div className="text-center">
            <span className="text-xl font-bold text-gray-900">
              {item[attribute.key].toLocaleString()}
            </span>
            <p className="text-sm text-gray-600">reviews</p>
          </div>
        );
      case "colors":
        return (
          <div className="space-y-2">
            <div className="flex gap-1 flex-wrap justify-center">
              {item.colors.slice(0, 6).map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: color }}
                  title={`Color ${index + 1}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              {item.colors.length} color{item.colors.length !== 1 ? "s" : ""}{" "}
              available
              {item.colors.length > 6 && ` (+${item.colors.length - 6} more)`}
            </p>
          </div>
        );
      case "features":
        return (
          <ul className="space-y-1">
            {item.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
            {item.features.length > 4 && (
              <li className="text-sm text-gray-500 ml-5">
                +{item.features.length - 4} more features
              </li>
            )}
          </ul>
        );
      case "specifications":
        return (
          <div className="space-y-2">
            {Object.entries(item.specifications)
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600 ml-1">{value}</span>
                </div>
              ))}
            {Object.keys(item.specifications).length > 3 && (
              <p className="text-sm text-gray-500">
                +{Object.keys(item.specifications).length - 3} more specs
              </p>
            )}
          </div>
        );
      default:
        return <span className="text-gray-700">{item[attribute.key]}</span>;
    }
  };

  // Redirect if no items to compare
  React.useEffect(() => {
    if (compareItems.length === 0) {
      navigate("/");
    }
  }, [compareItems.length, navigate]);

  if (compareItems.length === 0) {
    return null; // Will redirect via useEffect
  }

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
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Product Comparison
              </h1>
              <p className="text-gray-600 mt-1">
                Comparing {compareItems.length} product
                {compareItems.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleClearCompare}
            className="rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            Clear All
          </Button>
        </div>

        {/* Comparison Table */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Product Headers */}
            <div
              className={`grid grid-cols-1 gap-0 border-b border-gray-100 ${
                compareItems.length === 1
                  ? "lg:grid-cols-2"
                  : compareItems.length === 2
                  ? "lg:grid-cols-3"
                  : compareItems.length === 3
                  ? "lg:grid-cols-4"
                  : "lg:grid-cols-5"
              }`}
            >
              <div className="lg:col-span-1 p-6 bg-gray-50 border-r border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">Products</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Comparing {compareItems.length} item
                  {compareItems.length !== 1 ? "s" : ""}
                </p>
              </div>

              {compareItems.map((item) => (
                <div
                  key={item.id}
                  className="p-6 text-center border-r border-gray-100 last:border-r-0"
                >
                  <div className="relative mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl mx-auto"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveFromCompare(item.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-lg hover:bg-red-50 hover:border-red-200"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-blue-600 font-bold uppercase">
                      {item.brand}
                    </p>
                    <h4 className="font-semibold text-gray-900 leading-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAddToWishlist(item)}
                        className={`w-8 h-8 rounded-full ${
                          isInWishlist(item.product_id)
                            ? "text-red-500 border-red-200 bg-red-50"
                            : "hover:text-red-500 hover:border-red-200"
                        }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${
                            isInWishlist(item.product_id) ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewProduct(item.product_id)}
                        className="w-8 h-8 rounded-full hover:text-blue-600 hover:border-blue-200"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-4 py-1 rounded-lg text-sm"
                      >
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Attributes */}
            <div className="divide-y divide-gray-100">
              {comparisonAttributes.map((attribute) => (
                <div
                  key={attribute.key}
                  className={`grid grid-cols-1 gap-0 ${
                    compareItems.length === 1
                      ? "lg:grid-cols-2"
                      : compareItems.length === 2
                      ? "lg:grid-cols-3"
                      : compareItems.length === 3
                      ? "lg:grid-cols-4"
                      : "lg:grid-cols-5"
                  }`}
                >
                  <div className="lg:col-span-1 p-6 bg-gray-50 border-r border-gray-100">
                    <h4 className="font-semibold text-gray-900">
                      {attribute.label}
                    </h4>
                  </div>

                  {compareItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 border-r border-gray-100 last:border-r-0"
                    >
                      {renderAttributeValue(item, attribute)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Insights */}
        {compareItems.length >= 2 && (
          <Card className="border-0 shadow-lg rounded-2xl mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Comparison Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Best Value */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">
                  💰 Best Value
                </h4>
                {(() => {
                  const bestValue = compareItems.reduce((best, item) => {
                    const valueScore =
                      (item.rating * item.reviews) / item.price;
                    const bestScore = (best.rating * best.reviews) / best.price;
                    return valueScore > bestScore ? item : best;
                  });
                  return (
                    <p className="text-green-700">
                      <span className="font-bold">{bestValue.name}</span> by{" "}
                      {bestValue.brand} offers the best value for money
                    </p>
                  );
                })()}
              </div>

              {/* Highest Rated */}
              <div className="bg-yellow-50 p-4 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  ⭐ Highest Rated
                </h4>
                {(() => {
                  const highestRated = compareItems.reduce((best, item) =>
                    item.rating > best.rating ? item : best
                  );
                  return (
                    <p className="text-yellow-700">
                      <span className="font-bold">{highestRated.name}</span> has
                      the highest customer rating at {highestRated.rating}/5
                    </p>
                  );
                })()}
              </div>

              {/* Most Popular */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">
                  🔥 Most Popular
                </h4>
                {(() => {
                  const mostPopular = compareItems.reduce((best, item) =>
                    item.reviews > best.reviews ? item : best
                  );
                  return (
                    <p className="text-blue-700">
                      <span className="font-bold">{mostPopular.name}</span> is
                      the most popular with{" "}
                      {mostPopular.reviews.toLocaleString()} reviews
                    </p>
                  );
                })()}
              </div>

              {/* Price Range */}
              <div className="bg-purple-50 p-4 rounded-xl">
                <h4 className="font-semibold text-purple-800 mb-2">
                  💵 Price Range
                </h4>
                {(() => {
                  const prices = compareItems.map((item) => item.price);
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  return (
                    <p className="text-purple-700">
                      Price range:{" "}
                      <span className="font-bold">
                        ${minPrice} - ${maxPrice}
                      </span>
                      {minPrice !== maxPrice && (
                        <span className="ml-2">
                          (
                          {Math.round(((maxPrice - minPrice) / minPrice) * 100)}
                          % difference)
                        </span>
                      )}
                    </p>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {compareItems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No products to compare
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Add products to your comparison list to see detailed side-by-side
              comparisons of features, prices, and specifications.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-8 py-3 rounded-xl"
            >
              Discover Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
