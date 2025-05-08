const roles = {
  Admin: {
    permissions: [
      'read',
      'write',
      'update',
      'delete',
      'manageUsers',
      'manageSystem',
    ],
  },
  Operator: {
    permissions: [
      'read',
      'write',
      'update',
    ],
  },
  Manager: {
    permissions: [
      'read',
      'write',
      'update',
    ],
  },
  Maintenance: {
    permissions: [
      'read',
      'update',
    ],
  },
  Viewer: {
    permissions: [
      'read',
    ],
  },
};

module.exports = roles;
