import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Minimal offers sample data - can be replaced by API
const sampleOffers = [
  {
    id: "offer-1",
    title: "Spring Sale - 50% off Dresses",
    description: "Selected dresses up to 50% off. Limited time only.",
    badge: "50%",
    category: "Women",
    brand: "ZARA",
    code: "SPRING50",
    expires: "2025-10-31",
    image: "/frame-16377.svg",
  },
  {
    id: "offer-2",
    title: "Buy 2 Get 1 Free - T-Shirts",
    description: "Add three tees, pay for two. Automatically discounted at checkout.",
    badge: "B2G1",
    category: "Men",
    brand: "Levi's",
    code: "B2G1TS",
    expires: "2025-11-15",
    image: "/frame-16378.svg",
  },
  {
    id: "offer-3",
    title: "Free Shipping over $100",
    description: "Enjoy free standard shipping for orders over $100.",
    badge: "FREE",
    category: "All",
    brand: "OLO",
    code: "FREESHIP",
    expires: "2026-01-01",
    image: "/frame-16395.svg",
  },
];

export const Offers = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return sampleOffers.filter((o) => {
      if (category && category !== "All" && o.category !== category) return false;
      if (brand && brand !== "All" && o.brand !== brand) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          (o.code || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, category, brand]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Offers & Promotions</h2>
            <p className="text-sm text-gray-500">Save on trending products and limited time promotions.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm w-64"
                placeholder="Search offers, codes..."
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <Button onClick={() => navigate('/products')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">Shop Now</Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters */}
          <aside className="w-full md:w-64">
            <Card>
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-3">Filters</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 p-2 border rounded-lg">
                      <option>All</option>
                      <option>Women</option>
                      <option>Men</option>
                      <option>Kids</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Brand</label>
                    <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full mt-1 p-2 border rounded-lg">
                      <option>All</option>
                      <option>ZARA</option>
                      <option>Levi's</option>
                      <option>OLO</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-3">Apply Coupon</h4>
                <div className="flex gap-2">
                  <input placeholder="Coupon code" className="flex-1 p-2 border rounded-lg" />
                  <Button variant="outline">Apply</Button>
                </div>
                <p className="text-xs text-gray-500 mt-3">Coupons stack with site promotions where indicated.</p>
              </CardContent>
            </Card>
          </aside>

          {/* Offers list */}
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((o) => (
                <Card key={o.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <img src={o.image} alt="" className="w-12 h-12 object-contain" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{o.title}</h3>
                            <p className="text-xs text-gray-500">Expires: {o.expires}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-bold">{o.badge}</div>
                          <div className="text-xs text-gray-400 mt-2">Code: <span className="font-mono text-sm">{o.code}</span></div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-4">{o.description}</p>

                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <Button onClick={() => navigate(`/products?brand=${o.brand}`)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">Shop {o.brand}</Button>
                        <Button variant="outline" onClick={() => navigator.clipboard?.writeText(o.code) || null}>Copy Code</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500">No offers match your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Offers;
