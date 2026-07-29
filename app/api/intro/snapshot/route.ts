import { NextResponse } from 'next/server';
import { buildIntroMarketSnapshot } from '@/lib/intro-3d/fetch-snapshot';
import { FALLBACK_MARKET_SNAPSHOT } from '@/lib/intro-3d/market-data';

export const revalidate = 300;

export async function GET() {
  try {
    const snapshot = await buildIntroMarketSnapshot();
    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch {
    return NextResponse.json(FALLBACK_MARKET_SNAPSHOT, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
      },
    });
  }
}
