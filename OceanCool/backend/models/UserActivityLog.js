const { v4: uuidv4 } = require('uuid');

class UserActivityLog {
  constructor(userId, action, details, ipAddress) {
    this.logId = uuidv4();
    this.userId = userId;
    this.action = action;
    this.details = details;
    this.timestamp = new Date();
    this.ipAddress = ipAddress;
  }
}

module.exports = UserActivityLog;
