-- Complete Admin Dashboard Database Schema
-- This file contains all necessary tables, functions, and policies for the admin dashboard

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create system_settings table for admin configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  setting_key character varying NOT NULL UNIQUE,
  setting_value text,
  setting_type character varying DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  category character varying DEFAULT 'general',
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);

-- Create admin_audit_log table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  admin_id uuid NOT NULL,
  action character varying NOT NULL,
  table_name character varying,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT admin_audit_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id)
);

-- Create support_tickets table for admin support system
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  subject character varying NOT NULL,
  description text NOT NULL,
  priority character varying DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status character varying DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category character varying DEFAULT 'general',
  assigned_to uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id)
);

-- Create support_ticket_replies table
CREATE TABLE IF NOT EXISTS public.support_ticket_replies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ticket_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT support_ticket_replies_pkey PRIMARY KEY (id),
  CONSTRAINT support_ticket_replies_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  CONSTRAINT support_ticket_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Create content_reports table for content moderation
CREATE TABLE IF NOT EXISTS public.content_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reporter_id uuid NOT NULL,
  content_type character varying NOT NULL CHECK (content_type IN ('course', 'discussion', 'review', 'comment')),
  content_id uuid NOT NULL,
  reason character varying NOT NULL,
  description text,
  status character varying DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  action_taken character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT content_reports_pkey PRIMARY KEY (id),
  CONSTRAINT content_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id),
  CONSTRAINT content_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id)
);

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying NOT NULL,
  message text NOT NULL,
  type character varying DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  priority character varying DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read boolean DEFAULT false,
  read_by uuid[],
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_notifications_pkey PRIMARY KEY (id)
);

-- Create subscription_plans table for payment management
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  price numeric NOT NULL,
  currency character varying DEFAULT 'USD',
  duration_days integer NOT NULL,
  features jsonb,
  is_active boolean DEFAULT true,
  max_courses integer,
  max_students integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  status character varying DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  auto_renew boolean DEFAULT true,
  payment_method character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id)
);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, category, description) VALUES
('site_name', 'منصة التعلم الرقمي', 'string', 'general', 'اسم الموقع'),
('site_description', 'منصة تعليمية شاملة للتعلم عن بعد', 'string', 'general', 'وصف الموقع'),
('site_url', 'https://example.com', 'string', 'general', 'رابط الموقع'),
('default_language', 'ar', 'string', 'general', 'اللغة الافتراضية'),
('timezone', 'Asia/Riyadh', 'string', 'general', 'المنطقة الزمنية'),
('maintenance_mode', 'false', 'boolean', 'general', 'وضع الصيانة'),
('enable_registration', 'true', 'boolean', 'features', 'تمكين التسجيل'),
('enable_email_verification', 'true', 'boolean', 'features', 'التحقق من البريد الإلكتروني'),
('enable_two_factor_auth', 'false', 'boolean', 'features', 'المصادقة الثنائية'),
('enable_social_login', 'true', 'boolean', 'features', 'تسجيل الدخول الاجتماعي'),
('enable_course_reviews', 'true', 'boolean', 'features', 'تقييمات الكورسات'),
('enable_discussions', 'true', 'boolean', 'features', 'المناقشات'),
('enable_notifications', 'true', 'boolean', 'features', 'الإشعارات'),
('session_timeout', '30', 'number', 'security', 'مهلة الجلسة بالدقائق'),
('max_login_attempts', '5', 'number', 'security', 'الحد الأقصى لمحاولات تسجيل الدخول'),
('password_min_length', '8', 'number', 'security', 'الحد الأدنى لطول كلمة المرور'),
('require_strong_password', 'true', 'boolean', 'security', 'طلب كلمة مرور قوية'),
('enable_captcha', 'false', 'boolean', 'security', 'تفعيل CAPTCHA'),
('smtp_host', 'smtp.gmail.com', 'string', 'email', 'خادم SMTP'),
('smtp_port', '587', 'number', 'email', 'منفذ SMTP'),
('smtp_user', '', 'string', 'email', 'اسم مستخدم SMTP'),
('smtp_password', '', 'string', 'email', 'كلمة مرور SMTP'),
('from_email', 'noreply@example.com', 'string', 'email', 'البريد الإلكتروني المرسل منه'),
('from_name', 'منصة التعلم الرقمي', 'string', 'email', 'اسم المرسل'),
('stripe_public_key', '', 'string', 'payment', 'مفتاح Stripe العام'),
('stripe_secret_key', '', 'string', 'payment', 'مفتاح Stripe السري'),
('paypal_client_id', '', 'string', 'payment', 'معرف عميل PayPal'),
('paypal_secret', '', 'string', 'payment', 'مفتاح PayPal السري'),
('default_currency', 'USD', 'string', 'payment', 'العملة الافتراضية')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, currency, duration_days, features, max_courses, max_students) VALUES
('الخطة المجانية', 'خطة أساسية مجانية', 0, 'USD', 30, '{"basic_features": true}', 1, 10),
('الخطة الأساسية', 'خطة أساسية للمعلمين', 29.99, 'USD', 30, '{"basic_features": true, "advanced_features": true}', 5, 100),
('الخطة المتقدمة', 'خطة متقدمة للمؤسسات', 99.99, 'USD', 30, '{"basic_features": true, "advanced_features": true, "premium_features": true}', 50, 1000)
ON CONFLICT DO NOTHING;

