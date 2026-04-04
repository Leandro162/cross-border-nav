import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Generate slug from name if name is being updated and slug is not provided
    if (body.name && !body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update({
        name: body.name,
        slug: body.slug,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

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
    const { id } = await params;

    // Check if category has tools
    const { data: tools, error: countError } = await supabase
      .from('tools')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) throw countError;

    if (tools && tools.length > 0) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Cannot delete category with existing tools' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

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
