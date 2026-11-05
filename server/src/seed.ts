import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { Cart } from './models/Cart.js';
import { Order } from './models/Order.js';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

const products = [
  ['Wireless Headphones', 'Over-ear Bluetooth headphones with 30h battery and noise cancelling.', 129.99, 'Electronics', 'headphones', 25, 4.6],
  ['Smart Watch', 'Fitness tracking, heart-rate monitor and 7-day battery life.', 199.0, 'Electronics', 'watch', 15, 4.4],
  ['Mechanical Keyboard', 'Hot-swappable switches with RGB backlight.', 89.5, 'Electronics', 'keyboard', 40, 4.7],
  ['Portable Speaker', 'Waterproof speaker with deep bass and 12h playtime.', 59.99, 'Electronics', 'speaker', 30, 4.3],
  ['Running Shoes', 'Lightweight breathable shoes built for daily runs.', 74.99, 'Fashion', 'shoes', 50, 4.5],
  ['Denim Jacket', 'Classic fit denim jacket in washed blue.', 64.0, 'Fashion', 'jacket', 20, 4.2],
  ['Leather Backpack', 'Handcrafted backpack with padded laptop sleeve.', 110.0, 'Fashion', 'backpack', 12, 4.8],
  ['Sunglasses', 'Polarised UV400 lenses with a durable frame.', 39.9, 'Fashion', 'sunglasses', 60, 4.1],
  ['Ceramic Mug Set', 'Set of four handmade 350ml mugs.', 28.0, 'Home', 'mugs', 35, 4.5],
  ['Scented Candle', 'Soy wax candle with lavender and cedar notes.', 18.5, 'Home', 'candle', 80, 4.6],
  ['Desk Lamp', 'Dimmable LED lamp with USB charging port.', 45.0, 'Home', 'lamp', 28, 4.4],
  ['Cast Iron Skillet', 'Pre-seasoned 12-inch skillet for stovetop and oven.', 42.0, 'Home', 'skillet', 22, 4.7],
  ['Yoga Mat', 'Non-slip 6mm mat with carrying strap.', 24.99, 'Sports', 'yoga', 45, 4.3],
  ['Adjustable Dumbbells', 'Pair of dumbbells adjustable from 2 to 24 kg.', 149.0, 'Sports', 'dumbbell', 10, 4.6],
  ['Water Bottle', 'Insulated stainless steel bottle, 750ml.', 22.0, 'Sports', 'bottle', 100, 4.8],
  ['Paperback Novel Bundle', 'Three bestselling novels in one box set.', 31.5, 'Books', 'books', 18, 4.2],
].map(([name, description, price, category, seed, stock, rating]) => ({
  name, description, price, category, image: img(seed as string), stock, rating,
}));

await connectDB();
await Promise.all([Product.deleteMany({}), Cart.deleteMany({}), Order.deleteMany({}), User.deleteMany({})]);
await Product.insertMany(products);
await User.create([
  { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { name: 'Test User', email: 'user@example.com', password: 'user123', role: 'user' },
]);
console.log(`Seeded ${products.length} products and 2 users (admin@example.com / admin123, user@example.com / user123)`);
await mongoose.disconnect();
