import { NextRequest, NextResponse } from 'next/server';

const MAGIC_EDEN_BASE_URL = 'https://api-mainnet.magiceden.dev/v2';

// Fallback NFT data for collections
const FALLBACK_NFTS: { [key: string]: any[] } = {
  degods: [
    {
      mintAddress: '9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK',
      name: 'DeGod #1234',
      image: 'https://creator-hub-prod.s3.us-east-2.amazonaws.com/degods_pfp_1657114934990.png',
      price: 45.5,
      listStatus: 'listed',
      collection: 'degods',
      attributes: [
        { trait_type: 'Background', value: 'Blue' },
        { trait_type: 'Body', value: 'Gold' }
      ]
    },
    {
      mintAddress: '8BRngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSL',
      name: 'DeGod #5678',
      image: 'https://creator-hub-prod.s3.us-east-2.amazonaws.com/degods_pfp_1657114934990.png',
      price: 47.2,
      listStatus: 'listed',
      collection: 'degods',
      attributes: [
        { trait_type: 'Background', value: 'Red' },
        { trait_type: 'Body', value: 'Silver' }
      ]
    }
  ],
  okay_bears: [
    {
      mintAddress: '7CRngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSM',
      name: 'Okay Bear #2345',
      image: 'https://bafybeihvvulpp4evxj7x7armbqcwylfw2tejgichl5fzbc3xkm5yrykg3e.ipfs.nftstorage.link/',
      price: 12.8,
      listStatus: 'listed',
      collection: 'okay_bears',
      attributes: [
        { trait_type: 'Background', value: 'Forest' },
        { trait_type: 'Expression', value: 'Happy' }
      ]
    }
  ],
  mad_lads: [
    {
      mintAddress: '6DRngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSN',
      name: 'Mad Lad #3456',
      image: 'https://madlads.s3.us-west-2.amazonaws.com/images/1.png',
      price: 89.2,
      listStatus: 'listed',
      collection: 'mad_lads',
      attributes: [
        { trait_type: 'Hat', value: 'Beanie' },
        { trait_type: 'Eyes', value: 'Sunglasses' }
      ]
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    console.log(`🔍 API Route: Fetching NFTs for collection: ${symbol}`);
    
    // Try Magic Eden API first
    const response = await fetch(
      `${MAGIC_EDEN_BASE_URL}/collections/${symbol}/listings?offset=${offset}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NFT-Marketplace/1.0)',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Magic Eden API returned ${data?.length || 0} NFTs for ${symbol}`);
      
      if (data && data.length > 0) {
        return NextResponse.json(data);
      }
    } else {
      console.log(`⚠️ Magic Eden API returned status: ${response.status} for ${symbol}`);
    }
  } catch (error: any) {
    console.error(`❌ Magic Eden API error for ${symbol}:`, error.message);
  }

  // Fallback to mock data
  console.log(`🔄 Using fallback NFT data for collection: ${symbol}`);
  const fallbackNFTs = FALLBACK_NFTS[symbol] || [];
  const paginatedFallback = fallbackNFTs.slice(offset, offset + limit);
  
  return NextResponse.json(paginatedFallback);
}