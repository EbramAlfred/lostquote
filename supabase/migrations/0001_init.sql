-- =====================================================================
-- LostQuote – Initial schema (Supabase / PostgreSQL)
-- Multi-tenant: every business-owned row carries business_id and is
-- protected by Row Level Security via membership checks.
-- Run in the Supabase SQL editor, or place at supabase/migrations/0001_init.sql
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type member_role as enum ('owner', 'admin', 'member', 'viewer');
create type customer_type as enum ('individual', 'company');
create type status_kind as enum ('draft', 'open', 'won', 'lost', 'cancelled');
create type followup_state as enum ('pending', 'completed', 'skipped');
create type followup_channel as enum ('whatsapp', 'email', 'sms', 'linkedin', 'phone', 'other');

-- ---------------------------------------------------------------------
-- Generic helpers
-- ---------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- subscription_plans (static reference data; limits are hypotheses)
-- ---------------------------------------------------------------------
create table subscription_plans (
  id text primary key,                       -- 'free' | 'starter' | 'pro' | 'business'
  name text not null,
  price_monthly_usd numeric(10,2),           -- null = custom pricing
  monthly_quotation_limit integer,           -- null = unlimited
  max_team_members integer,                  -- null = unlimited
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into subscription_plans (id, name, price_monthly_usd, monthly_quotation_limit, max_team_members, features) values
  ('free',     'Free',     0,    5,    1,    '{"templates":false,"advanced_analytics":false,"team":false}'),
  ('starter',  'Starter',  9,    50,   1,    '{"templates":true,"reminders":true,"advanced_analytics":false,"team":false}'),
  ('pro',      'Pro',      19,   500,  10,   '{"templates":true,"reminders":true,"advanced_analytics":true,"team":true}'),
  ('business', 'Business', null, null, null, '{"templates":true,"reminders":true,"advanced_analytics":true,"team":true,"custom_workflows":true}');

-- ---------------------------------------------------------------------
-- users (profile mirror of auth.users)
-- ---------------------------------------------------------------------
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  preferred_language text not null default 'en' check (preferred_language in ('en','ar')),
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger users_updated before update on users
  for each row execute function set_updated_at();

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  logo_url text,
  industry text,                              -- free text; UI offers presets + "Other"
  default_currency char(3) not null default 'USD' check (default_currency ~ '^[A-Z]{3}$'),
  timezone text not null default 'UTC',
  language text not null default 'en' check (language in ('en','ar')),
  plan_id text not null default 'free' references subscription_plans(id),
  default_followup_days integer[] not null default '{2,5,7}',
  next_quote_number integer not null default 1,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger businesses_updated before update on businesses
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- business_members
-- ---------------------------------------------------------------------
create table business_members (
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index business_members_user_idx on business_members(user_id);

-- RLS helper functions (security definer avoids recursive policy evaluation)
create or replace function is_member(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from business_members
                 where business_id = b and user_id = auth.uid());
$$;

create or replace function has_role(b uuid, roles member_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from business_members
                 where business_id = b and user_id = auth.uid() and role = any(roles));
$$;

-- ---------------------------------------------------------------------
-- Customisable taxonomy: categories and statuses (per business)
-- ---------------------------------------------------------------------
create table quotation_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);

create table quotation_statuses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  kind status_kind not null,                  -- drives analytics regardless of custom names
  color text not null default '#64748B',
  sort_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
create table customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  type customer_type not null default 'individual',
  name text not null check (char_length(name) between 1 and 160),
  company_name text,
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  country text,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_business_idx on customers(business_id);
create index customers_search_idx on customers using gin
  ((coalesce(name,'') || ' ' || coalesce(company_name,'') || ' ' || coalesce(email,'')) gin_trgm_ops);
create trigger customers_updated before update on customers
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- quotations
-- ---------------------------------------------------------------------
create table quotations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  quote_number integer not null,              -- per-business sequence, shown as Q-0001
  customer_id uuid not null references customers(id) on delete restrict,
  category_id uuid references quotation_categories(id) on delete set null,
  status_id uuid not null references quotation_statuses(id),
  title text not null check (char_length(title) between 1 and 200),
  description text,
  amount numeric(14,2) not null default 0 check (amount >= 0),   -- estimated value
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  collected_amount numeric(14,2) check (collected_amount is null or collected_amount >= 0), -- actual revenue
  assigned_to uuid references users(id) on delete set null,
  internal_notes text,
  sent_at timestamptz,
  expected_response_at date,
  closed_at timestamptz,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, quote_number)
);
create index quotations_business_status_idx on quotations(business_id, status_id);
create index quotations_customer_idx on quotations(customer_id);
create index quotations_created_idx on quotations(business_id, created_at desc);
create trigger quotations_updated before update on quotations
  for each row execute function set_updated_at();

-- Assign per-business number, validate tenant consistency, enforce plan limit.
create or replace function quotations_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  lim integer;
  used integer;
