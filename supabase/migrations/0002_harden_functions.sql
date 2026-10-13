-- Trigger helpers are not an API. Keep them out of the exposed RPC surface (Supabase linter 0028/0029).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
