import { Router } from 'express';
import { createCheckoutController } from '../controllers/checkoutController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
const controller = createCheckoutController();

router.use(requireAuth);
router.get('/', controller.listOrders);

export default router;