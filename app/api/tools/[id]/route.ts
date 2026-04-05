import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';

// PUT /api/tools/[id] - Update a tool
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build update object only with provided fields
    const updateData: any = {
      name: body.name,
      description: body.description,
      url: body.url,
      has_deal: body.hasDeal,
    };

    // Only update logo_url if explicitly provided (not undefined or empty string)
    if (body.logoUrl !== undefined && body.logoUrl !== '') {
      updateData.logo_url = body.logoUrl;
    }

    // Handle deal_count separately
    if (body.dealCount !== undefined) {
      updateData.deal_count = body.dealCount;
    }

    const { data: tool, error } = await supabase
      .from('tools')
      .update(updateData)
      .eq('id', id)
      .select('*, categories(*)')
      .single();

    if (error) throw error;

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
    const { id } = await params;

    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) throw error;

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
