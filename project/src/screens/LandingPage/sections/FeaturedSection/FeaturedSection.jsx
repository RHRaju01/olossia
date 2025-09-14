import React from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Heart, ShoppingBag, Star, Eye, ArrowRight, Check } from "lucide-react";
import { useCart } from "../../../../contexts/CartContext";
import { useWishlist } from "../../../../contexts/WishlistContext";
import { useAuth } from "../../../../contexts/AuthContext";

export const FeaturedSection = () => {
  const { addItem: addToCart, items: cartItems } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist, items: wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();

  const products = [
    {
      id: "silk-midi-dress",
      name: "Silk Midi Dress",
      brand: "ZARA",
      price: 129,
      originalPrice: 189,
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500",
      isNew: true,
      discount: 32,
      rating: 4.8,
      reviews: 124,
      colors: ["#FF6B9D", "#000000", "#FFFFFF"]
    },
    {
      id: "premium-cotton-blazer",
      name: "Premium Cotton Blazer",
      brand: "H&M",
      price: 89,
      image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500",
      isNew: false,
      discount: 0,
      rating: 4.6,
      reviews: 89,
      colors: ["#8B4513", "#000000", "#708090"]
    },
    {
      id: "vintage-denim-jacket",
      name: "Vintage Denim Jacket",
      brand: "LEVI'S",
      price: 159,
      originalPrice: 199,
      image: "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=500",
      isNew: false,
      discount: 20,
      rating: 4.9,
      reviews: 203,
      colors: ["#4169E1", "#000080", "#87CEEB"]
    },
    {
      id: "floral-maxi-dress",
      name: "Floral Maxi Dress",
      brand: "MANGO",
      price: 99,
      image: "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500",
      isNew: true,
      discount: 0,
      rating: 4.7,
      reviews: 156,
      colors: ["#FFB6C1", "#FFC0CB", "#FF69B4"]
    },
    {
      id: "leather-crossbody-bag",
      name: "Leather Crossbody Bag",
      brand: "COACH",
      price: 299,
      originalPrice: 399,
      image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500",
      isNew: false,
      discount: 25,
      rating: 4.9,
      reviews: 67,
      colors: ["#8B4513", "#000000", "#D2691E"]
    },
    {
      id: "minimalist-sneakers",
      name: "Minimalist Sneakers",
      brand: "NIKE",
      price: 119,
      image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=500",
      isNew: true,
      discount: 0,
      rating: 4.8,
      reviews: 234,
      colors: ["#FFFFFF", "#000000", "#FF6B9D"]
    }
  ];

  const handleAddToWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      const wishlistItem = wishlistItems.find(item => item.product_id === product.id);
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
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Editor's <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Picks</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Handpicked favorites from our fashion experts, featuring the season's must-have pieces
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer border-0 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
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
                    <Button size="icon" className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border-0 text-gray-700 hover:text-purple-600">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      onClick={() => handleAddToCart(product)}
                      className={`w-10 h-10 rounded-full shadow-lg transition-all duration-300 ${
                        isInCart(product.id)
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-white/90 hover:bg-white text-gray-700 hover:text-purple-600'
                      }`}
                    >
                      {isInCart(product.id) ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="purple-pink-gradient-featured" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" 
                            fill="url(#purple-pink-gradient-featured)" 
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
                    <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">{product.brand}</p>
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
                    {product.discount > 0 && (
                      <span className="text-sm font-bold text-green-600">Save ${product.originalPrice - product.price}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Discover More Products
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};