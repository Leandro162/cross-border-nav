import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, PaginationResponse } from '@/types/api';
import { fetchMetadata } from '@/lib/services/metadata';

// GET /api/tools - Get all tools with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('tools')
      .select('*, categories(*)', { count: 'exact' });

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('order_num', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: tools, error, count } = await query;

    if (error) throw error;

    const total = count || 0;

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
    const body = await request.json();

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

    // Get the current max order for this category
    const { data: maxOrderData } = await supabase
      .from('tools')
      .select('order_num')
      .eq('category_id', body.categoryId)
      .order('order_num', { ascending: false })
      .limit(1);

    const nextOrder = ((maxOrderData && maxOrderData[0]?.order_num) ?? -1) + 1;

    const { data: tool, error } = await supabase
      .from('tools')
      .insert({
        name: body.name,
        description: description || body.name,
        url: body.url,
        logo_url: logoUrl,
        category_id: body.categoryId,
        has_deal: body.hasDeal || false,
        deal_count: body.dealCount,
        order_num: nextOrder,
      })
      .select('*, categories(*)')
      .single();

    if (error) throw error;

    return NextResponse.json<ApiResponse<any>>(
      { success: true, data: tool },
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
