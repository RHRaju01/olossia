import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  Heart,
  ShoppingBag,
  Star,
  Eye,
  Filter,
  Grid,
  List,
  BarChart3,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCompare } from "../contexts/CompareContext";
import { useNavigateWithScroll } from "../utils/navigation";
import { ProductDetailsOverlay } from "../components/commerce/ProductDetailsOverlay";

export const TrendingPage = () => {
  const { addItem: addToCart, isInCart } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigateWithScroll();

  const [viewMode, setViewMode] = useState("grid");
  const [timeFilter, setTimeFilter] = useState("week");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Mock trending products data
  const trendingProducts = [
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
      trendingScore: 127,
      category: "women",
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
      trendingScore: 89,
      category: "women",
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
      trendingScore: 156,
      category: "unisex",
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
      trendingScore: 203,
      category: "women",
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
      trendingScore: 78,
      category: "unisex",
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
      trendingScore: 234,
      category: "accessories",
    },
    {
      id: "athletic-sneakers",
      name: "Athletic Sneakers",
      brand: "NIKE",
      price: 129,
      rating: 4.8,
      reviews: 445,
      image:
        "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=500",
      colors: ["#FFFFFF", "#000000", "#FF6B9D"],
      trending: "+312% this week",
      trendingScore: 312,
      category: "shoes",
    },
    {
      id: "minimalist-watch",
      name: "Minimalist Watch",
      brand: "DANIEL WELLINGTON",
      price: 199,
      originalPrice: 249,
      rating: 4.7,
      reviews: 178,
      image:
        "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=500",
      colors: ["#C0C0C0", "#FFD700", "#8B4513"],
      trending: "+95% this week",
      trendingScore: 95,
      category: "accessories",
    },
  ];

  const handleAddToWishlist = async (product) => {
    await addToWishlist(product);
  };

  const handleAddToCompare = async (product) => {
    await addToCompare(product);
  };

  const handleAddToCart = async (product) => {
    await addToCart(product);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // Sort products by trending score
  const sortedProducts = [...trendingProducts].sort(
    (a, b) => b.trendingScore - a.trendingScore
  );

  const getTrendingColor = (score) => {
    if (score >= 200) return "text-red-500";
    if (score >= 100) return "text-orange-500";
    return "text-green-500";
  };

  const getTrendingBadgeColor = (score) => {
    if (score >= 200) return "from-red-500 to-pink-500";
    if (score >= 100) return "from-orange-500 to-red-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
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
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <h1 className="text-4xl font-black text-gray-900">
                  Trending{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                    Now
                  </span>
                </h1>
              </div>
              <p className="text-xl text-gray-600">
                Most loved items this {timeFilter} by our community
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Time filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

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
          </div>
        </div>

        {/* Trending Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">+156%</p>
              <p className="text-sm opacity-90">Average Growth</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-6 text-center">
              <Eye className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">2.4M</p>
              <p className="text-sm opacity-90">Total Views</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">45K</p>
              <p className="text-sm opacity-90">Added to Wishlist</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-6 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">12K</p>
              <p className="text-sm opacity-90">Items Sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "space-y-6"
          }
        >
          {sortedProducts.map((product, index) => (
            <Card
              key={product.id}
              className={`group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden ${
                viewMode === "grid" ? "rounded-2xl" : "rounded-xl"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                {viewMode === "grid" ? (
                  // Grid view
                  <>
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Trending rank */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-lg">
                          #{index + 1}
                        </div>
                      </div>

                      {/* Trending indicator */}
                      <div className="absolute top-4 right-4">
                        <div
                          className={`bg-gradient-to-r ${getTrendingBadgeColor(
                            product.trendingScore
                          )} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {product.trending}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                        <Button
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWishlist(product);
                          }}
                          className={`w-10 h-10 rounded-full bg-white/90 lg:hover:bg-white shadow-lg border-0 ${
                            isInWishlist(product.id)
                              ? "text-red-500 bg-red-50 lg:hover:bg-red-100"
                              : "text-gray-700 lg:hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isInWishlist(product.id) ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickView(product);
                          }}
                          className="w-10 h-10 rounded-full bg-white/90 lg:hover:bg-white shadow-lg border-0 text-gray-700 lg:hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCompare(product);
                          }}
                          className={`w-10 h-10 rounded-full bg-white/90 lg:hover:bg-white shadow-lg border-0 ${
                            isInCompare(product.id)
                              ? "text-blue-500 bg-blue-50 lg:hover:bg-blue-100"
                              : "text-gray-700 lg:hover:text-blue-500"
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className={`w-10 h-10 rounded-full shadow-lg border-0 transition-all duration-300 ${
                            isInCart(product.id)
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white lg:hover:from-green-600 lg:hover:to-emerald-600"
                              : "bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-green-600"
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div
                      className="p-6 space-y-4 cursor-pointer"
                      onClick={() => handleViewProduct(product.id)}
                    >
                      <div>
                        <p className="text-sm text-green-600 font-bold uppercase tracking-wider">
                          {product.brand}
                        </p>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight mt-1">
                          {product.name}
                        </h3>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      {/* Trending info */}
                      <div className="bg-green-50 p-3 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-green-700">
                            Trending Score
                          </span>
                          <span
                            className={`text-lg font-bold ${getTrendingColor(
                              product.trendingScore
                            )}`}
                          >
                            +{product.trendingScore}%
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Growth this week
                        </p>
                      </div>

                      {/* Colors */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-medium">
                          Colors:
                        </span>
                        <div className="flex gap-1">
                          {product.colors.map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className="w-5 h-5 rounded-full border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition-colors"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-gray-900">
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // List view
                  <div className="flex gap-6 p-6">
                    <div className="relative flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-32 h-32 object-cover rounded-xl"
                      />
                      <div className="absolute -top-2 -left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-bold text-gray-900 shadow-lg">
                        #{index + 1}
                      </div>
                      <div
                        className={`absolute -top-2 -right-2 bg-gradient-to-r ${getTrendingBadgeColor(
                          product.trendingScore
                        )} text-white px-2 py-1 rounded-full text-xs font-bold`}
                      >
                        +{product.trendingScore}%
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm text-green-600 font-bold uppercase tracking-wider">
                          {product.brand}
                        </p>
                        <h3 className="font-bold text-gray-900 text-xl leading-tight">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.reviews} reviews)
                        </span>
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                          {product.trending}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Available colors:
                        </span>
                        <div className="flex gap-1">
                          {product.colors.map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className="w-5 h-5 rounded-full border border-gray-200"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-900">
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddToWishlist(product)}
                            className={`w-10 h-10 rounded-full ${
                              isInWishlist(product.id)
                                ? "text-red-500 border-red-200 bg-red-50"
                                : "hover:text-red-500 hover:border-red-200"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isInWishlist(product.id) ? "fill-current" : ""
                              }`}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewProduct(product.id)}
                            className="w-10 h-10 rounded-full hover:text-blue-600 hover:border-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddToCompare(product)}
                            className={`w-10 h-10 rounded-full ${
                              isInCompare(product.id)
                                ? "text-blue-500 border-blue-200 bg-blue-50"
                                : "hover:text-blue-500 hover:border-blue-200"
                            }`}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className={`font-semibold px-6 py-2 rounded-xl ${
                              isInCart(product.id)
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            }`}
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            {isInCart(product.id)
                              ? "Added to Cart"
                              : "Add to Cart"}
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
      </div>

      <ProductDetailsOverlay
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
        onViewFullDetails={handleViewProduct}
      />
    </div>
  );
};
