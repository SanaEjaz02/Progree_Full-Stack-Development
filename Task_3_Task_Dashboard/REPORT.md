# Task 3 Task Dashboard Report

## Overview

Daymark is a fully functional task management dashboard with a React client, Express REST API, and file-backed SQLite database. It supports creating, reading, editing, completing, and deleting tasks while keeping the interface clear on mobile, tablet, and desktop screens.

## Architecture

The browser loads the React client from Vite on port 5173. Client requests use relative `/api` URLs, and Vite proxies them to Express on port 4000 during development. Express parses JSON, applies CORS, routes task requests, and delegates validation and response shaping to the task controller. The controller uses a repository abstraction backed by SQLite. The database module creates the schema on startup and stores records in `server/data/tasks.db`, so restarting the server does not clear work.

## API and data model

Each task has an integer `id`, required `title`, optional `description`, `status` (`pending` or `complete`), and an ISO `createdAt` timestamp. The API exposes GET collection, POST creation, PATCH/PUT updates, and DELETE removal. DELETE returns a small JSON confirmation so browser network tooling receives a normal completed response. Validation rejects empty titles, non-text descriptions, and unsupported statuses with readable 400 responses.

## Frontend decisions

The UI uses a two-column workspace on larger screens and a single-column flow below 800px. A focused composer sits beside the task list, with a native checkbox-like button for completion, inline edit mode, and a confirmation dialog for deletion. Loading, empty, and API error states are visible in the page rather than only in the console. The design reuses the Task 2 graphite, paper, mint, and coral language while adding a calm dashboard-specific layout.

## Interaction and accessibility

Forms use associated labels, required title validation, native buttons for keyboard activation, semantic headings, status pills, and an alert role for API errors. Delete confirmation uses `alertdialog`, and each task action has an accessible label. Task additions fade in, completed tasks become visually distinct, and reduced-motion users receive shortened animations through `prefers-reduced-motion`.

## Testing and trade-offs

The server uses Node's built-in test runner to exercise empty reads, creation, updates, deletion, validation, and a file-backed SQLite reconnect. Client tests verify the presence of CRUD requests, visible states, responsive rules, and motion support. The production client build is also run as a separate verification step. SQLite was selected because it persists locally without a separate database service; a production deployment could later swap the repository for PostgreSQL without changing the route contract.

## Known local setup

The app intentionally does not commit `.env` or SQLite data. `server/.env.example` documents the configurable port, allowed client origin, and database file. `run.bat` handles dependency installation and starts the client and server together.
