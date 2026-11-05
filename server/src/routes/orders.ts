import { Router } from 'express';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { processPayment } from '../utils/payment.js';

const router = Router();
router.use(protect);

const round2 = (n: number) => Math.round(n * 100) / 100;

// Checkout: builds the order from the server-side cart, charges, decrements stock.
router.post('/', async (req, res) => {
  const { shippingAddress, paymentMethod, cardNumber } = req.body ?? {};
  if (!['card', 'paypal', 'cod'].includes(paymentMethod)) throw new HttpError(400, 'Invalid payment method');
  const required = ['fullName', 'address', 'city', 'postalCode', 'country'];
  if (!shippingAddress || required.some((f) => !String(shippingAddress[f] ?? '').trim()))
    throw new HttpError(400, 'Complete shipping address is required');

  const cart = await Cart.findOne({ user: req.user!._id }).populate('items.product');
  const lines = (cart?.items ?? []).filter((i) => i.product);
  if (!cart || lines.length === 0) throw new HttpError(400, 'Cart is empty');

  const items = lines.map((l) => {
    const p = l.product as unknown as { _id: unknown; name: string; image: string; price: number; stock: number };
    if (l.quantity > p.stock) throw new HttpError(400, `"${p.name}" only has ${p.stock} left in stock`);
    return { product: p._id, name: p.name, image: p.image, price: p.price, quantity: l.quantity };
  });

  const itemsPrice = round2(items.reduce((s, i) => s + i.price * i.quantity, 0));
  const shippingPrice = itemsPrice >= 100 ? 0 : 9.99;
  const taxPrice = round2(itemsPrice * 0.08);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  // Reserve stock atomically; roll back if any line fails.
  const reserved: typeof items = [];
  try {
    for (const i of items) {
      const r = await Product.updateOne(
        { _id: i.product, stock: { $gte: i.quantity } },
        { $inc: { stock: -i.quantity } },
      );
      if (r.modifiedCount === 0) throw new HttpError(400, `"${i.name}" is out of stock`);
      reserved.push(i);
    }
    const payment = await processPayment(paymentMethod, totalPrice, { cardNumber });
    if (!payment.success) throw new HttpError(402, payment.error ?? 'Payment failed');

    const paid = paymentMethod !== 'cod';
    const order = await Order.create({
      user: req.user!._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: paid,
      paidAt: paid ? new Date() : undefined,
      paymentId: payment.paymentId,
      status: paid ? 'paid' : 'pending',
    });
    await Cart.updateOne({ user: req.user!._id }, { items: [] });
    res.status(201).json(order);
  } catch (err) {
    for (const i of reserved) await Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } });
    throw err;
  }
});

router.get('/mine', async (req, res) => {
  res.json(await Order.find({ user: req.user!._id }).sort({ createdAt: -1 }));
});

router.get('/', restrictTo('admin'), async (_req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }).populate('user', 'name email'));
});

router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');
  if (String(order.user) !== String(req.user!._id) && req.user!.role !== 'admin') throw new HttpError(403, 'Forbidden');
  res.json(order);
});

router.put('/:id/status', restrictTo('admin'), async (req, res) => {
  const { status } = req.body ?? {};
  if (!['pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(status))
    throw new HttpError(400, 'Invalid status');
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(order);
});

export default router;
