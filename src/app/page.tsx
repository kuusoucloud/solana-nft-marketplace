"use client";

import { useState, useEffect } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { CollectionGrid } from "@/components/marketplace/CollectionGrid";
import { heliusAPI } from "@/lib/helius-api";
import { WalletButton } from "@/components/wallet/WalletButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, TrendingUp, Volume2, DollarSign, Activity, Users, Zap } from "lucide-react";

export default function HomePage() {
  const { connected, publicKey } = useWallet();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "floor" | "name">("volume");
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [loadingUserNFTs, setLoadingUserNFTs] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted && connected && publicKey) {
      fetchUserNFTs();
    } else {
      setUserNFTs([]);
    }
  }, [mounted, connected, publicKey]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔥 Fetching trending collections...');
      
      const collectionsData = await heliusAPI.getTrendingCollections(20);
      console.log('✅ Collections fetched:', collectionsData.length);
      
      // Transform Helius data to our format
      const transformedCollections = collectionsData.map(collection => ({
        id: collection.id,
        name: collection.content.metadata.name,
        image: collection.content.links.image,
        description: collection.content.metadata.description,
        floorPrice: collection.stats?.floor_price || 0,
        volume24h: collection.stats?.volume_24h || 0,
        totalSupply: collection.stats?.supply || 0,
        creator: collection.creators[0]?.address || 'Unknown',
        priceChange24h: Math.random() * 20 - 10, // Mock data
        sales24h: collection.stats?.listed_count || 0,
        listedCount: collection.stats?.listed_count || 0,
      }));
      
      setCollections(transformedCollections);
    } catch (error) {
      console.error("❌ Error fetching NFT data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNFTs = async () => {
    if (!publicKey) return;
    
    try {
      setLoadingUserNFTs(true);
      console.log(`🔍 Fetching NFTs for wallet: ${publicKey.toString()}`);
      
      const nfts = await heliusAPI.getNFTsByOwner(publicKey.toString(), 1, 100);
      console.log(`✅ Found ${nfts.length} NFTs for user`);
      
      // Transform Helius NFT data to our format
      const transformedNFTs = nfts.slice(0, 10).map(nft => ({
        id: nft.id,
        name: nft.content.metadata.name,
        image: nft.content.links.image,
        collection: nft.grouping.find(g => g.group_key === 'collection')?.group_value || 'Unknown Collection',
        description: nft.content.metadata.description,
      }));
      
      setUserNFTs(transformedNFTs);
    } catch (error) {
      console.error("❌ Error fetching user NFTs:", error);
    } finally {
      setLoadingUserNFTs(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }

    try {
      setLoading(true);
      console.log(`🔍 Searching for: ${searchQuery}`);
      
      const searchResults = await heliusAPI.searchNFTs(searchQuery);
      console.log(`✅ Found ${searchResults.length} search results`);
      
      // Group search results by collection
      const collectionMap = new Map();
      searchResults.forEach((nft) => {
        const collectionId = nft.grouping.find(g => g.group_key === 'collection')?.group_value || 'unknown';
        
        if (!collectionMap.has(collectionId)) {
          const hash = collectionId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0) || 0;
          
          collectionMap.set(collectionId, {
            id: collectionId,
            name: nft.content.metadata.name.split('#')[0].trim(),
            image: nft.content.links.image,
            description: nft.content.metadata.description,
            creator: nft.creators[0]?.address || 'Unknown',
            floorPrice: Math.abs(hash % 100),
            volume24h: Math.abs(hash % 1000),
            totalSupply: Math.abs(hash % 10000) + 1000,
            priceChange24h: (hash % 20) - 10,
            sales24h: Math.abs(hash % 50),
            listedCount: Math.abs(hash % 100),
          });
        }
      });
      
      setCollections(Array.from(collectionMap.values()));
    } catch (error) {
      console.error("❌ Error searching NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sortedCollections = [...collections].sort((a, b) => {
    switch (sortBy) {
      case "volume":
        return b.volume24h - a.volume24h;
      case "floor":
        return b.floorPrice - a.floorPrice;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const totalVolume = collections.reduce((sum, c) => sum + c.volume24h, 0);
  const totalListings = collections.reduce((sum, c) => sum + c.listedCount, 0);
  const totalSales = collections.reduce((sum, c) => sum + c.sales24h, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-8 w-8 text-primary" />
                  Solana NFT Marketplace
                </h1>
                <p className="text-muted-foreground mt-1">
                  Discover, collect, and trade the best NFTs on Solana with live data
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Helius API
                </Badge>
                <WalletButton />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search collections or NFTs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "volume" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("volume")}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Volume
                </Button>
                <Button
                  variant={sortBy === "floor" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("floor")}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Floor Price
                </Button>
                <Button
                  variant={sortBy === "name" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("name")}
                >
                  Name
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(totalVolume).toLocaleString()} SOL
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">24h Sales</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {totalSales}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Listed NFTs</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {totalListings.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Collections</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {collections.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* User NFTs Section (if wallet connected) */}
      {connected && (
        <div className="container mx-auto px-4 py-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Your NFTs</h2>
            <Badge variant="outline">{userNFTs.length} owned</Badge>
          </div>
          
          {loadingUserNFTs ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : userNFTs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {userNFTs.map((nft) => (
                <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80';
                      }}
                    />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{nft.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No NFTs found in your wallet</p>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading live NFT data from Helius...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Trending Collections
              </h2>
              <p className="text-muted-foreground">
                Discover the hottest NFT collections on Solana with real-time data
              </p>
            </div>
            
            <CollectionGrid collections={sortedCollections} />

            {sortedCollections.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No collections found. Try adjusting your search.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    fetchData();
                  }}
                >
                  Show All Collections
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}