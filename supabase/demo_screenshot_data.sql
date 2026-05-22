-- NSH Meister-Assistent: Demo data for screenshots
-- Run in the Supabase SQL editor after at least one app user exists.
-- The script attaches the demo data to the first user in auth.users.

BEGIN;

DROP TABLE IF EXISTS _demo_user;

CREATE TEMP TABLE _demo_user AS
SELECT id AS user_id
FROM auth.users
ORDER BY created_at
LIMIT 1;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM _demo_user) THEN
    RAISE EXCEPTION 'No user found in auth.users. Create/login with a user first, then run this seed.';
  END IF;
END $$;

INSERT INTO customers (id, user_id, name, phone, address, city, notes, created_at)
SELECT *
FROM (
  VALUES
    ('10000000-0000-4000-8000-000000000001'::uuid, (SELECT user_id FROM _demo_user), 'Familie Schneider', '+49 171 555 1842', 'Lindenstrasse 14', 'Muenster', 'Privatkunde, bevorzugt WhatsApp. Fotos vom Wohnzimmer liegen vor.', now() - interval '18 days'),
    ('10000000-0000-4000-8000-000000000002'::uuid, (SELECT user_id FROM _demo_user), 'Bauleitung Krueger GmbH', '+49 251 778899', 'Hafenweg 8', 'Muenster', 'Gewerbekunde. Zugang ueber Hinterhof, Parkausweis beim Empfang.', now() - interval '12 days'),
    ('10000000-0000-4000-8000-000000000003'::uuid, (SELECT user_id FROM _demo_user), 'Anna Weber', '+49 160 8822441', 'Rosenweg 22', 'Warendorf', 'Altbauwohnung, Hund im Haushalt, Termin bitte ab 09:00 Uhr.', now() - interval '9 days'),
    ('10000000-0000-4000-8000-000000000004'::uuid, (SELECT user_id FROM _demo_user), 'Praxis Dr. Hoffmann', '+49 251 445566', 'Salzstrasse 3', 'Muenster', 'Arbeiten nur ausserhalb der Sprechzeiten moeglich.', now() - interval '5 days'),
    ('10000000-0000-4000-8000-000000000005'::uuid, (SELECT user_id FROM _demo_user), 'Kemal Yilmaz', '+49 176 33445590', 'Bahnhofstrasse 41', 'Ahlen', 'Material wird vom Kunden gestellt. Sockelleisten fehlen noch.', now() - interval '2 days')
) AS v(id, user_id, name, phone, address, city, notes, created_at)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  notes = EXCLUDED.notes;

