import { Router } from 'express';

import { Product } from '../models/Product.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';

const router = Router();
const FIELDS = ['name', 'description', 'price', 'category', 'image', 'stock', 'rating'] as const;

function pick(body: Record<string, unknown>) {
  return Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res) => {
  const { search, category, minPrice, maxPrice, sort = 'newest' } = req.query as Record<string, string>;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));

  const filter: Record<string, unknown> = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
  }
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }
  const sorts: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { rating: -1 },
  };

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sorts[sort] ?? sorts.newest).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ products, page, pages: Math.max(1, Math.ceil(total / limit)), total });
});

router.get('/categories', async (_req, res) => {
  res.json(await Product.distinct('category'));
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
});

router.post('/', protect, restrictTo('admin'), async (req, res) => {
  res.status(201).json(await Product.create(pick(req.body ?? {})));
});

router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body ?? {}), {
    new: true,
    runValidators: true,
  });
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
});

router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ message: 'Product deleted' });
});

export default router;
