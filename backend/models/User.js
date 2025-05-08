const { v4: uuidv4 } = require('uuid');

class User {
  constructor(username, passwordHash, email, firstName, lastName, role) {
    this.userId = uuidv4();
    this.username = username;
    this.passwordHash = passwordHash;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.status = 'Active';
    this.lastLogin = null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.phoneNumber = null;
    this.profileImage = null;
    this.preferences = {};
  }
}

module.exports = User;