INSERT INTO projects (
  id, user_id, customer_id, service_type, status, address, area_m2, vinyl_type,
  object_type, ground_condition, extras, material_supply, helpers_count, notes, created_at
)
SELECT *
FROM (
  VALUES
    (
      '20000000-0000-4000-8000-000000000001'::uuid, (SELECT user_id FROM _demo_user), '10000000-0000-4000-8000-000000000001'::uuid,
      'vinyl', 'in_arbeit', 'Lindenstrasse 14, 48143 Muenster', 64.50, 'klickvinyl',
      'renovierung', 'mittel',
      '{"bodenEntfernen":true,"spachteln":true,"sockelleisten":true,"tuerenKuerzen":false,"moebelRaeumen":true,"materialHolen":true,"entsorgung":true,"endreinigung":true}'::jsonb,
      'nsh', 1, 'Wohnzimmer, Flur und Kueche. Alter Laminatboden ist bereits geloest, Untergrund teilweise uneben.', now() - interval '15 days'
    ),
    (
      '20000000-0000-4000-8000-000000000002'::uuid, (SELECT user_id FROM _demo_user), '10000000-0000-4000-8000-000000000002'::uuid,
      'vinyl', 'geplant', 'Hafenweg 8, 48155 Muenster', 118.00, 'klebevinyl',
      'gewerbe', 'gut',
      '{"bodenEntfernen":false,"spachteln":false,"sockelleisten":true,"tuerenKuerzen":true,"moebelRaeumen":false,"materialHolen":false,"entsorgung":false,"endreinigung":true}'::jsonb,
      'kunde', 2, 'Bueroetage im 2. OG. Fahrstuhl vorhanden. Start nach Malerarbeiten.', now() - interval '10 days'
    ),
    (
      '20000000-0000-4000-8000-000000000003'::uuid, (SELECT user_id FROM _demo_user), '10000000-0000-4000-8000-000000000003'::uuid,
      'vinyl', 'geplant', 'Rosenweg 22, 48231 Warendorf', 42.00, 'rigid',
      'altbau', 'schlecht',
      '{"bodenEntfernen":true,"spachteln":true,"sockelleisten":true,"tuerenKuerzen":true,"moebelRaeumen":true,"materialHolen":true,"entsorgung":true,"endreinigung":false}'::jsonb,
      'unklar', 1, 'Besichtigung war auffaellig: Dielen schwingen im Schlafzimmer, Ausgleichsmasse einplanen.', now() - interval '8 days'
    ),
    (
      '20000000-0000-4000-8000-000000000004'::uuid, (SELECT user_id FROM _demo_user), '10000000-0000-4000-8000-000000000004'::uuid,
      'vinyl', 'in_arbeit', 'Salzstrasse 3, 48143 Muenster', 86.00, 'klebevinyl',
      'gewerbe', 'mittel',
      '{"bodenEntfernen":false,"spachteln":true,"sockelleisten":false,"tuerenKuerzen":false,"moebelRaeumen":false,"materialHolen":true,"entsorgung":false,"endreinigung":true}'::jsonb,
      'nsh', 2, 'Behandlungsraeume nacheinander fertigstellen. Leise arbeiten, Praxis bleibt teilweise offen.', now() - interval '4 days'
    ),
    (
      '20000000-0000-4000-8000-000000000005'::uuid, (SELECT user_id FROM _demo_user), '10000000-0000-4000-8000-000000000005'::uuid,
      'vinyl', 'fertig', 'Bahnhofstrasse 41, 59227 Ahlen', 31.50, 'klickvinyl',
      'neubau', 'gut',
      '{"bodenEntfernen":false,"spachteln":false,"sockelleisten":true,"tuerenKuerzen":false,"moebelRaeumen":false,"materialHolen":false,"entsorgung":false,"endreinigung":true}'::jsonb,
      'kunde', 0, 'Kleiner Neubauauftrag, sauber abgeschlossen. Rechnung nach Abnahme senden.', now() - interval '20 days'
    ),
    (
      '20000000-0000-4000-8000-000000000006'::uuid, (SELECT user_id FROM _demo_user), NULL,
      'arbeit', 'geplant', 'Am Stadtgraben 12, 48143 Muenster', NULL, NULL,
      NULL, NULL, '{}'::jsonb,
      NULL, 0, 'Privater Arbeitstermin: Angebot schreiben, Materialliste pruefen, Auto aufraeumen.', now() - interval '1 day'
    )
) AS v(id, user_id, customer_id, service_type, status, address, area_m2, vinyl_type, object_type, ground_condition, extras, material_supply, helpers_count, notes, created_at)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  customer_id = EXCLUDED.customer_id,
  service_type = EXCLUDED.service_type,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  area_m2 = EXCLUDED.area_m2,
  vinyl_type = EXCLUDED.vinyl_type,
  object_type = EXCLUDED.object_type,
  ground_condition = EXCLUDED.ground_condition,
  extras = EXCLUDED.extras,
  material_supply = EXCLUDED.material_supply,
  helpers_count = EXCLUDED.helpers_count,
  notes = EXCLUDED.notes;

