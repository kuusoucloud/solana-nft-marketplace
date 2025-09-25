"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { heliusAPI } from "@/lib/helius-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Grid, List, TrendingUp, Volume2, Users, Activity } from "lucide-react";
import Link from "next/link";

export default function CollectionPage() {
  const params = useParams();
  const collectionId = params.id as string;
  
  const [collection, setCollection] = useState<any>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"price" | "rarity" | "recent">("recent");

  useEffect(() => {
    if (collectionId) {
      fetchCollectionData();
    }
  }, [collectionId]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching collection data for: ${collectionId}`);

      // Get collection info from our trending collections
      const collections = await heliusAPI.getTrendingCollections(50);
      const collectionInfo = collections.find(c => c.id === collectionId);
      
      if (collectionInfo) {
        setCollection(collectionInfo);
        console.log(`✅ Found collection: ${collectionInfo.content.metadata.name}`);
        
        // Try to get NFTs from this collection
        try {
          const collectionNFTs = await heliusAPI.getNFTsByCollection(collectionId, 1, 100);
          console.log(`✅ Found ${collectionNFTs.length} NFTs in collection`);
          setNfts(collectionNFTs);
        } catch (error) {
          console.log("⚠️ Could not fetch collection NFTs, using mock data");
          // Generate mock NFTs for the collection
          const mockNFTs = Array.from({ length: 12 }, (_, i) => ({
            id: `${collectionId}-${i + 1}`,
            content: {
              metadata: {
                name: `${collectionInfo.content.metadata.name} #${i + 1}`,
                description: `A unique NFT from the ${collectionInfo.content.metadata.name} collection`,
              },
              links: {
                image: `https://images.unsplash.com/photo-${1578662996442 + i}?w=400&q=80`,
              },
            },
            grouping: [{ group_key: 'collection', group_value: collectionId }],
            creators: collectionInfo.creators,
            mockPrice: Math.random() * 100 + 10,
            mockRarity: Math.floor(Math.random() * 100) + 1,
          }));
          setNfts(mockNFTs);
        }
      } else {
        // Collection not found in trending, create mock data
        console.log("⚠️ Collection not found in trending, creating mock data");
        const mockCollection = {
          id: collectionId,
          content: {
            metadata: {
              name: collectionId.toUpperCase().replace(/-/g, ' '),
              symbol: collectionId.toUpperCase(),
              description: `The ${collectionId} NFT collection on Solana`,
            },
            links: {
              image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
            },
          },
          stats: {
            floor_price: Math.random() * 100 + 10,
            volume_24h: Math.random() * 1000 + 100,
            volume_7d: Math.random() * 5000 + 500,
            supply: 10000,
            listed_count: Math.floor(Math.random() * 1000) + 100,
            holders: Math.floor(Math.random() * 5000) + 1000,
          },
          creators: [],
        };
        
        setCollection(mockCollection);
        
        // Generate mock NFTs
        const mockNFTs = Array.from({ length: 20 }, (_, i) => ({
          id: `${collectionId}-${i + 1}`,
          content: {
            metadata: {
              name: `${mockCollection.content.metadata.name} #${i + 1}`,
              description: `A unique NFT from the ${mockCollection.content.metadata.name} collection`,
            },
            links: {
              image: `https://images.unsplash.com/photo-${1578662996442 + i * 100}?w=400&q=80`,
            },
          },
          grouping: [{ group_key: 'collection', group_value: collectionId }],
          creators: [],
          mockPrice: Math.random() * 100 + 10,
          mockRarity: Math.floor(Math.random() * 100) + 1,
        }));
        setNfts(mockNFTs);
      }
    } catch (error) {
      console.error("❌ Error fetching collection data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNFTs = nfts.filter(nft =>
    nft.content.metadata.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return (b.mockPrice || 0) - (a.mockPrice || 0);
      case "rarity":
        return (a.mockRarity || 0) - (b.mockRarity || 0);
      case "recent":
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
          <p className="text-muted-foreground mb-4">The collection you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img
                  src={collection.content.links.image}
                  alt={collection.content.metadata.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80';
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {collection.content.metadata.name}
                </h1>
                <p className="text-muted-foreground">
                  {collection.content.metadata.description}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Floor Price</span>
                </div>
                <div className="text-2xl font-bold">
                  {collection.stats?.floor_price?.toFixed(2) || '0.00'} SOL
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round(collection.stats?.volume_24h || 0)} SOL
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Holders</span>
                </div>
                <div className="text-2xl font-bold">
                  {collection.stats?.holders?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Supply</span>
                </div>
                <div className="text-2xl font-bold">
                  {collection.stats?.supply?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search NFTs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button size="icon" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={sortBy === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("recent")}
              >
                Recent
              </Button>
              <Button
                variant={sortBy === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("price")}
              >
                Price
              </Button>
              <Button
                variant={sortBy === "rarity" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("rarity")}
              >
                Rarity
              </Button>
              
              <div className="h-6 w-px bg-border" />
              
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* NFTs Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {sortedNFTs.length} NFTs
          </h2>
          <Badge variant="outline">
            {collection.stats?.listed_count || 0} listed
          </Badge>
        </div>

        {sortedNFTs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No NFTs found</p>
            <Button onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {sortedNFTs.map((nft) => (
              <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <img
                    src={nft.content.links.image}
                    alt={nft.content.metadata.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80';
                    }}
                  />
                  {nft.mockRarity && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">
                        #{nft.mockRarity}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">
                    {nft.content.metadata.name}
                  </h3>
                  {nft.mockPrice && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-bold">
                        {nft.mockPrice.toFixed(2)} SOL
                      </span>
                    </div>
                  )}
                  <Link href={`/nft/${nft.id}`}>
                    <Button className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}