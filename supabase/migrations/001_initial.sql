-- NSH Meister-Assistent: Initial Schema
-- Supabase SQL Editor — einmalig ausführen

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select" ON customers
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "customers_delete" ON customers
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- ============================================================
-- PROJECTS (Baustellen)
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_type     TEXT NOT NULL DEFAULT 'vinyl',
  status           TEXT NOT NULL DEFAULT 'geplant'
                   CHECK (status IN ('geplant','in_arbeit','fertig','abgesagt')),
  address          TEXT,
  area_m2          DECIMAL(10,2),
  vinyl_type       TEXT,
  object_type      TEXT,
  ground_condition TEXT,
  extras           JSONB NOT NULL DEFAULT '{}',
  material_supply  TEXT,
  helpers_count    INTEGER NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON projects
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id     ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status       ON projects(status);

-- ============================================================
-- CALENDAR EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  start_time     TIMESTAMPTZ NOT NULL,
  end_time       TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'geplant'
                 CHECK (status IN ('geplant','erledigt','abgesagt')),
  helpers_count  INTEGER NOT NULL DEFAULT 0,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON calendar_events
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "events_insert" ON calendar_events
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "events_update" ON calendar_events
  FOR UPDATE USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "events_delete" ON calendar_events
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_events_user_id    ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_project_id ON calendar_events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON calendar_events(start_time);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  is_done     BOOLEAN NOT NULL DEFAULT FALSE,
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON tasks
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id    ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date   ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- ============================================================
-- NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  type        TEXT NOT NULL DEFAULT 'privat'
              CHECK (type IN ('privat','kunden','baustellen')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON notes
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "notes_insert" ON notes
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "notes_update" ON notes
  FOR UPDATE USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "notes_delete" ON notes
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- ============================================================
-- MATERIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'benoetigt'
              CHECK (status IN ('benoetigt','bestellt','vorhanden','abgeholt','erledigt')),
  quantity    DECIMAL(10,2),
  unit        TEXT NOT NULL DEFAULT 'Stk',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials_select" ON materials
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "materials_insert" ON materials
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "materials_update" ON materials
  FOR UPDATE USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "materials_delete" ON materials
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_materials_user_id    ON materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_project_id ON materials(project_id);

-- ============================================================
-- PRICE CALCULATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS price_calculations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id  UUID REFERENCES customers(id) ON DELETE SET NULL,
  project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  area_m2      DECIMAL(10,2),
  difficulty   TEXT,
  extras       JSONB NOT NULL DEFAULT '{}',
  price_low    DECIMAL(10,2),
  price_normal DECIMAL(10,2),
  price_high   DECIMAL(10,2),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE price_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calc_select" ON price_calculations
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "calc_insert" ON price_calculations
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "calc_delete" ON price_calculations
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_calc_user_id ON price_calculations(user_id);

-- ============================================================
-- DICTIONARY TERMS (Deutsch lernen)
-- ============================================================
CREATE TABLE IF NOT EXISTS dictionary_terms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section    TEXT NOT NULL,
  german     TEXT NOT NULL,
  albanian   TEXT NOT NULL,
  example_de TEXT,
  example_al TEXT
);

ALTER TABLE dictionary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terms_public_read" ON dictionary_terms
  FOR SELECT USING (true);

