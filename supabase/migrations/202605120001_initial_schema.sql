create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_language text not null default 'de',
  created_at timestamptz not null default now()
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','worker','viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  name text not null, phone text, email text, address text, city text, notes text,
  preferred_contact text not null default 'unknown' check (preferred_contact in ('phone','whatsapp','email','unknown')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null, title text not null, service_type text not null,
  address text, city text,
  status text not null default 'neue_anfrage' check (status in ('neue_anfrage','besichtigung_geplant','angebot_gesendet','angenommen','in_arbeit','wartet_auf_kunde','wartet_auf_material','verschoben','abgeschlossen','rechnung_offen','bezahlt')),
  priority text not null default 'normal' check (priority in ('niedrig','normal','hoch','dringend')),
  start_date date, deadline date, estimated_days numeric, estimated_low_price numeric, estimated_normal_price numeric, estimated_high_price numeric,
  internal_notes text, customer_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade, customer_id uuid references customers(id) on delete set null,
  title text not null,
  type text not null check (type in ('baustellentermin','besichtigung','kunde_anrufen','material_holen','aufgabe','privat','erinnerung')),
  status text not null default 'geplant' check (status in ('geplant','in_arbeit','wartet_auf_kunde','wartet_auf_material','verschoben','erledigt','abgesagt')),
  priority text not null default 'normal' check (priority in ('niedrig','normal','hoch','dringend')),
  start_time timestamptz not null, end_time timestamptz not null, all_day boolean not null default false, location text, notes text, worker_count integer not null default 1,
  assigned_to uuid references auth.users(id) on delete set null, created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade, customer_id uuid references customers(id) on delete set null,
  title text not null, description text,
  status text not null default 'offen' check (status in ('offen','in_arbeit','erledigt','verschoben')),
  priority text not null default 'normal' check (priority in ('niedrig','normal','hoch','dringend')),
  due_date date, assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade, customer_id uuid references customers(id) on delete set null,
  type text not null default 'privat' check (type in ('kunde','baustelle','privat')),
  title text not null, content_de text, content_sq text, tags text[], reminder_date timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade, name text not null, quantity numeric, unit text,
  status text not null default 'benoetigt' check (status in ('benoetigt','bestellt','vorhanden','abgeholt','erledigt')),
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade, customer_id uuid references customers(id) on delete set null,
  storage_path text not null,
  type text not null default 'dokumentation' check (type in ('vorher','waehrend','nachher','notiz','dokumentation')),
  caption text, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade, customer_id uuid references customers(id) on delete set null,
  storage_path text not null,
  type text not null default 'sonstiges' check (type in ('angebot','rechnung','vertrag','beleg','sonstiges')),
  title text, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);

create table if not exists price_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  service_type text not null, name_de text not null, name_sq text, category text, unit text not null,
  low_price numeric not null, normal_price numeric not null, high_price numeric not null,
  material_included boolean not null default false, notes_de text, notes_sq text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists price_calculations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade, customer_id uuid references customers(id) on delete set null,
  service_type text not null, quantity numeric, unit text,
  difficulty text not null default 'normal' check (difficulty in ('leicht','normal','schwer','unbekannt')),
  estimated_low numeric, estimated_normal numeric, estimated_high numeric, customer_safe_note text, internal_notes text, calculation_json jsonb,
  created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);

create table if not exists service_workflows (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  service_type text not null, name_de text not null, name_sq text, description_de text, description_sq text, active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists workflow_questions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  workflow_id uuid not null references service_workflows(id) on delete cascade,
  question_key text not null, question_text_de text not null, question_text_sq text, help_text_de text, help_text_sq text,
  question_type text not null check (question_type in ('single_choice','multi_choice','number','date','time_range','text','boolean')),
  unit text, required boolean not null default true, order_index integer not null, created_at timestamptz not null default now()
);
create table if not exists workflow_options (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  question_id uuid not null references workflow_questions(id) on delete cascade,
  value text not null, label_de text not null, label_sq text, description_de text, description_sq text,
  time_multiplier numeric not null default 1, price_multiplier numeric not null default 1, extra_days numeric not null default 0,
  risk_level text not null default 'normal' check (risk_level in ('niedrig','normal','hoch')),
  order_index integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists workflow_answers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade, workflow_id uuid not null references service_workflows(id) on delete cascade,
  question_id uuid not null references workflow_questions(id) on delete cascade, answer_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists productivity_rules (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  service_type text not null, variant text, unit text not null, base_output_per_day numeric not null,
  helper_factor numeric not null default 1.45, minimum_days numeric not null default 0.5,
  notes_de text, notes_sq text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists dictionary_terms (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  category text, word_de text not null, word_sq text not null, example_sentence_de text, example_sentence_sq text,
  created_at timestamptz not null default now()
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  category text not null, title_de text not null, title_sq text, text_de text not null, text_sq text,
  created_at timestamptz not null default now()
);

create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade, user_id uuid references auth.users(id) on delete set null,
  start_time timestamptz, end_time timestamptz, notes text, created_at timestamptz not null default now()
);

create index if not exists idx_org_members_user on organization_members(user_id);
create index if not exists idx_customers_org on customers(organization_id);
create index if not exists idx_projects_org_status on projects(organization_id, status);
create index if not exists idx_calendar_events_org_start on calendar_events(organization_id, start_time);
create index if not exists idx_tasks_org_status on tasks(organization_id, status);
create index if not exists idx_notes_org_created_at on notes(organization_id, created_at desc);
create index if not exists idx_materials_org_status on materials(organization_id, status);
create index if not exists idx_price_items_org_service on price_items(organization_id, service_type);
create index if not exists idx_productivity_rules_org_service on productivity_rules(organization_id, service_type);

drop trigger if exists set_customers_updated_at on customers;
create trigger set_customers_updated_at before update on customers for each row execute function set_updated_at();
drop trigger if exists set_projects_updated_at on projects;
create trigger set_projects_updated_at before update on projects for each row execute function set_updated_at();
drop trigger if exists set_calendar_events_updated_at on calendar_events;
create trigger set_calendar_events_updated_at before update on calendar_events for each row execute function set_updated_at();
drop trigger if exists set_tasks_updated_at on tasks;
create trigger set_tasks_updated_at before update on tasks for each row execute function set_updated_at();
drop trigger if exists set_notes_updated_at on notes;
create trigger set_notes_updated_at before update on notes for each row execute function set_updated_at();
drop trigger if exists set_materials_updated_at on materials;
create trigger set_materials_updated_at before update on materials for each row execute function set_updated_at();
drop trigger if exists set_price_items_updated_at on price_items;
create trigger set_price_items_updated_at before update on price_items for each row execute function set_updated_at();
drop trigger if exists set_productivity_rules_updated_at on productivity_rules;
create trigger set_productivity_rules_updated_at before update on productivity_rules for each row execute function set_updated_at();
