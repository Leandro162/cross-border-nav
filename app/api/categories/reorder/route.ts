import { NextRequest, NextResponse } from 'next/server';
import { reorderCategories } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

// POST /api/categories/reorder - 批量更新分类排序
export async function POST(request: NextRequest) {
  // 检查认证
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { categories } = body;

    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: '无效的请求格式' }, { status: 400 });
    }

    const success = await reorderCategories(categories);

    if (!success) {
      return NextResponse.json({ error: '排序更新失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering categories:', error);
    return NextResponse.json({ error: '排序更新失败' }, { status: 500 });
  }
}
