/**
 * Marketplace
 * Browse, search, and install workflow templates and plugins
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, Download, Heart, Share2, Search, Filter, TrendingUp } from "lucide-react";

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  rating: number;
  reviews: number;
  downloads: number;
  price: number;
  image?: string;
  featured: boolean;
  verified: boolean;
  tags: string[];
}

export function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [items, setItems] = useState<MarketplaceItem[]>([
    {
      id: "1",
      name: "Email Campaign Automation",
      description: "Automated email campaigns with scheduling and personalization",
      category: "automation",
      author: { name: "John Doe" },
      rating: 4.8,
      reviews: 156,
      downloads: 2340,
      price: 0,
      featured: true,
      verified: true,
      tags: ["email", "automation", "marketing"],
    },
    {
      id: "2",
      name: "Slack Integration Pro",
      description: "Advanced Slack integration with custom workflows",
      category: "integrations",
      author: { name: "Jane Smith" },
      rating: 4.6,
      reviews: 89,
      downloads: 1205,
      price: 29,
      featured: true,
      verified: true,
      tags: ["slack", "integration", "communication"],
    },
    {
      id: "3",
      name: "Data Pipeline Builder",
      description: "Build complex data pipelines with visual editor",
      category: "data",
      author: { name: "Data Team" },
      rating: 4.9,
      reviews: 234,
      downloads: 3456,
      price: 0,
      featured: true,
      verified: true,
      tags: ["data", "pipeline", "etl"],
    },
  ]);

  const categories = [
    { id: "all", name: "All" },
    { id: "automation", name: "Automation" },
    { id: "integrations", name: "Integrations" },
    { id: "data", name: "Data" },
    { id: "communication", name: "Communication" },
    { id: "analytics", name: "Analytics" },
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "trending":
        return b.downloads - a.downloads;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return 0; // TODO: Add createdAt field
      case "price":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-gray-600">Discover and install workflow templates and plugins</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates, plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="trending">Trending</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
            <option value="price">Price</option>
          </select>
        </div>
      </div>

      {/* Featured Section */}
      {sortedItems.filter((item) => item.featured).length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedItems
              .filter((item) => item.featured)
              .map((item) => (
                <MarketplaceCard key={item.id} item={item} />
              ))}
          </div>
        </div>
      )}

      {/* All Items */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {selectedCategory === "all" ? "All Items" : `${selectedCategory} Items`}
        </h2>
        {sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No items found matching your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedItems.map((item) => (
              <MarketplaceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  const [liked, setLiked] = useState(false);

  return (
    <Card className="hover:shadow-lg transition overflow-hidden">
      {item.image && (
        <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              {item.verified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{item.author.name}</p>
          </div>
          <button
            onClick={() => setLiked(!liked)}
            className={`p-2 rounded-full transition ${
              liked ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-600"
            }`}
          >
            <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{item.description}</p>

        {/* Rating and Downloads */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(item.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {item.rating} ({item.reviews})
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Download className="w-4 h-4" />
            {(item.downloads / 1000).toFixed(1)}k
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              +{item.tags.length - 2}
            </span>
          )}
        </div>

        {/* Price and Action */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            {item.price === 0 ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : (
              <span className="text-lg font-bold">${item.price}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button size="sm" className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              Install
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
