import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/lib/models/Category.model';
import { ApiResponse } from '@/types/api';
import { UpdateCategoryInput } from '@/types/category';

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body: UpdateCategoryInput = await request.json();

    // Generate slug from name if name is being updated and slug is not provided
    if (body.name && !body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: category,
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json<ApiResponse<any>>(
      { success: false, error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Check if category has tools
    const Tool = (await import('@/lib/models/Tool.model')).default;
    const toolCount = await Tool.countDocuments({ categoryId: id });

    if (toolCount > 0) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Cannot delete category with existing tools' },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json<ApiResponse<any>>(
      { success: false, error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
