-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建工具表
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    logo_url TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    order_num INTEGER DEFAULT 0,
    has_deal BOOLEAN DEFAULT false,
    deal_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_order ON tools(order_num);
CREATE INDEX IF NOT EXISTS idx_tools_name_trgm ON tools USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tools_description_trgm ON tools USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_num);

-- 启用全文搜索（如果未安装 pg_trgm 扩展，这行会被忽略但不会报错）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 categories 表添加更新触发器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为 tools 表添加更新触发器
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 开启 RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（开发阶段，生产环境需要更严格的策略）
DROP POLICY IF EXISTS "Enable all access for categories" ON categories;
CREATE POLICY "Enable all access for categories" ON categories
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for tools" ON tools;
CREATE POLICY "Enable all access for tools" ON tools
    FOR ALL USING (true) WITH CHECK (true);

-- 插入示例分类
INSERT INTO categories (name, slug, order_num) VALUES
    ('选品工具', 'product-research', 0),
    ('营销推广', 'marketing', 1),
    ('物流仓储', 'logistics', 2),
    ('支付收款', 'payment', 3),
    ('建站工具', 'website-builder', 4)
ON CONFLICT (slug) DO NOTHING;

-- 插入示例工具
INSERT INTO tools (name, description, url, logo_url, category_id, order_num) VALUES
    ('Jungle Scout', '亚马逊选品工具，帮助卖家找到热销产品', 'https://www.junglescout.com', NULL, (SELECT id FROM categories WHERE slug = 'product-research' LIMIT 1), 0),
    ('Helium 10', '全方位亚马逊卖家工具套件', 'https://www.helium10.com', NULL, (SELECT id FROM categories WHERE slug = 'product-research' LIMIT 1), 1),
    ('Shopify', '全球领先的电商平台建站工具', 'https://www.shopify.com', NULL, (SELECT id FROM categories WHERE slug = 'website-builder' LIMIT 1), 0)
ON CONFLICT DO NOTHING;
