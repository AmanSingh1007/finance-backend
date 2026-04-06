/** @typedef {'viewer' | 'analyst' | 'admin'} Role */

const ROLES = Object.freeze({
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin',
});

const ROLE_LIST = [ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN];

/**
 * Which roles may call each capability (OR semantics within the array).
 * Used by authorize middleware.
 */
const CAPABILITIES = Object.freeze({
  /** Aggregated dashboard data only */
  DASHBOARD_READ: [ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN],
  /** List / get raw financial records */
  RECORDS_READ: [ROLES.ANALYST, ROLES.ADMIN],
  /** Create, update, delete (hard) records */
  RECORDS_WRITE: [ROLES.ADMIN],
  /** User CRUD and role assignment */
  USERS_MANAGE: [ROLES.ADMIN],
});

module.exports = { ROLES, ROLE_LIST, CAPABILITIES };
