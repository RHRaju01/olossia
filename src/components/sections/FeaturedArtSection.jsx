import React from "react";
import { Button } from "../ui/button";

export const FeaturedArtSection = () => {
  const categories = [
    {
      id: 1,
      title: "Beauty & Wellness",
      subtitle: "Skincare & Makeup",
      image:
        "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=300",
      gradient: "from-pink-500/80 to-rose-500/80",
      count: "2.1K+",
    },
    {
      id: 2,
      title: "Luxury Watches",
      subtitle: "Timepieces & Jewelry",
      image:
        "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=300",
      gradient: "from-yellow-500/80 to-amber-500/80",
      count: "850+",
    },
    {
      id: 3,
      title: "Intimate Apparel",
      subtitle: "Lingerie & Sleepwear",
      image:
        "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300",
      gradient: "from-purple-500/80 to-pink-500/80",
      count: "1.3K+",
    },
    {
      id: 4,
      title: "Arts & Crafts",
      subtitle: "Creative & Handmade",
      image:
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300",
      gradient: "from-emerald-500/80 to-teal-500/80",
      count: "950+",
    },
    {
      id: 5,
      title: "Premium Accessories",
      subtitle: "Bags, Belts & More",
      image:
        "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=300",
      gradient: "from-indigo-500/80 to-blue-500/80",
      count: "1.8K+",
    },
    {
      id: 6,
      title: "Home Fashion",
      subtitle: "Loungewear & Comfort",
      image:
        "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=300",
      gradient: "from-orange-500/80 to-red-500/80",
      count: "720+",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
            Specialty{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Collections
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our curated specialty categories designed for every aspect
            of your lifestyle
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className="group flex flex-col items-center p-0 h-auto bg-transparent hover:bg-transparent"
            >
              <div className="relative overflow-hidden rounded-3xl mb-4 w-full aspect-square">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.gradient} group-hover:opacity-90 transition-opacity duration-300`}
                />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-black text-sm leading-tight mb-1">
                      {category.title}
                    </h3>
                    <p className="text-xs opacity-90 mb-2">
                      {category.subtitle}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                        {category.count} items
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};
