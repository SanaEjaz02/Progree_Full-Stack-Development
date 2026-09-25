# Task 3 Task Dashboard Report

## Overview

Daymark is a fully functional task management dashboard with a React client, Express REST API, and file-backed SQLite database. It supports creating, reading, editing, completing, and deleting tasks while keeping the interface clear on mobile, tablet, and desktop screens.

## Architecture

The browser loads the React client from Vite on port 5173. Client requests use relative `/api` URLs, and Vite proxies them to Express on port 4000 during development. Express parses JSON, applies CORS, routes task requests, and delegates validation and response shaping to the task controller. The controller uses a repository abstraction backed by SQLite. The database module creates the schema on startup and stores records in `server/data/tasks.db`, so restarting the server does not clear work.

## API and data model

Each task has an integer `id`, required `title`, optional `description`, `status` (`pending` or `complete`), and an ISO `createdAt` timestamp. The API exposes GET collection, POST creation, PATCH/PUT updates, and DELETE removal. DELETE returns a small JSON confirmation so browser network tooling receives a normal completed response. Validation rejects empty titles, non-text descriptions, and unsupported statuses with readable 400 responses.

## Frontend decisions

The UI uses a two-column workspace on larger screens and a single-column flow below 800px. A focused composer sits beside the task list, with native controls for completion, priority, due date, and tags. Search, All/Active/Completed tabs, and sort controls sit above the list, while a progress bar communicates completion at a glance. Loading, empty, and API error states are visible in the page rather than only in the console.

The visual direction deliberately differs from Task 2: Daymark uses a cool sky-blue surface, violet and cyan accents, rounded panels, soft depth, and lively micro-interactions. Buttons lift and press, checkboxes pop when completed, cards elevate on hover, and the delete flow removes immediately before offering a five-second Undo snackbar.

## Interaction and accessibility

Forms use associated labels, required title validation, native buttons for keyboard activation, semantic headings, status pills, and an alert role for API errors. Each task action has an accessible label. Editing stays inline and preserves the exact scroll position; there is no anchor navigation or forced jump. Task additions fade in, completed tasks become visually distinct, and reduced-motion users receive shortened animations through `prefers-reduced-motion`.

## Testing and trade-offs

The server uses Node's built-in test runner to exercise empty reads, creation with priority/due date/tag metadata, updates, deletion, validation, and a file-backed SQLite reconnect. Client tests verify CRUD requests, metadata controls, search/filter/sort/undo hooks, visible states, responsive rules, no forced scrolling, and motion support. The production client build is also run as a separate verification step. SQLite was selected because it persists locally without a separate database service; a production deployment could later swap the repository for PostgreSQL without changing the route contract.

## End-to-end verification

The live browser walkthrough created a fully populated task, edited it without changing `scrollY`, searched for it, filtered Active tasks, sorted by priority, marked it complete, deleted it, restored it with Undo, and deleted it again after the five-second window. The API was also restarted with a persisted task and returned that task after reconnecting.

## Known local setup

The app intentionally does not commit `.env` or SQLite data. `server/.env.example` documents the configurable port, allowed client origin, and database file. `run.bat` handles dependency installation and starts the client and server together.
