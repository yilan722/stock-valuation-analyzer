# Supabase Setup Guide

This guide will help you set up Supabase for the stock valuation analyzer application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note down your project URL and anon key

## 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

Replace the values with your actual Supabase project URL and anon key.

## 3. Database Setup

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL to create the database schema:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  free_reports_used INTEGER DEFAULT 0,
  paid_reports_used INTEGER DEFAULT 0,
  subscription_id TEXT,
  subscription_type TEXT,
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  monthly_report_limit INTEGER DEFAULT 0
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  alipay_trade_no TEXT,
  alipay_order_id TEXT,
  subscription_type TEXT,
  report_limit INTEGER,
  report_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stock_symbol TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  report_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for payments table
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for reports table
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);
```

### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

4. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

5. Push the migration:
   ```bash
   supabase db push
   ```

## 4. Authentication Settings

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Configure the following settings:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: `http://localhost:3000/**`
   - **Enable email confirmations**: Optional (recommended for production)

## 5. Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the email templates for:
   - Confirm signup
   - Magic link
   - Change email address
   - Reset password

## 6. Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Try to register a new account
4. Check if the user profile is created in the `users` table

## 7. Production Deployment

For production deployment:

1. Update the Site URL in Supabase Authentication settings
2. Add your production domain to Redirect URLs
3. Update environment variables with production values
4. Consider enabling email confirmations for security

## Troubleshooting

### Common Issues

1. **Authentication errors**: Make sure your environment variables are correctly set
2. **Database errors**: Ensure the SQL migration has been run successfully
3. **RLS errors**: Check that Row Level Security policies are properly configured

### Debugging

1. Check the browser console for client-side errors
2. Check the server logs for API errors
3. Use Supabase dashboard to inspect database tables and logs

## Migration from Custom Auth

If you're migrating from the custom authentication system:

1. Export your existing user data
2. Import the data into Supabase using the dashboard or API
3. Update any hardcoded references to the old auth system
4. Test thoroughly before deploying to production

## Security Considerations

1. **Row Level Security**: All tables have RLS enabled to ensure users can only access their own data
2. **Environment Variables**: Never commit sensitive keys to version control
3. **Email Verification**: Consider enabling email verification for production
4. **Rate Limiting**: Implement rate limiting for API endpoints in production 