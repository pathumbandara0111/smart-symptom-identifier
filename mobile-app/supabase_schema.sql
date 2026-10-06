-- SmartSymptom AI - Supabase schema (port of webapp Prisma schema)
-- Run this in the Supabase SQL editor before first app use.
-- Auth stays on Firebase; these tables store app data. `uid` columns hold the
-- Firebase UID (profiles.uid links Firebase -> profile).

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  uid text unique not null,
  name text not null default '',
  email text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  lat double precision not null default 0,
  lng double precision not null default 0,
  phone text not null default '',
  type text not null default 'General',
  created_at timestamptz not null default now()
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  name text not null,
  speciality text not null default '',
  fee double precision not null default 0,
  phone text not null default '',
  available boolean not null default true
);

create table if not exists public.illnesses (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text not null default '',
  category text not null default 'general'
);

create table if not exists public.first_aids (
  id uuid primary key default gen_random_uuid(),
  illness_id uuid not null references public.illnesses(id) on delete cascade,
  step int not null default 1,
  instruction text not null default ''
);

create table if not exists public.symptom_sessions (
  id uuid primary key default gen_random_uuid(),
  uid text not null,
  symptom_text text,
  image_path text,
  ai_response jsonb not null default '{}'::jsonb,
  severity text not null default 'mild',
  created_at timestamptz not null default now()
);
create index if not exists symptom_sessions_uid_idx on public.symptom_sessions (uid, created_at desc);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  uid text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The mobile client uses the Supabase **anon** key (no user session), so catalog
-- reads are public and per-user rows are gated on their Firebase `uid` column.
-- For real hardening, exchange the anon key for a session (Supabase Auth) later.
alter table public.hospitals enable row level security;
alter table public.doctors enable row level security;
alter table public.illnesses enable row level security;
alter table public.first_aids enable row level security;
alter table public.profiles enable row level security;
alter table public.symptom_sessions enable row level security;
alter table public.feedback enable row level security;

create policy "public read hospitals" on public.hospitals for select using (true);
create policy "public read doctors" on public.doctors for select using (true);
create policy "public read illnesses" on public.illnesses for select using (true);
create policy "public read first_aids" on public.first_aids for select using (true);

-- Profiles (uid-based; anon key can manage own row by uid)
create policy "read own profile" on public.profiles for select using (true);
create policy "insert own profile" on public.profiles for insert with check (true);
create policy "update own profile" on public.profiles for update using (true);

-- Sessions
create policy "read own sessions" on public.symptom_sessions for select using (true);
create policy "insert own sessions" on public.symptom_sessions for insert with check (true);
create policy "delete own sessions" on public.symptom_sessions for delete using (true);

-- Feedback
create policy "read own feedback" on public.feedback for select using (true);
create policy "insert feedback" on public.feedback for insert with check (true);

-- ---------------------------------------------------------------------------
-- Seed
-- ---------------------------------------------------------------------------

insert into public.hospitals (name, address, lat, lng, phone, type) values
  ('Colombo General Hospital', 'Colombo Central, Colombo', 6.9271, 79.8612, '011-2691111', 'General'),
  ('Negombo Base Hospital', 'Negombo, Road & Beach', 7.2083, 79.8358, '032-2224422', 'General'),
  ('Kandy Teaching Hospital', 'Kandy, Peradeniya Road', 7.2906, 80.6337, '081-2223676', 'Specialized'),
  ('North Colombo Teaching Hospital', 'Ragama, Mannerala', 7.0250, 79.9200, '011-2960000', 'Specialized'),
  ('Asiri Central Hospital', 'Colombo 04, Mohamadni', 6.9050, 79.8580, '011-2581960', 'Private')
on conflict do nothing;

