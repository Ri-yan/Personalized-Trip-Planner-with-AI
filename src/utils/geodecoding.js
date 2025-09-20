export async function fetchLatLng(place) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || null;
  
    try {
      if (!apiKey) {
        // ✅ Google Geocoding API
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          place
        )}&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
  
        if (data.results.length > 0) {
          return data.results[0].geometry.location; // { lat, lng }
        }
      } else {
        // ✅ OpenStreetMap Nominatim (free, no key)
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          place
        )}&format=json&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
  
        if (data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
        }
      }
    } catch (err) {
      console.error("❌ Geocoding failed:", err);
    }
  
    return null; // fallback
  }
  