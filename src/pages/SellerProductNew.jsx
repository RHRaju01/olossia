import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { productAPI } from "../services/api/rest/productAPI";
import { useNavigateWithScroll } from "../utils/navigation";

const initial = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  price: "",
  compare_price: "",
  cost_price: "",
  sku: "",
  brand_id: "",
  category_id: "",
  stock_quantity: "",
  weight: "",
  dim_length: "",
  dim_width: "",
  dim_height: "",
  images: "", // comma-separated URLs
  specifications: "", // JSON or key:value lines
  tags: "",
  is_featured: false,
  is_digital: false,
  status: "draft",
  seo_title: "",
  seo_description: "",
};

export const SellerProductNew = () => {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigateWithScroll();

  const validate = () => {
    if (!form.name.trim()) return "Product name is required";
    if (!form.price || isNaN(Number(form.price)))
      return "Valid price is required";
    // optional numeric validations
    if (form.compare_price && isNaN(Number(form.compare_price)))
      return "Compare price must be a number";
    if (form.cost_price && isNaN(Number(form.cost_price)))
      return "Cost price must be a number";
    if (form.stock_quantity && isNaN(Number(form.stock_quantity)))
      return "Stock quantity must be an integer";
    if (form.weight && isNaN(Number(form.weight)))
      return "Weight must be a number";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      // Build payload matching DB schema
      const dimensions = {
        length: form.dim_length ? Number(form.dim_length) : undefined,
        width: form.dim_width ? Number(form.dim_width) : undefined,
        height: form.dim_height ? Number(form.dim_height) : undefined,
      };

      // try parsing specifications as JSON, fallback to key:value lines
      let specifications = {};
      if (form.specifications) {
        try {
          specifications = JSON.parse(form.specifications);
        } catch (e) {
          form.specifications.split("\n").forEach((line) => {
            const [k, ...rest] = line.split(":");
            if (!k) return;
            specifications[k.trim()] = rest.join(":").trim();
          });
        }
      }

      const payload = {
        name: form.name,
        slug:
          form.slug ||
          form.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        short_description: form.short_description || null,
        description: form.description || null,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        cost_price: form.cost_price ? Number(form.cost_price) : null,
        sku: form.sku || null,
        brand_id: form.brand_id || null,
        category_id: form.category_id || null,
        stock_quantity: form.stock_quantity
          ? parseInt(form.stock_quantity, 10)
          : 0,
        weight: form.weight ? Number(form.weight) : null,
        dimensions: Object.keys(dimensions).length ? dimensions : null,
        images: form.images
          ? form.images
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        specifications: Object.keys(specifications).length
          ? specifications
          : null,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        is_featured: !!form.is_featured,
        is_digital: !!form.is_digital,
        status: form.status,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
      };

      const resp = await productAPI.createProduct(payload);
      if (resp && resp.success) {
        setSuccess("Product created successfully");
        setForm(initial);
        // navigate to seller products list or dashboard
        navigate("/seller/products");
      } else {
        setError(resp?.message || "Failed to create product");
      }
    } catch (err) {
      setError(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Add Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Product name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
              <Input
                placeholder="Slug (optional)"
                value={form.slug}
                onChange={(e) =>
                  setForm((p) => ({ ...p, slug: e.target.value }))
                }
              />
              <Input
                placeholder="Short description"
                value={form.short_description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, short_description: e.target.value }))
                }
              />
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={6}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: e.target.value }))
                  }
                />
                <Input
                  placeholder="Compare price"
                  value={form.compare_price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, compare_price: e.target.value }))
                  }
                />
                <Input
                  placeholder="Cost price"
                  value={form.cost_price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cost_price: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="SKU"
                  value={form.sku}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sku: e.target.value }))
                  }
                />
                <Input
                  placeholder="Stock quantity"
                  value={form.stock_quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stock_quantity: e.target.value }))
                  }
                />
                <Input
                  placeholder="Weight"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, weight: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Brand ID"
                  value={form.brand_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, brand_id: e.target.value }))
                  }
                />
                <Input
                  placeholder="Category ID"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category_id: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Length"
                    value={form.dim_length}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, dim_length: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Width"
                    value={form.dim_width}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, dim_width: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Height"
                    value={form.dim_height}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, dim_height: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tags: e.target.value }))
                  }
                />
              </div>
              <Input
                placeholder="Image URLs (comma separated)"
                value={form.images}
                onChange={(e) =>
                  setForm((p) => ({ ...p, images: e.target.value }))
                }
              />
              <Textarea
                placeholder="Specifications (JSON or key:value per line)"
                value={form.specifications}
                onChange={(e) =>
                  setForm((p) => ({ ...p, specifications: e.target.value }))
                }
                rows={4}
              />
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, is_featured: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_digital}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, is_digital: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Digital</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="SEO Title"
                  value={form.seo_title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, seo_title: e.target.value }))
                  }
                />
                <Input
                  placeholder="SEO Description"
                  value={form.seo_description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, seo_description: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                  className="rounded-md border px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <div className="flex-1 text-right">
                  <Button
                    type="submit"
                    className="rounded-xl"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Create Product"}
                  </Button>
                </div>
              </div>
              {error && <div className="text-red-600">{error}</div>}
              {success && <div className="text-green-600">{success}</div>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerProductNew;
