const { v4: uuidv4 } = require('uuid');

class Permission {
  constructor(name, description) {
    this.permissionId = uuidv4();
    this.name = name;
    this.description = description;
  }
}

module.exports = Permission;
