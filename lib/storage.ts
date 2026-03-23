import fs from 'fs/promises';
import path from 'path';
import { LinkItem, Category } from './types';

const DATA_FILE = path.join(process.cwd(), 'public/data/links.json');
const CATEGORIES_FILE = path.join(process.cwd(), 'public/data/categories.json');

// 确保数据文件存在
export async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
}

// 读取所有链接
export async function getAllLinks(): Promise<LinkItem[]> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data || '[]');
}

// 获取指定分类的链接
export async function getLinksByCategory(category: string): Promise<LinkItem[]> {
  const links = await getAllLinks();
  return links.filter(link => link.category === category);
}

// 添加链接
export async function addLink(link: Omit<LinkItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<LinkItem> {
  await ensureDataFile();
  const links = await getAllLinks();

  const newLink: LinkItem = {
    ...link,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  links.push(newLink);
  await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
  return newLink;
}

// 更新链接
export async function updateLink(id: string, updates: Partial<LinkItem>): Promise<LinkItem | null> {
  await ensureDataFile();
  const links = await getAllLinks();
  const index = links.findIndex(link => link.id === id);

  if (index === -1) return null;

  links[index] = {
    ...links[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
  return links[index];
}

// 删除链接
export async function deleteLink(id: string): Promise<boolean> {
  await ensureDataFile();
  const links = await getAllLinks();
  const filteredLinks = links.filter(link => link.id !== id);

  if (filteredLinks.length === links.length) return false;

  await fs.writeFile(DATA_FILE, JSON.stringify(filteredLinks, null, 2));
  return true;
}

// ==================== 分类管理 ====================

// 默认分类数据
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'browser', name: '浏览器', icon: '🌐', description: '跨境专用浏览器工具' },
  { id: 'tools', name: '跨境工具', icon: '🔧', description: '实用跨境运营工具' },
  { id: 'ad-network', name: '广告联盟', icon: '📢', description: '国际广告联盟平台' },
  { id: 'payment', name: '支付工具', icon: '💳', description: '跨境支付解决方案' },
  { id: 'payment-channel', name: '支付通道', icon: '💰', description: '国际支付通道' },
  { id: 'other', name: '其他资源', icon: '📦', description: '其他跨境相关资源' },
];

// 确保分类数据文件存在
export async function ensureCategoriesFile() {
  try {
    await fs.access(CATEGORIES_FILE);
  } catch {
    await fs.mkdir(path.dirname(CATEGORIES_FILE), { recursive: true });
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(DEFAULT_CATEGORIES, null, 2));
  }
}

// 读取所有分类
export async function getAllCategories(): Promise<Category[]> {
  await ensureCategoriesFile();
  const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
  return JSON.parse(data || '[]');
}

// 获取单个分类
export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getAllCategories();
  return categories.find(cat => cat.id === id) || null;
}

// 添加分类
export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  await ensureCategoriesFile();
  const categories = await getAllCategories();

  // 生成唯一 ID
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const newCategory: Category = {
    ...category,
    id,
  };

  categories.push(newCategory);
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
  return newCategory;
}

// 更新分类
export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category | null> {
  await ensureCategoriesFile();
  const categories = await getAllCategories();
  const index = categories.findIndex(cat => cat.id === id);

  if (index === -1) return null;

  categories[index] = {
    ...categories[index],
    ...updates,
  };

  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
  return categories[index];
}

// 删除分类
export async function deleteCategory(id: string): Promise<boolean> {
  await ensureCategoriesFile();
  const categories = await getAllCategories();

  // 检查是否有链接使用此分类
  const links = await getAllLinks();
  const hasLinksInCategory = links.some(link => link.category === id);
  if (hasLinksInCategory) {
    throw new Error('该分类下还有链接，无法删除');
  }

  const filteredCategories = categories.filter(cat => cat.id !== id);
  if (filteredCategories.length === categories.length) return false;

  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(filteredCategories, null, 2));
  return true;
}
