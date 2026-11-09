-- Already applied to the live project. Kept here so the repo matches the database.
alter table public.customers add column if not exists personality text
  check (personality is null or personality in ('driver','expressive','amiable','analytical'));
-- (same-business trigger function enforce_same_business() and its triggers on
--  quotations, quotation_items and follow_up_tasks, plus dashboard indexes, were created too)
