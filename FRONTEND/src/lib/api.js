const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';

let authToken = null;

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const buildUrl = (path, query) => {
  const url = new URL(`${import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

const parseResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || data?.error || `Request failed with status ${response.status}.`,
      data
    );
  }

  return data;
};

const request = async (path, { method = 'GET', query, body, token, headers } = {}) => {
  const resolvedHeaders = new Headers(headers || {});
  const resolvedToken = token ?? authToken;

  if (body !== undefined) {
    resolvedHeaders.set('Content-Type', 'application/json');
  }

  if (resolvedToken) {
    resolvedHeaders.set('Authorization', `Bearer ${resolvedToken}`);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: resolvedHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseResponse(response);
};

const multipartRequest = async (path, { method = 'POST', formData, token, headers } = {}) => {
  const resolvedHeaders = new Headers(headers || {});
  const resolvedToken = token ?? authToken;

  if (resolvedToken) {
    resolvedHeaders.set('Authorization', `Bearer ${resolvedToken}`);
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: resolvedHeaders,
    body: formData,
  });

  return parseResponse(response);
};

export const setAuthToken = (token) => {
  authToken = token || null;
};

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
};

export const discoveryApi = {
  listShops: (params) => request('/shops', { query: params }),
  getShop: (shopId) => request(`/shops/${shopId}`),
  recordShopEvent: (shopId, type) => request(`/shops/${shopId}/events`, {
    method: 'POST',
    body: { type },
  }),
  searchProducts: (params) => request('/search/products', { query: params }),
  listCatalog: () => request('/catalog'),
};

export const ownerApi = {
  getShop: () => request('/owner/shop'),
  createShop: (payload) => request('/owner/shop', { method: 'POST', body: payload }),
  updateShop: (payload) => request('/owner/shop', { method: 'PATCH', body: payload }),
  getAnalytics: () => request('/owner/analytics'),
  getInventory: (params) => request('/owner/inventory', { query: params }),
  upsertInventoryItem: (payload, productId) => request(
    productId ? `/owner/inventory/${productId}` : '/owner/inventory',
    {
      method: productId ? 'PATCH' : 'POST',
      body: payload,
    }
  ),
  deleteInventoryItem: (productId) => request(`/owner/inventory/${productId}`, { method: 'DELETE' }),
  getPickupIntents: () => request('/owner/pickup-intents'),
  updatePickupIntent: (intentId, status) => request(`/owner/pickup-intents/${intentId}`, {
    method: 'PATCH',
    body: { status },
  }),
};

export const uploadApi = {
  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.set('image', file);
    return multipartRequest('/uploads/product-image', { formData });
  },
};

export const onboardingApi = {
  analyze: (payload) => request('/onboarding/analyze', { method: 'POST', body: payload }),
  confirm: (payload) => request('/onboarding/confirm', { method: 'POST', body: payload }),
};

export const pickupApi = {
  listMine: () => request('/pickup-intents/mine'),
  createIntent: (payload) => request('/pickup-intents', { method: 'POST', body: payload }),
};
