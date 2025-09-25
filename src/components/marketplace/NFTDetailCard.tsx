import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpDown,
  Heart,
  Share2,
  Clock,
  Tag,
  AlertCircle,
  Info,
  Hash,
  Copy,
  FileText,
} from "lucide-react";
import { PriceUpdate } from "@/lib/realtime-prices";

interface NFTDetailCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  collection: string;
  owner: string;
  creator: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  mintAddress: string;
  history: Array<{
    event: string;
    price: number | null;
    from: string;
    to: string | null;
    date: string;
  }>;
  offers: Array<{
    price: number;
    from: string;
    expiration: string;
  }>;
  rarity?: {
    rank?: number;
    score?: number;
  };
  realTimePrice?: PriceUpdate;
  connected?: boolean;
}

export function NFTDetailCard({
  id = "sample-nft",
  name = "Sample NFT #1234",
  image = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
  price = 45.5,
  currency = "SOL",
  collection = "Sample Collection",
  owner = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  creator = "Creator Address",
  description = "This is a sample NFT with various attributes and properties.",
  attributes = [
    { trait_type: "Background", value: "Blue" },
    { trait_type: "Eyes", value: "Laser" },
    { trait_type: "Rarity", value: "Legendary" },
  ],
  mintAddress = "SampleMintAddress123456789",
  history = [],
  offers = [],
  rarity,
  realTimePrice,
  connected = false,
}: NFTDetailCardProps) {
  const [activeTab, setActiveTab] = useState<"details" | "history" | "offers">("details");
  const [showFullDescription, setShowFullDescription] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const currentDisplayPrice = realTimePrice?.price || price;
  const priceChange = realTimePrice?.change24h || 0;

  return (
    <div className="bg-background min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Column - Image */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
              {rarity && (
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    Rank #{rarity.rank}
                  </Badge>
                </div>
              )}
              {realTimePrice && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/70 text-white flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Attributes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Attributes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="bg-muted rounded-lg p-3 text-center"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {attr.trait_type}
                    </p>
                    <p className="font-semibold text-foreground mt-1">
                      {attr.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{collection}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{name}</h1>
            
            {/* Price Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-foreground">
                      {currentDisplayPrice.toFixed(2)} {currency}
                    </p>
                    {priceChange !== 0 && (
                      <Badge 
                        variant="outline" 
                        className={`${priceChange >= 0 ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'}`}
                      >
                        {priceChange >= 0 ? '↗' : '↘'} {Math.abs(priceChange).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                {realTimePrice && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">24h Volume</p>
                    <p className="text-lg font-semibold">{realTimePrice.volume24h?.toFixed(0)} SOL</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button className="flex-1" disabled={!connected}>
                  {connected ? "Buy Now" : "Connect Wallet to Buy"}
                </Button>
                <Button variant="outline" className="flex-1" disabled={!connected}>
                  {connected ? "Make Offer" : "Connect Wallet"}
                </Button>
              </div>
              
              {!connected && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Connect your wallet to interact with this NFT
                </p>
              )}
            </Card>
          </div>

          {/* Owner Info */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Owner</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${owner}`} />
                      <AvatarFallback>OW</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(owner)}
                      className="text-sm font-mono"
                    >
                      {formatAddress(owner)}
                      <Copy className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Creator</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator}`} />
                      <AvatarFallback>CR</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(creator)}
                      className="text-sm font-mono"
                    >
                      {formatAddress(creator)}
                      <Copy className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {showFullDescription || description.length <= 200
                  ? description
                  : `${description.slice(0, 200)}...`}
              </p>
              {description.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 p-0 h-auto"
                >
                  {showFullDescription ? "Show Less" : "Show More"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="offers">Offers</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mint Address</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(mintAddress)}
                      className="text-sm font-mono"
                    >
                      {formatAddress(mintAddress)}
                      <Copy className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Token Standard</span>
                    <span className="text-sm font-medium">Metaplex</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Blockchain</span>
                    <span className="text-sm font-medium">Solana</span>
                  </div>
                  {rarity && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rarity Score</span>
                        <span className="text-sm font-medium">{rarity.score?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{item.event}</Badge>
                          <div>
                            <p className="text-sm font-medium">
                              {item.price ? `${item.price.toFixed(2)} ${currency}` : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="text-sm font-mono">{formatAddress(item.from)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No transaction history available</p>
                  )}
                </div>
              )}

              {activeTab === "offers" && (
                <div className="space-y-3">
                  {offers.length > 0 ? (
                    offers.map((offer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{offer.price.toFixed(2)} {currency}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires {new Date(offer.expiration).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="text-sm font-mono">{formatAddress(offer.from)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No offers yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}