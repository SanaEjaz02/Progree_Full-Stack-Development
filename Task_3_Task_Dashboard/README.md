# Task 3: Daymark Task Dashboard

A polished full-stack CRUD task dashboard built for the Progree Full Stack Development internship.

## Stack

- **Client:** React 19 with Vite
- **Server:** Node.js, Express, and CORS
- **Database:** SQLite through `better-sqlite3`
- **Testing:** Node's built-in test runner

## Structure

```text
Task_3_Task_Dashboard/
├── client/
│   ├── src/App.jsx             # Dashboard UI and CRUD interactions
│   ├── src/styles.css          # Responsive product styling
│   ├── tests/dashboard.test.js # Client source/layout checks
│   └── vite.config.js          # Dev server and API proxy
├── server/
│   ├── src/database.js         # SQLite schema and repository
│   ├── src/controllers/        # Validation and request handling
│   ├── src/routes/             # REST route definitions
│   ├── src/app.js              # Express app factory
│   ├── src/server.js           # Production/dev entrypoint
│   └── tests/tasks.test.js     # API CRUD and persistence tests
├── .env.example
├── run.bat
└── REPORT.md
```

## Run locally

From this directory, install all dependencies once:

```text
npm install
npm run install:all
```

Start both applications together:

```text
npm run dev
```

Then open `http://localhost:5173`. The API is available at `http://localhost:4000/api/tasks`.

Alternatively, double-click `run.bat`. It installs missing dependencies and starts both the Vite client and Express server in one terminal using `concurrently`.

## API

- `GET /api/tasks` - list tasks
- `POST /api/tasks` - create `{ title, description?, status? }`
- `PATCH /api/tasks/:id` or `PUT /api/tasks/:id` - update task fields
- `DELETE /api/tasks/:id` - remove a task and return `{ deleted: true }`
- `GET /api/health` - server health check

SQLite data is stored in `server/data/tasks.db` and is intentionally ignored by Git. Copy `server/.env.example` to `server/.env` to change the port, client origin, or database file.

## Verify

```text
npm test
npm run build
```