INSERT INTO calendar_events (id, user_id, project_id, title, start_time, end_time, status, helpers_count, notes, created_at)
SELECT *
FROM (
  VALUES
    ('30000000-0000-4000-8000-000000000001'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000001'::uuid, 'Vinyl verlegen - Familie Schneider', (current_date + time '08:00')::timestamptz, (current_date + time '16:00')::timestamptz, 'geplant', 1, 'Heute: Kueche fertigstellen, Sockelleisten zuschneiden, Endreinigung vorbereiten.', now() - interval '7 days'),
    ('30000000-0000-4000-8000-000000000002'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000004'::uuid, 'Praxis Dr. Hoffmann - Raum 2', (current_date + time '17:30')::timestamptz, (current_date + time '21:00')::timestamptz, 'geplant', 2, 'Nach Praxisschluss. Kleber und Zahnspachtel mitnehmen.', now() - interval '4 days'),
    ('30000000-0000-4000-8000-000000000003'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000002'::uuid, 'Bueroetage Hafenweg - Start', ((current_date + interval '1 day') + time '07:30')::timestamptz, ((current_date + interval '1 day') + time '15:30')::timestamptz, 'geplant', 2, 'Material pruefen, erster Abschnitt Flur und Empfang.', now() - interval '3 days'),
    ('30000000-0000-4000-8000-000000000004'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000002'::uuid, 'Bueroetage Hafenweg - Fertigstellung', ((current_date + interval '2 days') + time '08:00')::timestamptz, ((current_date + interval '2 days') + time '16:30')::timestamptz, 'geplant', 2, 'Tueren kuerzen, Sockelleisten, Endreinigung.', now() - interval '3 days'),
    ('30000000-0000-4000-8000-000000000005'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000003'::uuid, 'Besichtigung Anna Weber', ((current_date + interval '3 days') + time '09:30')::timestamptz, ((current_date + interval '3 days') + time '10:30')::timestamptz, 'geplant', 0, 'Untergrund genau pruefen, Feuchtigkeit messen, Angebot danach senden.', now() - interval '2 days'),
    ('30000000-0000-4000-8000-000000000006'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000006'::uuid, 'Angebote und Materiallisten', ((current_date + interval '4 days') + time '18:00')::timestamptz, ((current_date + interval '4 days') + time '19:30')::timestamptz, 'geplant', 0, 'Schneider abrechnen, Weber kalkulieren, Hafenweg Material nachbestellen.', now() - interval '1 day'),
    ('30000000-0000-4000-8000-000000000007'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000005'::uuid, 'Abnahme Kemal Yilmaz', ((current_date - interval '2 days') + time '14:00')::timestamptz, ((current_date - interval '2 days') + time '15:00')::timestamptz, 'erledigt', 0, 'Abnahme unterschrieben, Kunde sehr zufrieden.', now() - interval '6 days'),
    ('30000000-0000-4000-8000-000000000008'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000004'::uuid, 'Praxis Dr. Hoffmann - Vorbereitung', ((current_date - interval '1 day') + time '18:00')::timestamptz, ((current_date - interval '1 day') + time '21:00')::timestamptz, 'erledigt', 1, 'Untergrund vorbereitet und gespachtelt.', now() - interval '5 days')
) AS v(id, user_id, project_id, title, start_time, end_time, status, helpers_count, notes, created_at)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  project_id = EXCLUDED.project_id,
  title = EXCLUDED.title,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  status = EXCLUDED.status,
  helpers_count = EXCLUDED.helpers_count,
  notes = EXCLUDED.notes;

INSERT INTO tasks (id, user_id, project_id, title, is_done, due_date, created_at)
SELECT *
FROM (
  VALUES
    ('40000000-0000-4000-8000-000000000001'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000001'::uuid, 'Sockelleisten fuer Wohnzimmer zuschneiden', false, current_date, now() - interval '6 days'),
    ('40000000-0000-4000-8000-000000000002'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000001'::uuid, 'Fotos fuer Referenzmappe machen', false, current_date, now() - interval '2 days'),
    ('40000000-0000-4000-8000-000000000003'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000002'::uuid, 'Klebevinyl-Lieferung Hafenweg bestaetigen', false, current_date + 1, now() - interval '3 days'),
    ('40000000-0000-4000-8000-000000000004'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000003'::uuid, 'Feuchtigkeitsmessgeraet einpacken', false, current_date + 3, now() - interval '1 day'),
    ('40000000-0000-4000-8000-000000000005'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000004'::uuid, 'Praxis: Raumplan mit Empfang klaeren', true, current_date - 1, now() - interval '4 days'),
    ('40000000-0000-4000-8000-000000000006'::uuid, (SELECT user_id FROM _demo_user), NULL, 'Rechnung Yilmaz schreiben', false, current_date + 2, now() - interval '1 day')
) AS v(id, user_id, project_id, title, is_done, due_date, created_at)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  project_id = EXCLUDED.project_id,
  title = EXCLUDED.title,
  is_done = EXCLUDED.is_done,
  due_date = EXCLUDED.due_date;

INSERT INTO notes (id, user_id, project_id, customer_id, type, content, created_at)
SELECT *
FROM (
  VALUES
    ('50000000-0000-4000-8000-000000000001'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000001'::uuid, 'baustellen', 'Kunde moechte im Flur eine weisse Abschlussleiste statt grau. Vor Bestellung kurz Foto schicken.', now() - interval '2 days'),
    ('50000000-0000-4000-8000-000000000002'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000002'::uuid, '10000000-0000-4000-8000-000000000002'::uuid, 'kunden', 'Bauleitung ist ab 07:00 Uhr vor Ort. Schluessel kann am Empfang abgeholt werden.', now() - interval '1 day'),
    ('50000000-0000-4000-8000-000000000003'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000003'::uuid, '10000000-0000-4000-8000-000000000003'::uuid, 'baustellen', 'Altbau: Sockelbereiche fotografieren, wahrscheinlich mehr Spachtelarbeit als geplant.', now() - interval '8 hours'),
    ('50000000-0000-4000-8000-000000000004'::uuid, (SELECT user_id FROM _demo_user), NULL, NULL, 'privat', 'Vor Screenshot-Termin Demo-Daten pruefen: Kalender, Baustellen, Material, Kunden, Notizen.', now() - interval '3 hours')
) AS v(id, user_id, project_id, customer_id, type, content, created_at)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  project_id = EXCLUDED.project_id,
  customer_id = EXCLUDED.customer_id,
  type = EXCLUDED.type,
  content = EXCLUDED.content,
  created_at = EXCLUDED.created_at;

INSERT INTO materials (id, user_id, project_id, name, status, quantity, unit, created_at)
SELECT *
FROM (
  VALUES
    ('60000000-0000-4000-8000-000000000001'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000001'::uuid, 'Klickvinyl Eiche Natur', 'vorhanden', 68.00, 'm2', now() - interval '7 days'),
    ('60000000-0000-4000-8000-000000000002'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000001'::uuid, 'Sockelleisten weiss 60 mm', 'bestellt', 42.00, 'm', now() - interval '4 days'),
    ('60000000-0000-4000-8000-000000000003'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000002'::uuid, 'Klebevinyl Objektqualitaet', 'benoetigt', 125.00, 'm2', now() - interval '3 days'),
    ('60000000-0000-4000-8000-000000000004'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000002'::uuid, 'Dispersionskleber', 'bestellt', 6.00, 'Eimer', now() - interval '3 days'),
    ('60000000-0000-4000-8000-000000000005'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000003'::uuid, 'Ausgleichsmasse', 'benoetigt', 10.00, 'Sack', now() - interval '2 days'),
    ('60000000-0000-4000-8000-000000000006'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000004'::uuid, 'Zahnspachtel B1', 'vorhanden', 2.00, 'Stk', now() - interval '1 day'),
    ('60000000-0000-4000-8000-000000000007'::uuid, (SELECT user_id FROM _demo_user), '20000000-0000-4000-8000-000000000005'::uuid, 'Endreinigung Verbrauchsmaterial', 'erledigt', 1.00, 'Set', now() - interval '10 days')
) AS v(id, user_id, project_id, name, status, quantity, unit, created_at)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  project_id = EXCLUDED.project_id,
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit;

INSERT INTO price_calculations (
  id, user_id, customer_id, project_id, service_type, area_m2, difficulty,
  extras, price_low, price_normal, price_high, created_at
)
SELECT *
FROM (
  VALUES
    ('70000000-0000-4000-8000-000000000001'::uuid, (SELECT user_id FROM _demo_user), '10000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000001'::uuid, 'vinyl', 64.50, 'normal', '{"bodenEntfernen":true,"spachteln":true,"sockelleisten":true,"endreinigung":true}'::jsonb, 2450.00, 2890.00, 3320.00, now() - interval '14 days'),
    ('70000000-0000-4000-8000-000000000002'::uuid, (SELECT user_id FROM _demo_user), '10000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000002'::uuid, 'vinyl', 118.00, 'leicht', '{"sockelleisten":true,"tuerenKuerzen":true,"endreinigung":true}'::jsonb, 3540.00, 4180.00, 4820.00, now() - interval '9 days'),
    ('70000000-0000-4000-8000-000000000003'::uuid, (SELECT user_id FROM _demo_user), '10000000-0000-4000-8000-000000000003'::uuid, '20000000-0000-4000-8000-000000000003'::uuid, 'vinyl', 42.00, 'schwer', '{"bodenEntfernen":true,"spachteln":true,"sockelleisten":true,"tuerenKuerzen":true}'::jsonb, 2080.00, 2460.00, 2920.00, now() - interval '6 days')
) AS v(id, user_id, customer_id, project_id, service_type, area_m2, difficulty, extras, price_low, price_normal, price_high, created_at)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  customer_id = EXCLUDED.customer_id,
  project_id = EXCLUDED.project_id,
  service_type = EXCLUDED.service_type,
  area_m2 = EXCLUDED.area_m2,
  difficulty = EXCLUDED.difficulty,
  extras = EXCLUDED.extras,
  price_low = EXCLUDED.price_low,
  price_normal = EXCLUDED.price_normal,
  price_high = EXCLUDED.price_high;

COMMIT;
