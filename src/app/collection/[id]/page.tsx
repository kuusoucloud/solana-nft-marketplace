"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { magicEdenAPI } from "@/lib/magiceden-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, TrendingUp, Volume2, Users, Activity } from "lucide-react";
import Link from "next/link";

export default function CollectionPage() {
  const params = useParams();
  const collectionId = params.id as string;
  
  const [collection, setCollection] = useState<any>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nftsLoading, setNftsLoading] = useState(true);

  useEffect(() => {
    if (collectionId) {
      fetchCollectionData();
    }
  }, [collectionId]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      setNftsLoading(true);
      
      console.log(`🔍 Fetching data for collection: ${collectionId}`);
      
      // Fetch collection stats and NFTs in parallel
      const [statsData, nftsData, collectionsData] = await Promise.all([
        magicEdenAPI.getCollectionStats(collectionId),
        magicEdenAPI.getCollectionNFTs(collectionId, 0, 20),
        magicEdenAPI.getTrendingCollections(100) // Get all collections to find this one
      ]);

      // Find the collection info from the collections list
      const collectionInfo = collectionsData.find(c => c.symbol === collectionId);
      
      if (collectionInfo) {
        setCollection({
          id: collectionInfo.symbol,
          name: collectionInfo.name,
          description: collectionInfo.description,
          image: collectionInfo.image,
          floorPrice: statsData?.floorPrice || collectionInfo.floorPrice || 0,
          volume24h: statsData?.volume24hr || collectionInfo.volume24hr || 0,
          volumeAll: statsData?.volumeAll || collectionInfo.volumeAll || 0,
          listedCount: statsData?.listedCount || collectionInfo.listedCount || 0,
          avgPrice24hr: statsData?.avgPrice24hr || collectionInfo.avgPrice24hr || 0,
        });
      } else {
        // Fallback collection data if not found
        setCollection({
          id: collectionId,
          name: collectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `A unique NFT collection on Solana`,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
          floorPrice: statsData?.floorPrice || 1.0,
          volume24h: statsData?.volume24hr || 100,
          volumeAll: statsData?.volumeAll || 10000,
          listedCount: statsData?.listedCount || 50,
          avgPrice24hr: statsData?.avgPrice24hr || 1.2,
        });
      }

      setStats(statsData);
      setNfts(nftsData || []);
      
      console.log(`✅ Loaded collection data: ${nftsData?.length || 0} NFTs`);
    } catch (error) {
      console.error("❌ Error fetching collection data:", error);
    } finally {
      setLoading(false);
      setNftsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collection data...</p>
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
            <Badge variant="secondary">Collection</Badge>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Collection Image */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80';
                  }}
                />
              </div>
            </div>

            {/* Collection Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-4">{collection.name}</h1>
              <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
                {collection.description || "A unique NFT collection on the Solana blockchain."}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Floor Price</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {collection.floorPrice.toFixed(2)} SOL
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Volume2 className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">24h Volume</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round(collection.volume24h).toLocaleString()} SOL
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Listed</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {collection.listedCount.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Total Volume</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round(collection.volumeAll / 1000)}K SOL
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFTs Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Listed NFTs</h2>
          <Badge variant="outline">{nfts.length} items</Badge>
        </div>

        {nftsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading NFTs...</p>
            </div>
          </div>
        ) : nfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft, index) => (
              <Card key={nft.mintAddress || index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80';
                    }}
                  />
                  {nft.price && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/80 text-white">
                        {nft.price} SOL
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 truncate">
                    {nft.name || `${collection.name} #${index + 1}`}
                  </h3>
                  
                  {nft.attributes && nft.attributes.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {nft.attributes.slice(0, 2).map((attr, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{attr.trait_type}:</span>
                          <span className="text-foreground font-medium">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-bold text-foreground">
                        {nft.price ? `${nft.price} SOL` : 'Not Listed'}
                      </p>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No NFTs currently listed in this collection.</p>
            <p className="text-sm text-muted-foreground">Check back later for new listings!</p>
          </div>
        )}
      </div>
    </div>
  );
}