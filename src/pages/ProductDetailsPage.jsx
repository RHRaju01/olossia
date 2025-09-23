import React, { useState } from "react";
import { Button, Card, CardContent, Separator } from "../components/ui";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  Plus,
  Minus,
  Check,
  BarChart3,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useAuthRedux } from "../hooks/useAuthRedux";
import { useGetCartQuery } from "../services/api";
import { useWishlist } from "../contexts/WishlistContext";
import { useCompare } from "../contexts/CompareContext";
import { useParams } from "react-router-dom";
import { useNavigateWithScroll } from "../utils/navigation";
import { useDispatch } from "react-redux";
import { addLocalItem } from "../store/cartSlice";
import { useAddItemMutation } from "../services/api";

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const localItems = useSelector((s) => s.cart?.localItems || []);
  const { isAuthenticated } = useAuthRedux();
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
  const { addItem: addToCompare, isInCompare } = useCompare();
  const navigate = useNavigateWithScroll();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Scroll to top when component mounts or ID changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Mock product data (in real app, fetch by ID)
  const product = {
    id: id || "silk-midi-dress",
    name: "Silk Midi Dress",
    brand: "ZARA",
    price: 129,
    originalPrice: 189,
    discount: 32,
    rating: 4.8,
    reviewsCount: 124,
    inStock: true,
    stockCount: 15,
    images: [
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Navy", value: "#1e3a8a" },
      { name: "Burgundy", value: "#7c2d12" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Elevate your wardrobe with this stunning silk midi dress. Crafted from premium mulberry silk, this dress features a flattering A-line silhouette that gracefully flows to mid-calf length. The subtle sheen of the silk fabric catches light beautifully, making it perfect for both day and evening occasions.",
    features: [
      "100% Premium Mulberry Silk",
      "A-line silhouette for flattering fit",
      "Midi length (hits mid-calf)",
      "Side zip closure",
      "Fully lined",
      "Dry clean only",
    ],
    specifications: {
      Material: "100% Silk",
      Care: "Dry clean only",
      Origin: "Made in Italy",
      Fit: "True to size",
      Model: "5'8\" wearing size S",
    },
    reviews: [
      {
        id: 1,
        name: "Sarah M.",
        rating: 5,
        date: "2 days ago",
        comment:
          "Absolutely gorgeous dress! The silk quality is exceptional and the fit is perfect. I've received so many compliments.",
        verified: true,
      },
      {
        id: 2,
        name: "Emma L.",
        rating: 4,
        date: "1 week ago",
        comment:
          "Beautiful dress, runs slightly large so I'd recommend sizing down. The color is exactly as shown.",
        verified: true,
      },
      {
        id: 3,
        name: "Jessica R.",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "This dress is a showstopper! Perfect for special occasions. The silk drapes beautifully.",
        verified: true,
      },
    ],
  };

  const handleAddToCart = async () => {
    const cartItem = {
      ...product,
      quantity,
      size: selectedSize,
      color: product.colors[selectedColor].name,
      image: product.images[0],
    };

    try {
      await addItemTrigger({ product_id: product.id, quantity }).unwrap();
    } catch (e) {
      dispatch(
        addLocalItem({
          id: `local-${Date.now()}`,
          product_id: product.id,
          variant_id: null,
          quantity,
          name: product.name,
          price: product.price,
          image: product.images[0],
          size: selectedSize,
          color: product.colors[selectedColor].name,
        })
      );
    }
  };

  const handleAddToWishlist = async () => {
    await addToWishlist({
      ...product,
      image: product.images[0],
      colors: product.colors.map((c) => c.value),
    });
  };

  const handleAddToCompare = async () => {
    await addToCompare({
      ...product,
      image: product.images[0],
      colors: product.colors.map((c) => c.value),
    });
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const relatedProducts = [
    {
      id: "silk-blouse",
      name: "Silk Blouse",
      brand: "ZARA",
      price: 89,
      image:
        "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300",
      rating: 4.6,
    },
    {
      id: "midi-skirt",
      name: "Pleated Midi Skirt",
      brand: "H&M",
      price: 59,
      image:
        "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=300",
      rating: 4.4,
    },
    {
      id: "heeled-sandals",
      name: "Strappy Heeled Sandals",
      brand: "MANGO",
      price: 79,
      image:
        "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300",
      rating: 4.7,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <nav className="text-sm text-gray-600">
            <span className="hover:text-purple-600 cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="hover:text-purple-600 cursor-pointer">Women</span>
            <span className="mx-2">/</span>
            <span className="hover:text-purple-600 cursor-pointer">
              Dresses
            </span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-[600px] object-cover"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{product.discount}% OFF
                </div>
              )}
              <Button
                size="icon"
                onClick={() => handleAddToWishlist()}
                className={`absolute top-4 right-4 w-12 h-12 rounded-full shadow-lg ${
                  isInWishlist(product.id)
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-white/90 text-gray-700 hover:bg-white hover:text-red-500"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.id) ? "fill-current" : ""
                  }`}
                />
              </Button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-purple-500 shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <p className="text-sm text-purple-600 font-bold uppercase tracking-wider mb-2">
                {product.brand}
              </p>
              <h1 className="text-3xl font-black text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {product.rating} (
                  {product.reviews?.length || product.reviewsCount || 0}{" "}
                  reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-gray-900">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                      Save ${product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-700">
                  In Stock ({product.stockCount} left)
                </span>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Color:{" "}
                <span className="font-normal">
                  {product.colors[selectedColor].name}
                </span>
              </h3>
              <div className="flex gap-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      selectedColor === index
                        ? "border-purple-500 shadow-lg scale-110"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Size: <span className="font-normal">{selectedSize}</span>
              </h3>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl border-2 font-semibold transition-all ${
                      selectedSize === size
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                className="text-sm text-purple-600 hover:text-purple-700 p-0 h-auto mt-2"
              >
                Size Guide
              </Button>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl hover:bg-gray-200"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  Total:{" "}
                  <span className="font-bold text-gray-900">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className={`py-3 rounded-xl font-semibold ${
                    isInWishlist(product.id)
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      isInWishlist(product.id) ? "fill-current" : ""
                    }`}
                  />
                  {isInWishlist(product.id)
                    ? "Saved for Later"
                    : "Save for Later"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddToCompare}
                  className={`py-3 rounded-xl font-semibold ${
                    isInCompare(product.id)
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {isInCompare(product.id) ? "In Compare" : "Compare"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="py-3 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-semibold text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600">
                    256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="border-0 shadow-lg rounded-2xl mb-16">
          <CardContent className="p-0">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-100">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                  {tab === "reviews" && ` (${product.reviews.length})`}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === "description" && (
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.description}
                  </p>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4">
                      Key Features:
                    </h4>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-3 border-b border-gray-100"
                      >
                        <span className="font-semibold text-gray-900">
                          {key}:
                        </span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    )
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-8">
                  {/* Reviews Summary */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-900 mb-2">
                        {product.rating}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {product.reviews.length} reviews
                      </p>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div
                          key={stars}
                          className="flex items-center gap-3 mb-2"
                        >
                          <span className="text-sm font-medium w-8">
                            {stars}★
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${
                                  (product.reviews.filter(
                                    (r) => r.rating === stars
                                  ).length /
                                    product.reviews.length) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {
                              product.reviews.filter((r) => r.rating === stars)
                                .length
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-purple-600">
                                {review.name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.verified && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed ml-13">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <Card
                key={relatedProduct.id}
                className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden"
                onClick={() => handleViewProduct(relatedProduct.id)}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div>
                      <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">
                        {relatedProduct.brand}
                      </p>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {relatedProduct.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(relatedProduct.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {relatedProduct.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-gray-900">
                        ${relatedProduct.price}
                      </span>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2 rounded-xl">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
