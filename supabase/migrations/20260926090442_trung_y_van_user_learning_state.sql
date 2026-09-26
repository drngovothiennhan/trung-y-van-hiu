create table public.trung_y_van_user_learning_state (
  account_id uuid primary key references public.trung_y_van_accounts(id) on delete cascade,
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object' and pg_column_size(state) <= 262144),
  updated_at timestamptz not null default now()
);

alter table public.trung_y_van_user_learning_state enable row level security;
revoke all on table public.trung_y_van_user_learning_state from public, anon, authenticated;
grant select, insert, update, delete on table public.trung_y_van_user_learning_state to service_role;

comment on table public.trung_y_van_user_learning_state is 'Private per-account learning progress and app context for Trung Y Van HIU';
