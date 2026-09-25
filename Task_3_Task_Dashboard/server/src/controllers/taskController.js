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
    return null;
  }

  return {
    list(req, res) {
      res.json({ tasks: repository.all() });
    },
    create(req, res) {
      const error = validateTaskInput(req.body);
      if (error) return res.status(400).json({ error });
      const task = repository.create({ title: req.body.title, description: req.body.description, status: req.body.status ?? 'pending' });
      res.status(201).json({ task });
    },
    update(req, res) {
      const error = validateTaskInput(req.body, true);
      if (error) return res.status(400).json({ error });
      const existing = repository.find(Number(req.params.id));
      if (!existing) return res.status(404).json({ error: 'Task not found.' });
      const task = repository.update(existing.id, { title: req.body.title ?? existing.title, description: req.body.description ?? existing.description, status: req.body.status ?? existing.status });
      res.json({ task });
    },
    remove(req, res) {
      if (!repository.delete(Number(req.params.id))) return res.status(404).json({ error: 'Task not found.' });
      res.json({ deleted: true });
    }
  };
}
