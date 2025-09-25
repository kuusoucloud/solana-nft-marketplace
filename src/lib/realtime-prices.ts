"use client";

import { useEffect, useRef, useState } from 'react';

export interface PriceUpdate {
  mintAddress: string;
  price: number;
  currency: string;
  timestamp: number;
  change24h?: number;
  volume24h?: number;
}

export interface MarketData {
  [mintAddress: string]: PriceUpdate;
}

// Simulated WebSocket service for real-time price updates
export class RealTimePriceService {
  private ws: WebSocket | null = null;
  private subscribers: Set<(data: PriceUpdate) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  // For demo purposes, we'll simulate price updates
  private simulationInterval: NodeJS.Timeout | null = null;
  private trackedMints: Set<string> = new Set();

  constructor() {
    this.startSimulation();
  }

  // Subscribe to price updates
  subscribe(callback: (data: PriceUpdate) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Track a mint address for price updates
  trackMint(mintAddress: string) {
    this.trackedMints.add(mintAddress);
  }

  // Stop tracking a mint address
  untrackMint(mintAddress: string) {
    this.trackedMints.delete(mintAddress);
  }

  // Simulate real-time price updates
  private startSimulation() {
    this.simulationInterval = setInterval(() => {
      this.trackedMints.forEach(mintAddress => {
        // Generate realistic price fluctuations
        const basePrice = this.getBasePriceForMint(mintAddress);
        const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
        const newPrice = basePrice * (1 + fluctuation);
        
        const priceUpdate: PriceUpdate = {
          mintAddress,
          price: Math.max(0.01, newPrice), // Minimum price of 0.01 SOL
          currency: 'SOL',
          timestamp: Date.now(),
          change24h: fluctuation * 100,
          volume24h: Math.random() * 1000,
        };

        // Notify all subscribers
        this.subscribers.forEach(callback => callback(priceUpdate));
      });
    }, 3000); // Update every 3 seconds
  }

  private getBasePriceForMint(mintAddress: string): number {
    // Generate consistent base prices based on mint address
    const hash = mintAddress.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return Math.abs(hash % 100) + 10; // Price between 10-110 SOL
  }

  // Connect to real WebSocket (for production)
  private connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      // In production, this would connect to a real WebSocket endpoint
      // this.ws = new WebSocket('wss://api.magiceden.dev/ws');
      
      // For demo, we'll just use the simulation
      this.isConnecting = false;
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    this.isConnecting = false;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }

  // Clean up resources
  destroy() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    
    if (this.ws) {
      this.ws.close();
    }
    
    this.subscribers.clear();
    this.trackedMints.clear();
  }
}

// React hook for using real-time prices
export function useRealTimePrices(mintAddresses: string[] = []) {
  const [prices, setPrices] = useState<MarketData>({});
  const [isConnected, setIsConnected] = useState(false);
  const serviceRef = useRef<RealTimePriceService | null>(null);

  useEffect(() => {
    // Initialize service
    if (!serviceRef.current) {
      serviceRef.current = new RealTimePriceService();
      setIsConnected(true);
    }

    const service = serviceRef.current;

    // Subscribe to price updates
    const unsubscribe = service.subscribe((priceUpdate) => {
      setPrices(prev => ({
        ...prev,
        [priceUpdate.mintAddress]: priceUpdate,
      }));
    });

    // Track mint addresses
    mintAddresses.forEach(mint => service.trackMint(mint));

    return () => {
      unsubscribe();
      mintAddresses.forEach(mint => service.untrackMint(mint));
    };
  }, [mintAddresses]);

  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
      }
    };
  }, []);

  return {
    prices,
    isConnected,
    trackMint: (mintAddress: string) => serviceRef.current?.trackMint(mintAddress),
    untrackMint: (mintAddress: string) => serviceRef.current?.untrackMint(mintAddress),
  };
}

// Hook for tracking a single NFT price
export function useNFTPrice(mintAddress: string) {
  const { prices, isConnected, trackMint, untrackMint } = useRealTimePrices([mintAddress]);

  useEffect(() => {
    if (mintAddress) {
      trackMint(mintAddress);
      return () => untrackMint(mintAddress);
    }
  }, [mintAddress, trackMint, untrackMint]);

  return {
    price: prices[mintAddress],
    isConnected,
  };
}

// Export singleton service
export const realTimePriceService = new RealTimePriceService();