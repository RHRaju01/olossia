import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Heart, ShoppingBag, X, Star } from "lucide-react";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";

export const WishlistDropdown = ({ isOpen, onClose }) => {
  const { items: wishlistItems, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleRemoveFromWishlist = async (itemId) => {
    await removeItem(itemId);
  };

  const handleAddToCart = async (item) => {
    if (!item.inStock) return;
    
    const product = {
      id: item.product_id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image
    };
    
    const result = await addToCart(product);
    if (result.success) {
      // Optionally remove from wishlist after adding to cart
      // await removeItem(item.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-full right-0 mt-2 w-96 z-[55]"
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="font-bold text-gray-900 text-lg">Wishlist</h3>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                {wishlistItems.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Wishlist Items */}
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {wishlistItems.length > 0 ? (
              wishlistItems.map((item) => (
              <div key={item.id} className="p-6 border-b border-gray-50 last:border-b-0">
                <div className="flex gap-4">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    {item.originalPrice && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        SALE
                      </div>
                    )}
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xs font-bold">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs text-red-600 font-bold uppercase">{item.brand}</p>
                      <h4 className="font-semibold text-gray-900 leading-tight">{item.name}</h4>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({item.reviews})</span>
                    </div>

                    {/* Colors */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Colors:</span>
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
                        <span className="font-bold text-gray-900">${item.price}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="w-8 h-8 rounded-full border-gray-200 hover:border-red-300 hover:bg-red-50"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAddToCart(item)}
                          className="w-8 h-8 rounded-full border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                          disabled={!item.inStock}
                        >
                          <ShoppingBag className="w-3 h-3 text-purple-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Save items you love by clicking the heart icon on any product!
                </p>
                <Button 
                  onClick={onClose}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-xl"
                >
                  Discover Products
                </Button>
              </div>
            )}
          </div>

          {/* Footer - only show when wishlist has items */}
          {wishlistItems.length > 0 && (
            <div className="p-6 bg-gray-50 space-y-3">
              <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl">
                View Full Wishlist
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Items in your wishlist are saved for 30 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};