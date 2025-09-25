// Updated Magic Eden API client that uses our server-side API routes
export interface MagicEdenCollection {
  symbol: string;
  name: string;
  description: string;
  image: string;
  floorPrice: number;
  listedCount: number;
  volumeAll: number;
  volume24hr: number;
  avgPrice24hr: number;
  createdAt: string;
}

export interface MagicEdenNFT {
  mintAddress: string;
  owner?: string;
  supply?: number;
  collection: string;
  name: string;
  updateAuthority?: string;
  primarySaleHappened?: boolean;
  sellerFeeBasisPoints?: number;
  image: string;
  animationUrl?: string;
  externalUrl?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties?: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
    creators: Array<{
      address: string;
      share: number;
    }>;
  };
  price?: number;
  listStatus?: string;
  tokenAddress?: string;
}

export interface MagicEdenActivity {
  signature: string;
  type: string;
  source: string;
  tokenMint: string;
  collection: string;
  slot: number;
  blockTime: number;
  buyer?: string;
  buyerReferral?: string;
  seller?: string;
  sellerReferral?: string;
  price: number;
}

export interface MagicEdenCollectionStats {
  floorPrice: number;
  volume24hr: number;
  volumeAll: number;
  listedCount: number;
  avgPrice24hr: number;
  createdAt: string;
}

export class MagicEdenAPI {
  private baseURL: string;

  constructor() {
    // Use our own API routes instead of direct Magic Eden calls
    this.baseURL = '/api';
  }

  // Get popular collections using our API route
  async getPopularCollections(limit: number = 20): Promise<MagicEdenCollection[]> {
    try {
      console.log('🔥 Fetching collections via API route...');
      const response = await fetch(`${this.baseURL}/collections?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API route returned ${data?.length || 0} collections`);
      return data || [];
    } catch (error: any) {
      console.error('❌ Error fetching collections via API route:', error.message);
      return [];
    }
  }

  // Get trending collections (same as popular for now)
  async getTrendingCollections(limit: number = 20): Promise<MagicEdenCollection[]> {
    return this.getPopularCollections(limit);
  }

  // Get collection statistics using our API route
  async getCollectionStats(symbol: string): Promise<MagicEdenCollectionStats | null> {
    try {
      console.log(`🔍 Fetching stats for collection: ${symbol} via API route`);
      const response = await fetch(`${this.baseURL}/collections/${symbol}/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Got stats for ${symbol} via API route`);
      return data;
    } catch (error: any) {
      console.error(`❌ Error fetching stats for collection ${symbol} via API route:`, error.message);
      return null;
    }
  }

  // Get NFTs from a collection using our API route
  async getCollectionNFTs(symbol: string, offset: number = 0, limit: number = 20): Promise<MagicEdenNFT[]> {
    try {
      console.log(`🔍 Fetching NFTs for collection: ${symbol} via API route`);
      const response = await fetch(`${this.baseURL}/collections/${symbol}/nfts?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Got ${data?.length || 0} NFTs for ${symbol} via API route`);
      return data || [];
    } catch (error: any) {
      console.error(`❌ Error fetching NFTs for collection ${symbol} via API route:`, error.message);
      return [];
    }
  }

  // Get specific NFT details - placeholder for now
  async getNFTDetails(mintAddress: string): Promise<MagicEdenNFT | null> {
    try {
      console.log(`🔍 Fetching NFT details for: ${mintAddress}`);
      // For now, return null - can be implemented later if needed
      return null;
    } catch (error: any) {
      console.error(`❌ Error fetching NFT details for ${mintAddress}:`, error.message);
      return null;
    }
  }

  // Search collections
  async searchCollections(query: string): Promise<MagicEdenCollection[]> {
    try {
      const collections = await this.getPopularCollections(100);
      return collections.filter(collection => 
        collection.name.toLowerCase().includes(query.toLowerCase()) ||
        collection.symbol.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching collections:', error);
      return [];
    }
  }

  // Get floor price for a collection
  async getFloorPrice(symbol: string): Promise<number> {
    try {
      const stats = await this.getCollectionStats(symbol);
      return stats?.floorPrice || 0;
    } catch (error) {
      console.error(`Error fetching floor price for ${symbol}:`, error);
      return 0;
    }
  }
}

// Export singleton instance
export const magicEdenAPI = new MagicEdenAPI();