import { NextRequest, NextResponse } from 'next/server';
import { getAllLinks, addLink } from '@/lib/storage';

// GET /api/links - 获取所有链接
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const links = await getAllLinks();

    if (category) {
      return NextResponse.json(links.filter(link => link.category === category));
    }

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

// POST /api/links - 添加新链接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, description, icon, image, category, tags } = body;

    if (!url || !title || !category) {
      return NextResponse.json(
        { error: 'URL, title, and category are required' },
        { status: 400 }
      );
    }

    const newLink = await addLink({
      url,
      title,
      description: description || '',
      icon: icon || '',
      image: image || '',
      category,
      tags: tags || [],
    });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error('Error adding link:', error);
    return NextResponse.json({ error: 'Failed to add link' }, { status: 500 });
  }
}
