# 登录问题修复方案

## 问题描述
用户注册后,Supabase 发送了验证邮件,但用户无法登录。

## 问题原因
1. **缺少 RPC 函数** - `get_profile_by_username` 函数未创建
2. **邮件验证未完成** - 邮箱需要验证才能登录
3. **开发模式下不便** - 每次注册都需要验证邮件

## 解决方案

### 方案 1: 添加 RPC 函数 (必须执行)

在 Supabase Dashboard 的 SQL Editor 中执行:

```sql
-- supabase/get_profile_by_username.sql
CREATE OR REPLACE FUNCTION get_profile_by_username(username_param TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  nickname TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.nickname,
    p.email,
    p.avatar_url,
    p.bio,
    p.score,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.username = username_param
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_profile_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_by_username(TEXT) TO anon;
```

### 方案 2: 开发模式禁用邮件验证 (推荐用于开发)

#### 方法 A: 通过 Supabase Dashboard (推荐)

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** → **Settings**
4. 找到 **Confirm email** 选项
5. **取消勾选** "Enable email confirmations"
6. 点击 **Save** 保存

#### 方法 B: 通过 SQL 批量确认现有用户

在 SQL Editor 中执行:

```sql
-- supabase/disable_email_confirmation.sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

### 方案 3: 修改注册流程

如果保留邮件验证,需要修改 `Signup.vue`:

```typescript
// 当前代码 (第 114-121 行)
const { data, error } = await supabase.auth.signUp({
  email: email.value,
  password: password.value,
  options: {
    emailRedirectTo: `${window.location.origin}/login`,
    data: { username: username.value, nickname: nickname.value },
  },
})
```

这个代码是正确的,但需要用户点击邮件中的链接。

## 验证步骤

1. **执行 RPC 函数**
   - 在 Supabase SQL Editor 中执行 `get_profile_by_username.sql`

2. **禁用邮件验证** (开发模式)
   - 在 Supabase Dashboard 中关闭 "Enable email confirmations"

3. **测试注册流程**
   - 访问 `/signup`
   - 填写信息并注册
   - 自动跳转到首页,无需验证邮件

4. **测试登录流程**
   - 使用邮箱或用户名登录
   - 验证是否成功

## 生产环境配置

**重要**: 部署到生产环境前,必须重新启用邮件验证!

1. 在 Supabase Dashboard 中 **勾选** "Enable email confirmations"
2. 配置邮件服务商 (SMTP 或 Supabase 内置邮件)
3. 测试验证邮件是否正常发送

## 常见错误处理

### 错误: "User not found"
**原因**: RPC 函数未创建或用户不存在
**解决**: 执行 `get_profile_by_username.sql`

### 错误: "Email not confirmed"
**原因**: 邮箱未验证
**解决**: 禁用邮件验证(开发)或点击验证链接(生产)

### 错误: "Invalid login credentials"
**原因**: 密码错误
**解决**: 检查密码是否正确,可使用 "Forgot password" 功能

## 完整的 Supabase 配置检查清单

- [ ] RPC 函数 `get_profile_by_username` 已创建
- [ ] 邮件验证已禁用(开发)或已配置(生产)
- [ ] Profiles 表触发器 `handle_new_user` 已创建
- [ ] Friends 表已创建
- [ ] RLS 策略已正确配置
- [ ] Storage buckets 已创建
- [ ] 环境变量 `.env` 已正确配置

## 快速修复命令

在 Supabase SQL Editor 中依次执行:

```sql
-- 1. 添加 RPC 函数
CREATE OR REPLACE FUNCTION get_profile_by_username(username_param TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  nickname TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.nickname,
    p.email,
    p.avatar_url,
    p.bio,
    p.score,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.username = username_param
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_profile_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_by_username(TEXT) TO anon;

-- 2. 确认所有现有用户
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

---

**最后更新**: 2026-01-19
