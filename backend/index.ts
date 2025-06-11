import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo purposes
let incidents = [
  {
    id: '1',
    type: 'Emergency',
    description: 'Medical emergency reported at downtown area',
    location: 'Main Street & 5th Ave',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    verifications: 3,
    verified: true,
    priority: 'high',
    reportedBy: 'user123'
  },
  {
    id: '2',
    type: 'Safety Concern',
    description: 'Broken streetlight creating unsafe conditions',
    location: 'Oak Street',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    verifications: 1,
    verified: false,
    priority: 'medium',
    reportedBy: 'user456'
  }
];

let emergencyContacts = [
  {
    id: '1',
    userId: 'user123',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    relationship: 'Father',
    isPrimary: true
  },
  {
    id: '2',
    userId: 'user123',
    name: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    relationship: 'Friend',
    isPrimary: false
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Community Safety Backend is running' });
});

// Incidents endpoints
app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.post('/api/incidents', (req, res) => {
  const { type, description, location, priority = 'medium' } = req.body;
  
  if (!type || !description || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newIncident = {
    id: Date.now().toString(),
    type,
    description,
    location,
    timestamp: new Date(),
    verifications: 0,
    verified: false,
    priority,
    reportedBy: req.headers['user-id'] || 'anonymous'
  };

  incidents.unshift(newIncident);
  res.status(201).json(newIncident);
});

app.patch('/api/incidents/:id/verify', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  incident.verifications += 1;
  if (incident.verifications >= 3) {
    incident.verified = true;
  }

  res.json(incident);
});

// Emergency contacts endpoints
app.get('/api/contacts', (req, res) => {
  const userId = req.headers['user-id'] || 'user123';
  const userContacts = emergencyContacts.filter(c => c.userId === userId);
  res.json(userContacts);
});

app.post('/api/contacts', (req, res) => {
  const { name, phone, relationship, isPrimary = false } = req.body;
  const userId = req.headers['user-id'] || 'user123';
  
  if (!name || !phone || !relationship) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // If setting as primary, unset other primary contacts
  if (isPrimary) {
    emergencyContacts.forEach(contact => {
      if (contact.userId === userId) {
        contact.isPrimary = false;
      }
    });
  }

  const newContact = {
    id: Date.now().toString(),
    userId,
    name,
    phone,
    relationship,
    isPrimary
  };

  emergencyContacts.push(newContact);
  res.status(201).json(newContact);
});

app.put('/api/contacts/:id', (req, res) => {
  const contact = emergencyContacts.find(c => c.id === req.params.id);
  
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  const { name, phone, relationship, isPrimary } = req.body;
  
  // If setting as primary, unset other primary contacts for this user
  if (isPrimary && !contact.isPrimary) {
    emergencyContacts.forEach(c => {
      if (c.userId === contact.userId && c.id !== contact.id) {
        c.isPrimary = false;
      }
    });
  }

  Object.assign(contact, { name, phone, relationship, isPrimary });
  res.json(contact);
});

app.delete('/api/contacts/:id', (req, res) => {
  const index = emergencyContacts.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  emergencyContacts.splice(index, 1);
  res.status(204).send();
});

// User profile endpoints
app.get('/api/profile', (req, res) => {
  const userId = req.headers['user-id'] || 'user123';
  const userIncidents = incidents.filter(i => i.reportedBy === userId);
  const userVerifications = incidents.reduce((count, incident) => {
    // Simulate user helping with verifications
    return count + Math.floor(Math.random() * 2);
  }, 0);

  res.json({
    id: userId,
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    joinDate: 'March 2024',
    reportsSubmitted: userIncidents.length,
    verificationsHelped: userVerifications
  });
});

// Authentication endpoints (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Mock authentication
  res.json({
    token: 'mock-jwt-token',
    user: {
      id: 'user123',
      name: 'Alex Johnson',
      email
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  // Mock registration
  res.status(201).json({
    token: 'mock-jwt-token',
    user: {
      id: Date.now().toString(),
      name: `${firstName} ${lastName}`,
      email
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});