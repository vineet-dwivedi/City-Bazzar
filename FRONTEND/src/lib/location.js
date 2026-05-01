const STORAGE_KEY = 'urbnbzr-location';

export const DEFAULT_LOCATION = {
  lat: 28.6315,
  lng: 77.2167,
  radiusKm: 6,
  label: 'Connaught Place, New Delhi',
};

export const getStoredLocation = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

    if (
      parsed &&
      typeof parsed.lat === 'number' &&
      typeof parsed.lng === 'number'
    ) {
      return {
        lat: parsed.lat,
        lng: parsed.lng,
        radiusKm: Number(parsed.radiusKm) || DEFAULT_LOCATION.radiusKm,
        label: parsed.label || DEFAULT_LOCATION.label,
      };
    }
  } catch {
    return DEFAULT_LOCATION;
  }

  return DEFAULT_LOCATION;
};

export const saveLocation = (location) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
};
