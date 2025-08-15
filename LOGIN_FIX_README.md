# 登录问题修复指南

## 问题描述
当前登录系统存在以下问题：
1. 用户注册后，用户profile不会自动创建
2. 登录成功后，用户状态可能不会正确更新
3. 会话管理存在问题

## 已修复的问题

### 1. 代码结构优化 ✅
- 更新了 `lib/supabase.ts` 使用环境变量配置
- 改进了 `lib/useAuth.ts` 的会话管理
- 优化了 `lib/supabase-auth.ts` 的错误处理
- 简化了主页面的用户状态管理

### 2. 认证流程改进 ✅
- 添加了详细的调试日志
- 改进了错误处理和用户反馈
- 优化了登录成功后的状态更新

## 需要手动修复的问题

### 数据库触发器设置
由于无法通过代码直接执行SQL，需要在Supabase Dashboard中手动创建触发器：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：`opus4modelvaluation`
3. 进入 SQL Editor
4. 执行以下SQL：

```sql
-- 创建函数来自动创建用户profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at, free_reports_used, paid_reports_used, monthly_report_limit)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    NEW.created_at,
    NEW.updated_at,
    0,
    0,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器，当新用户注册时自动创建profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 为现有用户创建profile（如果不存在）
INSERT INTO public.users (id, email, name, created_at, updated_at, free_reports_used, paid_reports_used, monthly_report_limit)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', NULL),
  au.created_at,
  COALESCE(au.updated_at, au.created_at),
  0,
  0,
  0
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

## 测试步骤

### 1. 运行测试脚本
```bash
# 测试登录流程
node scripts/test-login-flow.js

# 测试迁移
node scripts/simple-migration.js
```

### 2. 手动测试
1. 启动开发服务器：`npm run dev`
2. 尝试注册新用户
3. 尝试登录
4. 检查用户状态是否正确更新

## 环境变量配置

确保 `.env` 文件包含正确的配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://decmecsshjqymhkykazg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 故障排除

### 如果登录仍然失败：

1. 检查浏览器控制台的错误信息
2. 确认环境变量是否正确设置
3. 验证Supabase项目配置
4. 检查数据库连接和权限

### 如果用户profile仍然不创建：

1. 确认触发器是否成功创建
2. 检查数据库日志
3. 手动创建用户profile作为临时解决方案

## 下一步

1. 在Supabase Dashboard中创建触发器
2. 测试完整的登录流程
3. 验证用户profile自动创建
4. 测试会话持久化

## 联系支持

如果问题仍然存在，请：
1. 检查Supabase项目状态
2. 查看项目日志
3. 确认数据库权限设置

