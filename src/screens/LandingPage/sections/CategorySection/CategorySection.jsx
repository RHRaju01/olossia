import React from "react";
import { Button } from "../../../../components/ui/button";
import { useNavigateWithScroll } from "../../../../utils/navigation";

export const CategorySection = () => {
  const navigate = useNavigateWithScroll();

  const categories = [
    {
      id: "women",
      label: "Women",
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: "2.5K+ items",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      id: "men",
      label: "Men",
      image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: "1.8K+ items",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      id: "kids",
      label: "Kids",
      image: "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: "900+ items",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      id: "beauty",
      label: "Beauty",
      image: "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: "1.2K+ items",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "shoes",
      label: "Shoes",
      image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: "800+ items",
      gradient: "from-gray-700 to-gray-900"
    },
    {
      id: "bags",
      label: "Bags",
      image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: "600+ items",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      id: "jewelry",
      label: "Jewelry",
      image: "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: "450+ items",
      gradient: "from-amber-500 to-yellow-500"
    },
    {
      id: "home",
      label: "Home & Living",
      image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: "750+ items",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Category</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our carefully curated collections from the world's most beloved fashion and lifestyle brands
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => handleCategoryClick(category.id)}
              className="group flex flex-col items-center p-0 h-auto bg-transparent hover:bg-transparent"
            >
              <div className="relative overflow-hidden rounded-3xl mb-4 w-full aspect-square">
                <img
                  src={category.image}
                  alt={category.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
                
                {/* Category info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3">
                    <p className="font-bold text-sm">{category.label}</p>
                    <p className="text-xs opacity-90">{category.count}</p>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/categories')}
            className="rounded-full px-8 py-3 border-2 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300"
          >
            Explore All Categories
          </Button>
        </div>
      </div>
    </section>
  );
};