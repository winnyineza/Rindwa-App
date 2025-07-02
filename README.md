# Rindwa App - Emergency Incident Management System

A comprehensive emergency incident reporting and management system built for cities and communities. This application enables citizens to report emergency incidents and allows emergency responders and administrators to manage and respond to these reports efficiently.

## 🚨 Features

### For Citizens
- **Emergency Incident Reporting**: Report fire, medical, accident, and security incidents
- **Location Services**: Automatic GPS capture and address resolution
- **Media Upload**: Attach photos and videos to incident reports
- **Real-time Updates**: Track incident status and receive notifications
- **Emergency Contacts**: Manage personal emergency contacts for SMS alerts
- **Upvoting System**: Support and validate reported incidents

### For Emergency Responders
- **Role-based Access**: Different access levels for police, fire department, medical staff
- **Incident Management**: Verify, resolve, and track incident progress
- **Real-time Notifications**: Receive push notifications for new incidents
- **Location-based Filtering**: View incidents in your jurisdiction
- **Communication Tools**: Comment on incidents and coordinate responses

### For Administrators
- **Comprehensive Dashboard**: Analytics and system overview
- **User Management**: Invite and manage users and organizations
- **Organization Management**: Create and manage emergency response organizations
- **System Analytics**: Incident trends and response metrics
- **Activity Logging**: Track all system activities

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Mobile**: Capacitor for iOS/Android
- **Desktop**: Electron
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Firebase Cloud Messaging
- **Maps & Location**: Geolocation APIs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd rindwa-app
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 📱 Mobile Development

### Android Build
```bash
# Build the web app
yarn build

# Initialize Capacitor (first time only)
yarn cap:init

# Add Android platform
yarn cap:add:android

# Build Android APK
yarn android:build
```

### iOS Build
```bash
# Add iOS platform
yarn cap:add:ios

# Open in Xcode
yarn cap:open:ios
```

## 🖥️ Desktop Development

### Electron Build
```bash
# Build for desktop
yarn electron:build
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin-specific components
│   ├── home/           # Home page components
│   └── navigation/     # Navigation components
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── integrations/       # Third-party integrations
└── lib/                # Utility functions
```

## 🔐 Authentication & Authorization

The app uses a role-based access control system:

- **super_admin**: Full system access
- **police**: Access to accident and security incidents
- **fire_dept**: Access to fire incidents
- **medical_staff**: Access to medical incidents
- **moderator**: General admin access
- **user**: Basic citizen access
- **responder**: Emergency responder access

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:
- `incidents`: Emergency incident reports
- `profiles`: User profiles and roles
- `organizations`: Emergency response organizations
- `notifications`: System notifications
- `emergency_contacts`: User emergency contacts
- `activity_logs`: System activity tracking

## 🚀 Deployment

### Web Deployment
```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

### Mobile Deployment
- **Android**: Build APK and distribute via Google Play Store
- **iOS**: Build and distribute via App Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🔮 Roadmap

- [ ] Enhanced mapping integration
- [ ] Offline support improvements
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with emergency services APIs
- [ ] Voice reporting capabilities 