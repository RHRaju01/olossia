import React from "react";
import { Button } from "../../../../components/ui/button";
import { useNavigateWithScroll } from "../../../../utils/navigation";

export const BrandsSection = () => {
  const navigate = useNavigateWithScroll();

  const handleBrandClick = (brandId) => {
    navigate(`/products?brand=${brandId}`);
  };

  const brands = [
    { 
      name: "ZARA", 
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Contemporary Fashion"
    },
    { 
      name: "H&M", 
      image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Affordable Style"
    },
    { 
      name: "UNIQLO", 
      image: "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Essential Basics"
    },
    { 
      name: "NIKE", 
      image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Athletic Wear"
    },
    { 
      name: "ADIDAS", 
      image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Sports & Lifestyle"
    },
    { 
      name: "PUMA", 
      image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Performance Gear"
    },
    { 
      name: "GUCCI", 
      image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Luxury Fashion"
    },
    { 
      name: "PRADA", 
      image: "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Italian Elegance"
    },
    { 
      name: "VERSACE", 
      image: "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Bold & Glamorous"
    },
    { 
      name: "BALENCIAGA", 
      image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Avant-garde Design"
    },
    { 
      name: "DIOR", 
      image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Timeless Luxury"
    },
    { 
      name: "CHANEL", 
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300",
      description: "Classic Elegance"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Brands</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Shop from the world's most prestigious fashion houses and emerging designers
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-square relative">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Brand overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-black text-gray-900 text-lg">{brand.name}</h3>
                      <p className="text-sm text-gray-600 font-medium">{brand.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/brands')}
            className="rounded-full px-12 py-4 border-2 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300 text-lg font-semibold"
          >
            View All Brands
          </Button>
        </div>
      </div>
    </section>
  );
};