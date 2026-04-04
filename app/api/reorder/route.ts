import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, MetadataResponse } from '@/types/api';
import { fetchMetadata } from '@/lib/services/metadata';

// POST /api/reorder - Update order of tools
export async function POST(request: NextRequest) {
  try {
    const { items }: { items: { id: string; order: number }[] } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update each tool's order
    for (const { id, order } of items) {
      const { error } = await supabase
        .from('tools')
        .update({ order_num: order })
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: 'Tools reordered successfully',
    });
  } catch (error: any) {
    console.error('Error reordering tools:', error);
    return NextResponse.json<ApiResponse<any>>(
      { success: false, error: error.message || 'Failed to reorder tools' },
      { status: 500 }
    );
  }
}
