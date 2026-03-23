import { NextRequest, NextResponse } from 'next/server';
import { updateLink, deleteLink, getAllLinks } from '@/lib/storage';

// PUT /api/links/[id] - 更新链接
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedLink = await updateLink(id, body);

    if (!updatedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

// DELETE /api/links/[id] - 删除链接
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteLink(id);

    if (!success) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
