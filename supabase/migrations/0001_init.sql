-- Signal Path v2: accounts, purchases, entitlements, webhook log, learner state.
-- Clients read their own rows through RLS. Every write except learner_state goes through the service role (server only).

create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: one per auth user, created by trigger
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- purchases: one per Stripe payment. A refund or dispute can arrive before checkout.session.completed,
-- so everything except the payment intent id is nullable and filled in by whichever event comes first.
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_order_id text unique,               -- Checkout Session id (cs_...)
  provider_payment_id text not null unique,    -- PaymentIntent id (pi_...), shared by session, charge and dispute events
  product_id text,
  amount_cents integer,
  currency text,
  status text not null check (status in ('paid', 'refunded', 'disputed', 'canceled')),
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index purchases_user_id_idx on public.purchases (user_id);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  status text not null check (status in ('active', 'suspended', 'revoked')),
  source_purchase_id uuid references public.purchases (id) on delete set null,
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index entitlements_source_purchase_idx on public.entitlements (source_purchase_id);

create table public.webhook_events (
  id text primary key,                         -- provider event id (evt_...)
  provider text not null default 'stripe',
  type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text
);

create table public.learner_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint learner_state_size check (pg_column_size(state) <= 262144)
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger purchases_updated_at before update on public.purchases
  for each row execute function public.set_updated_at();
create trigger entitlements_updated_at before update on public.entitlements
  for each row execute function public.set_updated_at();
-- learner_state.updated_at is the client's last-write-wins clock, so it has no trigger.

-- profile row for every new auth user
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: owners read their rows; nothing is readable anonymously.
alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.entitlements enable row level security;
alter table public.webhook_events enable row level security;
alter table public.learner_state enable row level security;

create policy "profiles: owner reads" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "purchases: owner reads" on public.purchases
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "entitlements: owner reads" on public.entitlements
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "learner_state: owner reads" on public.learner_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "learner_state: owner inserts" on public.learner_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "learner_state: owner updates" on public.learner_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- webhook_events has no policy: service role only.

-- Explicit privileges, so the result does not depend on a project's default grants.
revoke all on public.profiles, public.purchases, public.entitlements, public.webhook_events, public.learner_state
  from anon, authenticated;
grant select on public.profiles, public.purchases, public.entitlements to authenticated;
grant select, insert, update on public.learner_state to authenticated;
grant all on public.profiles, public.purchases, public.entitlements, public.webhook_events, public.learner_state
  to service_role;
