# Cloudflare Workers Functions

这个目录存放所有的Cloudflare Worker函数，用于处理API请求和服务端逻辑。

## 目录结构

```
functions/
├── README.md                 # 本文件
├── search/                   # 搜索相关功能
│   ├── index.ts             # 搜索入口
│   └── cities.ts            # 城市搜索
├── trips/                   # 行程相关功能
│   ├── index.ts
│   ├── create.ts            # 创建行程
│   └── list.ts              # 行程列表
└── shared/                  # 共享工具函数
    └── supabase.ts          # Supabase客户端
```

## 函数列表

### Search Functions
- `cities` - 城市搜索，使用GeoNames数据库

### Trip Functions
- `create` - 创建新行程
- `list` - 获取行程列表
- `update` - 更新行程信息
- `delete` - 删除行程

### User Functions
- `profile` - 用户资料管理
- `connections` - 联系人管理

## 部署

使用Wrangler部署单个函数：

```bash
npx wrangler deploy functions/search
```

部署所有函数：

```bash
npx wrangler deploy
```

## 环境变量

确保在`wrangler.toml`中配置了必要的环境变量：

```toml
[vars]
SUPABASE_URL = "your-supabase-url"
SUPABASE_ANON_KEY = "your-supabase-anon-key"
```
