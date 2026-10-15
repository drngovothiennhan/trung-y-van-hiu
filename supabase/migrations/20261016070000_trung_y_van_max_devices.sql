-- Per-account device limit (additive). Default 1 keeps today's behaviour for everyone.
alter table public.trung_y_van_accounts
  add column if not exists max_devices smallint not null default 1;
alter table public.trung_y_van_accounts
  drop constraint if exists trung_y_van_accounts_max_devices_check;
alter table public.trung_y_van_accounts
  add constraint trung_y_van_accounts_max_devices_check check (max_devices between 1 and 10);

-- Owner request 2026-10-16: account 2413120060 (Trần Minh Đạo) may use up to 3 devices.
update public.trung_y_van_accounts set max_devices = 3
where student_code = '2413120060' and role = 'member';
