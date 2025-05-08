const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User');

const users = []; // In-memory user storage (replace with database)
const loginAttempts = {}; // In-memory store for login attempts
const sessions = {}; // In-memory store for sessions
const passwordResetTokens = {}; // In-memory store for password reset tokens

console.log('OceanCool backend is running!');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const generateToken = (user) => {
  const payload = {
    userId: user.userId,
    role: user.role,
  };
  const secretKey = 'your-secret-key'; // Replace with a strong, secret key
  const options = {
    expiresIn: '1h', // Token expires in 1 hour
  };
  return jwt.sign(payload, secretKey, options);
};

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Middleware to prevent CORS errors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.post('/register', async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, role } = req.body;

    // Check if user already exists
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User(username, hashedPassword, email, firstName, lastName, role);
    users.push(newUser);

    console.log('New user registered:', newUser); // Log the registered user

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Rate limiting
    if (loginAttempts[username] && loginAttempts[username].attempts >= 5) {
      const timeSinceLastAttempt = Date.now() - loginAttempts[username].lastAttempt;
      if (timeSinceLastAttempt < 60000) { // 1 minute
        return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
      } else {
        // Reset attempts if 1 minute has passed
        loginAttempts[username] = { attempts: 1, lastAttempt: Date.now() };
      }
    }

    const user = users.find(user => user.username === username);

    if (!user) {
      loginAttempts[username] = { attempts: (loginAttempts[username]?.attempts || 0) + 1, lastAttempt: Date.now() };
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      loginAttempts[username] = { attempts: (loginAttempts[username]?.attempts || 0) + 1, lastAttempt: Date.now() };
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Reset attempts on successful login
    delete loginAttempts[username];

    const token = generateToken(user);
    const sessionId = uuidv4(); // Generate a session ID
    // Store the session in memory (replace with database)
    sessions[sessionId] = { userId: user.userId, token };

    res.json({ message: 'Login successful', token, role: user.role, sessionId });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

const { verifyToken, authorize } = require('./middleware/auth');
const fetch = require('node-fetch');

const apiKey = '73c107d10d3e7418528bfe3786a4686f';
const cities = [
  'Kigali', 'Cape Town', 'New York', 'London', 'Paris', 'Tokyo', 'Guangzhou', 'Miami', 'Delhi', 'Jacksonville',
  'Virginia Beach', 'Manilla', 'Lagos', 'Osaka', 'Jakarta', 'Nairobi', 'Burundi', 'Kinshasa', 'Bujumbura', 'Lima',
  'Karachi', 'Muscat', 'Washington', 'Seattle', 'Otawa', 'Toronto', 'Berlin', 'Rio de Janeiro', 'Texas', 'Amsterdam',
  'Barcelona', 'Venice', 'Oslo', 'Madrid', 'Addis Ababa', 'Abuja', 'Dar es Salaam', 'Kampala'
];

app.get('/status', verifyToken, authorize('read'), (req, res) => {
  // Dummy data for system status
  const statusData = {
    operationalMode: 'Normal',
    overallStatus: 'Normal',
    activeAlerts: 0,
    powerConsumption: 1200,
    coolingCapacity: 5000,
    efficiency: 4.2,
  };
  res.json(statusData);
});

app.get('/alerts', verifyToken, authorize('read'), (req, res) => {
  // Dummy data for alerts
  const alertData = [
    { id: 1, message: 'High temperature detected in Heat Exchanger 1', severity: 'High' },
    { id: 2, message: 'Low pressure detected in Distribution Network', severity: 'Medium' },
    { id: 3, message: 'Maintenance required for Pump 2', severity: 'Low' },
  ];
  res.json(alertData);
});

app.get('/metrics', verifyToken, authorize('read'), (req, res) => {
  // Dummy data for performance metrics
  const metricsData = {
    energyEfficiency: 4.5,
    coolingCapacity: 5200,
    environmentalImpact: {
      co2Savings: 1500,
    },
  };
  res.json(metricsData);
});

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  // Check if the user exists with the given email
  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate a unique token for password reset
  const resetToken = uuidv4();

  // Store the token and the user's email in the database (or in-memory store)
  // Replace this with your actual database logic
  passwordResetTokens[resetToken] = { email: user.email, timestamp: Date.now() };

  // Send an email to the user with a link to reset their password, including the token
  // Replace this with your actual email sending logic
  console.log(`Sending email to ${email} with reset token: ${resetToken}`);

  res.json({ message: 'Password reset link sent to your email', resetToken: resetToken });
});

app.post('/reset-password', async (req, res) => {
  const { resetToken, password } = req.body;

  // Verify the reset token
  if (!passwordResetTokens[resetToken]) {
    return res.status(400).json({ message: 'Invalid reset token' });
  }

  const { email, timestamp } = passwordResetTokens[resetToken];

  // Check if the token has expired (e.g., 1 hour)
  if (Date.now() - timestamp > 3600000) {
    return res.status(400).json({ message: 'Reset token has expired' });
  }

  // Hash the new password
  const hashedPassword = await hashPassword(password);

  // Update the user's password in the database (or in-memory store)
  const userIndex = users.findIndex(user => user.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  users[userIndex].passwordHash = hashedPassword;

  // Invalidate the password reset token
  delete passwordResetTokens[resetToken];

  res.json({ message: 'Password reset successfully' });
});

app.get('/weather', verifyToken, authorize('read'), async (req, res) => {
  try {
    const weatherData = {};
    for (const city of cities) {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      weatherData[city] = {
        temperature: data?.main?.temp,
        description: data?.weather[0]?.description,
        icon: data?.weather[0]?.icon,
      };
    }
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
