import { NextResponse } from 'next/server';
import { heliusAPI } from '@/lib/helius-api';

export async function GET() {
  try {
    console.log('🧪 Testing Helius API integration...');
    
    // Test Helius API directly
    const collections = await heliusAPI.getTrendingCollections(3);
    
    console.log(`✅ Helius API test successful: ${collections.length} collections`);
    
    return NextResponse.json({
      success: true,
      message: 'Helius API is working perfectly!',
      collectionsCount: collections.length,
      sampleCollection: collections[0]?.content?.metadata?.name || 'No collections found',
      apiKey: process.env.NEXT_PUBLIC_HELIUS_API_KEY ? 'Available' : 'Missing',
      rpcUrl: process.env.NEXT_PUBLIC_HELIUS_RPC_URL ? 'Available' : 'Missing'
    });
  } catch (error: any) {
    console.error('❌ Helius API test failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Helius API test failed'
    }, { status: 500 });
  }
}