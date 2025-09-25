import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test our Magic Eden proxy
    const response = await fetch(
      'https://api-mainnet.magiceden.dev/v2/collections?offset=0&limit=5',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NFT-Marketplace/1.0)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'API proxy is working!',
      collectionsCount: data?.length || 0,
      sampleCollection: data?.[0]?.name || 'No collections found'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'API proxy failed'
    }, { status: 500 });
  }
}