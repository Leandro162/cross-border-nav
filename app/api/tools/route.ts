import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Tool from '@/lib/models/Tool.model';
import { ApiResponse, PaginationResponse } from '@/types/api';
import { CreateToolInput } from '@/types/tool';
import { fetchMetadata } from '@/lib/services/metadata';

// GET /api/tools - Get all tools with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};

    if (category && category !== 'all') {
      query.categoryId = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tools, total] = await Promise.all([
      Tool.find(query)
        .populate('categoryId')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tool.countDocuments(query),
    ]);

    return NextResponse.json<PaginationResponse<any>>({
      success: true,
      data: tools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json<PaginationResponse<any>>(
      { success: false, error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// POST /api/tools - Create a new tool
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: CreateToolInput = await request.json();

    // Validate required fields
    if (!body.name || !body.url || !body.categoryId) {
      return NextResponse.json<ApiResponse<any>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Auto-fetch metadata if description is not provided
    let description = body.description;
    let logoUrl = body.logoUrl;

    if (!description || !logoUrl) {
      try {
        const metadata = await fetchMetadata(body.url);
        if (!description) {
          description = metadata.title || metadata.description || '';
        }
        if (!logoUrl) {
          logoUrl = metadata.logo || metadata.image || '';
        }
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    }

    const tool = await Tool.create({
      name: body.name,
      description: description || body.name,
      url: body.url,
      logoUrl,
      categoryId: body.categoryId,
      hasDeal: body.hasDeal || false,
      dealCount: body.dealCount,
    });

    const populatedTool = await Tool.findById(tool._id).populate('categoryId');

    return NextResponse.json<ApiResponse<any>>(
      { success: true, data: populatedTool },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating tool:', error);
    return NextResponse.json<ApiResponse<any>>(
      { success: false, error: error.message || 'Failed to create tool' },
      { status: 500 }
    );
  }
}
