import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';

// POST /api/reorder-categories - Update order of categories
export async function POST(request: NextRequest) {
  try {
    const { items }: { items: { id: string; order: number }[] } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update each category's order
    for (const { id, order } of items) {
      const { error } = await supabase
        .from('categories')
        .update({ order_num: order })
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: 'Categories reordered successfully',
    });
  } catch (error: any) {
    console.error('Error reordering categories:', error);
    return NextResponse.json<ApiResponse<any>>(
      { success: false, error: error.message || 'Failed to reorder categories' },
      { status: 500 }
    );
  }
}
