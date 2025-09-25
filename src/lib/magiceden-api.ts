import axios from 'axios';

// Magic Eden API endpoints
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

export class MagicEdenAPI {
  private baseURL: string;
  private axiosInstance;

  constructor() {
    this.baseURL = MAGIC_EDEN_BASE_URL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  // Get popular collections
  async getPopularCollections(limit: number = 20): Promise<MagicEdenCollection[]> {
    try {
      const response = await this.axiosInstance.get('/collections', {
        params: {
          offset: 0,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular collections:', error);
      return [];
    }
  }

  // Get collection stats
  async getCollectionStats(symbol: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/collections/${symbol}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching collection stats for ${symbol}:`, error);
      return null;
    }
  }

  // Get NFTs from a collection
  async getCollectionNFTs(symbol: string, offset: number = 0, limit: number = 20): Promise<MagicEdenNFT[]> {
    try {
      const response = await this.axiosInstance.get(`/collections/${symbol}/listings`, {
        params: {
          offset,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching NFTs for collection ${symbol}:`, error);
      return [];
    }
  }

  // Get specific NFT details
  async getNFTDetails(mintAddress: string): Promise<MagicEdenNFT | null> {
    try {
      const response = await this.axiosInstance.get(`/tokens/${mintAddress}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching NFT details for ${mintAddress}:`, error);
      return null;
    }
  }

  // Get NFT activities (sales, listings, etc.)
  async getNFTActivities(mintAddress: string, limit: number = 10): Promise<MagicEdenActivity[]> {
    try {
      const response = await this.axiosInstance.get(`/tokens/${mintAddress}/activities`, {
        params: {
          offset: 0,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching NFT activities for ${mintAddress}:`, error);
      return [];
    }
  }

  // Get collection activities
  async getCollectionActivities(symbol: string, limit: number = 100): Promise<MagicEdenActivity[]> {
    try {
      const response = await this.axiosInstance.get(`/collections/${symbol}/activities`, {
        params: {
          offset: 0,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching collection activities for ${symbol}:`, error);
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

  // Get trending collections (sorted by 24h volume)
  async getTrendingCollections(limit: number = 20): Promise<MagicEdenCollection[]> {
    try {
      const collections = await this.getPopularCollections(100);
      return collections
        .sort((a, b) => (b.volume24hr || 0) - (a.volume24hr || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending collections:', error);
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