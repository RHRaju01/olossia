import React, { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  X,
  Heart,
  ShoppingBag,
  Star,
  Plus,
  Minus,
  Check,
  ArrowRight,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addLocalItem } from "../../store/cartSlice";
import { useWishlist } from "../../contexts/WishlistContext";
import { useAddItemMutation } from "../../services/api";
import { formatPrice, formatRating } from "../../utils/formatNumbers";

export const ProductDetailsOverlay = ({
  product,
  isOpen,
  onClose,
  onViewFullDetails,
}) => {
  const [addItemTrigger] = useAddItemMutation();
  const dispatch = useDispatch();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Mock product data structure for overlay
  const overlayProduct = product
    ? {
        ...product,
        images: product.images || [product.image],
        colors: product.colors?.map((color, index) => ({
          name: ["Black", "Navy", "Burgundy"][index] || `Color ${index + 1}`,
          value: color,
        })) || [{ name: "Default", value: "#000000" }],
        sizes: ["XS", "S", "M", "L", "XL"],
        description:
          "Premium quality fashion piece crafted with attention to detail. Perfect for both casual and formal occasions.",
        features: [
          "Premium materials",
          "Comfortable fit",
          "Easy care",
          "Versatile styling",
        ],
      }
    : null;

  const handleAddToCart = useCallback(async () => {
    if (!overlayProduct) return;
    const cartItem = {
      ...overlayProduct,
      quantity,
      size: selectedSize,
      color: overlayProduct.colors[selectedColor].name,
      image: overlayProduct.images[0],
    };

    try {
      await addItemTrigger({
        product_id: overlayProduct.id,
        quantity,
      }).unwrap();
    } catch (e) {
      // fallback to local redux guest cart
      dispatch(
        addLocalItem({
          id: `local-${Date.now()}`,
          product_id: overlayProduct.id,
          variant_id: null,
          quantity,
          name: overlayProduct.name,
          price: overlayProduct.price,
          image: overlayProduct.images[0],
          size: selectedSize,
          color: overlayProduct.colors[selectedColor]?.name,
        })
      );
    }
  }, [addItemTrigger, overlayProduct, quantity, selectedSize, selectedColor]);

  const handleAddToWishlist = useCallback(async () => {
    if (!overlayProduct) return;
    try {
      await addToWishlist({ product_id: overlayProduct.id });
    } catch (e) {
      // noop - wishlist failures are non-blocking for the overlay
    }
  }, [addToWishlist, overlayProduct]);
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-6xl w-full mx-auto">
        <Card>
          <CardContent>
            <div className="flex items-start justify-between gap-4 p-6">
              <div>
                <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">
                  {overlayProduct.brand}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {overlayProduct.name}
                </h2>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Product Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={overlayProduct.images[selectedImage]}
                    alt={overlayProduct.name}
                    className="w-full h-96 object-cover"
                    loading="lazy"
                  />
                  {overlayProduct.originalPrice && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      SALE
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {overlayProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {overlayProduct.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? "border-purple-500 shadow-lg"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${overlayProduct.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Rating */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(Number(overlayProduct.rating) || 4.5)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {formatRating(overlayProduct.rating)} (
                    {overlayProduct.reviews || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-black text-gray-900">
                    ${formatPrice(overlayProduct.price)}
                  </span>
                  {overlayProduct.originalPrice && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ${formatPrice(overlayProduct.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                        Save $
                        {formatPrice(
                          (Number(overlayProduct.originalPrice) || 0) -
                            (Number(overlayProduct.price) || 0)
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    {overlayProduct.description}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">
                    Key Features:
                  </h4>
                  <ul className="space-y-2">
                    {overlayProduct.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Color:{" "}
                    <span className="font-normal">
                      {overlayProduct.colors[selectedColor].name}
                    </span>
                  </h3>
                  <div className="flex gap-2">
                    {overlayProduct.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(index)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
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
                  <div className="flex gap-2">
                    {overlayProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 rounded-lg border-2 font-semibold transition-all ${
                          selectedSize === size
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
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
                        className="w-10 h-10 rounded-xl hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-10 text-center font-bold">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-xl hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-gray-600">
                      Total:{" "}
                      <span className="font-bold text-gray-900">
                        $
                        {formatPrice(
                          Number(overlayProduct.price || 0) * quantity
                        )}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add to Cart - $
                    {formatPrice(
                      (Number(overlayProduct.price) || 0) * quantity
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleAddToWishlist}
                      className="py-2 rounded-xl font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        onViewFullDetails(overlayProduct.id);
                        onClose();
                      }}
                      className="py-2 rounded-xl font-semibold bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      Full Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
