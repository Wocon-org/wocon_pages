# 城市数据导入指南

## 📋 方法选择

### 方法 A: 分批导入 (推荐 - 使用 API)
适合: 没有数据库直接访问权限,通过 Supabase Web UI 操作

**优点:**
- 不需要数据库访问权限
- 可以监控进度
- 安全可靠

**缺点:**
- 速度较慢(每秒约 500-1000 条)
- 需要 .env 配置

---

### 方法 B: SQL 文件分块导入
适合: 有 SQL Editor 访问权限,一次性导入

**优点:**
- 速度中等
- 通过 Supabase Dashboard 操作

**缺点:**
- 需要手动运行多个 SQL 文件
- 大文件可能超时

---

### 方法 C: 直接 psql 导入
适合: 有数据库连接权限

**优点:**
- 速度最快
- 完全自动化

**缺点:**
- 需要数据库连接权限
- 需要安装 PostgreSQL 客户端

---

## 🚀 推荐方法: 分批导入

### 步骤 1: 创建数据库表

在 Supabase SQL Editor 中运行:
```bash
supabase/create_cities_table.sql
```

### 步骤 2: 安装依赖

```bash
npm install dotenv @supabase/supabase-js
```

### 步骤 3: 运行导入脚本

```bash
cd scripts
node import-cities.js
```

**预计时间:** 约 20-30 分钟 (根据网络情况)

---

## 📁 方法 B: SQL 文件导入

### 步骤 1: 生成 SQL 分块文件

```bash
cd scripts
node split-cities.js
```

这会生成 `cities_chunks/` 目录,包含多个 SQL 文件:
- chunk_1.sql (前 10,000 条记录)
- chunk_2.sql (10,001-20,000 条记录)
- ...

### 步骤 2: 导入 SQL 文件

在 Supabase SQL Editor 中依次运行:
```sql
-- 先运行 create_cities_table.sql
\i cities_chunks/chunk_1.sql
\i cities_chunks/chunk_2.sql
...
```

**注意:** 
- 每个文件大约 1-2MB
- 按 chunk_1, chunk_2... 顺序导入
- 遇到错误可以跳过单个 chunk

---

## 📁 方法 C: psql 直接导入

### 步骤 1: 转换为 CSV 格式

```bash
# 使用 sed/awk 转换
sed 's/\t/,/g' cities500.txt > cities500.csv
```

### 步骤 2: 通过 psql 导入

```bash
# 从 Supabase Dashboard 获取连接信息
psql -h db.xxx.supabase.co -U postgres -d postgres -c "\copy cities FROM 'cities500.csv' DELIMITER ',' CSV HEADER"
```

---

## 🔍 验证导入

导入完成后,运行以下 SQL 验证:

```sql
-- 检查记录数
SELECT COUNT(*) FROM cities;

-- 检查一些城市
SELECT * FROM cities WHERE asciiname ILIKE 'Beijing' LIMIT 5;

-- 测试搜索函数
SELECT * FROM search_cities('shang');
```

---

## ❗ 常见问题

### Q: 导入过程中报错 "Connection timeout"
A: 
- 方法 A: 减小 CHUNK_SIZE (改为 500)
- 方法 B: 分开时间导入,不要连续运行

### Q: "Foreign key constraint failed"
A: 先运行 `create_cities_table.sql` 创建表

### Q: "Permission denied"
A: 
- 确认 .env 文件配置正确
- 使用 SERVICE_ROLE_KEY 而不是 ANON_KEY (需要在 Dashboard 生成)

### Q: 导入速度太慢
A: 
- 方法 A: 增大 CHUNK_SIZE (改为 2000)
- 切换到方法 C (psql 导入)

---

## 📊 数据统计

预计导入后:
- 总记录数: ~5,000,000
- 数据库大小: ~500MB
- 索引大小: ~100MB

---

## 🗑️ 清理数据

如需重新导入,先清理:
```sql
DROP TABLE IF EXISTS public.cities;
DROP FUNCTION IF EXISTS search_cities(TEXT);
```

然后重新运行 `create_cities_table.sql`
