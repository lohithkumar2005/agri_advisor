import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createUser, getUserByEmail, updateUser } from './database';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, fieldType, landArea } = req.body;
    
    if (!name || !email || !password || !phone || !fieldType || !landArea) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    const hashedPassword = hashPassword(password);
    await createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      fieldType,
      landArea,
      profilePic: null,
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

    const user = await getUserByEmail(email) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Omit password from response
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
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await updateUser(email, { name, phone, fieldType, landArea, profilePic });
    
    // Fetch updated user to return
    const updatedUser = await getUserByEmail(email) as any;
    if (updatedUser) {
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.status(200).json(userWithoutPassword);
    } else {
        res.status(404).json({ error: 'User not found after update.' });
    }
  } catch (error: any) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Avoid starting the listener fully if deployed in Vercel Serverless (using Vercel's index wrapper)
// But we still start it for local `npm start`
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel Serverless
export default app;
