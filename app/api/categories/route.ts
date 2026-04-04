import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/lib/models/Category.model';
import { ApiResponse } from '@/types/api';
import { CreateCategoryInput } from '@/types/category';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({})
      .sort({ order: 1, name: 1 })
      .lean();

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
    await connectDB();

    const body: CreateCategoryInput = await request.json();

    // Generate slug from name if not provided
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug already exists
    const existing = await Category.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Set order if not provided
    if (!body.order) {
      const count = await Category.countDocuments();
      body.order = count;
    }

    const category = await Category.create(body);

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