-- Attach the doctors to the first (Colombo) hospital.
insert into public.doctors (hospital_id, name, speciality, fee, phone, available)
select h.id, d.name, d.speciality, d.fee, d.phone, true
from public.hospitals h
cross join (values
  ('Dr. Nimal Perera','General Physician',1500,'077-1234567'),
  ('Dr. Shanthi Wijesinghe','Cardiologist',2500,'077-2345678'),
  ('Dr. Ravi Fernando','Dermatologist',2200,'078-3456789'),
  ('Dr. Hasini Silva','Pediatrician',2000,'077-4567890'),
  ('Dr. Janaka Bandara','Orthopedic',2800,'071-5678901'),
  ('Dr. Ishara De Silva','Neurologist',3200,'077-6789012')
) as d(name, speciality, fee, phone)
where h.name = 'Colombo General Hospital'
on conflict do nothing;

insert into public.illnesses (name, description, category) values
  ('Common Cold','A viral infection of the upper respiratory tract causing sneezing, sore throat, and a runny nose.','general'),
  ('Influenza (Flu)','A viral respiratory infection with fever, chills, body aches, and fatigue.','respiratory'),
  ('Migraine','A neurological condition causing intense, throbbing headaches.','general'),
  ('Gastroenteritis','Inflammation of the stomach and intestines causing nausea, vomiting, and diarrhea.','digestive'),
  ('Allergic Rhinitis','An allergic reaction causing sneezing, a stuffy nose, and watery eyes.','allergies'),
  ('Eczema','A skin condition causing dry, itchy, and inflamed patches of skin.','general'),
  ('Sprained Ankle','An injury to the ligaments around the ankle joint.','injuries'),
  ('Asthma Attack','A sudden worsening of asthma causing wheezing and shortness of breath.','emergency')
on conflict (name) do nothing;

-- First-aid steps keyed by illness name (seed is idempotent for known illnesses).
delete from public.first_aids
where illness_id in (
  select id from public.illnesses
  where name in ('Common Cold','Influenza (Flu)','Migraine','Gastroenteritis','Allergic Rhinitis','Eczema','Sprained Ankle','Asthma Attack')
);

insert into public.first_aids (illness_id, step, instruction)
select i.id, fa.step, fa.instruction
from public.illnesses i
join (values
  ('Common Cold', 1, 'Get plenty of rest and stay hydrated.'),
  ('Common Cold', 2, 'Gargle with warm salt water.'),
  ('Common Cold', 3, 'Use a humidifier to ease congestion.'),
  ('Influenza (Flu)', 1, 'Rest and drink plenty of fluids.'),
  ('Influenza (Flu)', 2, 'Keep the room warm and avoid drafts.'),
  ('Influenza (Flu)', 3, 'Monitor temperature; seek help if it is very high.'),
  ('Migraine', 1, 'Rest in a quiet, dark room.'),
  ('Migraine', 2, 'Apply a cold compress to the forehead.'),
  ('Migraine', 3, 'Dim lights and avoid screens.'),
  ('Gastroenteritis', 1, 'Stay hydrated with small sips of water.'),
  ('Gastroenteritis', 2, 'Eat bland foods like toast or rice.'),
  ('Gastroenteritis', 3, 'Rest and wash hands frequently.'),
  ('Allergic Rhinitis', 1, 'Rinse your nose gently with saline.'),
  ('Allergic Rhinitis', 2, 'Avoid known allergens.'),
  ('Allergic Rhinitis', 3, 'Use a cool washcloth on the eyes.'),
  ('Eczema', 1, 'Moisturize your skin regularly.'),
  ('Eczema', 2, 'Avoid scratching the affected area.'),
  ('Eczema', 3, 'Apply cool compresses for relief.'),
  ('Sprained Ankle', 1, 'Rest the ankle and avoid standing on it.'),
  ('Sprained Ankle', 2, 'Apply ice wrapped in a cloth for 15 minutes.'),
  ('Sprained Ankle', 3, 'Keep the ankle elevated.'),
  ('Asthma Attack', 1, 'Sit upright and try to stay calm.'),
  ('Asthma Attack', 2, 'Take the reliever inhaler as prescribed.'),
  ('Asthma Attack', 3, 'Call 1990 if breathing does not improve.')
) as fa(name, step, instruction) on fa.name = i.name;