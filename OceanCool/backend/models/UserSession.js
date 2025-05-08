const { v4: uuidv4 } = require('uuid');

class UserSession {
  constructor(userId, token, ipAddress, userAgent) {
    this.sessionId = uuidv4();
    this.userId = userId;
    this.token = token;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.createdAt = new Date();
    this.expiresAt = new Date(Date.now() + 3600000); // Expires in 1 hour
    this.lastActivityAt = new Date();
  }
}

module.exports = UserSession;
