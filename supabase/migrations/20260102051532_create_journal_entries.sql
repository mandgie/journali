-- Create journal_entries table
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  content text not null default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- One entry per user per day
  unique(user_id, date)
);

-- Enable RLS
alter table public.journal_entries enable row level security;

-- Users can only see their own entries
create policy "Users can view own entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

-- Users can insert their own entries
create policy "Users can insert own entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

-- Users can update their own entries
create policy "Users can update own entries"
  on public.journal_entries for update
  using (auth.uid() = user_id);

-- Users can delete their own entries
create policy "Users can delete own entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_journal_entry_updated
  before update on public.journal_entries
  for each row execute function public.handle_updated_at();

-- Index for fast lookups by user and date
create index journal_entries_user_date_idx on public.journal_entries(user_id, date);
