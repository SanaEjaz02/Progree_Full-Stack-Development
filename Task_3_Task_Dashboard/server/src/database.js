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
      tag TEXT NOT NULL DEFAULT '',
      pinned INTEGER NOT NULL DEFAULT 0,
      accent TEXT NOT NULL DEFAULT 'violet',
      emoji TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);
  const columns = db.prepare('PRAGMA table_info(tasks)').all().map((column) => column.name);
  if (!columns.includes('priority')) db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'");
  if (!columns.includes('due_date')) db.exec("ALTER TABLE tasks ADD COLUMN due_date TEXT NOT NULL DEFAULT ''");
  if (!columns.includes('tag')) db.exec("ALTER TABLE tasks ADD COLUMN tag TEXT NOT NULL DEFAULT ''");
  if (!columns.includes('pinned')) db.exec('ALTER TABLE tasks ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0');
  if (!columns.includes('accent')) db.exec("ALTER TABLE tasks ADD COLUMN accent TEXT NOT NULL DEFAULT 'violet'");
  if (!columns.includes('emoji')) db.exec("ALTER TABLE tasks ADD COLUMN emoji TEXT NOT NULL DEFAULT ''");
  if (!columns.includes('sort_order')) db.exec('ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0');
  return db;
}

export function createTaskRepository(db) {
  const fields = 'id, title, description, status, created_at AS createdAt, priority, due_date AS dueDate, tag, pinned, accent, emoji, sort_order AS sortOrder';
  const selectAll = db.prepare(`SELECT ${fields} FROM tasks ORDER BY pinned DESC, sort_order ASC, status = 'complete', created_at DESC`);
  const selectOne = db.prepare(`SELECT ${fields} FROM tasks WHERE id = ?`);
  const insert = db.prepare('INSERT INTO tasks (title, description, status, created_at, priority, due_date, tag, pinned, accent, emoji, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const update = db.prepare('UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, tag = ?, pinned = ?, accent = ?, emoji = ? WHERE id = ?');
  const reorder = db.prepare('UPDATE tasks SET sort_order = ? WHERE id = ?');
  const remove = db.prepare('DELETE FROM tasks WHERE id = ?');

  return {
    all() { return selectAll.all(); },
    find(id) { return selectOne.get(id); },
    create({ title, description = '', status = 'pending', priority = 'medium', dueDate = '', tag = '', pinned = false, accent = 'violet', emoji = '' }) {
      const createdAt = new Date().toISOString();
      const sortOrder = db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM tasks').get().next;
      const result = insert.run(title.trim(), description.trim(), status, createdAt, priority, dueDate, tag.trim(), pinned ? 1 : 0, accent, emoji, sortOrder);
      return selectOne.get(result.lastInsertRowid);
    },
    update(id, { title, description = '', status, priority = 'medium', dueDate = '', tag = '', pinned = false, accent = 'violet', emoji = '' }) {
      const existing = selectOne.get(id);
      if (!existing) return null;
      update.run(title.trim(), description.trim(), status, priority, dueDate, tag.trim(), pinned ? 1 : 0, accent, emoji, id);
      return selectOne.get(id);
    },
    reorder(ids) {
      const applyOrder = db.transaction((orderedIds) => orderedIds.forEach((id, index) => reorder.run(index + 1, id)));
      applyOrder(ids);
    },
    delete(id) {
      const result = remove.run(id);
      return result.changes > 0;
    }
  };
}
