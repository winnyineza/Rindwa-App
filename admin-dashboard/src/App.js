import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Badge,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Download as DownloadIcon,
  Map as MapIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const drawerWidth = 240;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    activeIncidents: 0,
    verifiedIncidents: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [userApiWarning, setUserApiWarning] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  
  // Advanced analytics state
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // UI state
  const [darkMode, setDarkMode] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminUser');
    if (token && adminData) {
      setIsAuthenticated(true);
      setAdminUser(JSON.parse(adminData));
    } else {
      setLoginOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // For demo purposes, accept any email/password combination
      // In production, this would call your backend auth endpoint
      const mockAdminUser = {
        id: 1,
        name: 'Admin User',
        email: loginForm.email,
        role: 'admin'
      };
      
      const mockToken = 'mock-admin-token-' + Date.now();
      
      localStorage.setItem('adminToken', mockToken);
      localStorage.setItem('adminUser', JSON.stringify(mockAdminUser));
      
      setIsAuthenticated(true);
      setAdminUser(mockAdminUser);
      setLoginOpen(false);
      setNotification({ open: true, message: 'Login successful!', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: 'Login failed. Please try again.', severity: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setAdminUser(null);
    setLoginOpen(true);
    setNotification({ open: true, message: 'Logged out successfully', severity: 'info' });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/incidents`),
        axios.get(`${API_BASE_URL}/api/users`).catch(() => {
          setUserApiWarning(true);
          return { data: [] };
        })
      ]);

      setIncidents(incidentsRes.data);
      setUsers(usersRes.data);

      // Calculate stats
      const totalIncidents = incidentsRes.data.length;
      const activeIncidents = incidentsRes.data.filter(i => i.status === 'active').length;
      const verifiedIncidents = incidentsRes.data.filter(i => i.verified).length;
      const totalUsers = usersRes.data.length;

      setStats({ totalIncidents, activeIncidents, verifiedIncidents, totalUsers });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIncident = async (incidentId) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/incidents/${incidentId}/verify`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      fetchData();
      setNotification({ open: true, message: 'Incident verified successfully', severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: 'Failed to verify incident', severity: 'error' });
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setIncidentModalOpen(true);
  };

  const handleExportData = (type) => {
    // Mock export functionality
    const data = type === 'users' ? users : incidents;
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0] || {}).join(",") + "\n" +
      data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setNotification({ open: true, message: `${type} data exported successfully`, severity: 'success' });
  };

  const getFilteredIncidents = () => {
    let filtered = incidents;
    
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(incident => new Date(incident.createdAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(incident => new Date(incident.createdAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(incident => new Date(incident.createdAt) >= filterDate);
          break;
      }
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(incident => incident.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter);
    }
    
    return filtered;
  };

  const drawerItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
    { text: 'Incidents', icon: <ReportIcon />, value: 'incidents' },
    { text: 'Users', icon: <PeopleIcon />, value: 'users' },
    { text: 'Analytics', icon: <TrendingUpIcon />, value: 'analytics' },
    { text: 'Settings', icon: <SettingsIcon />, value: 'settings' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          🚨 Rindwa Admin
        </Typography>
      </Toolbar>
      <List>
        {drawerItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => setActiveTab(item.value)}
            selected={activeTab === item.value}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  // Login Dialog
  const renderLoginDialog = () => (
    <Dialog open={loginOpen} onClose={() => {}} maxWidth="sm" fullWidth>
      <DialogTitle>Admin Login</DialogTitle>
      <form onSubmit={handleLogin}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            required
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained" startIcon={<LoginIcon />}>
            Login
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  const renderDashboard = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Incidents
              </Typography>
              <Typography variant="h4">{stats.totalIncidents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Incidents
              </Typography>
              <Typography variant="h4" color="warning.main">{stats.activeIncidents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Verified Incidents
              </Typography>
              <Typography variant="h4" color="success.main">{stats.verifiedIncidents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Incidents
            </Typography>
            {incidents.slice(0, 5).map((incident) => (
              <Box key={incident.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">{incident.type}</Typography>
                    <Typography variant="body2" color="textSecondary">{incident.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {incident.verified ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <WarningIcon color="warning" />
                    )}
                    <Typography variant="caption">{incident.status}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Incident Types
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(incidents.reduce((acc, incident) => {
                    acc[incident.type] = (acc[incident.type] || 0) + 1;
                    return acc;
                  }, {})).map(([type, count]) => ({ name: type, value: count }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(incidents.reduce((acc, incident) => {
                    acc[incident.type] = (acc[incident.type] || 0) + 1;
                    return acc;
                  }, {})).map(([type, count]) => ({ name: type, value: count })).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderIncidents = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Incident Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => handleExportData('incidents')}
        >
          Export Incidents
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Filter</InputLabel>
              <Select
                value={dateFilter}
                label="Date Filter"
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type Filter</InputLabel>
              <Select
                value={typeFilter}
                label="Type Filter"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {Array.from(new Set(incidents.map(i => i.type))).map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="textSecondary">
              Showing {getFilteredIncidents().length} of {incidents.length} incidents
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={2}>
        {getFilteredIncidents().map((incident) => (
          <Grid item xs={12} key={incident.id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleIncidentClick(incident)}>
                  <Typography variant="h6">{incident.type}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Location: {incident.location}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {incident.description}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Reported by: {incident.reporter?.name} on {new Date(incident.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {incident.verified ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <WarningIcon color="warning" />
                  )}
                  <Typography variant="caption">{incident.status}</Typography>
                  <Typography variant="caption">
                    Verifications: {incident.verifications?.length || 0}
                  </Typography>
                  {!incident.verified && (
                    <IconButton size="small" onClick={() => handleVerifyIncident(incident.id)} color="primary">
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                  <IconButton size="small" color="primary"><EditIcon /></IconButton>
                  <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Dialog open={incidentModalOpen} onClose={() => setIncidentModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Incident Details</DialogTitle>
        <DialogContent>
          {selectedIncident && (
            <Box>
              <Typography variant="h6">{selectedIncident.type}</Typography>
              <Typography>Description: {selectedIncident.description}</Typography>
              <Typography>Location: {selectedIncident.location}</Typography>
              <Typography>Status: {selectedIncident.status}</Typography>
              <Typography>Reported by: {selectedIncident.reporter?.name}</Typography>
              <Typography>Date: {selectedIncident.createdAt ? new Date(selectedIncident.createdAt).toLocaleString() : 'N/A'}</Typography>
              {/* Map view for incident location (if lat/lng available) */}
              {selectedIncident.latitude && selectedIncident.longitude && (
                <Box sx={{ height: 300, mt: 2 }}>
                  <MapContainer center={[selectedIncident.latitude, selectedIncident.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[selectedIncident.latitude, selectedIncident.longitude]}>
                      <Popup>{selectedIncident.location}</Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              )}
              {/* TODO: Show media, verifications, etc. */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncidentModalOpen(false)}>Close</Button>
          <Button color="primary">Export</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderUsers = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => handleExportData('users')}
        >
          Export Users
        </Button>
      </Box>
      
      {userApiWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          /api/users endpoint not found. User management features are limited until this endpoint is implemented in the backend.
        </Alert>
      )}
      <Grid container spacing={2}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="primary" />
                <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleUserClick(user)}>
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <IconButton size="small" color="primary"><EditIcon /></IconButton>
                  <IconButton size="small" color="error"><DeleteIcon /></IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog open={userModalOpen} onClose={() => setUserModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6">{selectedUser.name}</Typography>
              <Typography>Email: {selectedUser.email}</Typography>
              <Typography>Phone: {selectedUser.phone}</Typography>
              <Typography>Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</Typography>
              {/* TODO: List user's incidents, contacts, etc. */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserModalOpen(false)}>Close</Button>
          <Button color="primary">Export</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderAnalytics = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Advanced Analytics
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Incidents Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incidents.reduce((acc, incident) => {
                const date = new Date(incident.createdAt).toLocaleDateString();
                acc[date] = (acc[date] || 0) + 1;
                return acc;
              }, {})}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Incidents by Type (Bar Chart)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(incidents.reduce((acc, incident) => {
                acc[incident.type] = (acc[incident.type] || 0) + 1;
                return acc;
              }, {})).map(([type, count]) => ({ name: type, value: count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Incident Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(incidents.reduce((acc, incident) => {
                    acc[incident.status] = (acc[incident.status] || 0) + 1;
                    return acc;
                  }, {})).map(([status, count]) => ({ name: status, value: count }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(incidents.reduce((acc, incident) => {
                    acc[incident.status] = (acc[incident.status] || 0) + 1;
                    return acc;
                  }, {})).map(([status, count]) => ({ name: status, value: count })).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification Rate
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h2" color="primary">
                {stats.totalIncidents > 0 ? Math.round((stats.verifiedIncidents / stats.totalIncidents) * 100) : 0}%
              </Typography>
              <Typography variant="body1" color="textSecondary">
                of incidents verified
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSettings = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              }
              label="Dark Mode"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Toggle between light and dark theme
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Admin Account
            </Typography>
            {adminUser && (
              <Box>
                <Typography>Name: {adminUser.name}</Typography>
                <Typography>Email: {adminUser.email}</Typography>
                <Typography>Role: {adminUser.role}</Typography>
                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ mt: 2 }}
                >
                  Logout
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Export
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportData('incidents')}
              >
                Export Incidents
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportData('users')}
              >
                Export Users
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'incidents':
        return renderIncidents();
      case 'users':
        return renderUsers();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  // Show login dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {renderLoginDialog()}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Rindwa Community Safety - Admin Dashboard
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        >
          <Toolbar />
          <Container maxWidth="xl">
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {renderContent()}
          </Container>
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App; 