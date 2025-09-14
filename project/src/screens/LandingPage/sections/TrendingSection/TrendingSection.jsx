import React from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Heart, ShoppingBag, Star, TrendingUp, Eye, Check } from "lucide-react";
import { useCart } from "../../../../contexts/CartContext";
import { useWishlist } from "../../../../contexts/WishlistContext";
import { useAuth } from "../../../../contexts/AuthContext";

export const TrendingSection = () => {
  const { addItem: addToCart, items: cartItems } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const products = [
    {
      id: "oversized-blazer",
      name: "Oversized Blazer",
      brand: "ZARA",
      price: 149,
      rating: 4.8,
      reviews: 324,
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500",
      colors: ["#000000", "#8B4513", "#708090"],
      trending: "+127% this week"
    },
    {
      id: "vintage-high-waist-jeans",
      name: "Vintage High-Waist Jeans",
      brand: "LEVI'S",
      price: 89,
      rating: 4.9,
      reviews: 189,
      image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500",
      colors: ["#4169E1", "#000080", "#87CEEB"],
      trending: "+89% this week"
    },
    {
      id: "cashmere-knit-sweater",
      name: "Cashmere Knit Sweater",
      brand: "UNIQLO",
      price: 79,
      rating: 4.7,
      reviews: 256,
      image: "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=500",
      colors: ["#F5F5DC", "#D2B48C", "#A0522D"],
      trending: "+156% this week"
    },
    {
      id: "silk-summer-dress",
      name: "Silk Summer Dress",
      brand: "H&M",
      price: 99,
      rating: 4.6,
      reviews: 203,
      image: "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500",
      colors: ["#FFB6C1", "#FFC0CB", "#FF69B4"],
      trending: "+203% this week"
    },
    {
      id: "premium-leather-jacket",
      name: "Premium Leather Jacket",
      brand: "MANGO",
      price: 299,
      originalPrice: 399,
      rating: 4.9,
      reviews: 167,
      image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=500",
      colors: ["#000000", "#8B4513", "#2F4F4F"],
      trending: "+78% this week"
    },
    {
      id: "designer-silk-scarf",
      name: "Designer Silk Scarf",
      brand: "GUCCI",
      price: 399,
      rating: 5.0,
      reviews: 89,
      image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500",
      colors: ["#FFD700", "#FF6347", "#9370DB"],
      trending: "+234% this week"
    }
  ];

  const handleAddToWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      const wishlistItem = useWishlist().items.find(item => item.product_id === product.id);
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
      }
    } else {
      await addToWishlist(product);
    }
  };

  const handleAddToCart = async (product) => {
    // Check if item already exists in cart
    const existingItem = cartItems.find(item => item.product_id === product.id);
    if (existingItem) {
      // Item already in cart, could show a message or do nothing
      return;
    }
    
    const result = await addToCart(product);
    if (!result.success) {
      alert(result.error);
    }
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.product_id === productId);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900">
                Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">Now</span>
              </h2>
            </div>
            <p className="text-xl text-gray-600">Most loved items this week by our community</p>
          </div>
          <Button 
            variant="outline" 
            className="hidden lg:flex rounded-full px-8 py-3 border-2 hover:bg-green-50 hover:border-green-200 transition-all duration-300"
          >
            View All Trending
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className="group cursor-pointer border-0 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Trending indicator */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {product.trending}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <Button 
                      size="icon" 
                      onClick={() => handleAddToWishlist(product)}
                      className={`w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border-0 ${
                        isInWishlist(product.id) 
                          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                          : 'text-gray-700 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button size="icon" className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border-0 text-gray-700 hover:text-blue-500">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      onClick={() => handleAddToCart(product)}
                      className={`w-10 h-10 rounded-full shadow-lg transition-all duration-300 ${
                        isInCart(product.id)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-white/90 hover:bg-white text-gray-700 hover:text-green-600'
                      }`}
                    >
                      {isInCart(product.id) ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="green-emerald-gradient-trending" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#22c55e" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" 
                            fill="url(#green-emerald-gradient-trending)" 
                            stroke="white" 
                            strokeWidth="1.5"
                          />
                          <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="1.5"/>
                          <path d="m16 10-4 4-4-4" stroke="white" strokeWidth="1.5" fill="none"/>
                        </svg>
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-green-600 font-bold uppercase tracking-wider">{product.brand}</p>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mt-1">{product.name}</h3>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{product.rating} ({product.reviews})</span>
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">Colors:</span>
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
                      <span className="text-2xl font-black text-gray-900">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};