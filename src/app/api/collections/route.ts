import { NextRequest, NextResponse } from 'next/server';
import { magicEdenAPI } from '@/lib/magiceden-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('🔥 API Route: Fetching trending collections from Magic Eden...');
    
    // Use Magic Eden API for live data
    const collections = await magicEdenAPI.getTrendingCollections(limit);
    
    console.log(`✅ API Route: Returning ${collections.length} collections from Magic Eden`);
    
    return NextResponse.json(collections, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('❌ API Route: Error fetching collections from Magic Eden:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections from Magic Eden' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}