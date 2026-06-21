const DASHBOARD_PATHS = {
  client: '/client/dashboard',
  technicien: '/technicien/dashboard',
  admin: '/admin/dashboard',
};

export function getDashboardPath(role) {
  return DASHBOARD_PATHS[role] || DASHBOARD_PATHS.client;
}
