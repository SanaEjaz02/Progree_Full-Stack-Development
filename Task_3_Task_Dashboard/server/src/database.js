import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export function createDatabase(filename = process.env.DATABASE_FILE || './data/tasks.db') {
  const databasePath = filename === ':memory:' ? filename : path.resolve(process.cwd(), filename);
  if (databasePath !== ':memory:') fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK(length(trim(title)) > 0),
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'complete')),
      created_at TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT NOT NULL DEFAULT '',
      tag TEXT NOT NULL DEFAULT ''
    )
  `);
  const columns = db.prepare('PRAGMA table_info(tasks)').all().map((column) => column.name);
  if (!columns.includes('priority')) db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'");
  if (!columns.includes('due_date')) db.exec("ALTER TABLE tasks ADD COLUMN due_date TEXT NOT NULL DEFAULT ''");
  if (!columns.includes('tag')) db.exec("ALTER TABLE tasks ADD COLUMN tag TEXT NOT NULL DEFAULT ''");
  return db;
}

export function createTaskRepository(db) {
  const selectAll = db.prepare('SELECT id, title, description, status, created_at AS createdAt, priority, due_date AS dueDate, tag FROM tasks ORDER BY status = \'complete\', created_at DESC');
  const selectOne = db.prepare('SELECT id, title, description, status, created_at AS createdAt, priority, due_date AS dueDate, tag FROM tasks WHERE id = ?');
  const insert = db.prepare('INSERT INTO tasks (title, description, status, created_at, priority, due_date, tag) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const update = db.prepare('UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, tag = ? WHERE id = ?');
  const remove = db.prepare('DELETE FROM tasks WHERE id = ?');

  return {
    all() { return selectAll.all(); },
    find(id) { return selectOne.get(id); },
    create({ title, description = '', status = 'pending', priority = 'medium', dueDate = '', tag = '' }) {
      const createdAt = new Date().toISOString();
      const result = insert.run(title.trim(), description.trim(), status, createdAt, priority, dueDate, tag.trim());
      return selectOne.get(result.lastInsertRowid);
    },
    update(id, { title, description = '', status, priority = 'medium', dueDate = '', tag = '' }) {
      const existing = selectOne.get(id);
      if (!existing) return null;
      update.run(title.trim(), description.trim(), status, priority, dueDate, tag.trim(), id);
      return selectOne.get(id);
    },
    delete(id) {
      const result = remove.run(id);
      return result.changes > 0;
    }
  };
}
