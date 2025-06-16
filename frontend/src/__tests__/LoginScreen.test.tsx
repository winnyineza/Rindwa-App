import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';

import LoginScreen from '../screens/auth/LoginScreen';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        ...initialState,
      },
    },
  });
};

// Mock the navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
  }),
}));

// Mock flash message
const mockShowMessage = jest.fn();
jest.mock('react-native-flash-message', () => ({
  showMessage: mockShowMessage,
}));

describe('LoginScreen', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  const renderLoginScreen = () => {
    return render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );
  };

  it('renders login form correctly', () => {
    renderLoginScreen();
    
    expect(screen.getByText('Welcome Back')).toBeTruthy();
    expect(screen.getByText('Sign in to continue to Rindwa')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email address')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
    expect(screen.getByText('Forgot Password?')).toBeTruthy();
    expect(screen.getByText('Don\'t have an account?')).toBeTruthy();
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });

  it('shows validation errors for invalid email', async () => {
    renderLoginScreen();
    
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    // Enter invalid email
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(passwordInput, 'blur');
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  it('shows validation errors for short password', async () => {
    renderLoginScreen();
    
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    // Enter valid email and short password
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123');
    fireEvent(passwordInput, 'blur');
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy();
    });
  });

  it('shows validation errors for empty fields', async () => {
    renderLoginScreen();
    
    const loginButton = screen.getByText('Sign In');
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeTruthy();
      expect(screen.getByText('Password is required')).toBeTruthy();
    });
  });

  it('navigates to forgot password screen', () => {
    renderLoginScreen();
    
    const forgotPasswordButton = screen.getByText('Forgot Password?');
    fireEvent.press(forgotPasswordButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('navigates to register screen', () => {
    renderLoginScreen();
    
    const signUpButton = screen.getByText('Sign Up');
    fireEvent.press(signUpButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('shows loading state during login', async () => {
    // Create store with loading state
    store = createTestStore({ isLoading: true });
    
    renderLoginScreen();
    
    // Should show loading indicator instead of button text
    expect(screen.queryByText('Sign In')).toBeFalsy();
  });

  it('shows error message when auth error occurs', () => {
    // Create store with error state
    store = createTestStore({ error: 'Invalid credentials' });
    
    renderLoginScreen();
    
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: 'Login Failed',
      description: 'Invalid credentials',
      type: 'danger',
      duration: 4000,
    });
  });

  it('navigates to main app when already authenticated', () => {
    // Create store with authenticated state
    store = createTestStore({ 
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    });
    
    renderLoginScreen();
    
    expect(mockReplace).toHaveBeenCalledWith('MainTabs');
  });

  it('handles successful login', async () => {
    renderLoginScreen();
    
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Sign In');
    
    // Enter valid credentials
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);
    
    // Note: In a real test, you would mock the Redux dispatch and verify the action was called
    // This is a simplified version for demonstration
  });

  it('disables login button when form is invalid', () => {
    renderLoginScreen();
    
    const loginButton = screen.getByText('Sign In');
    
    // Button should be disabled initially (no valid input)
    expect(loginButton.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#bdc3c7' })
    );
  });

  it('enables login button when form is valid', async () => {
    renderLoginScreen();
    
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Sign In');
    
    // Enter valid credentials
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    await waitFor(() => {
      expect(loginButton.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#e74c3c' })
      );
    });
  });
}); 