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
      created_at TEXT NOT NULL
    )
  `);
  return db;
}

export function createTaskRepository(db) {
  const selectAll = db.prepare('SELECT id, title, description, status, created_at AS createdAt FROM tasks ORDER BY status = \'complete\', created_at DESC');
  const selectOne = db.prepare('SELECT id, title, description, status, created_at AS createdAt FROM tasks WHERE id = ?');
  const insert = db.prepare('INSERT INTO tasks (title, description, status, created_at) VALUES (?, ?, ?, ?)');
  const update = db.prepare('UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?');
  const remove = db.prepare('DELETE FROM tasks WHERE id = ?');

  return {
    all() { return selectAll.all(); },
    find(id) { return selectOne.get(id); },
    create({ title, description = '', status = 'pending' }) {
      const createdAt = new Date().toISOString();
      const result = insert.run(title.trim(), description.trim(), status, createdAt);
      return selectOne.get(result.lastInsertRowid);
    },
    update(id, { title, description = '', status }) {
      const existing = selectOne.get(id);
      if (!existing) return null;
      update.run(title.trim(), description.trim(), status, id);
      return selectOne.get(id);
    },
    delete(id) {
      const result = remove.run(id);
      return result.changes > 0;
    }
  };
}
