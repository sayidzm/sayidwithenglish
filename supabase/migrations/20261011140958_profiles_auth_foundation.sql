-- Phase 2 only: no vocabulary, review or AI tables.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null default 'Sayid' check (char_length(display_name) between 1 and 128),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 2048),
  native_language text not null default 'tr' check (native_language = 'tr'),
  learning_language text not null default 'en' check (learning_language = 'en'),
  current_level text not null default 'B1' check (current_level in ('A1','A2','B1','B2','C1','C2')),
  target_level text not null default 'B2' check (target_level in ('A1','A2','B1','B2','C1','C2')),
  daily_new_card_limit integer not null default 10 check (daily_new_card_limit between 1 and 50),
  daily_review_goal integer not null default 30 check (daily_review_goal between 1 and 200),
  preferred_accent text not null default 'us' check (preferred_accent in ('us','uk')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select, insert on public.profiles to authenticated;
grant update (display_name, avatar_url, current_level, target_level,
  daily_new_card_limit, daily_review_goal, preferred_accent)
  on public.profiles to authenticated;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_own') then
    create policy profiles_select_own on public.profiles for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_insert_own') then
    create policy profiles_insert_own on public.profiles for insert to authenticated
      with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_own') then
    create policy profiles_update_own on public.profiles for update to authenticated
      using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
end $$;

-- Auth invokes this internal trigger before an authenticated session exists.
-- User-editable metadata is used only as display text, never authorization.
create or replace function private.bootstrap_auth_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_schema <> 'auth' or tg_table_name <> 'users' then
    raise exception 'Invalid trigger context';
  end if;
  if auth.uid() is not null and auth.uid() <> new.id then
    raise exception 'Invalid profile owner';
  end if;
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(nullif(left(btrim(new.raw_user_meta_data->>'display_name'),128),''),'Sayid'))
  on conflict (user_id) do nothing;
  return new;
end $$;
revoke all on function private.bootstrap_auth_profile() from public, anon, authenticated, service_role;

create or replace function private.touch_profile_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end $$;
revoke all on function private.touch_profile_updated_at() from public, anon, authenticated, service_role;

do $$ begin
  if not exists (select 1 from pg_trigger where tgrelid='auth.users'::regclass and tgname='sayid_bootstrap_profile') then
    create trigger sayid_bootstrap_profile after insert on auth.users
      for each row execute function private.bootstrap_auth_profile();
  end if;
  if not exists (select 1 from pg_trigger where tgrelid='public.profiles'::regclass and tgname='sayid_profile_updated_at') then
    create trigger sayid_profile_updated_at before update on public.profiles
      for each row execute function private.touch_profile_updated_at();
  end if;
end $$;

-- Safe bootstrap for existing Auth users; never overwrite existing profiles.
insert into public.profiles (user_id, display_name)
select id, coalesce(nullif(left(btrim(raw_user_meta_data->>'display_name'),128),''),'Sayid')
from auth.users on conflict (user_id) do nothing;
