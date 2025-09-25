import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing internal API proxy...');
    
    // Test our internal proxy route instead of external API
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(
      `${baseUrl}/api/collections?offset=0&limit=5`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NFT-Marketplace/1.0)',
        },
      }
    );

    console.log('Internal proxy response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Internal proxy error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Internal proxy data received:', data?.length || 0, 'collections');
    
    return NextResponse.json({
      success: true,
      message: 'Internal API proxy is working!',
      collectionsCount: data?.length || 0,
      sampleCollection: data?.[0]?.name || 'No collections found',
      baseUrl
    });
  } catch (error: any) {
    console.error('Internal proxy test failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Internal API proxy failed'
    }, { status: 500 });
  }
}