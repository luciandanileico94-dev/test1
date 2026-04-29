-- Couple App Schema
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- ============== profiles ==============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============== couples ==============
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  photo_url text,
  invite_code text not null unique default upper(substring(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============== couple_members ==============
create table if not exists public.couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'partner',
  joined_at timestamptz not null default now(),
  unique(couple_id, user_id)
);

create index if not exists couple_members_couple_idx on public.couple_members(couple_id);
create index if not exists couple_members_user_idx on public.couple_members(user_id);

-- ============== couple_events ==============
create table if not exists public.couple_events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  location text,
  type text not null default 'custom',
  status text not null default 'planned',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists couple_events_couple_idx on public.couple_events(couple_id);
create index if not exists couple_events_date_idx on public.couple_events(event_date);

-- ============== event_reviews ==============
create table if not exists public.event_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.couple_events(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  what_was_good text,
  what_was_bad text,
  what_to_repeat text,
  rating smallint check (rating >= 1 and rating <= 5),
  private_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============== couple_wishlist_items ==============
create table if not exists public.couple_wishlist_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null default 'product',
  priority text not null default 'medium',
  price numeric(12,2),
  link text,
  image_url text,
  status text not null default 'wanted',
  reserved_by uuid references auth.users(id),
  is_surprise boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists couple_wishlist_couple_idx on public.couple_wishlist_items(couple_id);
create index if not exists couple_wishlist_owner_idx on public.couple_wishlist_items(owner_user_id);

-- ============== albums ==============
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  description text,
  cover_image_url text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists albums_couple_idx on public.albums(couple_id);

-- ============== media ==============
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  album_id uuid references public.albums(id) on delete set null,
  event_id uuid references public.couple_events(id) on delete set null,
  file_url text not null,
  file_type text not null default 'image',
  caption text,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists media_couple_idx on public.media(couple_id);
create index if not exists media_album_idx on public.media(album_id);

-- ============== intimacy_records ==============
create table if not exists public.intimacy_records (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  date date not null,
  mood text,
  notes text,
  rating smallint check (rating >= 1 and rating <= 5),
  visibility text not null default 'shared',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists intimacy_couple_idx on public.intimacy_records(couple_id);

-- ============== cycle_settings ==============
create table if not exists public.cycle_settings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_enabled boolean not null default false,
  cycle_length integer not null default 28,
  period_length integer not null default 5,
  last_period_start date,
  partner_visibility text not null default 'private',
  recommendations_enabled boolean not null default true,
  show_on_partner_dashboard boolean not null default false,
  partner_notifications_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(couple_id, user_id)
);

-- ============== cycle_days ==============
create table if not exists public.cycle_days (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  cycle_day integer,
  phase text,
  mood text,
  energy_level smallint check (energy_level >= 1 and energy_level <= 5),
  pain_level smallint check (pain_level >= 1 and pain_level <= 5),
  symptoms text[],
  notes text,
  intimacy_preference text not null default 'private',
  communication_preference text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(couple_id, user_id, date)
);

create index if not exists cycle_days_couple_user_idx on public.cycle_days(couple_id, user_id);
create index if not exists cycle_days_date_idx on public.cycle_days(date);

-- ============== cycle_support_preferences ==============
create table if not exists public.cycle_support_preferences (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  phase text not null,
  what_helps text,
  what_makes_worse text,
  partner_should_do text,
  partner_should_avoid text,
  food_preferences text,
  drink_preferences text,
  comfort_food_preferences text,
  attention_preferences text,
  space_preferences text,
  physical_contact_preferences text,
  intimacy_boundaries text,
  custom_partner_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(couple_id, user_id, phase)
);

-- ============== check_ins ==============
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  week_start date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text,
  gratitude text,
  missing text,
  want_to_discuss text,
  want_to_do_together text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(couple_id, week_start, user_id)
);

create index if not exists check_ins_couple_idx on public.check_ins(couple_id);

-- ============== agreements ==============
create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agreements_couple_idx on public.agreements(couple_id);

-- ============== date_ideas ==============
create table if not exists public.date_ideas (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'другое',
  estimated_price numeric(12,2),
  location text,
  priority text not null default 'medium',
  status text not null default 'idea',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists date_ideas_couple_idx on public.date_ideas(couple_id);

-- ============== updated_at triggers ==============
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

do $$ declare
  t text;
begin
  foreach t in array array[
    'profiles','couples','couple_events','event_reviews',
    'couple_wishlist_items','albums','intimacy_records',
    'cycle_settings','cycle_days','cycle_support_preferences',
    'check_ins','agreements','date_ideas'
  ] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ============== auto-create profile on signup ==============
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============== helper: is_couple_member ==============
create or replace function public.is_couple_member(p_couple_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.couple_members
    where couple_id = p_couple_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- ============== RLS ==============
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_events enable row level security;
alter table public.event_reviews enable row level security;
alter table public.couple_wishlist_items enable row level security;
alter table public.albums enable row level security;
alter table public.media enable row level security;
alter table public.intimacy_records enable row level security;
alter table public.cycle_settings enable row level security;
alter table public.cycle_days enable row level security;
alter table public.cycle_support_preferences enable row level security;
alter table public.check_ins enable row level security;
alter table public.agreements enable row level security;
alter table public.date_ideas enable row level security;

-- profiles
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_partner_read" on public.profiles;
create policy "profiles_partner_read" on public.profiles
  for select using (
    exists (
      select 1 from public.couple_members cm1
      join public.couple_members cm2 on cm1.couple_id = cm2.couple_id
      where cm1.user_id = auth.uid() and cm2.user_id = profiles.id
    )
  );

-- couples
drop policy if exists "couples_member_read" on public.couples;
create policy "couples_member_read" on public.couples
  for select using (public.is_couple_member(id));

drop policy if exists "couples_creator_write" on public.couples;
create policy "couples_creator_write" on public.couples
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

drop policy if exists "couples_insert" on public.couples;
create policy "couples_insert" on public.couples
  for insert with check (auth.uid() = created_by);

-- couple_members
drop policy if exists "couple_members_read" on public.couple_members;
create policy "couple_members_read" on public.couple_members
  for select using (public.is_couple_member(couple_id) or user_id = auth.uid());

drop policy if exists "couple_members_insert" on public.couple_members;
create policy "couple_members_insert" on public.couple_members
  for insert with check (auth.uid() = user_id);

drop policy if exists "couple_members_delete_own" on public.couple_members;
create policy "couple_members_delete_own" on public.couple_members
  for delete using (auth.uid() = user_id);

-- couple_events
drop policy if exists "events_member_all" on public.couple_events;
create policy "events_member_all" on public.couple_events
  for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

-- event_reviews
drop policy if exists "reviews_member_read" on public.event_reviews;
create policy "reviews_member_read" on public.event_reviews
  for select using (public.is_couple_member(couple_id));

drop policy if exists "reviews_own_write" on public.event_reviews;
create policy "reviews_own_write" on public.event_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- couple_wishlist_items: hide reserved_by from owner for surprises
drop policy if exists "wishlist_member_read" on public.couple_wishlist_items;
create policy "wishlist_member_read" on public.couple_wishlist_items
  for select using (public.is_couple_member(couple_id));

drop policy if exists "wishlist_member_write" on public.couple_wishlist_items;
create policy "wishlist_member_write" on public.couple_wishlist_items
  for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

-- albums
drop policy if exists "albums_member_all" on public.albums;
create policy "albums_member_all" on public.albums
  for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

-- media
drop policy if exists "media_member_all" on public.media;
create policy "media_member_all" on public.media
  for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

-- intimacy_records: private = only creator, shared = both members
drop policy if exists "intimacy_read" on public.intimacy_records;
create policy "intimacy_read" on public.intimacy_records
  for select using (
    (visibility = 'shared' and public.is_couple_member(couple_id))
    or (visibility = 'private' and auth.uid() = created_by)
  );

drop policy if exists "intimacy_write" on public.intimacy_records;
create policy "intimacy_write" on public.intimacy_records
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

-- cycle_settings: only owner
drop policy if exists "cycle_settings_own" on public.cycle_settings;
create policy "cycle_settings_own" on public.cycle_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cycle_days: only owner
drop policy if exists "cycle_days_own" on public.cycle_days;
create policy "cycle_days_own" on public.cycle_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- partner reads cycle_days only if visibility allows
drop policy if exists "cycle_days_partner_read" on public.cycle_days;
create policy "cycle_days_partner_read" on public.cycle_days
  for select using (
    public.is_couple_member(couple_id)
    and auth.uid() != user_id
    and exists (
      select 1 from public.cycle_settings cs
      where cs.couple_id = cycle_days.couple_id
        and cs.user_id = cycle_days.user_id
        and cs.partner_visibility in ('show_support','show_full')
    )
  );

-- cycle_support_preferences: only owner writes
drop policy if exists "cycle_prefs_own" on public.cycle_support_preferences;
create policy "cycle_prefs_own" on public.cycle_support_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cycle_prefs_partner_read" on public.cycle_support_preferences;
create policy "cycle_prefs_partner_read" on public.cycle_support_preferences
  for select using (
    public.is_couple_member(couple_id)
    and auth.uid() != user_id
    and exists (
      select 1 from public.cycle_settings cs
      where cs.couple_id = cycle_support_preferences.couple_id
        and cs.user_id = cycle_support_preferences.user_id
        and cs.partner_visibility in ('show_support','show_full')
        and cs.recommendations_enabled = true
    )
  );

-- check_ins: visible to both only after both complete
drop policy if exists "checkins_own_write" on public.check_ins;
create policy "checkins_own_write" on public.check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "checkins_both_read" on public.check_ins;
create policy "checkins_both_read" on public.check_ins
  for select using (
    public.is_couple_member(couple_id)
    and (
      auth.uid() = user_id
      or exists (
        select 1 from public.check_ins ci2
        where ci2.couple_id = check_ins.couple_id
          and ci2.week_start = check_ins.week_start
          and ci2.user_id = auth.uid()
      )
    )
  );

-- agreements
drop policy if exists "agreements_member_all" on public.agreements;
create policy "agreements_member_all" on public.agreements
  for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

-- date_ideas
drop policy if exists "date_ideas_member_all" on public.date_ideas;
create policy "date_ideas_member_all" on public.date_ideas
  for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

-- ============== Storage buckets ==============
insert into storage.buckets (id, name, public) values ('couple-media', 'couple-media', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('couple-avatars', 'couple-avatars', true) on conflict do nothing;

-- Storage policies
drop policy if exists "couple_media_member" on storage.objects;
create policy "couple_media_member" on storage.objects
  for all using (
    bucket_id = 'couple-media'
    and auth.uid() is not null
  ) with check (
    bucket_id = 'couple-media'
    and auth.uid() is not null
  );

drop policy if exists "couple_avatars_public_read" on storage.objects;
create policy "couple_avatars_public_read" on storage.objects
  for select using (bucket_id = 'couple-avatars');

drop policy if exists "couple_avatars_auth_write" on storage.objects;
create policy "couple_avatars_auth_write" on storage.objects
  for all using (bucket_id = 'couple-avatars' and auth.uid() is not null)
  with check (bucket_id = 'couple-avatars' and auth.uid() is not null);
