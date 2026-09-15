# Migrations

No migration files are checked in yet because this repository was
built without a live database connection to run `prisma migrate dev`
against.

To generate the initial migration:

```bash
cp .env.example .env   # set a real DATABASE_URL
npm install
npm run db:migrate:dev -- --name init
```

This will create a timestamped migration directory here from
`prisma/schema.prisma`, which is already complete and reflects the
full data model described in `docs/database.md`.
