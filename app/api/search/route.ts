import { NextRequest, NextResponse } from 'next/server';
import { searchBlocks } from '@/lib/content';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || '';
  
  if (!query.trim()) {
    return NextResponse.json({ blocks: [] });
  }

  const blocks = searchBlocks(query);
  
  return NextResponse.json({ blocks });
}
