import React, { useState, useCallback } from "react";
import { Button, Card, CardContent, Input, SearchBar } from "../components/ui";
import {
  ArrowLeft,
  Filter,
  Grid,
  List,
  Heart,
  ShoppingBag,
  Star,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  BarChart3,
  Search,
} from "lucide-react";
// cart state is provided by CartContext for local/demo flows
import { /* useSelector removed */ } from "react-redux";
import { useAuthRedux } from "../hooks/useAuthRedux";
import {
  useGetCartQuery,
  useAddItemMutation,
  useRemoveItemMutation,
  useGetProductsQuery,
} from "../services/api";
import { useCart } from "../contexts/Cart/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCompare } from "../contexts/CompareContext";
import { useNavigateWithScroll } from "../utils/navigation";
import { ProductDetailsOverlay } from "../components/commerce/ProductDetailsOverlay";
import { ProductActions } from "../components/commerce/ProductActions";
import { formatPrice, formatRating } from "../utils/formatNumbers";

export const ProductsPage = () => {
  const { items: cartItems, addItem: addLocalCartItem, updateItem, removeItem } = useCart();
  const { isAuthenticated } = useAuthRedux();
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const serverItems = cartResponse?.data?.items || [];
  const sourceItems = isAuthenticated ? serverItems : cartItems;

  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useWishlist();
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigateWithScroll();

  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Use server products if available. Keep the previous mock products as a commented fallback.
  const { data: productsResponse, isLoading: productsLoading } =
    useGetProductsQuery();
  // support both shapes: { data: { products: [...] } } or { data: [...] }
  const serverProductsList =
    (productsResponse &&
      productsResponse.data &&
      productsResponse.data.products) ||
    productsResponse?.data ||
    productsResponse ||
    [];

  const products =
    serverProductsList.map((p) => {
      // Prefer explicit brand name fields returned by the API, fall back to nested relations or id
      const brandName =
        p.brand_name ||
        (p.brands && p.brands.name) ||
        (p.brand && p.brand.name) ||
        p.brand_id ||
        "";

      // Derive color swatches from multiple possible shapes:
      //  - p.colors (array of hex strings)
      //  - p.variants (array) -> v.attributes.color
      //  - p._server?.variants (some handlers keep original payload under _server)
      const rawColors = [];
      if (Array.isArray(p.colors) && p.colors.length > 0) {
        rawColors.push(...p.colors);
      }
      // Also support product-level specifications.available_colors
      if (
        p.specifications &&
        Array.isArray(p.specifications.available_colors) &&
        p.specifications.available_colors.length > 0
      ) {
        rawColors.push(...p.specifications.available_colors);
      }
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach((v) => {
          if (v && v.attributes && v.attributes.color)
            rawColors.push(v.attributes.color);
          else if (v && v.attributes && typeof v.attributes === "string") {
            try {
              const parsed = JSON.parse(v.attributes);
              if (parsed.color) rawColors.push(parsed.color);
            } catch (e) {
              // ignore
            }
          }
        });
      }
      if (p._server && Array.isArray(p._server.variants)) {
        p._server.variants.forEach((v) => {
          if (v && v.attributes && v.attributes.color)
            rawColors.push(v.attributes.color);
        });
      }

      // Normalize and dedupe colors, fallback to a single placeholder if empty
      const colors = Array.from(
        new Set(rawColors.map((c) => (c || "").toString()))
      ).filter(Boolean);

      return {
        // Use server id (UUID) as canonical id for matching with cart items
        id: p.id || p.slug,
        slug: p.slug || null,
        name: p.name,
        brand: brandName,
        price: Number(p.price),
        originalPrice: p.compare_price ? Number(p.compare_price) : null,
        image:
          Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
        category: p.category?.slug || p.category_id || "",
        isNew: p.is_featured || false,
        discount: p.compare_price
          ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100)
          : 0,
        rating: p.avg_rating || p.rating || 0,
        reviews: p.review_count || p.reviews_count || 0,
        colors: colors.length > 0 ? colors : [],
        // Keep original server object for advanced flows
        _server: p,
      };
    }) ||
    /*
  // Mock products data (commented fallback) - uncomment if you prefer the static UI
  [
    { id: "silk-midi-dress", name: "Silk Midi Dress", brand: "ZARA", price: 129, originalPrice: 189, image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500", category: "women", isNew: true, discount: 32, rating: 4.8, reviews: 124, colors: ["#FF6B9D", "#000000", "#FFFFFF"] },
    // ... other mocks omitted for brevity
  ]
  */ [];

  const categories = [
    { id: "all", name: "All Products", count: products.length },
    {
      id: "women",
      name: "Women's Fashion",
      count: products.filter((p) => p.category === "women").length,
    },
    {
      id: "men",
      name: "Men's Fashion",
      count: products.filter((p) => p.category === "men").length,
    },
    {
      id: "accessories",
      name: "Accessories",
      count: products.filter((p) => p.category === "accessories").length,
    },
    {
      id: "shoes",
      name: "Shoes",
      count: products.filter((p) => p.category === "shoes").length,
    },
  ];

  const brands = [
    { id: "all", name: "All Brands", count: products.length },
    {
      id: "ZARA",
      name: "ZARA",
      count: products.filter((p) => p.brand === "ZARA").length,
    },
    {
      id: "H&M",
      name: "H&M",
      count: products.filter((p) => p.brand === "H&M").length,
    },
    {
      id: "LEVI'S",
      name: "LEVI'S",
      count: products.filter((p) => p.brand === "LEVI'S").length,
    },
    {
      id: "MANGO",
      name: "MANGO",
      count: products.filter((p) => p.brand === "MANGO").length,
    },
    {
      id: "COACH",
      name: "COACH",
      count: products.filter((p) => p.brand === "COACH").length,
    },
    {
      id: "NIKE",
      name: "NIKE",
      count: products.filter((p) => p.brand === "NIKE").length,
    },
  ];

  const handleAddToWishlist = async (product) => {
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
  };

  const handleAddToCompare = async (product) => {
    await addToCompare(product);
  };
  const [addItemTrigger] = useAddItemMutation();
  const [removeItemTrigger] = useRemoveItemMutation();

  // Determine if product is in cart (match by product_id or slug)
  const isInCart = useCallback(
    (productId) =>
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
        // compare normalized values
        return candidateIds.has(productId) || candidateIds.has(String(productId));
      }),
    [sourceItems]
  );

  // Find cart item id for a product (server-side)
  const findCartItemId = (productId) => {
    const it = sourceItems.find((i) => {
      if (!i) return false;
      if (i.product_id && i.product_id === productId) return true;
      if (i.sku && i.sku === productId) return true;
      if (
        i.product &&
        (i.product.id === productId || i.product.slug === productId)
      )
        return true;
      return false;
    });
    return it ? it.id : null;
  };

  const handleToggleCart = async (product) => {
    // If user is authenticated and item exists on server, remove it; else add
    if (isAuthenticated) {
      const existingId = findCartItemId(product.id);
      if (existingId) {
        try {
          await removeItemTrigger(existingId).unwrap();
        } catch (e) {
          console.warn("remove failed, not removed from UI", e);
        }
        return;
      }

      try {
        await addItemTrigger({ product_id: product.id, quantity: 1 }).unwrap();
      } catch (e) {
        console.warn("add failed, falling back to local", e);
        addLocalCartItem({
          id: `local-${Date.now()}`,
          product_id: product.id,
          variant_id: null,
          quantity: 1,
          name: product.name,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice || null,
          image: product.image,
          rating: product.rating || null,
          reviews: product.reviews || null,
          inStock: product.inStock !== undefined ? product.inStock : true,
          colors: product.colors || [],
        });
      }
    } else {
      // Guest: local cart toggle behavior (match by product_id, id or sku)
      const localExists = cartItems.find((it) => {
        if (!it) return false;
        const ids = [it.product_id, it.id, it.sku];
        if (it.product) ids.push(it.product.id, it.product.slug);
        return ids.some((x) => x === product.id || String(x) === String(product.id));
      });
      if (localExists) {
        const localId = localExists.id;
        removeItem(localId);
      } else {
        addLocalCartItem({
          id: `local-${Date.now()}`,
          product_id: product.id,
          variant_id: null,
          quantity: 1,
          name: product.name,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice || null,
          image: product.image,
          rating: product.rating || null,
          reviews: product.reviews || null,
          inStock: product.inStock !== undefined ? product.inStock : true,
          colors: product.colors || [],
        });
      }
    }
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

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesBrand =
      selectedBrand === "all" || product.brand === selectedBrand;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesRating = product.rating >= minRating;

    return (
      matchesCategory &&
      matchesBrand &&
      matchesSearch &&
      matchesPrice &&
      matchesRating
    );
  });

  // Handle search from URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    const categoryParam = urlParams.get("category");
    const brandParam = urlParams.get("brand");

    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (brandParam) setSelectedBrand(brandParam);
  }, []);

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
              <h1 className="text-3xl font-black text-gray-900">
                All Products
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} products found
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

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden rounded-xl"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:col-span-1 space-y-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h3>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search
                  </label>
                  <SearchBar
                    onSearch={(query) => setSearchQuery(query)}
                    placeholder="Search products..."
                    showButton={false}
                  />
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Categories
                  </label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.name}</span>
                          <span className="text-sm text-gray-500">
                            ({category.count})
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Brands
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedBrand === brand.id
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{brand.name}</span>
                          <span className="text-sm text-gray-500">
                            ({brand.count})
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[4, 3, 2, 1, 0].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          minRating === rating
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span>
                          {rating > 0 ? `${rating}+ Stars` : "All Ratings"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Price Range
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([
                            parseInt(e.target.value),
                            priceRange[1],
                          ])
                        }
                        placeholder="Min"
                        className="rounded-lg"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        placeholder="Max"
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      ${priceRange[0]} - ${priceRange[1]}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedBrand("all");
                    setSearchQuery("");
                    setPriceRange([0, 500]);
                    setMinRating(0);
                    setSortBy("newest");
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }
            >
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden ${
                    viewMode === "grid" ? "rounded-2xl" : "rounded-xl"
                  }`}
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

                          {/* Badges */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {product.isNew && (
                              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                NEW
                              </span>
                            )}
                            {product.discount > 0 && (
                              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                -{product.discount}%
                              </span>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 transform translate-x-0 lg:translate-x-2 lg:group-hover:translate-x-0">
                            <Button
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToWishlist(product);
                              }}
                              className={`w-10 h-10 rounded-full shadow-lg border-0 transition-all duration-300 ${
                                isInWishlist(product.id)
                                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white lg:hover:from-red-600 lg:hover:to-pink-600"
                                  : "bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-red-500"
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
                              className="w-10 h-10 rounded-full bg-white/90 lg:hover:bg-white shadow-lg border-0 text-gray-700 lg:hover:text-blue-500"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCompare(product);
                              }}
                              className={`w-10 h-10 rounded-full shadow-lg border-0 transition-all duration-300 ${
                                isInCompare(product.id)
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white lg:hover:from-blue-600 lg:hover:to-indigo-600"
                                  : "bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-blue-500"
                              }`}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>

                            <Button
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCart(product);
                              }}
                              className={`w-10 h-10 rounded-full shadow-lg border-0 transition-all duration-300 ${
                                isInCart(product.id)
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white lg:hover:from-purple-600 lg:hover:to-pink-600"
                                  : "bg-white/90 lg:hover:bg-white text-gray-700 lg:hover:text-purple-600"
                              }`}
                            >
                              <ShoppingBag className={`w-4 h-4 ${isInCart(product.id) ? 'text-white' : ''}`} />
                            </Button>
                          </div>
                        </div>

                        <div
                          className="p-6 space-y-4 cursor-pointer"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          <div>
                            <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">
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
                              {formatRating(product.rating)} ({product.reviews})
                            </span>
                          </div>

                          {/* Colors */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">
                              Colors:
                            </span>
                            <div className="flex gap-1">
                              {product.colors.map((color, index) => (
                                <div
                                  key={index}
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
                                ${formatPrice(product.price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-lg text-gray-400 line-through">
                                  ${formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            {product.discount > 0 && (
                              <span className="text-sm font-bold text-green-600">
                                Save $
                                {formatPrice(
                                  Number(product.originalPrice || 0) -
                                    Number(product.price || 0)
                                )}
                              </span>
                            )}
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
                          {product.isNew && (
                            <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              NEW
                            </div>
                          )}
                          {product.discount > 0 && (
                            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{product.discount}%
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">
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
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              Available colors:
                            </span>
                            <div className="flex gap-1">
                              {product.colors.map((color, index) => (
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
                                ${product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="text-lg text-gray-400 line-through">
                                  ${product.originalPrice}
                                </span>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToWishlist(product);
                              }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProduct(product.id);
                              }}
                              className="w-10 h-10 rounded-full hover:text-blue-600 hover:border-blue-200"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCompare(product);
                              }}
                              className={`w-10 h-10 rounded-full ${
                                isInCompare(product.id)
                                  ? "text-blue-500 border-blue-200 bg-blue-50"
                                  : "hover:text-blue-500 hover:border-blue-200"
                              }`}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCart(product);
                              }}
                              className={`font-semibold px-6 py-2 rounded-xl ${
                                isInCart(product.id)
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                              }`}
                            >
                              <ShoppingBag className={`w-4 h-4 mr-2 ${isInCart(product.id) ? 'text-white' : ''}`} />
                              {isInCart(product.id)
                                ? "Added to Cart"
                                : "Add to Cart"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-16 h-16 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  No products found
                </h2>
                <p className="text-gray-600 mb-8">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setPriceRange([0, 500]);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          <ProductDetailsOverlay
            product={quickViewProduct}
            isOpen={isQuickViewOpen}
            onClose={handleCloseQuickView}
            onViewFullDetails={handleViewProduct}
          />
        </div>
      </div>
    </div>
  );
};
