import 'express';

// Extend Express Request type to include 'user' property

declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
} 