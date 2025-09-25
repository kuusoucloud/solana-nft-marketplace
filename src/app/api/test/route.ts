import { NextResponse } from 'next/server';
import { magicEdenAPI } from '@/lib/magiceden-api';

export async function GET() {
  try {
    console.log('🧪 Testing Magic Eden API integration...');
    
    // Test Magic Eden API directly
    const collections = await magicEdenAPI.getTrendingCollections(3);
    
    console.log(`✅ Magic Eden API test successful: ${collections.length} collections`);
    
    return NextResponse.json({
      success: true,
      message: 'Magic Eden API is working perfectly!',
      collectionsCount: collections.length,
      sampleCollection: collections[0]?.name || 'No collections found',
      sampleFloorPrice: collections[0]?.floorPrice || 0,
      sampleVolume: collections[0]?.volume24hr || 0,
      apiStatus: 'Live data from Magic Eden'
    });
  } catch (error: any) {
    console.error('❌ Magic Eden API test failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Magic Eden API test failed'
    }, { status: 500 });
  }
}