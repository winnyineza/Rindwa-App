import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Check if FRONTEND_URL is set in production
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.error('FRONTEND_URL environment variable not set in production!');
  process.exit(1);
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:19006', // Allow requests from the frontend
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware to validate request body
const validateRequest = (requiredFields: string[]) => (req: any, res: any, next: any) => {
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }
  next();
};

// Middleware to handle errors
const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Rindwa Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET environment variable not set!');
      process.exit(1);
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Authentication endpoints
app.post('/api/auth/register', validateRequest(['email', 'password', 'name']), async (req: any, res: any, next: any) => {
  try {
    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', validateRequest(['email', 'password']), async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
});

// Incidents endpoints
app.get('/api/incidents', async (req: any, res: any, next: any) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        verifications: true,
        media: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(incidents);
  } catch (error) {
    next(error);
  }
});

app.post('/api/incidents', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { type, description, location, priority = 'medium', latitude, longitude } = req.body;
    const userId = req.user.userId;

    if (!type || !description || !location) {
      return res.status(400).json({ error: 'Type, description, and location are required' });
    }

    const incident = await prisma.incident.create({
      data: {
        type,
        description,
        location,
        priority,
        latitude,
        longitude,
        reportedBy: userId
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/incidents/:id/verify', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if user already verified this incident
    const existingVerification = await prisma.verification.findUnique({
      where: {
        incidentId_userId: {
          incidentId: id,
          userId: userId
        }
      }
    });

    if (existingVerification) {
      return res.status(400).json({ error: 'You have already verified this incident' });
    }

    // Create verification
    await prisma.verification.create({
      data: {
        incidentId: id,
        userId: userId
      }
    });

    // Get updated incident with verification count
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        verifications: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Auto-verify if 3 or more verifications
    if (incident && incident.verifications.length >= 3) {
      await prisma.incident.update({
        where: { id },
        data: { verified: true }
      });
      incident.verified = true;
    }

    res.json(incident);
  } catch (error) {
    next(error);
  }
});

// Emergency contacts endpoints
app.get('/api/contacts', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.userId;
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { isPrimary: 'desc' }
    });

    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

app.post('/api/contacts', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const { name, phone, relationship, isPrimary = false } = req.body;
    const userId = req.user.userId;

    if (!name || !phone || !relationship) {
      return res.status(400).json({ error: 'Name, phone, and relationship are required' });
    }

    // If setting as primary, unset other primary contacts
    if (isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { userId },
        data: { isPrimary: false }
      });
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        userId,
        name,
        phone,
        relationship,
        isPrimary
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

// User profile endpoint
app.get('/api/profile', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        incidents: {
          select: { id: true }
        },
        verifications: {
          select: { id: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      joinDate: user.createdAt,
      reportsSubmitted: user.incidents.length,
      verificationsHelped: user.verifications.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users - List all users (for admin dashboard)
app.get('/api/users', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Apply error handler middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
