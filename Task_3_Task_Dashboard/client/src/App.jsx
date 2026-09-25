import { useEffect, useMemo, useState } from 'react';

const emptyForm = { title: '', description: '' };

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

async function request(path, options = {}) {
  const response = await fetch(path, { headers: { 'content-type': 'application/json' }, ...options });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'The dashboard could not complete that request.');
  return data;
}

function TaskForm({ form, setForm, onSubmit, editingId, onCancel, busy }) {
  return (
    <form className="task-form" onSubmit={onSubmit}>
      <div className="field field-title">
        <label htmlFor="task-title">Task title</label>
        <input id="task-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Prepare project handoff" required maxLength={100} autoFocus={Boolean(editingId)} />
      </div>
      <div className="field field-description">
        <label htmlFor="task-description">Description <span>Optional</span></label>
        <textarea id="task-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add a little context, a link, or the next step..." rows="3" maxLength={280} />
      </div>
      <div className="form-actions">
        {editingId && <button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button>}
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Saving...' : editingId ? 'Save changes' : 'Add task'} <span aria-hidden="true">{editingId ? '↗' : '+'}</span></button>
      </div>
    </form>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  return (
    <article className={`task-card ${task.status === 'complete' ? 'is-complete' : ''}`}>
      <button className="task-check" type="button" onClick={() => onToggle(task)} aria-label={`${task.status === 'complete' ? 'Mark' : 'Complete'} ${task.title}`} aria-pressed={task.status === 'complete'}><span aria-hidden="true">{task.status === 'complete' ? '✓' : ''}</span></button>
      <div className="task-content">
        <div className="task-heading"><h3>{task.title}</h3><span className={`status-pill ${task.status}`}>{task.status}</span></div>
        {task.description && <p>{task.description}</p>}
        <time dateTime={task.createdAt}>Added {formatDate(task.createdAt)}</time>
      </div>
      <div className="task-actions">
        <button type="button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>Edit</button>
        <button type="button" className="delete-action" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}>Delete</button>
      </div>
    </article>
  );
}

function ConfirmDialog({ task, onConfirm, onCancel, busy }) {
  if (!task) return null;
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
      <span className="dialog-kicker">Remove task</span><h2 id="delete-title">Delete “{task.title}”?</h2><p>This action cannot be undone. The task will be removed from your local dashboard.</p>
      <div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Keep task</button><button className="button button-danger" type="button" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting...' : 'Delete task'}</button></div>
    </section>
  </div>;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadTasks() {
    setLoading(true); setError('');
    try { const data = await request('/api/tasks'); setTasks(data.tasks); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { loadTasks(); }, []);

  async function handleSubmit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = editingId ? await request(`/api/tasks/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) }) : await request('/api/tasks', { method: 'POST', body: JSON.stringify(form) });
      setTasks((current) => editingId ? current.map((task) => task.id === editingId ? data.task : task) : [data.task, ...current]);
      setForm(emptyForm); setEditingId(null);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function handleToggle(task) {
    setError('');
    try { const data = await request(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ status: task.status === 'complete' ? 'pending' : 'complete' }) }); setTasks((current) => current.map((item) => item.id === task.id ? data.task : item)); } catch (err) { setError(err.message); }
  }
  async function handleDelete() {
    setBusy(true); setError('');
    try { await request(`/api/tasks/${deleteTask.id}`, { method: 'DELETE' }); setTasks((current) => current.filter((task) => task.id !== deleteTask.id)); setDeleteTask(null); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  function startEdit(task) { setEditingId(task.id); setForm({ title: task.title, description: task.description }); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  const completed = useMemo(() => tasks.filter((task) => task.status === 'complete').length, [tasks]);
  const pending = tasks.length - completed;

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="Daymark home"><span className="brand-mark">D</span><span>daymark</span></a><div className="topbar-meta"><span className="pulse-dot" aria-hidden="true"></span> Local workspace</div></header>
    <main id="top" className="dashboard-shell">
      <section className="dashboard-intro"><div><p className="eyebrow">Personal task dashboard</p><h1>Make room for<br /><em>what matters.</em></h1><p className="intro-copy">A calm place to collect the work in front of you, one clear next step at a time.</p></div><div className="date-card"><span>Today</span><strong>{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</strong><small>{pending} open · {completed} done</small></div></section>
      {error && <div className="error-banner" role="alert"><strong>Something needs attention.</strong><span>{error}</span><button type="button" onClick={loadTasks}>Try again</button></div>}
      <section className="workspace-grid" aria-label="Task workspace">
        <div className="composer-panel"><div className="panel-heading"><div><span className="section-number">01</span><h2>{editingId ? 'Refine this task' : 'Add a task'}</h2></div><span className="panel-icon" aria-hidden="true">✦</span></div><TaskForm form={form} setForm={setForm} onSubmit={handleSubmit} editingId={editingId} onCancel={() => { setEditingId(null); setForm(emptyForm); }} busy={busy} /><p className="composer-note">Keep it specific. Small, clear tasks are easier to move forward.</p></div>
        <div className="tasks-panel"><div className="panel-heading"><div><span className="section-number">02</span><h2>Your tasks</h2></div><span className="task-count">{tasks.length.toString().padStart(2, '0')}</span></div>{loading ? <div className="state-card"><span className="loader" aria-hidden="true"></span><p>Loading your workspace...</p></div> : tasks.length === 0 ? <div className="state-card empty-state"><span className="empty-mark" aria-hidden="true">○</span><h3>Nothing here yet.</h3><p>Add your first task and give the day a direction.</p></div> : <div className="task-list">{tasks.map((task) => <TaskCard key={task.id} task={task} onToggle={handleToggle} onEdit={startEdit} onDelete={setDeleteTask} />)}</div>}</div>
      </section>
    </main>
    <footer className="app-footer"><span>Daymark / Task 03</span><span>Built for focused progress</span></footer>
    <ConfirmDialog task={deleteTask} onConfirm={handleDelete} onCancel={() => setDeleteTask(null)} busy={busy} />
  </div>;
}
