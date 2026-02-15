# 安装指南

## 环境要求

在开始安装 Wocon 项目之前，请确保您的系统满足以下要求：

- **Node.js**：v16.0 或更高版本
- **npm**：v7.0 或更高版本
- **Git**：最新版本
- **开发工具**：
  - VS Code
  - Trae (AI 辅助开发工具)
  - GitHub Desktop (可选)
  - TablePlus (数据库管理工具)

## 项目安装

### 1. 克隆仓库

使用 Git 克隆 Wocon 项目仓库：

```bash
git clone https://github.com/wocon-org/wocon_pages.git
cd wocon_pages
```

### 2. 安装依赖

使用 npm 安装项目依赖：

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件并配置以下环境变量：

```env
# Supabase 配置
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# 其他配置
VITE_APP_TITLE=Wocon
VITE_APP_VERSION=1.0.0
```

### 4. 启动开发服务器

启动本地开发服务器：

```bash
npm run dev
```

服务器启动后，您可以通过以下地址访问应用：
- **本地地址**：http://localhost:5173
- **网络地址**：http://your-local-ip:5173

## 构建生产版本

当您准备好部署应用时，运行以下命令构建生产版本：

```bash
npm run build
```

构建完成后，生产文件将生成在 `dist` 目录中。

## 部署到 Cloudflare Pages

### 1. 准备 GitHub 仓库

确保您的代码已推送到 GitHub 仓库。

### 2. 配置 Cloudflare Pages

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com)
2. 导航到 **Pages** 部分
3. 点击 **创建项目**
4. 选择您的 GitHub 仓库
5. 配置构建设置：
   - **构建命令**：`npm run build`
   - **构建输出目录**：`dist`
   - **环境变量**：添加您的 Supabase 配置

### 3. 部署

点击 **部署** 按钮，Cloudflare Pages 将自动构建并部署您的应用。

## 数据库配置 (Supabase)

### 1. 创建 Supabase 项目

1. 登录 [Supabase 控制台](https://app.supabase.com)
2. 创建一个新的 Supabase 项目
3. 记录项目的 URL 和匿名密钥

### 2. 数据库表结构

Wocon 项目需要以下数据库表：

- **profiles**：用户信息
- **trips**：旅行行程
- **map_markers**：地图标记
- **cities**：城市数据
- **connections**：用户连接

### 3. 导入示例数据

您可以使用 TablePlus 连接到 Supabase 数据库并导入示例数据。

## 常见问题

### 依赖安装失败

如果遇到依赖安装失败，请尝试：

```bash
npm cache clean --force
npm install
```

### 开发服务器启动失败

确保端口 5173 未被其他进程占用，或使用其他端口：

```bash
npm run dev -- --port 3000
```

### Supabase 连接问题

检查 `.env` 文件中的 Supabase 配置是否正确，确保网络连接正常。

## 技术支持

如果您在安装过程中遇到问题，请参考：
- [Vue 官方文档](https://vuejs.org/guide/introduction.html)
- [Vite 官方文档](https://vitejs.dev/guide/)
- [Supabase 官方文档](https://supabase.com/docs)
- [Leaflet.js 官方文档](https://leafletjs.com/reference.html)