-- Seed-Daten (nur Admin kann einfuegen, daher kein INSERT-Policy fuer anon)
-- Diese INSERTs laufen als postgres-User (SQL Editor umgeht RLS)
INSERT INTO dictionary_terms (section, german, albanian, example_de, example_al) VALUES
-- Baustelle Woerter
('baustelle', 'die Baustelle', 'kantieri', 'Die Baustelle ist bereit.', 'Kantieri eshte gati.'),
('baustelle', 'der Untergrund', 'baza', 'Der Untergrund ist schlecht.', 'Baza eshte e keqe.'),
('baustelle', 'das Vinyl', 'vinili', 'Das Vinyl wird verlegt.', 'Vinili vendoset.'),
('baustelle', 'der Boden', 'dyshemeja', 'Der Boden muss vorbereitet werden.', 'Dyshemeja duhet pergatitur.'),
('baustelle', 'die Sockelleiste', 'bordura', 'Die Sockelleisten werden am Ende angebracht.', 'Bordurat vendosen ne fund.'),
('baustelle', 'das Klickvinyl', 'vinili click', 'Klickvinyl ist einfach zu verlegen.', 'Vinili click eshte i lehte per tu vendosur.'),
('baustelle', 'spachteln', 'shpetim me suva', 'Wir muessen zuerst spachteln.', 'Duhet te spaktelojme fillimisht.'),
('baustelle', 'der Trockenbau', 'ndertimi i thate', 'Der Trockenbau ist fertig.', 'Ndertimi i thate eshte gati.'),
('baustelle', 'die Endreinigung', 'pastrimi final', 'Die Endreinigung dauert 2 Stunden.', 'Pastrimi final zgjat 2 ore.'),
('baustelle', 'das Werkzeug', 'mjetet', 'Das Werkzeug ist im Auto.', 'Mjetet jane ne makine.'),
-- Kunde sprechen
('kunden', 'Guten Tag, ich bin Naim Shala.', 'Miredit, une jam Naim Shala.', NULL, NULL),
('kunden', 'Ich muss zuerst den Untergrund pruefen.', 'Duhet se pari ta kontrolloj bazen.', NULL, NULL),
('kunden', 'Wann wuerde Ihnen eine Besichtigung passen?', 'Kur ju pershtatет nje vizite?', NULL, NULL),
('kunden', 'Ich rufe Sie morgen an.', 'Ju telefonoj neser.', NULL, NULL),
('kunden', 'Das Angebot schicke ich Ihnen per WhatsApp.', 'Ofertten jua dergoj nepermjet WhatsApp.', NULL, NULL),
('kunden', 'Wir beginnen am Montag.', 'Fillojme te henen.', NULL, NULL),
('kunden', 'Die Arbeit ist fertig.', 'Puna eshte e mbaruar.', NULL, NULL),
('kunden', 'Haben Sie noch Fragen?', 'Keni ende pyetje?', NULL, NULL),
-- Preise erklaeren
('preise', 'Der genaue Preis kann erst nach Besichtigung bestaetigt werden.', 'Cmimi i sakte mund te konfirmohet vetem pas shikimit te objektit.', NULL, NULL),
('preise', 'Das kostet zwischen X und Y Euro.', 'Kjo kushton ndermjet X dhe Y Euro.', NULL, NULL),
('preise', 'Der Preis pro Quadratmeter betraegt X Euro.', 'Cmimi per meter katror eshte X Euro.', NULL, NULL),
('preise', 'Ich mache Ihnen ein schriftliches Angebot.', 'Ju bej nje oferte me shkrim.', NULL, NULL),
('preise', 'Die Materialkosten sind nicht enthalten.', 'Kostot e materialit nuk jane te perfshira.', NULL, NULL),
('preise', 'Zahlung nach Fertigstellung.', 'Pagesa pas perfundimit.', NULL, NULL),
-- Termine
('termine', 'Ich bin puenktlich da.', 'Jam atje me kohe.', NULL, NULL),
('termine', 'Ich komme um 8 Uhr.', 'Vij ne ora 8.', NULL, NULL),
('termine', 'Kann ich den Termin verschieben?', 'Mund ta shtyj takimin?', NULL, NULL),
('termine', 'Der Termin dauert einen Tag.', 'Takimi zgjat nje dite.', NULL, NULL),
('termine', 'Ich brauche noch einen Tag.', 'Kam nevoje edhe per nje dite.', NULL, NULL),
-- Material
('material', 'das Material', 'materiali', 'Das Material ist bestellt.', 'Materiali eshte porositur.'),
('material', 'der Kleber', 'ngjitesi', 'Der Kleber ist trocken.', 'Ngjitesi eshte thate.'),
('material', 'die Unterlage', 'shtresa baze', 'Die Unterlage wird zuerst verlegt.', 'Shtresa baze vendoset e para.'),
('material', 'der Nagel', 'gozhde', 'Ich brauche mehr Naegel.', 'Kam nevoje per me shume gozhde.'),
('material', 'die Schraube', 'vide', 'Die Schraube ist locker.', 'Vida eshte e lire.'),
-- Probleme erklaeren
('probleme', 'Es gibt ein Problem mit dem Untergrund.', 'Ka nje problem me bazen.', NULL, NULL),
('probleme', 'Das dauert laenger als geplant.', 'Kjo zgjat me shume se sa planifikuar.', NULL, NULL),
('probleme', 'Es gibt einen Wasserschaden.', 'Ka demtim nga uji.', NULL, NULL),
('probleme', 'Ich muss erst reparieren.', 'Duhet fillimisht te riparoj.', NULL, NULL),
('probleme', 'Der Boden ist nicht gerade.', 'Dyshemeja nuk eshte e drejte.', NULL, NULL),
('probleme', 'Das Material reicht nicht aus.', 'Materiali nuk mjafton.', NULL, NULL);
