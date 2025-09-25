import axios from 'axios';

// Magic Eden API for NFT marketplace data
const MAGIC_EDEN_BASE_URL = 'https://api-mainnet.magiceden.dev/v2';

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
  owner: string;
  supply: number;
  collection: string;
  name: string;
  updateAuthority: string;
  primarySaleHappened: boolean;
  sellerFeeBasisPoints: number;
  image: string;
  animationUrl?: string;
  externalUrl?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
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
  private axiosInstance;

  constructor() {
    this.baseURL = MAGIC_EDEN_BASE_URL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  // Get popular collections - FIXED TO USE REAL MAGIC EDEN API
  async getPopularCollections(limit: number = 20): Promise<MagicEdenCollection[]> {
    try {
      console.log('🔥 Fetching collections from Magic Eden API...');
      const response = await this.axiosInstance.get('/collections', {
        params: {
          offset: 0,
          limit,
        },
      });
      console.log(`✅ Magic Eden API returned ${response.data?.length || 0} collections`);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching popular collections from Magic Eden:', error.message);
      console.error('Error details:', error.response?.data || error);
      return [];
    }
  }

  // Get trending collections (same as popular for now)
  async getTrendingCollections(limit: number = 20): Promise<MagicEdenCollection[]> {
    return this.getPopularCollections(limit);
  }

  // Get collection statistics - FIXED TO USE REAL MAGIC EDEN API
  async getCollectionStats(symbol: string): Promise<MagicEdenCollectionStats | null> {
    try {
      console.log(`🔍 Fetching stats for collection: ${symbol}`);
      const response = await this.axiosInstance.get(`/collections/${symbol}/stats`);
      console.log(`✅ Got stats for ${symbol}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error fetching stats for collection ${symbol}:`, error.message);
      return null;
    }
  }

  // Get NFTs from a collection - FIXED TO USE REAL MAGIC EDEN API
  async getCollectionNFTs(symbol: string, offset: number = 0, limit: number = 20): Promise<MagicEdenNFT[]> {
    try {
      console.log(`🔍 Fetching NFTs for collection: ${symbol}`);
      const response = await this.axiosInstance.get(`/collections/${symbol}/listings`, {
        params: {
          offset,
          limit,
        },
      });
      console.log(`✅ Got ${response.data?.length || 0} NFTs for ${symbol}`);
      return response.data || [];
    } catch (error: any) {
      console.error(`❌ Error fetching NFTs for collection ${symbol}:`, error.message);
      return [];
    }
  }

  // Get specific NFT details - FIXED TO USE REAL MAGIC EDEN API
  async getNFTDetails(mintAddress: string): Promise<MagicEdenNFT | null> {
    try {
      console.log(`🔍 Fetching NFT details for: ${mintAddress}`);
      const response = await this.axiosInstance.get(`/tokens/${mintAddress}`);
      console.log(`✅ Got NFT details for ${mintAddress}`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error fetching NFT details for ${mintAddress}:`, error.message);
      return null;
    }
  }

  // Get NFT activities (sales, listings, etc.) - FIXED TO USE REAL MAGIC EDEN API
  async getNFTActivities(mintAddress: string, limit: number = 10): Promise<MagicEdenActivity[]> {
    try {
      const response = await this.axiosInstance.get(`/tokens/${mintAddress}/activities`, {
        params: {
          offset: 0,
          limit,
        },
      });
      return response.data || [];
    } catch (error: any) {
      console.error(`❌ Error fetching NFT activities for ${mintAddress}:`, error.message);
      return [];
    }
  }

  // Get collection activities - FIXED TO USE REAL MAGIC EDEN API
  async getCollectionActivities(symbol: string, limit: number = 100): Promise<MagicEdenActivity[]> {
    try {
      const response = await this.axiosInstance.get(`/collections/${symbol}/activities`, {
        params: {
          offset: 0,
          limit,
        },
      });
      return response.data || [];
    } catch (error: any) {
      console.error(`❌ Error fetching collection activities for ${symbol}:`, error.message);
      return [];
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