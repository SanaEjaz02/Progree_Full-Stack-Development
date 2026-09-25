export function createTaskController(repository) {
  function validateTaskInput(body, partial = false) {
    const input = body ?? {};
    if (!partial && (!input.title || typeof input.title !== 'string' || !input.title.trim())) {
      return 'A task title is required.';
    }
    if (partial && input.title !== undefined && (typeof input.title !== 'string' || !input.title.trim())) {
      return 'A task title is required.';
    }
    if (input.description !== undefined && typeof input.description !== 'string') {
      return 'Description must be text.';
    }
    if (input.status !== undefined && !['pending', 'complete'].includes(input.status)) {
      return 'Status must be pending or complete.';
    }
    if (input.priority !== undefined && !['high', 'medium', 'low'].includes(input.priority)) {
      return 'Priority must be high, medium, or low.';
    }
    if (input.dueDate !== undefined && (typeof input.dueDate !== 'string' || (input.dueDate && Number.isNaN(Date.parse(input.dueDate))))) {
      return 'Due date must be a valid date.';
    }
    if (input.tag !== undefined && typeof input.tag !== 'string') return 'Tag must be text.';
    return null;
  }

  return {
    list(req, res) {
      res.json({ tasks: repository.all() });
    },
    create(req, res) {
      const error = validateTaskInput(req.body);
      if (error) return res.status(400).json({ error });
      const task = repository.create({ title: req.body.title, description: req.body.description, status: req.body.status ?? 'pending', priority: req.body.priority ?? 'medium', dueDate: req.body.dueDate ?? '', tag: req.body.tag ?? '' });
      res.status(201).json({ task });
    },
    update(req, res) {
      const error = validateTaskInput(req.body, true);
      if (error) return res.status(400).json({ error });
      const existing = repository.find(Number(req.params.id));
      if (!existing) return res.status(404).json({ error: 'Task not found.' });
      const task = repository.update(existing.id, { title: req.body.title ?? existing.title, description: req.body.description ?? existing.description, status: req.body.status ?? existing.status, priority: req.body.priority ?? existing.priority, dueDate: req.body.dueDate ?? existing.dueDate, tag: req.body.tag ?? existing.tag });
      res.json({ task });
    },
    remove(req, res) {
      if (!repository.delete(Number(req.params.id))) return res.status(404).json({ error: 'Task not found.' });
      res.json({ deleted: true });
    }
  };
}
