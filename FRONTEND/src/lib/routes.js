export const APP_ROUTES = {
  auth: '/auth',
  buyerHome: '/buyer',
  buyerSearch: '/search',
  buyerProfile: '/profile',
  buyerRequests: '/requests',
  sellerHome: '/seller',
  sellerAddProduct: '/seller/add',
  sellerAiReview: '/seller/ai-review',
  sellerInventory: '/seller/inventory',
  sellerRequests: '/seller/requests',
  sellerAnalytics: '/seller/analytics',
  sellerSettings: '/seller/settings',
  shopDetail: (shopId) => `/shop/${shopId}`,
};

export const normalizeRole = (role) => {
  if (role === 'shop_owner') return 'seller';
  if (role === 'customer') return 'buyer';
  if (role === 'seller' || role === 'buyer' || role === 'admin') return role;
  return null;
};

export const getHomePath = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'seller') {
    return APP_ROUTES.sellerHome;
  }

  if (normalizedRole === 'buyer') {
    return APP_ROUTES.buyerHome;
  }

  return APP_ROUTES.auth;
};

export const getSearchPath = (role, query = '') => {
  const normalizedRole = normalizeRole(role);
  const trimmedQuery = query.trim();
  const queryString = trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : '';

  if (normalizedRole === 'seller') {
    return `${APP_ROUTES.sellerInventory}${queryString}`;
  }

  return `${APP_ROUTES.buyerSearch}${queryString}`;
};

export const getProfilePath = (role) =>
  normalizeRole(role) === 'seller' ? APP_ROUTES.sellerSettings : APP_ROUTES.buyerProfile;

export const getSettingsPath = (role) =>
  normalizeRole(role) === 'seller' ? APP_ROUTES.sellerSettings : APP_ROUTES.buyerProfile;
