-- Trigger functions are invoked by their owning table triggers only.
-- Do not expose the SECURITY DEFINER notification routine as a client RPC.
revoke all on function public.notify_application_event() from public, anon, authenticated;
