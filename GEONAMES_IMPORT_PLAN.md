# GeoNames 数据上传到 Supabase 计划

## 概述
将 GeoNames 的城市数据(cities500.txt)导入到 Supabase 数据库,用于应用中的目的地搜索和地图标记。

---

## 1. 前期准备

### 1.1 数据文件
- **源文件**: `cities500.txt` (项目根目录)
- **数据量**: ~200,000+条记录
- **文件大小**: ~38.5MB
- **格式**: Tab分隔的CSV
- **字段**: 19个字段(geonameid, name, asciiname, latitude, longitude, population等)
- **说明**: 文件名中的"500"指人口数量>500的城市

### 1.2 Supabase环境
- 已创建 `geonames_import.sql` 表结构
- 已创建 `create_cities_table.sql` 完整表+索引+搜索函数
- 已有 `import-cities.js` Node.js导入脚本

---

## 2. 上传方法对比

### 方法A: psql命令行导入 (推荐)

**优点**:
- 速度快,批量导入
- 直接操作数据库
- 支持大文件

**步骤**:
```bash
# 1. 连接Supabase
psql -h db.abcdefg.supabase.co -U postgres -d postgres

# 2. 执行创建表和索引的SQL
\i supabase/create_cities_table.sql

# 3. 导入数据
\copy public.cities FROM 'E:/ceaserzhao/woconapp/cities500.txt' DELIMITER E'\t' CSV HEADER NULL ''

# 4. 验证数据
SELECT COUNT(*) FROM public.cities;
SELECT * FROM public.cities LIMIT 5;
```

**时间估算**: ~30-60秒(20万+条记录)

---

### 方法B: Supabase SQL Editor (备用)

**优点**:
- 无需命令行
- 可视化操作

**缺点**:
- 需要手动上传文件到Storage
- 大文件可能超时

**步骤**:
1. 打开 Supabase Dashboard → SQL Editor
2. 执行 `supabase/create_cities_table.sql` 创建表
3. 将 `cities500.txt` 上传到 Storage → `public` bucket
4. 使用以下SQL导入:
```sql
-- 读取Storage文件并导入
INSERT INTO public.cities
SELECT *
FROM read_csv_file('public/cities500.txt', DELIMITER E'\t', HEADER);
```

---

### 方法C: Node.js API导入 (最慢,不推荐)

**优点**:
- 通过API操作,有错误处理
- 支持断点续传

**缺点**:
- 非常慢(20万条需要20-40分钟)
- 可能触发API限流
- 受网络延迟影响大

**已实现**: `scripts/import-cities.js`

**使用方法**:
```bash
# 1. 配置.env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# 2. 安装依赖
npm install @supabase/supabase-js dotenv

# 3. 运行脚本
node scripts/import-cities.js
```

---

## 3. 推荐上传流程

### 方案1: 快速方案(推荐)

**适用场景**: 拥有psql访问权限

**步骤**:
1. 确认Supabase连接信息(project settings → Database)
2. 使用psql执行表创建: `supabase/create_cities_table.sql`
3. 使用psql导入数据: `\copy` 命令
4. 验证导入结果
5. 测试搜索函数

**时间**: 5-15分钟

---

### 方案2: 可视化方案

**适用场景**: 无psql访问,使用Supabase Dashboard

**步骤**:
1. 打开Supabase Dashboard
2. SQL Editor执行 `supabase/create_cities_table.sql`
3. 上传 `cities500.txt` 到 Storage
4. SQL Editor执行导入命令
5. 验证数据

**时间**: 15-30分钟

---

### 方案3: 备用API方案

**适用场景**: 无法使用SQL Editor或psql

**步骤**:
1. 配置 `.env` 文件
2. 运行 `node scripts/import-cities.js`
3. 等待导入完成(可能需要20-40分钟)
4. 验证数据

**时间**: 20-60分钟(取决于网络)

---

## 4. 验证步骤

### 4.1 数据验证
```sql
-- 检查记录数
SELECT COUNT(*) as total_cities FROM public.cities;

-- 检查是否有NULL的必填字段
SELECT COUNT(*) as missing_coords
FROM public.cities
WHERE latitude IS NULL OR longitude IS NULL;

-- 查看样本数据
SELECT * FROM public.cities ORDER BY population DESC LIMIT 10;
```

### 4.2 索引验证
```sql
-- 检查索引是否创建
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'cities';
```

### 4.3 搜索功能测试
```sql
-- 测试搜索函数
SELECT * FROM search_cities('Tokyo');

-- 测试模糊搜索
SELECT * FROM search_cities('New');
```

### 4.4 前端集成测试
```typescript
// 测试Supabase查询
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('cities')
  .select('*')
  .ilike('name', '%tokyo%')
  .limit(5)

console.log('Search results:', data)
```

---

## 5. 文件清单

| 文件 | 用途 | 状态 |
|------|------|------|
| `cities500.txt` | 原始数据 | ✅ 存在 |
| `supabase/create_cities_table.sql` | 表结构+索引+函数 | ✅ 已创建 |
| `supabase/geonames_import.sql` | 基础表结构 | ✅ 已创建 |
| `scripts/import-cities.js` | API导入脚本 | ✅ 已创建 |

---

## 6. 后续工作

### 6.1 数据库优化
- [ ] 创建全文搜索索引
- [ ] 添加PostGIS地理位置扩展
- [ ] 优化查询性能
- [ ] 定期数据更新

### 6.2 前端集成
- [ ] 集成Supabase客户端
- [ ] 实现城市搜索功能
- [ ] 地图标记集成
- [ ] 搜索建议功能

### 6.3 性能监控
- [ ] 监控查询性能
- [ ] 设置慢查询日志
- [ ] 缓存热门搜索结果

---

## 7. 常见问题

### Q1: 导入时出现编码错误
**A**: 确保文件使用UTF-8编码,psql添加 `ENCODING 'UTF8'`

### Q2: 字段不匹配
**A**: 检查 `cities500.txt` 实际分隔符,可能是 `\t` 或 `,`

### Q3: 导入速度太慢
**A**: 使用方法A(psql)替代API导入,速度提升10倍以上

### Q4: 索引未生效
**A**: 执行 `ANALYZE public.cities;` 更新统计信息

---

## 8. 执行检查清单

### 前置检查
- [ ] `cities500.txt` 文件存在
- [ ] Supabase项目已创建
- [ ] 已获取数据库连接信息
- [ ] 选择上传方法(A/B/C)

### 执行步骤
- [ ] 创建 `cities` 表
- [ ] 创建索引
- [ ] 导入数据
- [ ] 验证记录数

### 验证测试
- [ ] 测试搜索函数
- [ ] 测试模糊查询
- [ ] 前端集成测试
- [ ] 性能测试

---

## 9. 联系信息

**遇到问题时**:
- 查看Supabase文档: https://supabase.com/docs/guides/database
- 查看GeoNames文档: https://www.geonames.org/export/
- 检查SQL脚本中的错误信息

---

## 更新日志

- 2026-01-29: 初始版本,制定GeoNames导入计划
