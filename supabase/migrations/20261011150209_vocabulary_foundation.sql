-- Phase 3, schema only. Existing Auth/profiles objects are intentionally untouched.
-- User-owned entries are soft-deleted; deleting an Auth user still cascades its data.

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  expression text not null check (char_length(btrim(expression)) between 1 and 2000),
  -- Stored generation keeps duplicate detection correct when expression changes.
  -- Unicode quotes/dashes, repeated whitespace and surrounding punctuation normalize.
  normalized_expression text generated always as (
    regexp_replace(
      lower(btrim(regexp_replace(
        translate(expression, '’‘“”‐‑–—', $$''""----$$),
        '[[:space:]]+', ' ', 'g'
      ))),
      '^[[:punct:]]+|[[:punct:]]+$', '', 'g'
    )
  ) stored not null check (normalized_expression <> ''),
  entry_type text not null check (entry_type in (
    'word', 'phrase', 'phrasal_verb', 'idiom', 'sentence',
    'collocation', 'grammar_pattern', 'slang'
  )),
  cefr_level text check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  english_explanation text,
  pronunciation_ipa text,
  pronunciation_readable text,
  is_favorite boolean not null default false,
  is_difficult boolean not null default false,
  is_mastered boolean not null default false,
  learning_status text not null default 'new' check (learning_status in (
    'new', 'learning', 'reviewing', 'mastered', 'suspended'
  )),
  original_input text,
  user_note text,
  image_url text check (image_url is null or
    (char_length(image_url) <= 2048 and image_url ~* '^https://')),
  ai_generated boolean not null default false,
  ai_version text check (ai_version is null or char_length(ai_version) <= 64),
  ai_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(ai_metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.entry_meanings (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  meaning_tr text not null check (char_length(btrim(meaning_tr)) > 0),
  meaning_order integer not null default 0 check (meaning_order >= 0),
  usage_note text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entry_examples (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  sentence_en text not null check (char_length(btrim(sentence_en)) > 0),
  translation_tr text not null check (char_length(btrim(translation_tr)) > 0),
  example_order integer not null default 0 check (example_order >= 0),
  difficulty_level text check (difficulty_level in ('A1','A2','B1','B2','C1','C2')),
  source_type text,
  is_user_added boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.similar_expressions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  expression text not null check (char_length(btrim(expression)) > 0),
  turkish_meaning text,
  relationship_type text not null check (relationship_type in (
    'synonym', 'related', 'alternative', 'formal_alternative',
    'casual_alternative', 'slang_alternative'
  )),
  usage_difference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entry_sources (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  source_type text not null check (source_type in (
    'tv_series', 'movie', 'youtube', 'book', 'school',
    'podcast', 'web', 'manual', 'other'
  )),
  source_name text,
  series_name text,
  season_number integer check (season_number > 0),
  episode_number integer check (episode_number > 0),
  source_url text check (source_url is null or
    (char_length(source_url) <= 2048 and source_url ~* '^https?://')),
  source_sentence text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 120),
  description text,
  icon text check (icon is null or char_length(icon) <= 80),
  color text check (color is null or char_length(color) <= 32),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deck_entries (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  entry_id uuid not null references public.entries(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint deck_entries_pair_unique unique (deck_id, entry_id)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entry_tags (
  entry_id uuid not null references public.entries(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (entry_id, tag_id)
);

-- The partial unique index permits a new active entry when an older copy is trashed.
-- Restoring the old copy fails until the active duplicate is resolved.
create unique index if not exists entries_active_normalized_unique
  on public.entries (user_id, normalized_expression) where deleted_at is null;
create index if not exists entries_user_created_at_idx
  on public.entries (user_id, created_at desc, id desc) where deleted_at is null;
create index if not exists entries_user_learning_status_idx
  on public.entries (user_id, learning_status, created_at desc) where deleted_at is null;
create index if not exists entries_user_deleted_at_idx
  on public.entries (user_id, deleted_at) where deleted_at is not null;
create index if not exists entry_meanings_entry_order_idx
  on public.entry_meanings (entry_id, meaning_order, id);
create unique index if not exists entry_meanings_one_primary_idx
  on public.entry_meanings (entry_id) where is_primary;
create index if not exists entry_examples_entry_order_idx
  on public.entry_examples (entry_id, example_order, id);
create index if not exists similar_expressions_entry_idx
  on public.similar_expressions (entry_id);
create index if not exists entry_sources_entry_idx
  on public.entry_sources (entry_id);
create unique index if not exists decks_user_name_unique
  on public.decks (user_id, lower(name));
create index if not exists decks_user_created_at_idx
  on public.decks (user_id, created_at desc);
create index if not exists deck_entries_entry_deck_idx
  on public.deck_entries (entry_id, deck_id);
create unique index if not exists tags_user_name_unique
  on public.tags (user_id, lower(name));
create index if not exists entry_tags_tag_entry_idx
  on public.entry_tags (tag_id, entry_id);

-- Columns holding ownership or relationship IDs are intentionally not updatable.
alter table public.entries enable row level security;
alter table public.entry_meanings enable row level security;
alter table public.entry_examples enable row level security;
alter table public.similar_expressions enable row level security;
alter table public.entry_sources enable row level security;
alter table public.decks enable row level security;
alter table public.deck_entries enable row level security;
alter table public.tags enable row level security;
alter table public.entry_tags enable row level security;

revoke all on public.entries, public.entry_meanings, public.entry_examples,
  public.similar_expressions, public.entry_sources, public.decks,
  public.deck_entries, public.tags, public.entry_tags
  from public, anon, authenticated;

grant select, insert on public.entries, public.entry_meanings, public.entry_examples,
  public.similar_expressions, public.entry_sources, public.decks,
  public.deck_entries, public.tags, public.entry_tags to authenticated;
grant delete on public.entry_meanings, public.entry_examples,
  public.similar_expressions, public.entry_sources, public.decks,
  public.deck_entries, public.tags, public.entry_tags to authenticated;
grant update (expression, entry_type, cefr_level, english_explanation,
  pronunciation_ipa, pronunciation_readable, is_favorite, is_difficult,
  is_mastered, learning_status, original_input, user_note, image_url,
  ai_generated, ai_version, ai_metadata, deleted_at)
  on public.entries to authenticated;
grant update (meaning_tr, meaning_order, usage_note, is_primary)
  on public.entry_meanings to authenticated;
grant update (sentence_en, translation_tr, example_order, difficulty_level,
  source_type, is_user_added) on public.entry_examples to authenticated;
grant update (expression, turkish_meaning, relationship_type, usage_difference)
  on public.similar_expressions to authenticated;
grant update (source_type, source_name, series_name, season_number,
  episode_number, source_url, source_sentence)
  on public.entry_sources to authenticated;
grant update (name, description, icon, color, is_archived)
  on public.decks to authenticated;
grant update (name) on public.tags to authenticated;

-- RLS follows the parent owner. Link rows require BOTH sides to belong to the
-- same authenticated user; a guessed foreign UUID cannot be linked.
do $policy$ declare item record; policy_name text; begin
  for item in
    select * from (values
      ('entries', '(select auth.uid()) = user_id', true, false),
      ('decks', '(select auth.uid()) = user_id', true, true),
      ('tags', '(select auth.uid()) = user_id', true, true),
      ('entry_meanings', 'exists (select 1 from public.entries e where e.id = entry_id and e.user_id = (select auth.uid()))', true, true),
      ('entry_examples', 'exists (select 1 from public.entries e where e.id = entry_id and e.user_id = (select auth.uid()))', true, true),
      ('similar_expressions', 'exists (select 1 from public.entries e where e.id = entry_id and e.user_id = (select auth.uid()))', true, true),
      ('entry_sources', 'exists (select 1 from public.entries e where e.id = entry_id and e.user_id = (select auth.uid()))', true, true),
      ('deck_entries', 'exists (select 1 from public.decks d where d.id = deck_id and d.user_id = (select auth.uid())) and exists (select 1 from public.entries e where e.id = entry_id and e.user_id = (select auth.uid()))', false, true),
      ('entry_tags', 'exists (select 1 from public.tags t where t.id = tag_id and t.user_id = (select auth.uid())) and exists (select 1 from public.entries e where e.id = entry_id and e.user_id = (select auth.uid()))', false, true)
    ) as v(table_name, ownership, can_update, can_delete)
  loop
    policy_name := item.table_name || '_select_own';
    if not exists (select 1 from pg_policies where schemaname = 'public'
      and tablename = item.table_name and policyname = policy_name) then
      execute format('create policy %I on public.%I for select to authenticated using (%s)',
        policy_name, item.table_name, item.ownership);
    end if;
    policy_name := item.table_name || '_insert_own';
    if not exists (select 1 from pg_policies where schemaname = 'public'
      and tablename = item.table_name and policyname = policy_name) then
      execute format('create policy %I on public.%I for insert to authenticated with check (%s)',
        policy_name, item.table_name, item.ownership);
    end if;
    if item.can_update then
      policy_name := item.table_name || '_update_own';
      if not exists (select 1 from pg_policies where schemaname = 'public'
        and tablename = item.table_name and policyname = policy_name) then
        execute format('create policy %I on public.%I for update to authenticated using (%s) with check (%s)',
          policy_name, item.table_name, item.ownership, item.ownership);
      end if;
    end if;
    if item.can_delete then
      policy_name := item.table_name || '_delete_own';
      if not exists (select 1 from pg_policies where schemaname = 'public'
        and tablename = item.table_name and policyname = policy_name) then
        execute format('create policy %I on public.%I for delete to authenticated using (%s)',
          policy_name, item.table_name, item.ownership);
      end if;
    end if;
  end loop;
end $policy$;

create or replace function private.touch_vocabulary_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $fn$
begin
  new.updated_at = clock_timestamp();
  return new;
end $fn$;
revoke all on function private.touch_vocabulary_updated_at()
  from public, anon, authenticated, service_role;

do $triggers$ declare table_name text; begin
  foreach table_name in array array[
    'entries', 'entry_meanings', 'entry_examples', 'similar_expressions',
    'entry_sources', 'decks', 'tags'
  ] loop
    if not exists (select 1 from pg_trigger
      where tgrelid = format('public.%I', table_name)::regclass
        and tgname = 'sayid_vocabulary_updated_at') then
      execute format('create trigger sayid_vocabulary_updated_at before update on public.%I for each row execute function private.touch_vocabulary_updated_at()', table_name);
    end if;
  end loop;
end $triggers$;
