# Rindwa App - Community Safety Platform

Rindwa App is a mobile application designed to empower communities through shared safety awareness. The app allows users to report safety incidents, verify reports from others, manage emergency contacts, and stay informed about safety concerns in their area.

## Project Structure

The project is organized into three main components:

1. **Frontend** - React Native mobile application using Expo
2. **Backend** - Node.js/Express API server with Prisma ORM
3. **Admin Dashboard** - React web application for administration

## Features

- **User Authentication** - Register, login, and account management
- **Incident Reporting** - Report safety incidents with location data and media attachments
- **Community Verification** - Verify incidents reported by others in your community
- **Emergency Contacts** - Manage personal emergency contacts for quick access
- **Real-time Notifications** - Get alerted about incidents in your area
- **Offline Support** - Basic functionality works without internet connection
- **Multi-language Support** - Interface available in multiple languages

## Tech Stack

### Frontend
- React Native / Expo
- Redux Toolkit for state management
- React Navigation for routing
- Axios for API requests
- React Query for data fetching
- Formik and Yup for form handling and validation
- React Native Paper for UI components
- Sentry for error monitoring
- Firebase Analytics for usage tracking

### Backend
- Node.js / Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication
- File storage with Firebase Storage
- Swagger for API documentation

### Admin Dashboard
- React
- Material UI
- Redux Toolkit
- Chart.js for data visualization

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database
- Expo CLI (for mobile development)

### Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/your-org/rindwa-app.git
   cd rindwa-app
   ```

2. **Set up environment variables**
   ```
   cp .env.example .env
   cp frontend/env.example frontend/.env
   cp backend/prisma/.env.example backend/prisma/.env
   ```
   
   Edit the `.env` files with your configuration details.

3. **Install dependencies**
   ```
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   
   # Install admin dashboard dependencies
   cd ../admin-dashboard
   npm install
   ```

4. **Run database migrations**
   ```
   cd backend
   npx prisma migrate dev
   ```

5. **Start the development servers**
   ```
   # Start backend
   cd backend
   npm run dev
   
   # Start frontend
   cd frontend
   npm run start
   
   # Start admin dashboard
   cd admin-dashboard
   npm run start
   ```

## Development

### Mobile App (Frontend)

The React Native app uses Expo for easier development and deployment. Key files and directories:

- `frontend/src/screens/` - All app screens
- `frontend/src/components/` - Reusable UI components
- `frontend/src/navigation/` - Navigation configuration
- `frontend/src/services/` - API client and other services
- `frontend/src/store/` - Redux store and slices

### Backend API

The backend uses Express with TypeScript and Prisma ORM. Key files and directories:

- `backend/prisma/schema.prisma` - Database schema
- `backend/index.ts` - Entry point
- `backend/routes/` - API routes
- `backend/controllers/` - Business logic
- `backend/middleware/` - Express middleware

## Testing

- Unit tests use Jest
- Integration tests for API endpoints
- E2E tests with Detox for the mobile app

```
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## Deployment

The app is containerized using Docker for easier deployment. See `DEPLOYMENT.md` for detailed instructions.

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
