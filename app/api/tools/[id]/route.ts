import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool.model';
import { ApiResponse } from '@/types/api';
import { UpdateToolInput } from '@/types/tool';

// PUT /api/tools/[id] - Update a tool
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body: UpdateToolInput = await request.json();

    const tool = await Tool.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('categoryId');

    if (!tool) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: tool,
    });
  } catch (error: any) {
    console.error('Error updating tool:', error);
    return NextResponse.json<ApiResponse<any>>(
      { success: false, error: error.message || 'Failed to update tool' },
      { status: 500 }
    );
  }
}

// DELETE /api/tools/[id] - Delete a tool
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const tool = await Tool.findByIdAndDelete(id);

    if (!tool) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: 'Tool deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting tool:', error);
    return NextResponse.json<ApiResponse<any>>(
      { success: false, error: error.message || 'Failed to delete tool' },
      { status: 500 }
    );
  }
}
