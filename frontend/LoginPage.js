import React, { useState } from 'react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful', data);
        // Store the token in local storage or a cookie
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('sessionId', data.sessionId);
        // Redirect to the dashboard
        props.onLoginSuccess();
      } else {
        console.error('Login failed', data);
        // Display an error message to the user
      }
    } catch (error) {
      console.error('Error logging in', error);
      // Display an error message to the user
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="#" onClick={() => {
          window.location.reload();
        }}>Register</a>
      </p>
      <p>
        <a href="#" onClick={() => {
          window.location.reload();
        }}>Forgot Password?</a>
      </p>
    </div>
  );
}

export default LoginPage;
