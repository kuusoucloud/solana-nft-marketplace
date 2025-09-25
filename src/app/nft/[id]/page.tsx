"use client";

import { useState, useEffect } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { NFTDetailCard } from "@/components/marketplace/NFTDetailCard";
import { enhancedSolanaNFTService, EnhancedNFTMetadata } from "@/lib/solana";
import { useNFTPrice } from "@/lib/realtime-prices";
import { WalletButton } from "@/components/wallet/WalletButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Zap, TrendingUp, Activity } from "lucide-react";

export default function NFTDetailPage({ params }: { params?: { id: string } }) {
  // Handle case where params might be undefined (e.g., in storyboard context)
  const nftId = params?.id || "1234";
  const { connected } = useWallet();
  const [nft, setNft] = useState<EnhancedNFTMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get real-time price for this NFT
  const { price: realTimePrice, isConnected: priceServiceConnected } = useNFTPrice(nft?.mintAddress || '');

  useEffect(() => {
    fetchNFTData();
  }, [nftId]);

  const fetchNFTData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const nftData = await enhancedSolanaNFTService.fetchNFTById(nftId);
      
      if (nftData) {
        setNft(nftData);
      } else {
        // If NFT not found by ID, get a sample NFT
        const collections = await enhancedSolanaNFTService.fetchTrendingCollections(1);
        if (collections.length > 0) {
          const collectionNFTs = await enhancedSolanaNFTService.fetchCollectionNFTs(collections[0].symbol, 1);
          if (collectionNFTs.length > 0) {
            setNft(collectionNFTs[0]);
          } else {
            setError("NFT not found");
          }
        } else {
          setError("NFT not found");
        }
      }
    } catch (err) {
      console.error("Error fetching NFT data:", err);
      setError("Failed to load NFT data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading NFT data from Solana...</p>
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || "NFT not found"}</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentPrice = realTimePrice?.price || nft.price || 0;
  const priceChange = realTimePrice?.change24h || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div>
                <h1 className="text-xl font-bold text-foreground">{nft.name}</h1>
                <p className="text-sm text-muted-foreground">{nft.collection}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {priceServiceConnected && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Price
                </Badge>
              )}
              <WalletButton />
            </div>
          </div>
        </div>
      </div>

      {/* Price Stats Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Current Price</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {currentPrice.toFixed(2)} SOL
                </div>
                {priceChange !== 0 && (
                  <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange >= 0 ? '↗' : '↘'} {Math.abs(priceChange).toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>

            {nft.lastSale && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Last Sale</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {nft.lastSale.price.toFixed(2)} SOL
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(nft.lastSale.date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {nft.rarity && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Rarity Rank</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    #{nft.rarity.rank}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Score: {nft.rarity.score?.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Status</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  <Badge 
                    variant={nft.listStatus === 'listed' ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {nft.listStatus || 'Unlisted'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <NFTDetailCard
          id={nft.id}
          name={nft.name}
          image={nft.image}
          price={currentPrice}
          currency={nft.currency}
          collection={nft.collection || "Unknown Collection"}
          owner={nft.owner || "Unknown Owner"}
          creator={nft.creator || "Unknown Creator"}
          description={nft.description || "No description available"}
          attributes={nft.attributes || []}
          mintAddress={nft.mintAddress}
          history={nft.priceHistory?.map(h => ({
            event: h.type === 'sale' ? 'Sale' : h.type === 'listing' ? 'Listed' : 'Delisted',
            price: h.price,
            from: "User",
            to: h.type === 'sale' ? "Buyer" : null,
            date: new Date(h.date).toISOString().split('T')[0],
          })) || [
            {
              event: "Listed",
              price: currentPrice,
              from: nft.owner || "Unknown",
              to: null,
              date: new Date().toISOString().split('T')[0],
            },
          ]}
          offers={[
            {
              price: currentPrice * 0.9,
              from: "Buyer1...",
              expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
            {
              price: currentPrice * 0.8,
              from: "Buyer2...",
              expiration: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
          ]}
          rarity={nft.rarity}
          realTimePrice={realTimePrice}
          connected={connected}
        />
      </div>
    </div>
  );
}