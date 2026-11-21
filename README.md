# EGO GoatStore

A small public command-store website with search/category filtering, JavaScript command downloads, and admin-only uploads.

## Run locally
1. Install Node.js 18+.
2. In this folder run `npm install`
3. Set an admin key:
   - Linux/macOS: `ADMIN_KEY="your-secret-key" npm start`
   - Windows PowerShell: `$env:ADMIN_KEY="your-secret-key"; npm start`
4. Visit `http://localhost:3000`

## Deploy to Render
1. Push this folder to a GitHub repository.
2. Render → New → Web Service → connect repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable `ADMIN_KEY` with a long random secret.
6. Deploy.

## API
- `GET /api/health`
- `GET /api/commands?q=moon&category=media`
- `GET /api/commands/:name/download`
- `POST /api/commands` (multipart form; requires `x-admin-key`; fields `name`, `category`, `description`, `author`, `file`)
- `POST /api/commands/:name/download-count`
- `DELETE /api/commands/:name` (requires `x-admin-key`)

## Important
This starter stores metadata and uploaded files on the server filesystem. Many free hosting services use ephemeral storage, so uploaded files may be lost after redeploy/restart. For a production store, connect persistent storage (MongoDB/S3/GitHub storage) and add moderation, malware/code review, rate limiting, and backups.

Community JavaScript commands may be unsafe. Review source before running them in your bot.