begin
  -- tenant consistency
  if not exists (select 1 from customers where id = new.customer_id and business_id = new.business_id) then
    raise exception 'customer does not belong to this business';
  end if;
  if not exists (select 1 from quotation_statuses where id = new.status_id and business_id = new.business_id) then
    raise exception 'status does not belong to this business';
  end if;

  -- plan limit (calendar month, business timezone ignored in MVP)
  select p.monthly_quotation_limit into lim
    from businesses b join subscription_plans p on p.id = b.plan_id
   where b.id = new.business_id;
  if lim is not null then
    select count(*) into used from quotations
     where business_id = new.business_id
       and created_at >= date_trunc('month', now());
    if used >= lim then
      raise exception 'PLAN_LIMIT_REACHED: monthly quotation limit (%) reached', lim
        using errcode = 'P0001';
    end if;
  end if;

  -- sequence number
  update businesses set next_quote_number = next_quote_number + 1
   where id = new.business_id
   returning next_quote_number - 1 into new.quote_number;

  return new;
end $$;
create trigger quotations_bi before insert on quotations
  for each row execute function quotations_before_insert();

-- Stamp closed_at when moving into a terminal status.
create or replace function quotations_status_sync() returns trigger
language plpgsql set search_path = public as $$
declare k status_kind;
begin
  select kind into k from quotation_statuses where id = new.status_id;
  if k in ('won','lost','cancelled') then
    new.closed_at = coalesce(new.closed_at, now());
  else
    new.closed_at = null;
  end if;
  if k = 'open' and new.sent_at is null then
    new.sent_at = now();
  end if;
  return new;
end $$;
create trigger quotations_status_sync_trg before insert or update of status_id on quotations
  for each row execute function quotations_status_sync();

