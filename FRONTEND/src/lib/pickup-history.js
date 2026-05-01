const STORAGE_KEY = 'urbnbzr-buyer-pickups';

export const getPickupHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const recordPickupHistory = (intent) => {
  const current = getPickupHistory();
  const next = [intent, ...current.filter((entry) => entry.id !== intent.id)].slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
