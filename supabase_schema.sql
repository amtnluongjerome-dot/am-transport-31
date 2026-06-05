-- ═══════════════════════════════════════════════════
--  AM TRANSPORT 31 — SCHEMA SUPABASE
--  Colle ce SQL dans l'éditeur SQL de Supabase
-- ═══════════════════════════════════════════════════

-- 1. TABLE PROFILES (étend auth.users)
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text not null,
  email       text,
  role        text not null check (role in ('manager','driver')),
  created_at  timestamptz default now()
);

-- Trigger : crée automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Nouveau compte'),
    coalesce(new.raw_user_meta_data->>'role', 'driver')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. TABLE BADGES TELEPEAGE
create table public.telepeage_badges (
  id          uuid default gen_random_uuid() primary key,
  reference   text not null unique,
  notes       text,
  created_at  timestamptz default now()
);


-- 3. TABLE ATTRIBUTIONS VEHICULES
create table public.vehicule_attributions (
  id                  uuid default gen_random_uuid() primary key,
  profile_id          uuid references public.profiles(id) on delete cascade,
  plaque              text not null,
  telepeage_badge_id  uuid references public.telepeage_badges(id),
  route               text,
  date                date not null default current_date,
  created_at          timestamptz default now(),
  unique(profile_id, date)
);


-- 4. TABLE PLANNING
create table public.planning (
  id          uuid default gen_random_uuid() primary key,
  profile_id  uuid references public.profiles(id) on delete cascade,
  date        date not null,
  route       text,
  statut      text default 'actif' check (statut in ('actif','conge','maladie','formation','repos')),
  created_at  timestamptz default now(),
  unique(profile_id, date)
);


-- 5. TABLE TOURNEES (données journalières du chauffeur)
create table public.tournees (
  id                      uuid default gen_random_uuid() primary key,
  profile_id              uuid references public.profiles(id) on delete cascade,
  vehicule_attribution_id uuid references public.vehicule_attributions(id),
  date                    date not null default current_date,

  -- Matin
  km_depart               integer,
  photo_camion_matin      text,
  photo_mobilic_matin     text,
  remarques_depart        text,
  heure_depart            time,

  -- Soir
  km_retour               integer,
  photo_camion_soir       text,
  photo_mobilic_soir      text,
  remarques_retour        text,
  heure_retour            time,

  statut  text default 'depart' check (statut in ('depart','en_tournee','cloture','absent')),
  created_at timestamptz default now(),
  unique(profile_id, date)
);


-- ═══════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════

alter table public.profiles             enable row level security;
alter table public.vehicule_attributions enable row level security;
alter table public.planning             enable row level security;
alter table public.tournees             enable row level security;
alter table public.telepeage_badges     enable row level security;

-- PROFILES : chacun voit le sien, managers voient tout
create policy "Profil perso" on public.profiles
  for select using (auth.uid() = id);
create policy "Manager voit tout" on public.profiles
  for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'manager')
  );

-- TOURNEES : chauffeur voit les siennes, manager voit tout
create policy "Tournee perso" on public.tournees
  for all using (auth.uid() = profile_id);
create policy "Manager tournees" on public.tournees
  for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'manager')
  );

-- PLANNING : lecture pour tous, écriture manager seulement
create policy "Planning lecture" on public.planning
  for select using (true);
create policy "Planning manager" on public.planning
  for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'manager')
  );

-- ATTRIBUTIONS : lecture pour le chauffeur concerné + managers
create policy "Attribution perso" on public.vehicule_attributions
  for select using (auth.uid() = profile_id);
create policy "Attribution manager" on public.vehicule_attributions
  for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'manager')
  );

-- BADGES : lecture tous, écriture manager
create policy "Badges lecture" on public.telepeage_badges
  for select using (true);
create policy "Badges manager" on public.telepeage_badges
  for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'manager')
  );


-- ═══════════════════════════════════════════════════
--  STORAGE — bucket photos
-- ═══════════════════════════════════════════════════
-- Dans Supabase > Storage, crée un bucket "photos" (public)
-- puis ajoute ces policies :

-- insert storage.objects for bucket "photos":
--   authenticated users can upload
-- select storage.objects for bucket "photos":
--   authenticated users can view


-- ═══════════════════════════════════════════════════
--  DONNÉES DE TEST (optionnel)
-- ═══════════════════════════════════════════════════

-- Badges de test
insert into public.telepeage_badges (reference) values
  ('TP-001'),('TP-002'),('TP-003'),('TP-004'),('TP-005'),
  ('TP-006'),('TP-007'),('TP-008'),('TP-009'),('TP-010');
