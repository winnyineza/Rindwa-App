# 🚨 Rindwa App - Emergency Reporting Platform

A comprehensive React Native emergency reporting application with real-time incident tracking, user verification, and community safety features.

## 🌟 Features

### Core Functionality
- **Emergency Incident Reporting** - Report incidents with location, media, and priority levels
- **Real-time Verification** - Community-driven incident verification system
- **Emergency Contacts** - Manage personal emergency contacts
- **Location Services** - GPS-based incident location tracking
- **Media Support** - Photo and video upload for incident documentation
- **Offline Support** - Work without internet connection with local data sync

### Enhanced Features
- **Push Notifications** - Real-time alerts for incidents and verifications
- **Deep Linking** - Share incidents and navigate directly to specific content
- **Analytics & Monitoring** - Comprehensive tracking and error monitoring
- **Multi-language Support** - Internationalization for global accessibility
- **Advanced UI/UX** - Modern design with skeleton loading and flash messages
- **State Management** - Redux Toolkit for robust state management
- **Data Fetching** - React Query for efficient API calls with caching

## 🏗️ Architecture

### Frontend (React Native + Expo)
- **React Native 0.73.4** with Expo SDK 50
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Query** for server state management
- **React Navigation** for navigation
- **React Native Paper** for UI components

### Backend (Node.js + Express)
- **Node.js** with Express framework
- **PostgreSQL** database with Prisma ORM
- **JWT** authentication
- **Twilio** for SMS notifications
- **Firebase Auth** integration

### Services Integration
- **Sentry** for error monitoring and performance tracking
- **Firebase Analytics** for user behavior analytics
- **Expo Notifications** for push notifications
- **Deep Linking** for external navigation

## 📱 Screenshots

*[Add screenshots here]*

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- PostgreSQL database
- Firebase project (for analytics)
- Sentry project (for monitoring)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/rindwa-app.git
   cd rindwa-app
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install --legacy-peer-deps
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Frontend
   cd frontend
   cp env.example .env
   # Edit .env with your configuration
   
   # Backend
   cd ../backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm start
   ```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_API_TIMEOUT=15000

# Environment
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_APP_VERSION=1.0.0

# Monitoring (Sentry)
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn-here

# Analytics (Firebase)
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Notifications (Expo)
EXPO_PROJECT_ID=your-expo-project-id

# Deep Linking
EXPO_PUBLIC_APP_SCHEME=rindwa-app
```

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rindwa_db"

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend

# Unit tests
npm test

# Test coverage
npm run test:coverage

# E2E tests (iOS)
npm run test:e2e

# E2E tests (Android)
npm run test:e2e:android
```

### Backend Testing
```bash
cd backend

# Unit tests
npm test

# Integration tests
npm run test:integration
```

## 📦 Building & Deployment

### Frontend (Expo)
```bash
cd frontend

# Build for development
expo build:development

# Build for production
expo build:production

# Publish to Expo
expo publish
```

### Backend (Docker)
```bash
cd backend

# Build Docker image
docker build -t rindwa-backend .

# Run with Docker Compose
docker-compose up -d
```

## 🔄 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow:

- **Code Quality**: Linting, type checking, and formatting
- **Testing**: Unit tests, integration tests, and E2E tests
- **Building**: Automated builds for iOS and Android
- **Deployment**: Automated deployment to production

### Workflow Triggers
- **Push to main**: Full CI/CD pipeline with deployment
- **Pull Request**: Code quality and testing only
- **Push to develop**: Testing and staging deployment

## 📊 Monitoring & Analytics

### Error Monitoring (Sentry)
- Real-time error tracking
- Performance monitoring
- User session tracking
- Custom metrics and breadcrumbs

### Analytics (Firebase)
- User behavior tracking
- Feature usage analytics
- Performance metrics
- Custom event tracking

### Push Notifications
- Incident alerts
- Verification requests
- Emergency notifications
- Custom notification types

## 🔗 Deep Linking

The app supports deep linking for:
- Incident details: `rindwa-app://incident?id=123`
- Verification requests: `rindwa-app://verify?id=123`
- Emergency screens: `rindwa-app://emergency`
- User profiles: `rindwa-app://profile?id=456`

## 🌐 Internationalization

The app supports multiple languages with i18n-js:
- English (default)
- Swahili
- French
- Spanish

## 🔒 Security Features

- JWT token authentication
- Secure storage for sensitive data
- Input validation and sanitization
- Rate limiting on API endpoints
- HTTPS enforcement in production

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API level 21+
- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Follow the existing code style
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community
- Expo team for the excellent development platform
- Firebase for analytics and authentication
- Sentry for error monitoring
- All contributors and testers

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release with core emergency reporting features
- Real-time incident tracking and verification
- Push notifications and deep linking
- Comprehensive analytics and monitoring
- Multi-language support
- Advanced UI/UX with modern design patterns

---

**Made with ❤️ for community safety**
