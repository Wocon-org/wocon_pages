# Cloudflare Workers 部署指南

## 概述

本项目使用 Cloudflare Workers 来处理API请求，提供更快的响应速度和更好的性能。

## 项目结构

```
woconapp/
├── worker.ts           # Cloudflare Worker 主入口（单文件架构）
├── functions/           # Worker 函数（保留用于未来扩展）
│   ├── search/         # 搜索功能
│   ├── trips/          # 行程管理
│   └── shared/         # 共享工具
├── wrangler.toml      # Cloudflare 配置
└── src/lib/api.ts     # 前端 API 客户端
```

## 架构说明

当前使用 **单文件Worker架构** (`worker.ts`)，所有路由集中在一个文件中，便于部署和管理。

未来可扩展为多文件架构，使用 `functions/` 目录中的模块化代码。

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 配置环境变量

在 `wrangler.toml` 中已配置：

```toml
[vars]
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your-anon-key"
```

或者使用 secrets（更安全，推荐用于生产环境）：

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
```

### 4. 本地测试

```bash
# 启动本地开发服务器
wrangler dev

# 测试 API
curl http://localhost:8787/api/search/cities?q=Tokyo

# 测试健康检查
curl http://localhost:8787/health
```

### 5. 部署到 Cloudflare

```bash
# 部署 Worker
wrangler deploy

# 部署后你会得到一个 URL，例如：
# https://woconworker.your-subdomain.workers.dev
```

## API 端点

### 搜索城市

**请求:**
```
GET /api/search/cities?q=Tokyo
```

**响应:**
```json
{
  "success": true,
  "query": "Tokyo",
  "count": 10,
  "results": [
    {
      "id": "city-1850147",
      "type": "destination",
      "title": "Tokyo",
      "subtitle": "JP • Population: 37,435,191",
      "lat": 35.6895,
      "lng": 139.6917,
      "population": 37435191
    }
  ]
}
```

### 搜索行程

**请求:**
```
GET /api/search/trips?q=Summer
```

**响应:**
```json
{
  "success": true,
  "query": "Summer",
  "count": 5,
  "results": []
}
```

## 前端配置

在 `.env` 文件中配置 API 基础 URL：

```env
# 使用 Cloudflare Workers API
VITE_API_BASE_URL=https://your-worker.your-subdomain.workers.dev

# 或使用相对路径（开发环境）
VITE_API_BASE_URL=/api
```

## 性能优化

1. **缓存策略**: Workers 自动缓存响应
2. **边缘计算**: 全球边缘节点部署
3. **CORS 配置**: 支持跨域请求

## 监控和日志

在 Cloudflare Dashboard 中查看：

- Workers Analytics: 请求统计
- Workers Logs: 实时日志
- R2 Storage: 存储使用情况

## 故障排查

### 1. 部署失败

检查 `wrangler.toml` 配置是否正确，确保环境变量已设置。

### 2. API 返回 404

检查路由配置，确保路径正确。

### 3. CORS 错误

检查 Worker 中的 CORS headers 配置。

## 下一步

- [ ] 添加用户认证
- [ ] 实现行程 CRUD 操作
- [ ] 添加文件上传功能
- [ ] 集成 R2 Storage
- [ ] 添加实时推送

## 相关文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Supabase 文档](https://supabase.com/docs)
