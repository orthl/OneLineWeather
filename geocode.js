export async function getCoordinates(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

  try {
    console.log(`🔍 Searching for location: ${query}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OneLineWeather/1.0 (https://orth.dev)'
      }
    });
    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('Location not found');
    }

    const { lat, lon, display_name } = data[0];

    return {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      name: display_name
    };
  } catch (error) {
    console.error('❌ Geocoding error:', error);
    return null;
  }
}
