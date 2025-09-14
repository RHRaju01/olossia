import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Radio, Users, Eye, Clock } from "lucide-react";

export const LiveSection = React.memo(() => {
  const liveShows = [
    {
      id: 1,
      brand: "ZARA",
      title: "Spring Collection Launch",
      host: "Maria Rodriguez",
      viewers: 12500,
      duration: "45 min",
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600",
      category: "Women's Fashion",
      discount: "30% OFF Live Exclusive"
    },
    {
      id: 2,
      brand: "NIKE",
      title: "New Sneaker Drop",
      host: "Alex Chen",
      viewers: 8900,
      duration: "30 min",
      image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=600",
      category: "Athletic Wear",
      discount: "Limited Edition"
    },
    {
      id: 3,
      brand: "H&M",
      title: "Sustainable Fashion Show",
      host: "Emma Thompson",
      viewers: 6700,
      duration: "60 min",
      image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600",
      category: "Eco-Friendly",
      discount: "Buy 2 Get 1 Free"
    },
    {
      id: 4,
      brand: "GUCCI",
      title: "Luxury Accessories Preview",
      host: "Isabella Rossi",
      viewers: 15200,
      duration: "25 min",
      image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600",
      category: "Luxury",
      discount: "VIP Early Access"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <Radio className="w-8 h-8 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white">
              Live <span className="text-yellow-300">Shows</span>
            </h2>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Join exclusive live shopping events with your favorite brands and get special deals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {liveShows.map((show) => (
            <Card
              key={show.id}
              className="group cursor-pointer border-0 bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-2xl overflow-hidden hover:scale-105 hover:shadow-2xl"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={show.image}
                    alt={show.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Live indicator */}
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </div>
                  </div>

                  {/* Viewers count */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                      <Eye className="w-3 h-3" />
                      {show.viewers.toLocaleString()}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3">
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      {show.duration}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-bold text-purple-600 uppercase tracking-wider">{show.brand}</p>
                    <h3 className="font-bold text-gray-900 leading-tight">{show.title}</h3>
                    <p className="text-sm text-gray-600">with {show.host}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      {show.category}
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-2 rounded-lg">
                    <p className="text-xs font-bold text-orange-700 text-center">
                      {show.discount}
                    </p>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl">
                    Join Live Show
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-full px-8 py-3 font-semibold"
          >
            View All Live Shows
          </Button>
        </div>
      </div>
    </section>
  );
});

LiveSection.displayName = 'LiveSection';