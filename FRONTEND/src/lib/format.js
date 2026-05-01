export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatDistance = (value) => `${Number(value || 0).toFixed(1)} km`;

export const formatCategory = (value) =>
  String(value || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const getStockClassName = (status) => {
  if (status === 'low_stock') return 'low-stock';
  if (status === 'out_of_stock') return 'out-stock';
  return 'in-stock';
};

export const getStockLabel = (status, quantity) => {
  if (status === 'out_of_stock') return 'Out of Stock';
  if (status === 'low_stock') return `${quantity} left`;
  return `In Stock${typeof quantity === 'number' ? ` (${quantity})` : ''}`;
};

export const formatPickupStatus = (status) =>
  String(status || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const formatDateTime = (value) => {
  if (!value) return '';

  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};
