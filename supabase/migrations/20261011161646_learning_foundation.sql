-- Phase 4: additive learning and AI job persistence. Existing vocabulary/Auth
-- tables and their data are not modified.

create table if not exists public.learning_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  enabled_card_types text[] not null default array['en_to_tr','tr_to_en','meaning','cloze','sentence_completion','translation','production']::text[],
  updated_at timestamptz not null default now(),
  constraint learning_preferences_card_types_check check (
    enabled_card_types <@ array['en_to_tr','tr_to_en','meaning','cloze','listening','sentence_completion','translation','production']::text[]
  )
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_id uuid not null references public.entries(id) on delete cascade,
  card_type text not null check (card_type in ('en_to_tr','tr_to_en','meaning','cloze','listening','sentence_completion','translation','production')),
  front_data jsonb not null check (jsonb_typeof(front_data) = 'object'),
  back_data jsonb not null check (jsonb_typeof(back_data) = 'object'),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flashcards_entry_type_unique unique (entry_id, card_type)
);

create table if not exists public.review_state (
  id uuid primary key default gen_random_uuid(),
  flashcard_id uuid not null unique references public.flashcards(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  stability double precision not null default 0 check (stability >= 0),
  difficulty double precision not null default 0 check (difficulty >= 0),
  scheduled_days integer not null default 0 check (scheduled_days >= 0),
  elapsed_days integer not null default 0 check (elapsed_days >= 0),
  learning_steps integer not null default 0 check (learning_steps >= 0),
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  review_count integer not null default 0 check (review_count >= 0),
  lapse_count integer not null default 0 check (lapse_count >= 0),
  state text not null default 'new' check (state in ('new','learning','review','relearning')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  rating text not null check (rating in ('again','hard','good','easy')),
  response_time_ms integer check (response_time_ms is null or response_time_ms between 0 and 600000),
  was_correct boolean not null,
  previous_due_at timestamptz,
  next_due_at timestamptz not null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_id uuid not null references public.entries(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  mistake_type text not null check (char_length(mistake_type) between 1 and 80),
  user_answer text,
  correct_answer text,
  times_missed integer not null default 1 check (times_missed > 0),
  last_missed_at timestamptz not null default now(),
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mistakes_card_type_unique unique (user_id, flashcard_id, mistake_type)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_type text not null check (session_type in ('flashcard','quiz','writing','listening','shadowing','mixed')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_cards integer not null default 0 check (total_cards >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  incorrect_answers integer not null default 0 check (incorrect_answers >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.study_session_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  study_session_id uuid not null references public.study_sessions(id) on delete cascade,
  entry_id uuid not null references public.entries(id) on delete cascade,
  flashcard_id uuid references public.flashcards(id) on delete set null,
  question_type text not null,
  user_answer text,
  correct_answer text,
  is_correct boolean not null,
  response_time_ms integer check (response_time_ms is null or response_time_ms between 0 and 600000),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','processing','completed','partial','failed')),
  total_items integer not null check (total_items between 1 and 20),
  processed_items integer not null default 0 check (processed_items >= 0),
  failed_items integer not null default 0 check (failed_items >= 0),
  input_json jsonb not null check (jsonb_typeof(input_json) = 'array'),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_job_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  job_id uuid not null references public.ai_jobs(id) on delete cascade,
  raw_input text not null,
  normalized_input text not null,
  status text not null default 'queued' check (status in ('queued','processing','completed','duplicate','failed')),
  result_json jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_job_items_job_normalized_unique unique (job_id, normalized_input)
);

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  model text not null,
  request_type text not null check (request_type in ('vocabulary','tutor')),
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

create index if not exists flashcards_user_entry_idx on public.flashcards (user_id, entry_id);
create index if not exists review_state_user_due_idx on public.review_state (user_id, due_at, state);
create index if not exists review_history_user_reviewed_idx on public.review_history (user_id, reviewed_at desc);
create index if not exists review_history_card_idx on public.review_history (flashcard_id, reviewed_at desc);
create index if not exists mistakes_user_active_idx on public.mistakes (user_id, last_missed_at desc) where not resolved;
create index if not exists mistakes_entry_idx on public.mistakes (entry_id);
create index if not exists study_sessions_user_started_idx on public.study_sessions (user_id, started_at desc);
create index if not exists study_session_items_session_idx on public.study_session_items (study_session_id);
create index if not exists study_session_items_entry_idx on public.study_session_items (entry_id);
create index if not exists ai_jobs_user_created_idx on public.ai_jobs (user_id, created_at desc);
create index if not exists ai_job_items_job_idx on public.ai_job_items (job_id, status);
create index if not exists ai_usage_user_created_idx on public.ai_usage (user_id, created_at desc);

do $triggers$ declare table_name text; begin
  foreach table_name in array array['learning_preferences','flashcards','review_state','mistakes','ai_job_items'] loop
    if not exists (select 1 from pg_trigger where tgrelid = ('public.' || table_name)::regclass and tgname = 'sayid_learning_updated_at') then
      execute format('create trigger sayid_learning_updated_at before update on public.%I for each row execute function private.touch_vocabulary_updated_at()', table_name);
    end if;
  end loop;
end $triggers$;

do $policies$ declare table_name text; begin
  foreach table_name in array array['learning_preferences','flashcards','review_state','review_history','mistakes','study_sessions','study_session_items','ai_jobs','ai_job_items','ai_usage'] loop
    execute format('alter table public.%I enable row level security', table_name);
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=table_name and policyname='sayid_owner_select') then
      execute format('create policy sayid_owner_select on public.%I for select to authenticated using (user_id = (select auth.uid()))', table_name);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=table_name and policyname='sayid_owner_insert') then
      execute format('create policy sayid_owner_insert on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', table_name);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=table_name and policyname='sayid_owner_update') then
      execute format('create policy sayid_owner_update on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', table_name);
    end if;
  end loop;
end $policies$;

-- Parent ownership is checked on every FK-bearing insert/update. Linkage IDs
-- are never granted UPDATE, so relationships cannot be reassigned afterward.
do $ownership$ declare item record; begin
  for item in select * from (values
    ('flashcards','exists (select 1 from public.entries e where e.id=entry_id and e.user_id=(select auth.uid()) and e.deleted_at is null)'),
    ('review_state','exists (select 1 from public.flashcards f where f.id=flashcard_id and f.user_id=(select auth.uid()))'),
    ('review_history','exists (select 1 from public.flashcards f where f.id=flashcard_id and f.user_id=(select auth.uid()))'),
    ('mistakes','exists (select 1 from public.flashcards f join public.entries e on e.id=f.entry_id where f.id=flashcard_id and e.id=entry_id and f.user_id=(select auth.uid()))'),
    ('study_session_items','exists (select 1 from public.study_sessions s join public.entries e on e.id=entry_id where s.id=study_session_id and s.user_id=(select auth.uid()) and e.user_id=(select auth.uid()) and (flashcard_id is null or exists (select 1 from public.flashcards f where f.id=flashcard_id and f.entry_id=e.id and f.user_id=(select auth.uid()))))'),
    ('ai_job_items','exists (select 1 from public.ai_jobs j where j.id=job_id and j.user_id=(select auth.uid()))')
  ) as rules(table_name, predicate) loop
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=item.table_name and policyname='sayid_parent_insert') then
      execute format('create policy sayid_parent_insert on public.%I as restrictive for insert to authenticated with check (%s)',item.table_name,item.predicate);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=item.table_name and policyname='sayid_parent_update') then
      execute format('create policy sayid_parent_update on public.%I as restrictive for update to authenticated using (%s) with check (%s)',item.table_name,item.predicate,item.predicate);
    end if;
  end loop;
end $ownership$;

-- PostgreSQL combines permissive policies with OR. Parent checks are
-- restrictive so both ownership and parent ownership must pass.

revoke all on public.learning_preferences, public.flashcards, public.review_state,
  public.review_history, public.mistakes, public.study_sessions,
  public.study_session_items, public.ai_jobs, public.ai_job_items,
  public.ai_usage from public, anon, authenticated;

grant select, insert on public.learning_preferences, public.flashcards,
  public.review_state, public.review_history, public.mistakes,
  public.study_sessions, public.study_session_items, public.ai_jobs,
  public.ai_job_items, public.ai_usage to authenticated;
grant update (enabled_card_types) on public.learning_preferences to authenticated;
grant update (front_data, back_data, is_enabled) on public.flashcards to authenticated;
grant update (stability, difficulty, scheduled_days, elapsed_days,
  learning_steps, due_at, last_reviewed_at, review_count, lapse_count, state)
  on public.review_state to authenticated;
grant update (user_answer, correct_answer, times_missed, last_missed_at, resolved)
  on public.mistakes to authenticated;
grant update (ended_at, total_cards, correct_answers, incorrect_answers, duration_seconds)
  on public.study_sessions to authenticated;
grant update (status, processed_items, failed_items, started_at, completed_at)
  on public.ai_jobs to authenticated;
grant update (status, result_json, error_message) on public.ai_job_items to authenticated;

-- One transaction records the FSRS result, history, mistake and session.
-- The caller is the authenticated user; RLS remains in force (invoker).
create or replace function public.commit_review(
  p_flashcard_id uuid, p_rating text, p_expected_count integer,
  p_due_at timestamptz, p_stability double precision,
  p_difficulty double precision, p_scheduled_days integer,
  p_elapsed_days integer, p_learning_steps integer,
  p_state text, p_lapse_count integer, p_response_time_ms integer,
  p_session_id uuid default null, p_user_answer text default null,
  p_correct_answer text default null
) returns jsonb language plpgsql security invoker set search_path = '' as $fn$
declare
  v_user uuid := auth.uid();
  v_entry uuid;
  v_previous_due timestamptz;
  v_count integer;
  v_now timestamptz := clock_timestamp();
begin
  if v_user is null or p_rating is null or p_rating not in ('again','hard','good','easy')
     or p_state is null or p_state not in ('new','learning','review','relearning')
     or p_expected_count is null or p_expected_count < 0
     or p_stability is null or p_stability < 0
     or p_difficulty is null or p_difficulty < 0
     or p_scheduled_days is null or p_scheduled_days < 0
     or p_elapsed_days is null or p_elapsed_days < 0
     or p_learning_steps is null or p_learning_steps < 0
     or p_lapse_count is null or p_lapse_count < 0 or p_due_at is null
     or p_due_at > v_now + interval '100 years'
     or p_due_at < v_now - interval '1 day'
     or (p_response_time_ms is not null and p_response_time_ms not between 0 and 600000)
  then raise exception 'Invalid review input' using errcode='22023'; end if;

  select f.entry_id, rs.due_at, rs.review_count
    into v_entry, v_previous_due, v_count
    from public.review_state rs
    join public.flashcards f on f.id=rs.flashcard_id
    join public.entries e on e.id=f.entry_id
    where rs.flashcard_id=p_flashcard_id and rs.user_id=v_user
      and f.user_id=v_user and f.is_enabled and e.deleted_at is null
    for update of rs;
  if not found then raise exception 'Card unavailable' using errcode='P0002'; end if;
  if v_count <> p_expected_count then
    raise exception 'Stale review state' using errcode='40001';
  end if;
  if p_session_id is not null and not exists (
    select 1 from public.study_sessions s
      where s.id=p_session_id and s.user_id=v_user and s.ended_at is null
  ) then raise exception 'Session unavailable' using errcode='P0002'; end if;

  update public.review_state set
    stability=p_stability, difficulty=p_difficulty,
    scheduled_days=p_scheduled_days, elapsed_days=p_elapsed_days,
    learning_steps=p_learning_steps, due_at=p_due_at,
    last_reviewed_at=v_now, review_count=review_count+1,
    lapse_count=p_lapse_count, state=p_state
    where flashcard_id=p_flashcard_id and user_id=v_user;

  insert into public.review_history (user_id,flashcard_id,rating,
    response_time_ms,was_correct,previous_due_at,next_due_at,reviewed_at)
    values (v_user,p_flashcard_id,p_rating,p_response_time_ms,
      p_rating <> 'again',v_previous_due,p_due_at,v_now);

  if p_rating='again' then
    insert into public.mistakes (user_id,entry_id,flashcard_id,mistake_type,
      user_answer,correct_answer,last_missed_at)
      values (v_user,v_entry,p_flashcard_id,'review',
        left(p_user_answer,3000),left(p_correct_answer,3000),v_now)
    on conflict (user_id,flashcard_id,mistake_type) do update set
      times_missed=public.mistakes.times_missed+1,
      user_answer=excluded.user_answer,
      correct_answer=excluded.correct_answer,
      last_missed_at=v_now,resolved=false;
  end if;

  if p_session_id is not null then
    update public.study_sessions set
      total_cards=total_cards+1,
      correct_answers=correct_answers + case when p_rating='again' then 0 else 1 end,
      incorrect_answers=incorrect_answers + case when p_rating='again' then 1 else 0 end
      where id=p_session_id and user_id=v_user;
    insert into public.study_session_items (user_id,study_session_id,entry_id,
      flashcard_id,question_type,user_answer,correct_answer,is_correct,response_time_ms)
      values (v_user,p_session_id,v_entry,p_flashcard_id,'flashcard',
        left(p_user_answer,3000),left(p_correct_answer,3000),
        p_rating <> 'again',p_response_time_ms);
  end if;
  return jsonb_build_object('review_count',v_count+1,'due_at',p_due_at);
end $fn$;

revoke all on function public.commit_review(uuid,text,integer,timestamptz,double precision,
  double precision,integer,integer,integer,text,integer,integer,uuid,text,text)
  from public, anon;
grant execute on function public.commit_review(uuid,text,integer,timestamptz,double precision,
  double precision,integer,integer,integer,text,integer,integer,uuid,text,text)
  to authenticated;
