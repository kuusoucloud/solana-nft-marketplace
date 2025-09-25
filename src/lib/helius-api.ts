import axios from 'axios';

// Helius API for enhanced NFT data
const HELIUS_BASE_URL = 'https://api.helius.xyz/v0';
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || 'demo-key';

export interface HeliusNFT {
  id: string;
  content: {
    $schema: string;
    json_uri: string;
    files: Array<{
      uri: string;
      cdn_uri: string;
      mime: string;
    }>;
    metadata: {
      attributes: Array<{
        trait_type: string;
        value: string;
      }>;
      description: string;
      name: string;
      symbol: string;
      token_standard: string;
    };
    links: {
      image: string;
      external_url?: string;
    };
  };
  authorities: Array<{
    address: string;
    scopes: string[];
  }>;
  compression: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  grouping: Array<{
    group_key: string;
    group_value: string;
  }>;
  royalty: {
    royalty_model: string;
    target: string | null;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators: Array<{
    address: string;
    share: number;
    verified: boolean;
  }>;
  ownership: {
    frozen: boolean;
    delegated: boolean;
    delegate: string | null;
    ownership_model: string;
    owner: string;
  };
  supply: {
    print_max_supply: number;
    print_current_supply: number;
    edition_nonce: number;
  };
  mutable: boolean;
  burnt: boolean;
  token_info?: {
    symbol: string;
    balance: number;
    supply: number;
    decimals: number;
    token_program: string;
    associated_token_address: string;
    price_info?: {
      price_per_token: number;
      total_price: number;
      currency: string;
    };
  };
}

export interface HeliusCollection {
  id: string;
  content: {
    metadata: {
      name: string;
      symbol: string;
      description: string;
    };
    links: {
      image: string;
      external_url?: string;
    };
  };
  grouping: Array<{
    group_key: string;
    group_value: string;
  }>;
  creators: Array<{
    address: string;
    share: number;
    verified: boolean;
  }>;
  items: HeliusNFT[];
  stats?: {
    floor_price: number;
    volume_24h: number;
    volume_7d: number;
    volume_30d: number;
    volume_all: number;
    listed_count: number;
    holders: number;
    supply: number;
  };
}

export class HeliusAPI {
  private baseURL: string;
  private apiKey: string;
  private axiosInstance;

  constructor() {
    this.baseURL = HELIUS_BASE_URL;
    this.apiKey = HELIUS_API_KEY;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  // Get NFTs by owner
  async getNFTsByOwner(ownerAddress: string, page: number = 1, limit: number = 1000): Promise<HeliusNFT[]> {
    try {
      const response = await this.axiosInstance.get(`/assets?api-key=${this.apiKey}`, {
        params: {
          ownerAddress,
          page,
          limit,
          displayOptions: {
            showFungible: false,
            showNativeBalance: false,
          },
        },
      });
      return response.data.items || [];
    } catch (error) {
      console.error(`Error fetching NFTs for owner ${ownerAddress}:`, error);
      return [];
    }
  }

  // Get NFT by mint address
  async getNFTByMint(mintAddress: string): Promise<HeliusNFT | null> {
    try {
      const response = await this.axiosInstance.get(`/assets/${mintAddress}?api-key=${this.apiKey}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching NFT ${mintAddress}:`, error);
      return null;
    }
  }

  // Get NFTs by collection
  async getNFTsByCollection(collectionId: string, page: number = 1, limit: number = 1000): Promise<HeliusNFT[]> {
    try {
      const response = await this.axiosInstance.get(`/assets?api-key=${this.apiKey}`, {
        params: {
          grouping: ['collection', collectionId],
          page,
          limit,
        },
      });
      return response.data.items || [];
    } catch (error) {
      console.error(`Error fetching NFTs for collection ${collectionId}:`, error);
      return [];
    }
  }

  // Search NFTs
  async searchNFTs(query: string, limit: number = 100): Promise<HeliusNFT[]> {
    try {
      const response = await this.axiosInstance.post(`/assets/search?api-key=${this.apiKey}`, {
        nftName: query,
        limit,
      });
      return response.data.items || [];
    } catch (error) {
      console.error(`Error searching NFTs with query "${query}":`, error);
      return [];
    }
  }

  // Get NFT transactions/activities
  async getNFTTransactions(mintAddress: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(`/assets/${mintAddress}/transactions?api-key=${this.apiKey}`, {
        params: {
          limit,
        },
      });
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching transactions for NFT ${mintAddress}:`, error);
      return [];
    }
  }

  // Get collection floor price and stats
  async getCollectionStats(collectionId: string): Promise<any> {
    try {
      // This would typically be a separate endpoint, but for demo we'll simulate
      const nfts = await this.getNFTsByCollection(collectionId, 1, 100);
      
      if (nfts.length === 0) return null;

      // Calculate basic stats from available data
      const listedNFTs = nfts.filter(nft => nft.token_info?.price_info);
      const prices = listedNFTs.map(nft => nft.token_info?.price_info?.price_per_token || 0);
      
      return {
        collection_id: collectionId,
        supply: nfts.length,
        listed_count: listedNFTs.length,
        floor_price: prices.length > 0 ? Math.min(...prices) : 0,
        avg_price: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
        volume_24h: 0, // Would need transaction data
        holders: new Set(nfts.map(nft => nft.ownership.owner)).size,
      };
    } catch (error) {
      console.error(`Error fetching collection stats for ${collectionId}:`, error);
      return null;
    }
  }

  // Get trending collections (this would typically be a dedicated endpoint)
  async getTrendingCollections(limit: number = 20): Promise<HeliusCollection[]> {
    try {
      // For demo purposes, we'll return some popular known collections
      const popularCollections = [
        'DRiP2Pn2K6fuMLKQmt5rZWxa91jdMhzuLReqzMfMTzTY',
        'SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W',
        'DeGod3CG9diwGzuxvYHjVajZrKdqVuXPQSu4nntWtNuK',
      ];

      const collections: HeliusCollection[] = [];
      
      for (const collectionId of popularCollections.slice(0, limit)) {
        const nfts = await this.getNFTsByCollection(collectionId, 1, 10);
        if (nfts.length > 0) {
          const stats = await this.getCollectionStats(collectionId);
          collections.push({
            id: collectionId,
            content: {
              metadata: {
                name: nfts[0].content.metadata.name.split('#')[0].trim(),
                symbol: nfts[0].content.metadata.symbol,
                description: nfts[0].content.metadata.description,
              },
              links: {
                image: nfts[0].content.links.image,
                external_url: nfts[0].content.links.external_url,
              },
            },
            grouping: nfts[0].grouping,
            creators: nfts[0].creators,
            items: nfts,
            stats,
          });
        }
      }

      return collections;
    } catch (error) {
      console.error('Error fetching trending collections:', error);
      return [];
    }
  }

  // Get real-time price data (WebSocket would be ideal, but we'll simulate)
  async getRealTimePrices(mintAddresses: string[]): Promise<Record<string, number>> {
    try {
      const prices: Record<string, number> = {};
      
      for (const mintAddress of mintAddresses) {
        const nft = await this.getNFTByMint(mintAddress);
        if (nft?.token_info?.price_info) {
          prices[mintAddress] = nft.token_info.price_info.price_per_token;
        }
      }
      
      return prices;
    } catch (error) {
      console.error('Error fetching real-time prices:', error);
      return {};
    }
  }
}

// Export singleton instance
export const heliusAPI = new HeliusAPI();