export const ROUTE_MAP = {
  "dashboard":      "/admin/dashboard",
  "administrateurs":"/admin/dashboard/administrateurs",
  "techniciens":    "/admin/dashboard/techniciens",
  "demandes":       "/admin/dashboard/demandes",
  "categories":     "/admin/dashboard/categories",
  "services":       "/admin/dashboard/services",
  "reviews":        "/admin/dashboard/avis",
  "reports":        "/admin/dashboard/signalements",
  "notifications":  "/admin/dashboard/notifications",
  "statistics":     "/admin/dashboard/statistiques",
  "settings":       "/admin/dashboard/parametres",
  "profile":        "/admin/dashboard/profil",
  "app-settings":   "/admin/dashboard/parametres-app",
  "system":         "/admin/dashboard/systeme",
  "logout":         null,

  "tech-dashboard":    "/technicien/dashboard",
  "tech-services":     "/technicien/dashboard/services",
  "tech-portfolio":    "/technicien/dashboard/portfolio",
  "tech-schedule":     "/technicien/dashboard/planning",
  "tech-reservations": "/technicien/dashboard/reservations",
  "tech-profile":      "/technicien/dashboard/profil",
  "tech-settings":     "/technicien/dashboard/parametres",
  "tech-system":       "/technicien/dashboard/systeme",

  "client-dashboard":    "/dashboard",
  "client-reservations": "/dashboard/mes-reservations",
  "client-reviews":      "/dashboard/mes-avis",
  "client-profile":      "/dashboard/profil",

  "notifications":       "/notifications",
  "client-notifications":"/notifications",
  "tech-notifications":  "/notifications",
};

const _reverseMap = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([k, v]) => [v, k])
);

export function getActiveKey(pathname, fallback = 'dashboard') {
  return _reverseMap[pathname] || fallback;
}

export const SIDEBAR_CONFIG = {
  admin: {
    sections: [
      {
        label: null,
        items: [
          { key: "dashboard", label: "sidebar.dashboard", icon: "dashboard", path: ROUTE_MAP.dashboard },
        ],
      },
      {
        label: "sidebar.section_users",
        items: [
          { key: "administrateurs", label: "sidebar.administrators", icon: "users", path: ROUTE_MAP.administrateurs },
          { key: "demandes",        label: "sidebar.requests",        icon: "history", path: ROUTE_MAP.demandes },
          { key: "techniciens",     label: "sidebar.technicians",     icon: "technician", path: ROUTE_MAP.techniciens },
        ],
      },
      {
        label: "sidebar.section_management",
        items: [
          { key: "services",      label: "sidebar.services",      icon: "services",    path: ROUTE_MAP.services },
          { key: "categories",    label: "sidebar.categories",    icon: "categories",  path: ROUTE_MAP.categories },
          { key: "reviews",       label: "sidebar.reviews",       icon: "reviews",     path: ROUTE_MAP.reviews },
          { key: "reports",       label: "sidebar.reports",       icon: "reports",     path: ROUTE_MAP.reports },
          { key: "notifications", label: "sidebar.notifications", icon: "bell", badge: true, path: ROUTE_MAP.notifications },
          { key: "statistics",    label: "sidebar.statistics",    icon: "stats",       path: ROUTE_MAP.statistics }, 
          
        ],
      },
       {
        label: "sidebar.section_my_space",
        items: [
          { key: "profile",     label: "sidebar.admin_profile",    icon: "profile",  path: ROUTE_MAP.profile },
        ],
      },
    ],
    bottom: [
      { key: "app-settings",label: "sidebar.app_settings",      icon: "settings", path: ROUTE_MAP["app-settings"] }, 
      { key: "logout",      label: "sidebar.logout",     icon: "logout", danger: true, divider: true, path: ROUTE_MAP.logout },
    ],
  },

  technicien: {
    sections: [
      {
        label: null,
        items: [
          { key: "tech-dashboard", label: "sidebar.dashboard", icon: "dashboard", path: ROUTE_MAP["tech-dashboard"] },
        ],
      },
      {
        label: "sidebar.section_my_space",
        items: [
          { key: "tech-services",     label: "sidebar.my_services",     icon: "services",  path: ROUTE_MAP["tech-services"] },
          { key: "tech-reservations", label: "sidebar.reservations",     icon: "history",   path: ROUTE_MAP["tech-reservations"] },
          { key: "tech-schedule",     label: "sidebar.my_schedule",     icon: "calendar",  path: ROUTE_MAP["tech-schedule"] },
          { key: "tech-notifications", label: "sidebar.notifications", icon: "bell", badge: true, path: ROUTE_MAP["tech-notifications"] },
          { key: "tech-profile",  label: "sidebar.my_profile",   icon: "profile",  path: ROUTE_MAP["tech-profile"] },
        ],
      },
    ],
    bottom: [
      { key: "tech-settings", label: "sidebar.settings",   icon: "settings", path: ROUTE_MAP["tech-settings"] }, 
      { key: "logout",        label: "sidebar.logout",  icon: "logout", danger: true, divider: true, path: ROUTE_MAP.logout },
    ],
  },

  client: {
    sections: [
      {
        label: null,
        items: [
          { key: "client-dashboard", label: "sidebar.welcome", icon: "dashboard", path: ROUTE_MAP["client-dashboard"] },
        ],
      },
      {
        label: "sidebar.section_my_space",
        items: [
          { key: "client-reservations", label: "sidebar.my_reservations", icon: "history", path: ROUTE_MAP["client-reservations"] },
          { key: "client-reviews", label: "sidebar.my_reviews", icon: "reviews", path: ROUTE_MAP["client-reviews"] },
          { key: "client-notifications", label: "sidebar.notifications", icon: "bell", badge: true, path: ROUTE_MAP["client-notifications"] },
          { key: "client-profile", label: "sidebar.my_profile",  icon: "profile",  path: ROUTE_MAP["client-profile"] },
        ],
      },
    ],
    bottom: [
      { key: "settings",       label: "sidebar.settings",  icon: "settings", path: ROUTE_MAP["client-dashboard"] },
      { key: "logout",         label: "sidebar.logout", icon: "logout", danger: true, divider: true, path: ROUTE_MAP.logout },
    ],
  },
};