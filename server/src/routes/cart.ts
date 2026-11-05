import { Router } from 'express';
import type { Types } from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';

const router = Router();
router.use(protect);

async function loadCart(userId: Types.ObjectId) {
  const cart = (await Cart.findOne({ user: userId })) ?? (await Cart.create({ user: userId, items: [] }));
  return cart;
}

async function respond(userId: Types.ObjectId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  // drop items whose product was deleted
  const items = (cart?.items ?? []).filter((i) => i.product);
  return { items };
}

const qty = (v: unknown) => {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < 1) throw new HttpError(400, 'Quantity must be at least 1');
  return n;
};

router.get('/', async (req, res) => {
  res.json(await respond(req.user!._id));
});

router.post('/items', async (req, res) => {
  const { productId } = req.body ?? {};
  const quantity = qty(req.body?.quantity ?? 1);
  const product = await Product.findById(productId);
  if (!product) throw new HttpError(404, 'Product not found');
  const cart = await loadCart(req.user!._id);
  const existing = cart.items.find((i) => String(i.product) === String(product._id));
  const newQty = (existing?.quantity ?? 0) + quantity;
  if (newQty > product.stock) throw new HttpError(400, `Only ${product.stock} in stock`);
  if (existing) existing.quantity = newQty;
  else cart.items.push({ product: product._id, quantity: newQty });
  await cart.save();
  res.json(await respond(req.user!._id));
});

router.put('/items/:productId', async (req, res) => {
  const quantity = qty(req.body?.quantity);
  const product = await Product.findById(req.params.productId);
  if (!product) throw new HttpError(404, 'Product not found');
  if (quantity > product.stock) throw new HttpError(400, `Only ${product.stock} in stock`);
  const cart = await loadCart(req.user!._id);
  const item = cart.items.find((i) => String(i.product) === req.params.productId);
  if (!item) throw new HttpError(404, 'Item not in cart');
  item.quantity = quantity;
  await cart.save();
  res.json(await respond(req.user!._id));
});

router.delete('/items/:productId', async (req, res) => {
  const cart = await loadCart(req.user!._id);
  cart.set(
    'items',
    cart.items.filter((i) => String(i.product) !== req.params.productId),
  );
  await cart.save();
  res.json(await respond(req.user!._id));
});

router.delete('/', async (req, res) => {
  await Cart.updateOne({ user: req.user!._id }, { items: [] });
  res.json({ items: [] });
});

export default router;
