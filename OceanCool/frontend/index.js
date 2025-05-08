import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Dashboard from './Dashboard';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const getUrlParameter = (name) => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  const handleRegisterClick = () => {
    setIsRegistering(true);
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const handleLoginClick = () => {
    setIsRegistering(false);
    setIsForgotPassword(false);
    setIsResetPassword(false);
    setResetToken(null);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const token = getUrlParameter('token');

  return (
    <div>
      {isLoggedIn ? (
        <Dashboard />
      ) : isResetPassword ? (
        <ResetPasswordPage resetToken={token} />
      ) : isForgotPassword ? (
        <ForgotPasswordPage />
      ) : isRegistering ? (
        <RegisterPage />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
