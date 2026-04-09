import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

// Handle BigInt serialization
(BigInt.prototype as any).toJSON = function () { return this.toString(); };

const prisma = new PrismaClient();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiter for auth endpoints - max 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again after 15 minutes.' }
});

// General API limiter - max 60 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, fieldType, landArea } = req.body;

    if (!name || !email || !password || !phone || !fieldType || !landArea) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    await prisma.user.create({
      data: { name, email, phone, password: hashPassword(password), fieldType, landArea, profilePic: null }
    });

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } }) as any;
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/auth/update', async (req, res) => {
  try {
    const { email, name, phone, fieldType, landArea, profilePic } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { name, phone, fieldType, landArea, ...(profilePic !== undefined && { profilePic }) }
    }) as any;

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error: any) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Start locally only
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
