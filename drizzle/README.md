# Database migrations

`drizzle/` is the **single source of truth** for the database schema. There is no
second migration history anywhere in this repository.

Before this baseline there were two, applied by different tools and disagreeing
with each other and with the ORM:

| History | Applied by | Problems |
|---|---|---|
| `drizzle/0000..0029` | `drizzle-kit` / `src/db/migrate.ts` | `meta/_journal.json` listed only `0000..0026`, so `0027`–`0029` **never ran**; two files both claimed index `0019`; the `modules` table the app depends on was created by no migration at all |
| `supabase/migrations/2026*` | Supabase CLI | Re-created `profiles` with a different shape, dropped tables the drizzle history still created, and carried a stray copy of a drizzle journal under `meta/` |

Both are replaced by the ordered set in this directory. `supabase/migrations/`
is gone; its RLS, realtime, storage and auth-trigger work lives in `0029`–`0031`
here, so a single `bun run db:migrate` produces a complete database.

## Layout

One file per table, named `NNNN_create_<table>_table.sql`, in dependency order —
a table's file always runs after every table it references. The non-table files
are named for what they do:

| File | Purpose |
|---|---|
| `0000_create_extensions_and_helpers.sql` | Extensions plus the `gym_*` helper routines the table files use |
| `0001_create_enums.sql` | Every enum type, in one place |
| `0002`–`0027` | One table each |
| `0028_drop_legacy_objects.sql` | Removes superseded tables, columns, types and triggers |
| `0029_enable_row_level_security.sql` | RLS policies |
| `0030_enable_realtime_and_storage.sql` | Realtime publication and storage buckets |
| `0031_create_auth_user_triggers.sql` | `auth.users` → `profiles` sync trigger |
| `0032_seed_reference_data.sql` | Rows the app cannot start without |

`meta/_journal.json` is the index Drizzle actually reads. **A file that is not
in the journal does not run** — that is precisely how `0027`–`0029` of the old
history were silently skipped. Any new file must be added there.

## Table files are convergent

Each table file both *creates* the table on an empty database and *reconciles*
an existing one to the same shape — adding missing columns, correcting types,
renaming legacy columns, collapsing duplicate foreign keys and indexes. That is
what lets one ordered set serve a fresh database and a drifted production one,
and it is why the whole set is safe to re-apply.

Two consequences worth knowing:

- **Never use `CREATE UNIQUE INDEX IF NOT EXISTS`.** `IF NOT EXISTS` matches by
  *name only*, so if a non-unique index already carries that name the statement
  is a silent no-op and the uniqueness is never established. (This had actually
  happened to `idx_states_code` and `idx_villages_slug`.) Use
  `DROP INDEX IF EXISTS "x";` followed by `CREATE UNIQUE INDEX "x" ...`.
- **Never use `ALTER TYPE ... ADD VALUE`.** Drizzle runs the entire migration
  set inside one transaction, and a value added to a pre-existing type cannot be
  used in that same transaction. `gym_sync_enum()` builds a replacement type and
  re-points dependent columns instead.

## Helpers (`0000`)

| Helper | Does |
|---|---|
| `gym_sync_enum(type, labels[])` | Brings an enum to exactly this label set, migrating dependent columns |
| `gym_cast_column_to_enum(table, col, type, fallback)` | Converts a text column that should have been an enum, rewriting out-of-domain values to `fallback` first so the cast cannot fail midway |
| `gym_drop_foreign_keys(table, col)` | Drops every FK on a column, so the file can add the one canonical constraint |
| `gym_attach_updated_at(table)` | Attaches the shared `updated_at` trigger |

## Workflow

```bash
bun run db:migrate    # apply everything pending (src/db/migrate.ts)
bun run db:check      # drizzle-kit consistency check
bun run db:seed       # demo/content seeding — NOT structural
```

Migrations here are **hand-written**, because they carry data reconciliation
that `drizzle-kit generate` cannot infer. `meta/0032_snapshot.json` matches
`src/db/schema.ts` exactly, so `drizzle-kit generate` still produces a correct
*diff* for a future change — but review what it emits, add any data
backfill by hand, and register the file in `_journal.json`.

The whole set can be rehearsed against a real database without committing
anything: run it inside a transaction and roll back. That is how this baseline
was validated against production before being applied.

## Known limitation

`events.date` and `events.time` are `text`, not `date` and `time`. Fixing that
changes the payload the events API and the admin editor exchange, so it is an
application change rather than a schema normalisation and was left out of this
pass deliberately.
