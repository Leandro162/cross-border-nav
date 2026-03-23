// 网站链接类型
export interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  icon: string;
  image: string;  // 网站预览图/缩略图
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 预设分类
export const CATEGORIES: Category[] = [
  { id: 'browser', name: '浏览器', icon: '🌐', description: '跨境专用浏览器工具' },
  { id: 'tools', name: '跨境工具', icon: '🔧', description: '实用跨境运营工具' },
  { id: 'ad-network', name: '广告联盟', icon: '📢', description: '国际广告联盟平台' },
  { id: 'payment', name: '支付工具', icon: '💳', description: '跨境支付解决方案' },
  { id: 'payment-channel', name: '支付通道', icon: '💰', description: '国际支付通道' },
  { id: 'other', name: '其他资源', icon: '📦', description: '其他跨境相关资源' },
];
