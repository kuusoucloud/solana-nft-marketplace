import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollectionCardProps {
  id: string;
  name: string;
  image: string;
  description: string;
  floorPrice: number;
  volume24h: number;
  totalSupply: number;
  creator: string;
  priceChange24h?: number;
  sales24h?: number;
  listedCount?: number;
}

export function CollectionCard({
  id = "default-collection",
  name = "Sample Collection",
  image = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
  description = "A sample NFT collection",
  floorPrice = 0,
  volume24h = 0,
  totalSupply = 0,
  creator = "Unknown Creator",
  priceChange24h = 0,
  sales24h = 0,
  listedCount = 0,
}: CollectionCardProps) {
  const priceChangeColor = priceChange24h >= 0 ? "text-green-500" : "text-red-500";
  const priceChangeIcon = priceChange24h >= 0 ? "↗" : "↘";

  return (
    <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <div className="aspect-square relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            {totalSupply.toLocaleString()} items
          </Badge>
        </div>
        {priceChange24h !== 0 && (
          <div className="absolute top-2 left-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${priceChangeColor} border-current`}
            >
              {priceChangeIcon} {Math.abs(priceChange24h).toFixed(1)}%
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-foreground text-lg truncate">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            by {creator}
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Floor Price</p>
            <p className="font-semibold text-foreground">
              {floorPrice.toFixed(2)} SOL
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">24h Volume</p>
            <p className="font-semibold text-foreground">
              {volume24h.toLocaleString()} SOL
            </p>
          </div>
        </div>

        {(sales24h > 0 || listedCount > 0) && (
          <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">24h Sales</p>
              <p className="font-medium text-foreground">{sales24h}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Listed</p>
              <p className="font-medium text-foreground">{listedCount}</p>
            </div>
          </div>
        )}
        
        <Button 
          className="w-full" 
          onClick={() => window.location.href = `/collection/${id}`}
        >
          View Collection
        </Button>
      </div>
    </div>
  );
}