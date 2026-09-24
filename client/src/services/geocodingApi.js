export const searchPlace = async (query) => {
  if (!query || query.trim() === '') return [];
  
  // Nominatim public API endpoint
  // Adding format=json and limit=5
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
  
  try {
    const response = await fetch(url, {
      headers: {
        // Nominatim requires a user agent or identifying header usually, 
        // though it works in browsers. Setting Accept-Language is good practice.
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    
    // Normalize the result
    return data.map(item => ({
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
};
