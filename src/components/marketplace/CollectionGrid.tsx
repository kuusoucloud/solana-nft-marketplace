"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollectionCard } from "./CollectionCard";
import { ArrowUpDown, Flame, Clock, Filter } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  image: string;
  description: string;
  floorPrice: number;
  volume24h: number;
  totalSupply: number;
  creator: string;
}

interface CollectionGridProps {
  collections: Collection[];
}

export function CollectionGrid({ collections = [] }: CollectionGridProps) {
  return (
    <div className="bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            id={collection.id}
            name={collection.name}
            image={collection.image}
            description={collection.description}
            floorPrice={collection.floorPrice}
            volume24h={collection.volume24h}
            totalSupply={collection.totalSupply}
            creator={collection.creator}
          />
        ))}
      </div>
      
      {collections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No collections available</p>
        </div>
      )}
    </div>
  );
}