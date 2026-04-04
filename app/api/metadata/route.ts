import { NextRequest, NextResponse } from 'next/server';
import { fetchMetadata } from '@/lib/services/metadata';
import { ApiResponse, MetadataResponse } from '@/types/api';

// POST /api/metadata - Fetch metadata for a URL
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json<ApiResponse<MetadataResponse>>(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const metadata = await fetchMetadata(url);

    return NextResponse.json<ApiResponse<MetadataResponse>>({
      success: true,
      data: metadata,
    });
  } catch (error: any) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json<ApiResponse<MetadataResponse>>(
      { success: false, error: error.message || 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
