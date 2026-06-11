# Boxautomat Challenge

Einfache Next.js-App fuer die Boxautomat-Challenge beim Sommerfest.

## Setup

1. Abhaengigkeiten installieren:

```bash
npm install
```

2. `.env.example` nach `.env.local` kopieren und Werte setzen.

3. SQL aus [database/schema.sql](/c:/Users/batu4/Documents/Boxautomat/database/schema.sql) in deiner Postgres-Datenbank ausfuehren.

4. Entwicklungsserver starten:

```bash
npm run dev
```

## Deploy auf Vercel

- Projekt bei Vercel importieren
- In Vercel eine Postgres-Integration aus dem Marketplace verbinden, zum Beispiel Neon
- `DATABASE_URL` oder die von Vercel gesetzte `POSTGRES_URL` verwenden
- `ADMIN_PASSWORD` als eigenes Secret setzen
