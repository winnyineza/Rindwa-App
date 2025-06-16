# 🚨 Rindwa App - Emergency Reporting Platform

[![React Native](https://img.shields.io/badge/React%20Native-0.72.0-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive emergency reporting platform built with React Native, Node.js, and PostgreSQL. Rindwa App enables real-time incident reporting, verification, and response coordination for emergency situations.

## 🌟 Features

### 📱 Mobile Application
- **Real-time Emergency Reporting** - Report incidents with location, media, and priority classification
- **User Authentication** - Secure registration and login with JWT tokens
- **Offline Support** - Continue working without internet connection
- **Push Notifications** - Get updates on incident status and responses
- **Location Services** - GPS-based incident reporting and tracking
- **Media Upload** - Attach photos and videos to incident reports

### 📊 Admin Dashboard
- **Incident Management** - Real-time monitoring and verification workflow
- **Analytics & Reporting** - Comprehensive statistics and data visualization
- **User Administration** - Manage users, roles, and permissions
- **System Configuration** - Configure notifications and application settings

### 🔧 Backend API
- **RESTful API** - Complete CRUD operations for all entities
- **Authentication & Authorization** - JWT-based security with role-based access
- **File Management** - Secure media upload and storage
- **Database Integration** - PostgreSQL with Prisma ORM
- **Real-time Updates** - WebSocket integration for live data

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   React Admin   │    │   Node.js API   │
│   Mobile App    │◄──►│   Dashboard     │◄──►│   (Express)     │
│   (Expo)        │    │   (TypeScript)  │    │   (TypeScript)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   Database      │
                                               └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Expo CLI (`npm install -g @expo/cli`)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Rindwa-App
```

### 2. Environment Setup
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin-dashboard/.env.example admin-dashboard/.env

# Edit the files with your configuration
```

### 3. Install Dependencies
```bash
# Backend
cd backend
npm install
npx prisma generate

# Frontend
cd ../frontend
npm install

# Admin Dashboard
cd ../admin-dashboard
npm install
```

### 4. Start Services

#### Option A: Using the Startup Script (Recommended)
```bash
# Windows PowerShell
.\start-app.ps1

# Linux/Mac
chmod +x start-app.sh
./start-app.sh
```

#### Option B: Manual Start
```bash
# Start database
docker-compose up -d postgres

# Start backend (in new terminal)
cd backend
npm run dev

# Start admin dashboard (in new terminal)
cd admin-dashboard
npm start

# Start mobile app (in new terminal)
cd frontend
npm start
```

### 5. Access the Application
- **Mobile App**: Scan QR code from Expo development server
- **Admin Dashboard**: http://localhost:3001
- **API Documentation**: http://localhost:3000/api
- **Database**: localhost:5432

## 📱 Mobile App Usage

### Installation
1. Install Expo Go from your device's app store
2. Scan the QR code from the Expo development server
3. The app will load on your device

### Features
- **Report Emergency**: Tap the emergency button to report an incident
- **View Incidents**: Browse reported incidents in your area
- **Profile Management**: Update your profile and notification preferences
- **Offline Mode**: Continue using the app without internet connection

## 📊 Admin Dashboard Usage

### Access
1. Open http://localhost:3001 in your browser
2. Login with admin credentials
3. Navigate through the dashboard sections

### Features
- **Incident Management**: View, verify, and update incident status
- **User Management**: Manage user accounts and permissions
- **Analytics**: View statistics and generate reports
- **System Settings**: Configure application parameters

## 🔧 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/refresh     # Refresh token
POST /api/auth/logout      # User logout
```

### Incident Endpoints
```http
GET    /api/incidents      # List incidents
POST   /api/incidents      # Create incident
PUT    /api/incidents/:id  # Update incident
DELETE /api/incidents/:id  # Delete incident
```

### User Endpoints
```http
GET  /api/users/profile    # Get user profile
PUT  /api/users/profile    # Update profile
POST /api/users/notifications # Update notifications
```

## 🐳 Docker Deployment

### Development
```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build -d

# Scale services
docker-compose -f docker-compose.prod.yml up --scale backend=3
```

## 🧪 Testing

### Run All Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
cd frontend
npm run test:e2e
```

### Test Coverage
```bash
# Generate coverage reports
npm run test:coverage
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Environment Variables** for sensitive data

## 📈 Monitoring & Analytics

- **Error Tracking**: Sentry integration
- **Analytics**: Firebase Analytics
- **Performance**: React Query DevTools
- **Health Checks**: Automated service monitoring
- **Logging**: Structured logging with Winston

## 🛠️ Development

### Code Quality
- ESLint and Prettier for code formatting
- Pre-commit hooks for automated checks
- TypeScript for type safety
- Comprehensive test coverage

### Git Workflow
1. Create feature branch from main
2. Make changes with tests
3. Run linting and tests
4. Submit pull request
5. Code review and merge

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: Contact the development team

## 🎯 Roadmap

### Upcoming Features
- [ ] Real-time messaging system
- [ ] Advanced analytics and reporting
- [ ] Integration with emergency services
- [ ] Voice-to-text reporting
- [ ] Offline incident reporting
- [ ] Multi-language support

### Technical Improvements
- [ ] GraphQL implementation
- [ ] Microservices architecture
- [ ] Advanced caching strategies
- [ ] CDN integration
- [ ] Two-factor authentication

## 🙏 Acknowledgments

- React Native and Expo teams
- Node.js and Express communities
- PostgreSQL and Prisma teams
- All contributors and supporters

---

**Made with ❤️ for emergency response and community safety**
