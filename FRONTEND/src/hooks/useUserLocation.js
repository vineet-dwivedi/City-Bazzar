import { useState } from 'react';
import { getStoredLocation, saveLocation } from '../lib/location.js';

export const useUserLocation = () => {
  const [location, setLocationState] = useState(() => getStoredLocation());

  const setLocation = (nextLocation) => {
    setLocationState(nextLocation);
    saveLocation(nextLocation);
  };

  return { location, setLocation };
};
