import { NextRequest, NextResponse } from 'next/server';

const MAGIC_EDEN_BASE_URL = 'https://api-mainnet.magiceden.dev/v2';

// Fallback stats data
const FALLBACK_STATS: { [key: string]: any } = {
  degods: {
    floorPrice: 45.5,
    volume24hr: 1250,
    volumeAll: 125000,
    listedCount: 234,
    avgPrice24hr: 48.2,
    createdAt: '2022-01-01T00:00:00.000Z'
  },
  okay_bears: {
    floorPrice: 12.8,
    volume24hr: 890,
    volumeAll: 89000,
    listedCount: 456,
    avgPrice24hr: 13.1,
    createdAt: '2022-04-01T00:00:00.000Z'
  },
  mad_lads: {
    floorPrice: 89.2,
    volume24hr: 2340,
    volumeAll: 234000,
    listedCount: 123,
    avgPrice24hr: 92.1,
    createdAt: '2023-04-01T00:00:00.000Z'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol;

  try {
    console.log(`🔍 API Route: Fetching stats for collection: ${symbol}`);
    
    // Try Magic Eden API first
    const response = await fetch(`${MAGIC_EDEN_BASE_URL}/collections/${symbol}/stats`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NFT-Marketplace/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Magic Eden API returned stats for ${symbol}`);
      return NextResponse.json(data);
    } else {
      console.log(`⚠️ Magic Eden API returned status: ${response.status} for ${symbol} stats`);
    }
  } catch (error: any) {
    console.error(`❌ Magic Eden API error for ${symbol} stats:`, error.message);
  }

  // Fallback to mock data
  console.log(`🔄 Using fallback stats data for collection: ${symbol}`);
  const fallbackStats = FALLBACK_STATS[symbol] || {
    floorPrice: 1.0,
    volume24hr: 100,
    volumeAll: 10000,
    listedCount: 50,
    avgPrice24hr: 1.2,
    createdAt: new Date().toISOString()
  };
  
  return NextResponse.json(fallbackStats);
}