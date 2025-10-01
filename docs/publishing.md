# Publishing & Hostinger Operations

This guide explains how to run the SQL schema, connect the Astro app to Hostinger's MySQL service, and keep editorial content backed up.

## 1. Provision the database

1. In Hostinger, open **Websites → Manage → Databases** and create a new MySQL database.
2. Note the database name, username, password, and the server/host name that Hostinger provides (for example, `mysql123.hostinger.com`).
3. Open **phpMyAdmin** from the same panel. The interface loads the Hostinger-managed database.

## 2. Apply the schema

1. Inside phpMyAdmin, select your database from the left sidebar.
2. Click the **Import** tab.
3. Choose the `sql/schema.sql` file from this repository and press **Go**. phpMyAdmin will execute the SQL and create the `users`, `categories`, `posts`, and `post_assets` tables along with their indexes.
4. Optionally save the executed query output as confirmation in your deployment notes.

## 3. Configure application credentials

Create an `.env` (and optionally `.env.production`) file in the project root with your Hostinger credentials:

```bash
DB_HOST="mysql123.hostinger.com"
DB_PORT="3306"
DB_NAME="lefthand_journal"
DB_USER="lefthand_editor"
DB_PASSWORD="super-secret-password"
```

These environment variables are read by `src/utils/db.ts` when the serverless endpoints run. Never commit the `.env` file to version control—Hostinger will let you configure the same values in its **Environment Variables** panel for production builds.

## 4. Drafts vs. published content

The schema stores each post's lifecycle in the `status` field:

- `draft` – editable content not shown publicly.
- `scheduled` – ready to go live at `scheduled_publish_at`. A scheduled post is treated as published automatically when that timestamp is in the past.
- `published` – publicly visible immediately.
- `archived` – preserved for reference but hidden from regular listings.

API endpoints filter published content with the following logic:

```sql
WHERE status = 'published'
  AND (scheduled_publish_at IS NULL OR scheduled_publish_at <= NOW())
```

Draft views omit that clause so editors can see everything.

## 5. CRUD & editorial tooling endpoints

Serverless endpoints under `src/pages/api/publishing/` provide the following capabilities:

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/publishing/posts` | `GET` | List posts with optional `status`, `category`, `limit`, and `offset` filters. |
| `/api/publishing/posts` | `POST` | Create a new post from JSON payload fields. |
| `/api/publishing/posts/[id]` | `GET` | Retrieve a single post plus author/category context. |
| `/api/publishing/posts/[id]` | `PUT` | Update an existing post's fields. |
| `/api/publishing/posts/[id]` | `DELETE` | Remove a post and its assets. |
| `/api/publishing/posts/[id]/preview` | `GET` | Return the latest saved draft for preview rendering. |
| `/api/publishing/posts/[id]/duplicate` | `POST` | Clone a post into a new draft with a unique slug. |
| `/api/publishing/posts/[id]/publish` | `POST` | Toggle publish/unpublish states and optionally set `scheduled_publish_at`. |

All endpoints return JSON. They rely on the shared connection pool defined in `src/utils/db.ts`.

## 6. Export and import backups

Keeping the editorial archive safe is easy with phpMyAdmin:

### SQL dump (full backup)

1. In phpMyAdmin, select the database.
2. Click **Export** → choose **Custom**.
3. Tick `users`, `categories`, `posts`, and `post_assets`.
4. Under **Output**, pick `Compression: gzipped` for smaller downloads if desired.
5. Click **Go** to download an SQL dump. Store this securely (for example, in an encrypted cloud drive).

To restore, use the **Import** tab on an empty database and upload the `.sql` (or `.sql.gz`) file. phpMyAdmin will recreate tables and data.

### CSV exports (granular backups)

1. From the left sidebar, select a table such as `posts`.
2. Click the **Export** tab and choose the `CSV` format.
3. Enable column headers and UTF-8 encoding for spreadsheet compatibility.
4. Repeat for `categories` and `users` if you need separate CSV files.

To import CSV data:

1. Open the target table in phpMyAdmin.
2. Click **Import** and upload the CSV.
3. Configure the delimiter (usually comma) and column mappings if your CSV headers differ.
4. Execute the import. phpMyAdmin will append rows to the table.

Always export a fresh SQL dump before running destructive operations such as truncating tables or bulk updates.
