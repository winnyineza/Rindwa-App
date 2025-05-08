import React, { useState } from 'react';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Forgot password request successful', data);
        // Display a success message to the user
        // After successfully sending the reset link, redirect to a confirmation page or the login page
        // For now, let's just log the success message
        alert(data.message);
        window.location.href = `/index.html?token=${data.resetToken}`;
      } else {
        console.error('Forgot password request failed', data);
        // Display an error message to the user
        alert(data.message);
      }
    } catch (error) {
      console.error('Error submitting forgot password request', error);
      // Display an error message to the user
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
