import crypto from 'node:crypto';
import { Router } from 'express';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { signToken } from '../utils/token.js';

const router = Router();

const publicUser = (u: { _id: unknown; name: string; email: string; role: string }) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required');
  if (String(password).length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
  if (await User.exists({ email: String(email).toLowerCase() })) throw new HttpError(409, 'Email already registered');
  const user = await User.create({ name, email, password }); // role is never taken from the client
  res.status(201).json({ token: signToken(String(user._id)), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) throw new HttpError(400, 'Email and password are required');
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(String(password)))) throw new HttpError(401, 'Invalid email or password');
  res.json({ token: signToken(String(user._id)), user: publicUser(user) });
});

// JWTs are stateless: the client discards the token. Endpoint kept for API completeness.
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

router.get('/me', protect, (req, res) => {
  res.json({ user: publicUser(req.user!) });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) throw new HttpError(400, 'Email is required');
  const user = await User.findOne({ email: String(email).toLowerCase() });
  const response: Record<string, unknown> = {
    message: 'If that email exists, a reset link has been generated.',
  };
  if (user) {
    const raw = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    // No email service is configured: in development the link is returned directly.
    if (process.env.NODE_ENV !== 'production') {
      response.resetUrl = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/reset-password/${raw}`;
    }
  }
  res.json(response);
});

router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body ?? {};
  if (!password || String(password).length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
  const hashed = crypto.createHash('sha256').update(req.params.token as string).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) throw new HttpError(400, 'Reset token is invalid or has expired');
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ token: signToken(String(user._id)), user: publicUser(user) });
});

export default router;
