-- Analytics Functions for Admin Dashboard
-- This file contains the RPC functions needed for the analytics page

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to get user growth statistics
CREATE OR REPLACE FUNCTION get_user_growth_stats()
RETURNS json AS $$
DECLARE
  this_month_count integer;
  last_month_count integer;
  growth_rate numeric;
BEGIN
  -- Get user count for current month
  SELECT COUNT(*) INTO this_month_count
  FROM users
  WHERE created_at >= date_trunc('month', CURRENT_DATE);
  
  -- Get user count for last month
  SELECT COUNT(*) INTO last_month_count
  FROM users
  WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
    AND created_at < date_trunc('month', CURRENT_DATE);
  
  -- Calculate growth rate
  IF last_month_count > 0 THEN
    growth_rate := ((this_month_count - last_month_count)::numeric / last_month_count) * 100;
  ELSE
    growth_rate := 0;
  END IF;
  
  RETURN json_build_object(
    'thisMonth', this_month_count,
    'lastMonth', last_month_count,
    'growth', round(growth_rate, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get course performance statistics
CREATE OR REPLACE FUNCTION get_course_performance_stats()
RETURNS json AS $$
DECLARE
  this_month_count integer;
  last_month_count integer;
  growth_rate numeric;
  top_courses json;
BEGIN
  -- Get course count for current month
  SELECT COUNT(*) INTO this_month_count
  FROM courses
  WHERE created_at >= date_trunc('month', CURRENT_DATE);
  
  -- Get course count for last month
  SELECT COUNT(*) INTO last_month_count
  FROM courses
  WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
    AND created_at < date_trunc('month', CURRENT_DATE);
  
  -- Calculate growth rate
  IF last_month_count > 0 THEN
    growth_rate := ((this_month_count - last_month_count)::numeric / last_month_count) * 100;
  ELSE
    growth_rate := 0;
  END IF;
  
  -- Get top performing courses
  SELECT json_agg(
    json_build_object(
      'id', c.id,
      'title', c.title,
      'enrollments', COALESCE(c.enrollment_count, 0),
      'revenue', COALESCE(c.price, 0) * COALESCE(c.enrollment_count, 0),
      'rating', COALESCE(c.rating, 0)
    )
  ) INTO top_courses
  FROM courses c
  ORDER BY COALESCE(c.enrollment_count, 0) DESC
  LIMIT 5;
  
  RETURN json_build_object(
    'growth', json_build_object(
      'thisMonth', this_month_count,
      'lastMonth', last_month_count,
      'growth', round(growth_rate, 1)
    ),
    'topCourses', COALESCE(top_courses, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get payment statistics
CREATE OR REPLACE FUNCTION get_payment_stats()
RETURNS json AS $$
DECLARE
  this_month_revenue numeric;
  last_month_revenue numeric;
  growth_rate numeric;
  monthly_stats json;
BEGIN
  -- Get revenue for current month
  SELECT COALESCE(SUM(amount), 0) INTO this_month_revenue
  FROM payments
  WHERE status = 'completed'
    AND created_at >= date_trunc('month', CURRENT_DATE);
  
  -- Get revenue for last month
  SELECT COALESCE(SUM(amount), 0) INTO last_month_revenue
  FROM payments
  WHERE status = 'completed'
    AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
    AND created_at < date_trunc('month', CURRENT_DATE);
  
  -- Calculate growth rate
  IF last_month_revenue > 0 THEN
    growth_rate := ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100;
  ELSE
    growth_rate := 0;
  END IF;
  
  -- Generate monthly stats for the last 6 months
  SELECT json_agg(
    json_build_object(
      'month', to_char(month_date, 'Month'),
      'users', user_count,
      'courses', course_count,
      'revenue', revenue_amount
    )
  ) INTO monthly_stats
  FROM (
    SELECT 
      date_trunc('month', CURRENT_DATE - (i || ' months')::interval) as month_date,
      COUNT(DISTINCT u.id) as user_count,
      COUNT(DISTINCT c.id) as course_count,
      COALESCE(SUM(p.amount), 0) as revenue_amount
    FROM generate_series(0, 5) i
    LEFT JOIN users u ON date_trunc('month', u.created_at) = date_trunc('month', CURRENT_DATE - (i || ' months')::interval)
    LEFT JOIN courses c ON date_trunc('month', c.created_at) = date_trunc('month', CURRENT_DATE - (i || ' months')::interval)
    LEFT JOIN payments p ON date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE - (i || ' months')::interval) AND p.status = 'completed'
    GROUP BY month_date
    ORDER BY month_date DESC
  ) monthly_data;
  
  RETURN json_build_object(
    'growth', json_build_object(
      'thisMonth', this_month_revenue,
      'lastMonth', last_month_revenue,
      'growth', round(growth_rate, 1)
    ),
    'monthlyStats', COALESCE(monthly_stats, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_growth_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_performance_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_stats() TO authenticated;
