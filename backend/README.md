# Community Safety Backend

Express.js backend API for the Community Safety mobile application.

## Features

- Incident reporting and management
- Emergency contacts management
- User authentication (mock)
- Community verification system
- RESTful API endpoints

## API Endpoints

### Incidents
- `GET /api/incidents` - Get all incidents
- `POST /api/incidents` - Create new incident
- `PATCH /api/incidents/:id/verify` - Verify an incident

### Emergency Contacts
- `GET /api/contacts` - Get user's emergency contacts
- `POST /api/contacts` - Add new emergency contact
- `PUT /api/contacts/:id` - Update emergency contact
- `DELETE /api/contacts/:id` - Delete emergency contact

### User Profile
- `GET /api/profile` - Get user profile and statistics

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Running the Backend

```bash
cd backend
npm install
npm run dev
```

The server will start on port 3000 by default.

## Development

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server