const assert = require('assert');

describe('Authentication Endpoints', () => {
  it('should register a new user', async () => {
    const fetch = await import('node-fetch');
    const response = await fetch.default('http://localhost:3001/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'Viewer',
      }),
    });

    assert.strictEqual(response.status, 201);
    const data = await response.json();
    assert.strictEqual(data.message, 'User registered successfully');
  });

  it('should login an existing user', async () => {
    const fetch = await import('node-fetch');
    const response = await fetch.default('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password',
      }),
    });

    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.message, 'Login successful');
    assert.ok(data.token);
  });
});
