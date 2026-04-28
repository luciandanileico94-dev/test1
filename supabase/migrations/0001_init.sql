-- WishList for Events — initial schema
-- Run via Supabase SQL editor or `supabase db push`.

create extension if not exists "pgcrypto";

-- ============== events ==============
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text default '',
  event_date timestamptz,
  location_name text,
  address text,
  lat double precision,
  lng double precision,
  directions text,
  cover_image_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_owner_idx on public.events(owner_id);
create index if not exists events_slug_idx on public.events(slug);

-- ============== wishlist_items ==============
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  product_url text,
  price numeric(12, 2),
  priority smallint not null default 0, -- 0 nice-to-have, 1 must-have
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists wishlist_items_event_idx on public.wishlist_items(event_id);

-- ============== claims ==============
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null unique references public.wishlist_items(id) on delete cascade,
  guest_name text not null,
  guest_message text,
  guest_token text not null default encode(gen_random_bytes(24), 'hex'),
  claimed_at timestamptz not null default now()
);

create index if not exists claims_item_idx on public.claims(item_id);

-- ============== updated_at trigger ==============
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- ============== RLS ==============
alter table public.events enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.claims enable row level security;

-- events: owner full access
drop policy if exists "events_owner_all" on public.events;
create policy "events_owner_all" on public.events
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- events: public read when is_public
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
  for select using (is_public = true);

-- wishlist_items: owner full access via parent event
drop policy if exists "items_owner_all" on public.wishlist_items;
create policy "items_owner_all" on public.wishlist_items
  for all using (
    exists (select 1 from public.events e where e.id = wishlist_items.event_id and e.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.events e where e.id = wishlist_items.event_id and e.owner_id = auth.uid())
  );

-- wishlist_items: public read for items of public events
drop policy if exists "items_public_read" on public.wishlist_items;
create policy "items_public_read" on public.wishlist_items
  for select using (
    exists (select 1 from public.events e where e.id = wishlist_items.event_id and e.is_public = true)
  );

-- claims: anyone can read claims of items belonging to a public event
drop policy if exists "claims_public_read" on public.claims;
create policy "claims_public_read" on public.claims
  for select using (
    exists (
      select 1 from public.wishlist_items i
      join public.events e on e.id = i.event_id
      where i.id = claims.item_id and e.is_public = true
    )
  );

-- claims: owner can read all claims for own events
drop policy if exists "claims_owner_read" on public.claims;
create policy "claims_owner_read" on public.claims
  for select using (
    exists (
      select 1 from public.wishlist_items i
      join public.events e on e.id = i.event_id
      where i.id = claims.item_id and e.owner_id = auth.uid()
    )
  );

-- claims: anyone can insert if item exists and event is public
-- (uniqueness on item_id prevents double-claim at the DB level)
drop policy if exists "claims_public_insert" on public.claims;
create policy "claims_public_insert" on public.claims
  for insert with check (
    exists (
      select 1 from public.wishlist_items i
      join public.events e on e.id = i.event_id
      where i.id = claims.item_id and e.is_public = true
    )
  );

-- claims: deletion is handled via service-role server actions (token verified there).
-- No public delete policy.

-- ============== Realtime publication ==============
-- Make sure the claims table is included in supabase_realtime publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'claims'
  ) then
    execute 'alter publication supabase_realtime add table public.claims';
  end if;
end $$;
