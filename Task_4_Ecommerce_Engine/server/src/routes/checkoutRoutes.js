import { Router } from 'express';
import { createCheckoutController } from '../controllers/checkoutController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
const controller = createCheckoutController();

router.get('/config', controller.getConfig);
router.use(requireAuth);
router.post('/payment-intent', controller.createPaymentIntent);
router.post('/confirm', controller.confirmOrder);

export default router;