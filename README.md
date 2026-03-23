# 跨境工具导航站

一个现代化的跨境工具和资源导航网站，支持分类管理、自动获取网站信息等功能。

## 功能特点

- 自动获取网站标题、描述、图标和预览图
- 分类管理（增删改查）
- 标签系统
- 搜索功能
- 玻璃态设计风格
- 响应式布局
- 数据库存储（Supabase）

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL 数据库)
- Cheerio (网页解析)

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/cross-border-nav.git
cd cross-border-nav
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase 数据库

#### 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project" 创建新项目
4. 等待项目创建完成（约2分钟）

#### 获取数据库凭证

1. 进入项目 → 点击左侧 "Settings" → "API"
2. 复制以下信息：
   - Project URL
   - anon/public key

#### 创建数据库表

1. 进入项目 → 点击左侧 "SQL Editor"
2. 点击 "New Query"
3. 复制 `supabase/init.sql` 文件内容
4. 粘贴到编辑器并点击 "Run" 执行

#### 配置环境变量

1. 复制 `.env.local.example` 为 `.env.local`
2. 填入你的 Supabase 凭证：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入项目
4. 在 Vercel 项目设置中添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 点击 Deploy

### 其他平台

支持所有 Next.js 兼容的平台：Netlify、Railway、Render 等

## 项目结构

```
cross-border-nav/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── categories/    # 分类管理 API
│   │   ├── links/         # 链接管理 API
│   │   └── fetch-meta/    # 网站信息获取 API
│   ├── admin/             # 管理后台页面
│   ├── page.tsx           # 首页
│   └── layout.tsx         # 根布局
├── lib/                   # 工具函数
│   ├── db.ts              # 数据库操作
│   ├── supabase.ts        # Supabase 客户端
│   ├── storage.ts         # 文件存储（已弃用）
│   └── types.ts           # TypeScript 类型
├── supabase/
│   └── init.sql           # 数据库初始化脚本
└── public/                # 静态资源
```

## 常见问题

### 如何备份数据？

Supabase 自动备份数据，你也可以在 Supabase 控制台手动导出。

### 如何迁移现有数据？

如果你之前使用 JSON 文件存储，可以将数据导入到数据库。请联系我获取迁移脚本。

### 数据库有费用吗？

Supabase 免费套餐包含：
- 500MB 数据库存储
- 1GB 文件存储
- 50GB 带宽/月
- 2个并发项目

对于个人项目完全够用。

## License

MIT
