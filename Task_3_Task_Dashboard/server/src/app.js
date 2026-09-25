import express from 'express';
import cors from 'cors';
import { createDatabase, createTaskRepository } from './database.js';
import { createTaskController } from './controllers/taskController.js';
import { createTaskRoutes } from './routes/taskRoutes.js';

export function createApp({ db = createDatabase(), clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173' } = {}) {
  const app = express();
  const repository = createTaskRepository(db);
  const controller = createTaskController(repository);

  app.use(cors({ origin: clientOrigin }));
  app.use(express.json());
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/tasks', createTaskRoutes(controller));
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  });
  return app;
}
