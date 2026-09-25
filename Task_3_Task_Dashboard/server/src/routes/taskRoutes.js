import { Router } from 'express';

export function createTaskRoutes(controller) {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
