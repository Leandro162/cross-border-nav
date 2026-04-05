import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_num', { ascending: true });

    if (error) throw error;

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json<ApiResponse<any>>(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate slug from name if not provided
    let slug = body.slug;
    if (!slug) {
      slug = body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug already exists and make it unique
    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', uniqueSlug)
        .single();

      if (!existing) break;

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Get the current max order
    const { data: maxOrderData } = await supabase
      .from('categories')
      .select('order_num')
      .order('order_num', { ascending: false })
      .limit(1);

    const nextOrder = ((maxOrderData && maxOrderData[0]?.order_num) ?? -1) + 1;

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: body.name,
        slug: uniqueSlug,
        order_num: body.order ?? nextOrder,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<any>>(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json<ApiResponse<any>>(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
