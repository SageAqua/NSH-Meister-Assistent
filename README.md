# NSH Meister-Assistent

iPad-first PWA für **NSH Renovierung** (deutschsprachige UI mit albanischen Hilfstexten), aufgebaut mit Next.js + Supabase.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth + Postgres + Storage

## Lokale Entwicklung
1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. Umgebungsvariablen setzen (`.env.local`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
3. Dev-Server starten:
   ```bash
   npm run dev
   ```

## Datenbank
Migrationen liegen in `supabase/migrations/`.

### Migrationen ausführen (Supabase CLI)
```bash
supabase db push
```

### Seed ausführen (folgt in nächster Phase)
```bash
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

## Qualitätschecks
```bash
npm run lint
npm run build
```

## Projektstatus
- ✅ Phase 1: Setup + App Shell + Grundrouting
- ✅ Phase 2: Kernschema (21 Tabellen), Multi-Tenant Basis, Trigger/Indizes
- ⏳ Nächste Schritte: RLS + Storage Policies + Seed + Vinyl Workflow
