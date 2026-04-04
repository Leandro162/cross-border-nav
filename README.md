# 跨境出海工具导航站

一个参考 [1000.tools](https://1000.tools/) 设计的现代化工具导航站，支持工具管理、分类筛选、搜索功能，以及管理后台的拖拽排序。

## 功能特点

- ✅ 工具展示 - 网格卡片布局展示工具
- ✅ 分类筛选 - 按分类浏览工具
- ✅ 搜索功能 - 搜索工具名称和描述
- ✅ 提交工具 - 用户可提交新工具（自动获取网页元数据）
- ✅ 管理后台 - 拖拽排序、编辑、删除工具
- ✅ 响应式设计 - 适配各种设备
- ✅ 动画效果 - Framer Motion 页面过渡和卡片动画

## 技术栈

- **前端**: Next.js 14 + React + TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **拖拽**: @dnd-kit
- **数据库**: MongoDB (MongoDB Atlas)
- **部署**: Vercel

## 开始使用

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并配置：

```bash
# MongoDB Connection URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crossborder-nav

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

获取免费 MongoDB 数据库：
1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
cross-border-nav/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   ├── admin/                # 管理后台页面
│   ├── submit/               # 提交工具页面
│   └── page.tsx              # 首页
├── components/               # React 组件
│   ├── ui/                   # 基础 UI 组件
│   ├── tool/                 # 工具相关组件
│   ├── category/             # 分类组件
│   ├── admin/                # 管理后台组件
│   └── layout/               # 布局组件
├── lib/                      # 工具库
│   ├── models/               # Mongoose 模型
│   ├── services/             # 服务层
│   └── hooks/                # 自定义 Hooks
└── types/                    # TypeScript 类型定义
```

## API 接口

### 工具管理
- `GET /api/tools` - 获取工具列表（支持分页、筛选、搜索）
- `POST /api/tools` - 创建新工具
- `PUT /api/tools/[id]` - 更新工具
- `DELETE /api/tools/[id]` - 删除工具

### 分类管理
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/[id]` - 更新分类
- `DELETE /api/categories/[id]` - 删除分类

### 其他
- `POST /api/metadata` - 获取网页元数据
- `POST /api/reorder` - 更新工具排序

## 部署到 Vercel

1. 推送代码到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 导入项目
4. 配置环境变量
5. 部署

## License

MIT
