import { Router } from 'express';
import { addCartItem, getCart, removeCartItem, updateCartItem } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getCart);
router.post('/:productId', addCartItem);
router.patch('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);

export default router;