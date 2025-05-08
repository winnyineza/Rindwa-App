const { v4: uuidv4 } = require('uuid');

class RolePermission {
  constructor(role, permissionId) {
    this.rolePermissionId = uuidv4();
    this.role = role;
    this.permissionId = permissionId;
  }
}

module.exports = RolePermission;
