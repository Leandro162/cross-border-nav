import { supabase, isSupabaseConfigured } from './supabase';
import { LinkItem, Category } from './types';

// 辅助函数：获取 supabase 客户端（带类型安全）
function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  return supabase;
}

// ==================== 分类管理 ====================

// 默认分类数据
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'browser', name: '浏览器', icon: '🌐', description: '跨境专用浏览器工具', sortOrder: 0 },
  { id: 'tools', name: '跨境工具', icon: '🔧', description: '实用跨境运营工具', sortOrder: 1 },
  { id: 'ad-network', name: '广告联盟', icon: '📢', description: '国际广告联盟平台', sortOrder: 2 },
  { id: 'payment', name: '支付工具', icon: '💳', description: '跨境支付解决方案', sortOrder: 3 },
  { id: 'payment-channel', name: '支付通道', icon: '💰', description: '国际支付通道', sortOrder: 4 },
  { id: 'other', name: '其他资源', icon: '📦', description: '其他跨境相关资源', sortOrder: 5 },
];

// 初始化默认分类
export async function initDefaultCategories() {
  if (!isSupabaseConfigured()) return;

  const { data: existing } = await getSupabase()
    .from('categories')
    .select('id');

  if (!existing || existing.length === 0) {
    await getSupabase().from('categories').insert(DEFAULT_CATEGORIES);
  }
}

// 获取所有分类
export async function getAllCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_CATEGORIES;
  }

  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  // 转换字段名
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
    description: item.description || '',
    sortOrder: item.sort_order || 0,
  }));
}

// 获取单个分类
export async function getCategoryById(id: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_CATEGORIES.find(c => c.id === id) || null;
  }

  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return {
    id: data.id,
    name: data.name,
    icon: data.icon,
    description: data.description || '',
    sortOrder: data.sort_order || 0,
  };
}

// 添加分类
export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // 获取当前最大的 sort_order
  const { data: existing } = await getSupabase()
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = existing && existing.length > 0 ? (existing[0].sort_order || 0) + 1 : 0;

  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const { data, error } = await getSupabase()
    .from('categories')
    .insert({
      id,
      name: category.name,
      icon: category.icon,
      description: category.description,
      sort_order: category.sortOrder ?? nextSortOrder,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    icon: data.icon,
    description: data.description || '',
    sortOrder: data.sort_order || 0,
  };
}

// 更新分类
export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

  const { data, error } = await getSupabase()
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;

  return {
    id: data.id,
    name: data.name,
    icon: data.icon,
    description: data.description || '',
    sortOrder: data.sort_order || 0,
  };
}

// 删除分类
export async function deleteCategory(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // 检查是否有链接使用此分类
  const { data: links } = await getSupabase()
    .from('links')
    .select('id')
    .eq('category', id);

  if (links && links.length > 0) {
    throw new Error('该分类下还有链接，无法删除');
  }

  const { error } = await getSupabase()
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) return false;
  return true;
}

// 批量更新分类排序
export async function reorderCategories(categories: { id: string; sortOrder: number }[]): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // 批量更新
  const updates = categories.map(({ id, sortOrder }) =>
    supabase
      .from('categories')
      .update({ sort_order: sortOrder })
      .eq('id', id)
  );

  try {
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error reordering categories:', error);
    return false;
  }
}

// ==================== 链接管理 ====================

// 获取所有链接
export async function getAllLinks(): Promise<LinkItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await getSupabase()
    .from('links')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // 转换字段名
  return (data || []).map(item => ({
    id: item.id,
    url: item.url,
    title: item.title,
    description: item.description || '',
    icon: item.icon || '',
    image: item.image || '',
    category: item.category,
    tags: item.tags || [],
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

// 获取指定分类的链接
export async function getLinksByCategory(category: string): Promise<LinkItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await getSupabase()
    .from('links')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    url: item.url,
    title: item.title,
    description: item.description || '',
    icon: item.icon || '',
    image: item.image || '',
    category: item.category,
    tags: item.tags || [],
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

// 添加链接
export async function addLink(link: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<LinkItem> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const id = Date.now().toString();
  const now = new Date().toISOString();

  const { data, error } = await getSupabase()
    .from('links')
    .insert({
      id,
      url: link.url,
      title: link.title,
      description: link.description,
      icon: link.icon,
      image: link.image,
      category: link.category,
      tags: link.tags,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    url: data.url,
    title: data.title,
    description: data.description || '',
    icon: data.icon || '',
    image: data.image || '',
    category: data.category,
    tags: data.tags || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// 更新链接
export async function updateLink(id: string, updates: Partial<LinkItem>): Promise<LinkItem | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.url !== undefined) updateData.url = updates.url;
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.image !== undefined) updateData.image = updates.image;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.tags !== undefined) updateData.tags = updates.tags;

  const { data, error } = await getSupabase()
    .from('links')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;

  return {
    id: data.id,
    url: data.url,
    title: data.title,
    description: data.description || '',
    icon: data.icon || '',
    image: data.image || '',
    category: data.category,
    tags: data.tags || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// 删除链接
export async function deleteLink(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { error } = await getSupabase()
    .from('links')
    .delete()
    .eq('id', id);

  if (error) return false;
  return true;
}
