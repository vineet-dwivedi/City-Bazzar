const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const haversineDistanceKm = (
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number
) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(destinationLat - originLat);
  const dLng = toRadians(destinationLng - originLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(originLat)) *
      Math.cos(toRadians(destinationLat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(2));
};
