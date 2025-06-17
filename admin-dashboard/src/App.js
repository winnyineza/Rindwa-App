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
  CssBaseline,
  ThemeProvider,
  createTheme,
  Alert,
  Snackbar,
  IconButton,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const theme = createTheme();

const drawerWidth = 240;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [adminUser, setAdminUser] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState('dashboard');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginForm);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      setAdminUser(response.data.user);
      setLoginOpen(false);
      setNotification({ open: true, message: 'Login successful!', severity: 'success' });
    } catch (err) {
      console.error('Login error:', err);
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

  const renderLoginDialog = () => (
    <Dialog open={loginOpen} onClose={() => { }} maxWidth="sm" fullWidth>
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
    <Typography variant="h4" gutterBottom>
      Dashboard Overview
    </Typography>
  );

  const renderIncidents = () => (
    <Typography variant="h4" gutterBottom>
      Incident Management
    </Typography>
  );

  const renderUsers = () => (
    <Typography variant="h4" gutterBottom>
      User Management
    </Typography>
  );

  const renderAnalytics = () => (
    <Typography variant="h4" gutterBottom>
      Advanced Analytics
    </Typography>
  );

  const renderSettings = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Button
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{ mt: 2 }}
      >
        Logout
      </Button>
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
      <BrowserRouter>
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
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/users" element={<Users />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
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
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
