export const fetchRoute = async (startLoc, endLoc) => {
  let url = `http://localhost:3000/api/route`;
  
  if (typeof startLoc === 'object' && typeof endLoc === 'object') {
    url += `?startLat=${startLoc.lat}&startLon=${startLoc.lon}&endLat=${endLoc.lat}&endLon=${endLoc.lon}`;
  } else {
    url += `?start=${startLoc}&end=${endLoc}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch route');
  }
  return response.json();
};