-- ---------------------------------------------------------------------
-- quotation_items
-- ---------------------------------------------------------------------
create table quotation_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  quotation_id uuid not null references quotations(id) on delete cascade,
  description text not null,
  quantity numeric(12,3) not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0 check (unit_price >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index quotation_items_quote_idx on quotation_items(quotation_id);

-- ---------------------------------------------------------------------
-- follow_up_tasks
-- ---------------------------------------------------------------------
create table follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  quotation_id uuid not null references quotations(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  step_label text,                            -- e.g. 'First follow-up'
  due_date date not null,
  state followup_state not null default 'pending',
  channel followup_channel,
  assigned_to uuid references users(id) on delete set null,
  customer_response text,
  outcome text,
  rescheduled_count integer not null default 0,
  completed_at timestamptz,
  completed_by uuid references users(id),
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index followups_due_idx on follow_up_tasks(business_id, state, due_date);
create index followups_quote_idx on follow_up_tasks(quotation_id);
create trigger followups_updated before update on follow_up_tasks
  for each row execute function set_updated_at();

-- Overdue is derived, never stored: state = 'pending' and due_date < current_date.
create or replace view follow_up_tasks_v with (security_invoker = true) as
select t.*,
       (t.state = 'pending' and t.due_date < current_date) as is_overdue
  from follow_up_tasks t;

-- ---------------------------------------------------------------------
-- message_templates (fallback when AI is unavailable)
-- ---------------------------------------------------------------------
create table message_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,  -- null = global system template
  language text not null check (language in ('en','ar')),
  channel text not null check (channel in ('whatsapp','email','sms','linkedin')),
  tone text not null check (tone in ('professional','friendly','persuasive','formal','casual')),
  stage smallint not null check (stage between 1 and 3),
  subject text,
  body text not null,                         -- placeholders: {{customer_name}} {{quote_title}} {{amount}} {{currency}} {{business_name}}
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- activity_logs
-- ---------------------------------------------------------------------
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  actor_id uuid references users(id) on delete set null,
  entity_type text not null,                  -- 'customer' | 'quotation' | 'follow_up' | 'message'
  entity_id uuid,
  action text not null,                       -- 'created' | 'updated' | 'status_changed' | 'completed' ...
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_entity_idx on activity_logs(business_id, entity_type, entity_id, created_at desc);

-- ---------------------------------------------------------------------
-- notification_preferences
-- ---------------------------------------------------------------------
create table notification_preferences (
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  email_daily_digest boolean not null default true,
  email_overdue_alerts boolean not null default true,
  in_app_reminders boolean not null default true,
  digest_hour smallint not null default 8 check (digest_hour between 0 and 23),
  primary key (business_id, user_id)
);

-- ---------------------------------------------------------------------
-- create_business(): atomic onboarding (business + owner + defaults)
-- ---------------------------------------------------------------------
create or replace function create_business(
  p_name text, p_industry text, p_currency char(3), p_timezone text, p_language text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  bid uuid;
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;

  insert into businesses (name, industry, default_currency, timezone, language, created_by)
  values (p_name, p_industry, p_currency, coalesce(p_timezone,'UTC'), coalesce(p_language,'en'), uid)
  returning id into bid;

  insert into business_members (business_id, user_id, role) values (bid, uid, 'owner');
  insert into notification_preferences (business_id, user_id) values (bid, uid);

  insert into quotation_statuses (business_id, name, kind, color, sort_order, is_default) values
    (bid, 'Draft',              'draft',     '#64748B', 1, true),
    (bid, 'Sent',               'open',      '#2563EB', 2, true),
    (bid, 'Awaiting Response',  'open',      '#2563EB', 3, true),
    (bid, 'Follow-up Required', 'open',      '#F97316', 4, true),
    (bid, 'Negotiation',        'open',      '#8B5CF6', 5, true),
    (bid, 'Won',                'won',       '#16A34A', 6, true),
    (bid, 'Lost',               'lost',      '#DC2626', 7, true),
    (bid, 'Cancelled',          'cancelled', '#94A3B8', 8, true);

  insert into quotation_categories (business_id, name, is_default, sort_order) values
    (bid, 'Price Quotation', true, 1),
    (bid, 'Service Estimate', true, 2),
    (bid, 'Business Proposal', true, 3),
    (bid, 'Project Proposal', true, 4),
    (bid, 'Product Offer', true, 5),
    (bid, 'Contract Awaiting Approval', true, 6),
    (bid, 'Custom Offer', true, 7);

  insert into activity_logs (business_id, actor_id, entity_type, entity_id, action)
  values (bid, uid, 'business', bid, 'created');

  return bid;
end $$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table subscription_plans       enable row level security;
alter table users                    enable row level security;
alter table businesses               enable row level security;
alter table business_members         enable row level security;
alter table quotation_categories     enable row level security;
alter table quotation_statuses       enable row level security;
alter table customers                enable row level security;
alter table quotations               enable row level security;
alter table quotation_items          enable row level security;
alter table follow_up_tasks          enable row level security;
alter table message_templates        enable row level security;
alter table activity_logs            enable row level security;
alter table notification_preferences enable row level security;

-- subscription_plans: readable by any signed-in user, writable by nobody (service role only)
create policy plans_read on subscription_plans for select to authenticated using (true);

-- users: see yourself and people who share a business with you; edit only yourself
create policy users_self_read on users for select to authenticated using (
  id = auth.uid()
  or exists (select 1 from business_members a join business_members b on a.business_id = b.business_id
              where a.user_id = auth.uid() and b.user_id = users.id)
);
create policy users_self_update on users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- businesses: members read; owner/admin update; creation goes through create_business()
create policy businesses_read   on businesses for select to authenticated using (is_member(id));
create policy businesses_update on businesses for update to authenticated
  using (has_role(id, array['owner','admin']::member_role[]))
  with check (has_role(id, array['owner','admin']::member_role[]));
create policy businesses_delete on businesses for delete to authenticated
  using (has_role(id, array['owner']::member_role[]));

-- business_members: members read the roster; owner/admin manage it
create policy members_read on business_members for select to authenticated using (is_member(business_id));
create policy members_insert on business_members for insert to authenticated
  with check (has_role(business_id, array['owner','admin']::member_role[]));
create policy members_update on business_members for update to authenticated
  using (has_role(business_id, array['owner','admin']::member_role[]))
  with check (has_role(business_id, array['owner','admin']::member_role[]) and role <> 'owner');
create policy members_delete on business_members for delete to authenticated
  using (has_role(business_id, array['owner','admin']::member_role[]) and role <> 'owner');

-- Tenant data tables: members read; owner/admin/member write; viewers read-only.
do $$
declare t text;
begin
  foreach t in array array['quotation_categories','quotation_statuses','customers',
                           'quotations','quotation_items','follow_up_tasks']
  loop
    execute format('create policy %I_read on %I for select to authenticated using (is_member(business_id))', t, t);
    execute format('create policy %I_insert on %I for insert to authenticated with check (has_role(business_id, array[''owner'',''admin'',''member'']::member_role[]))', t, t);
    execute format('create policy %I_update on %I for update to authenticated using (has_role(business_id, array[''owner'',''admin'',''member'']::member_role[])) with check (has_role(business_id, array[''owner'',''admin'',''member'']::member_role[]))', t, t);
    execute format('create policy %I_delete on %I for delete to authenticated using (has_role(business_id, array[''owner'',''admin'']::member_role[]))', t, t);
  end loop;
end $$;

-- message_templates: global templates (business_id null) readable by all signed-in users
create policy templates_read on message_templates for select to authenticated
  using (business_id is null or is_member(business_id));
create policy templates_write on message_templates for all to authenticated
  using (business_id is not null and has_role(business_id, array['owner','admin']::member_role[]))
  with check (business_id is not null and has_role(business_id, array['owner','admin']::member_role[]));

-- activity_logs: members read and append; no edits or deletes
create policy activity_read on activity_logs for select to authenticated using (is_member(business_id));
create policy activity_insert on activity_logs for insert to authenticated
  with check (is_member(business_id) and actor_id = auth.uid());

-- notification_preferences: each user manages only their own
create policy notif_own on notification_preferences for all to authenticated
  using (user_id = auth.uid() and is_member(business_id))
  with check (user_id = auth.uid() and is_member(business_id));

-- Grants: lock down create_business to signed-in users only
revoke all on function create_business(text,text,char,text,text) from public;
grant execute on function create_business(text,text,char,text,text) to authenticated;
