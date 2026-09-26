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
    if (input.pinned !== undefined && typeof input.pinned !== 'boolean') return 'Pinned must be true or false.';
    if (input.accent !== undefined && !['violet', 'cyan', 'rose', 'amber', 'blue'].includes(input.accent)) return 'Choose a supported task accent.';
    if (input.emoji !== undefined && (typeof input.emoji !== 'string' || input.emoji.length > 8)) return 'Emoji must be a short text value.';
    return null;
  }

  return {
    list(req, res) {
      res.json({ tasks: repository.all() });
    },
    create(req, res) {
      const error = validateTaskInput(req.body);
      if (error) return res.status(400).json({ error });
      const task = repository.create({ title: req.body.title, description: req.body.description, status: req.body.status ?? 'pending', priority: req.body.priority ?? 'medium', dueDate: req.body.dueDate ?? '', tag: req.body.tag ?? '', pinned: req.body.pinned ?? false, accent: req.body.accent ?? 'violet', emoji: req.body.emoji ?? '' });
      res.status(201).json({ task });
    },
    update(req, res) {
      const error = validateTaskInput(req.body, true);
      if (error) return res.status(400).json({ error });
      const existing = repository.find(Number(req.params.id));
      if (!existing) return res.status(404).json({ error: 'Task not found.' });
      const task = repository.update(existing.id, { title: req.body.title ?? existing.title, description: req.body.description ?? existing.description, status: req.body.status ?? existing.status, priority: req.body.priority ?? existing.priority, dueDate: req.body.dueDate ?? existing.dueDate, tag: req.body.tag ?? existing.tag, pinned: req.body.pinned ?? Boolean(existing.pinned), accent: req.body.accent ?? existing.accent, emoji: req.body.emoji ?? existing.emoji });
      res.json({ task });
    },
    reorder(req, res) {
      const ids = req.body?.ids;
      if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(Number(id)))) return res.status(400).json({ error: 'Provide an ordered list of task IDs.' });
      const currentIds = repository.all().map((task) => task.id).sort((a, b) => a - b);
      const requestedIds = ids.map(Number).sort((a, b) => a - b);
      if (currentIds.length !== requestedIds.length || currentIds.some((id, index) => id !== requestedIds[index])) return res.status(400).json({ error: 'The order must include every task exactly once.' });
      repository.reorder(ids.map(Number));
      res.json({ tasks: repository.all() });
    },
    remove(req, res) {
      if (!repository.delete(Number(req.params.id))) return res.status(404).json({ error: 'Task not found.' });
      res.json({ deleted: true });
    }
  };
}
