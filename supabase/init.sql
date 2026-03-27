-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建链接表
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image TEXT,
  category TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);

-- 插入默认分类
INSERT INTO categories (id, name, icon, description, sort_order) VALUES
  ('browser', '浏览器', '🌐', '跨境专用浏览器工具', 0),
  ('tools', '跨境工具', '🔧', '实用跨境运营工具', 1),
  ('ad-network', '广告联盟', '📢', '国际广告联盟平台', 2),
  ('payment', '支付工具', '💳', '跨境支付解决方案', 3),
  ('payment-channel', '支付通道', '💰', '国际支付通道', 4),
  ('other', '其他资源', '📦', '其他跨境相关资源', 5)
ON CONFLICT (id) DO NOTHING;

-- 启用 RLS (可选，用于权限控制)
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE links ENABLE ROW LEVEL SECURITY;
--
-- 允许所有操作（开发环境）
-- CREATE POLICY "Allow all access" ON categories FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all access" ON links FOR ALL USING (true) WITH CHECK (true);
