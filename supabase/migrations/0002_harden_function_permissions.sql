-- Already applied to the live project. Kept here so the repo matches the database.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.quotations_before_insert() from public, anon, authenticated;
revoke all on function public.is_member(uuid) from public, anon;
revoke all on function public.has_role(uuid, public.member_role[]) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.has_role(uuid, public.member_role[]) to authenticated;
revoke all on function public.create_business(text, text, char, text, text) from public, anon;
grant execute on function public.create_business(text, text, char, text, text) to authenticated;
alter function public.set_updated_at() set search_path = public;
create schema if not exists extensions;
alter extension pg_trgm set schema extensions;