-- Create functions for admin dashboard

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(role_type text DEFAULT 'admin')
RETURNS json AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM public.users),
    'totalCourses', (SELECT COUNT(*) FROM public.courses),
    'totalEnrollments', (SELECT COUNT(*) FROM public.course_enrollments),
    'totalRevenue', (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'completed'),
    'pendingPayments', (SELECT COUNT(*) FROM public.payments WHERE status = 'pending'),
    'activeUsers', (SELECT COUNT(*) FROM public.users WHERE is_active = true),
    'publishedCourses', (SELECT COUNT(*) FROM public.courses WHERE status = 'published'),
    'userRoles', json_build_object(
      'students', (SELECT COUNT(*) FROM public.users WHERE role = 'student'),
      'teachers', (SELECT COUNT(*) FROM public.users WHERE role = 'teacher'),
      'admins', (SELECT COUNT(*) FROM public.users WHERE role = 'admin')
    ),
    'courseCategories', (
      SELECT json_agg(json_build_object('category', category, 'count', count))
      FROM (
        SELECT category, COUNT(*) as count
        FROM public.courses
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      ) categories
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user growth statistics
CREATE OR REPLACE FUNCTION get_user_growth_stats(days_back integer DEFAULT 30)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'currentPeriod', (
      SELECT COUNT(*)
      FROM public.users
      WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
    ),
    'previousPeriod', (
      SELECT COUNT(*)
      FROM public.users
      WHERE created_at >= NOW() - INTERVAL '1 day' * (days_back * 2)
      AND created_at < NOW() - INTERVAL '1 day' * days_back
    ),
    'dailyGrowth', (
      SELECT json_agg(json_build_object('date', date_series.date, 'count', COALESCE(user_counts.count, 0)))
      FROM (
        SELECT generate_series(
          NOW() - INTERVAL '1 day' * days_back,
          NOW(),
          INTERVAL '1 day'
        )::date as date
      ) date_series
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM public.users
        WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY DATE(created_at)
      ) user_counts ON date_series.date = user_counts.date
      ORDER BY date_series.date
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get course performance statistics
CREATE OR REPLACE FUNCTION get_course_performance_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'topCourses', (
      SELECT json_agg(json_build_object(
        'id', c.id,
        'title', c.title,
        'enrollments', c.enrollment_count,
        'revenue', COALESCE(c.price * c.enrollment_count, 0),
        'rating', c.rating,
        'teacher', u.name
      ))
      FROM public.courses c
      LEFT JOIN public.users u ON c.teacher_id = u.id
      ORDER BY c.enrollment_count DESC
      LIMIT 10
    ),
    'courseStats', json_build_object(
      'totalCourses', (SELECT COUNT(*) FROM public.courses),
      'publishedCourses', (SELECT COUNT(*) FROM public.courses WHERE status = 'published'),
      'draftCourses', (SELECT COUNT(*) FROM public.courses WHERE status = 'draft'),
      'archivedCourses', (SELECT COUNT(*) FROM public.courses WHERE status = 'archived'),
      'averageRating', (SELECT AVG(rating) FROM public.courses WHERE rating > 0),
      'totalEnrollments', (SELECT SUM(enrollment_count) FROM public.courses)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get payment statistics
CREATE OR REPLACE FUNCTION get_payment_stats(days_back integer DEFAULT 30)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalRevenue', (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'completed'),
    'monthlyRevenue', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.payments
      WHERE status = 'completed'
      AND created_at >= DATE_TRUNC('month', NOW())
    ),
    'pendingPayments', (SELECT COUNT(*) FROM public.payments WHERE status = 'pending'),
    'failedPayments', (SELECT COUNT(*) FROM public.payments WHERE status = 'failed'),
    'paymentMethods', (
      SELECT json_agg(json_build_object('method', payment_method, 'count', count, 'total', total))
      FROM (
        SELECT 
          payment_method,
          COUNT(*) as count,
          SUM(amount) as total
        FROM public.payments
        WHERE status = 'completed'
        GROUP BY payment_method
      ) methods
    ),
    'dailyRevenue', (
      SELECT json_agg(json_build_object('date', date_series.date, 'revenue', COALESCE(daily_revenue.revenue, 0)))
      FROM (
        SELECT generate_series(
          NOW() - INTERVAL '1 day' * days_back,
          NOW(),
          INTERVAL '1 day'
        )::date as date
      ) date_series
      LEFT JOIN (
        SELECT DATE(created_at) as date, SUM(amount) as revenue
        FROM public.payments
        WHERE status = 'completed'
        AND created_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY DATE(created_at)
      ) daily_revenue ON date_series.date = daily_revenue.date
      ORDER BY date_series.date
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update system settings
CREATE OR REPLACE FUNCTION update_system_setting(
  setting_key_param text,
  setting_value_param text,
  setting_type_param text DEFAULT 'string'
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO public.system_settings (setting_key, setting_value, setting_type)
  VALUES (setting_key_param, setting_value_param, setting_type_param)
  ON CONFLICT (setting_key)
  DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    updated_at = NOW();
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  admin_id_param uuid,
  action_param text,
  table_name_param text DEFAULT NULL,
  record_id_param uuid DEFAULT NULL,
  old_values_param jsonb DEFAULT NULL,
  new_values_param jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    admin_id_param,
    action_param,
    table_name_param,
    record_id_param,
    old_values_param,
    new_values_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for admin tables

-- System settings policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all system settings" ON public.system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update system settings" ON public.system_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert system settings" ON public.system_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin audit log policies
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Support tickets policies
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tickets" ON public.support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Support ticket replies policies
ALTER TABLE public.support_ticket_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view replies to their tickets" ON public.support_ticket_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = support_ticket_replies.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create replies to their tickets" ON public.support_ticket_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = support_ticket_replies.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all replies" ON public.support_ticket_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can create replies" ON public.support_ticket_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Content reports policies
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports" ON public.content_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports" ON public.content_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports" ON public.content_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports" ON public.content_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin notifications policies
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications" ON public.admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update notifications" ON public.admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Subscription plans policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- User subscriptions policies
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket_id ON public.support_ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_content_type ON public.content_reports(content_type);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON public.content_reports(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON public.admin_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create views for easier data access
CREATE OR REPLACE VIEW admin_dashboard_overview AS
SELECT
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM public.courses) as total_courses,
  (SELECT COUNT(*) FROM public.course_enrollments) as total_enrollments,
  (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM public.payments WHERE status = 'pending') as pending_payments,
  (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'open') as open_tickets,
  (SELECT COUNT(*) FROM public.content_reports WHERE status = 'pending') as pending_reports;

-- Create view for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT
  role,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month
FROM public.users
GROUP BY role;

-- Create view for course statistics
CREATE OR REPLACE VIEW course_statistics AS
SELECT
  status,
  COUNT(*) as count,
  AVG(rating) as avg_rating,
  SUM(enrollment_count) as total_enrollments
FROM public.courses
GROUP BY status;

-- Create view for payment statistics
CREATE OR REPLACE VIEW payment_statistics AS
SELECT
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM public.payments
GROUP BY status;

COMMENT ON TABLE public.system_settings IS 'System configuration settings for the platform';
COMMENT ON TABLE public.admin_audit_log IS 'Audit log for admin actions';
COMMENT ON TABLE public.support_tickets IS 'Support ticket system';
COMMENT ON TABLE public.support_ticket_replies IS 'Replies to support tickets';
COMMENT ON TABLE public.content_reports IS 'Content moderation reports';
COMMENT ON TABLE public.admin_notifications IS 'Admin notifications and alerts';
COMMENT ON TABLE public.subscription_plans IS 'Subscription plans for teachers';
COMMENT ON TABLE public.user_subscriptions IS 'User subscription records';

COMMENT ON FUNCTION get_dashboard_stats(text) IS 'Get comprehensive dashboard statistics';
COMMENT ON FUNCTION get_user_growth_stats(integer) IS 'Get user growth statistics over time';
COMMENT ON FUNCTION get_course_performance_stats() IS 'Get course performance statistics';
COMMENT ON FUNCTION get_payment_stats(integer) IS 'Get payment statistics over time';
COMMENT ON FUNCTION update_system_setting(text, text, text) IS 'Update system setting';
COMMENT ON FUNCTION log_admin_action(uuid, text, text, uuid, jsonb, jsonb) IS 'Log admin action for audit';
