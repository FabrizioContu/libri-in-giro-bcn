-- Explicit grants required from May 30 2026 (new projects) / October 30 2026 (existing projects)
-- rate_limits is internal — only service_role needs access

GRANT SELECT, INSERT ON public.rate_limits TO service_role;
