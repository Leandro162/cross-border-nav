import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool.model';
import { ApiResponse } from '@/types/api';

interface ReorderItem {
  id: string;
  order: number;
}

// POST /api/reorder - Update order of tools
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { items }: { items: ReorderItem[] } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update each tool's order
    const updatePromises = items.map(({ id, order }) =>
      Tool.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

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
