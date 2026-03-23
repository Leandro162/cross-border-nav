import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, addCategory } from '@/lib/storage';

// GET /api/categories - 获取所有分类
export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories - 添加新分类
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon, description } = body;

    if (!name || !icon) {
      return NextResponse.json(
        { error: '名称和图标为必填项' },
        { status: 400 }
      );
    }

    const newCategory = await addCategory({
      name,
      icon,
      description: description || '',
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
