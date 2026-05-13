-- Rate limiting table for anti-spam protection
-- Tracks submissions by IP and action type within time windows

CREATE TABLE IF NOT EXISTS rate_limits (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip         text        NOT NULL,
  action     text        NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action_created_at
  ON rate_limits (ip, action, created_at);

-- RLS: enabled with no anon policies — only service role key can read/write
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Auto-cleanup function: removes entries older than 24 hours
-- Call periodically via Supabase cron (pg_cron) or manually
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM rate_limits WHERE created_at < now() - INTERVAL '1 day';
$$;
