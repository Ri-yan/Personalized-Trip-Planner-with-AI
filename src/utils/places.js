export async function fetchNearbyPlaces({
  lat,
  lng,
  radius = 2000,
  type = "tourist_attraction",
}) {
  const gKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || null;

  // ✅ Primary: Google Places API
  if (!gKey) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${gKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data?.results) {
        return data.results.map((r) => ({
          id: r.place_id,
          name: r.name,
          lat: r.geometry.location.lat,
          lng: r.geometry.location.lng,
          rating: r.rating,
          user_ratings_total: r.user_ratings_total,
          address: r.vicinity || r.formatted_address,
          types: r.types,
          source: "google",
        }));
      }
    } catch (err) {
      console.warn("Google Places failed:", err);
    }
  }

  // ✅ Fallback: Overpass API (OpenStreetMap)
  // Match the given type to OpenStreetMap tags
  let osmFilter = "";

  switch (type) {
    case "restaurant":
      osmFilter = 'node(around:RADIUS,LAT,LNG)[amenity=restaurant];';
      break;
    case "lodging":
    case "hotel":
      osmFilter = `
        node(around:RADIUS,LAT,LNG)[tourism=hotel];
        node(around:RADIUS,LAT,LNG)[tourism=guest_house];
        node(around:RADIUS,LAT,LNG)[tourism=hostel];
      `;
      break;
    case "tourist_attraction":
    default:
      osmFilter = `
        node(around:RADIUS,LAT,LNG)[tourism=attraction];
        node(around:RADIUS,LAT,LNG)[historic];
        node(around:RADIUS,LAT,LNG)[amenity=museum];
      `;
      break;
  }

  const query = `
    [out:json][timeout:25];
    (
      ${osmFilter.replace(/RADIUS/g, radius)
        .replace(/LAT/g, lat)
        .replace(/LNG/g, lng)}
    );
    out center 30;
  `;

  try {
    const overpassUrl = "https://overpass-api.de/api/interpreter";
    const resp = await fetch(overpassUrl, {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    });
    const payload = await resp.json();

    if (payload?.elements) {
      return payload.elements.slice(0, 30).map((el) => ({
        id: `osm-${el.id}`,
        name:
          (el.tags && (el.tags.name || el.tags.official_name)) || "Unknown place",
        lat: el.lat || (el.center && el.center.lat),
        lng: el.lon || (el.center && el.center.lon),
        rating: null,
        user_ratings_total: null,
        address:
          el.tags &&
          (el.tags["addr:full"] || el.tags["addr:street"] || el.tags["addr:city"] || ""),
        types: Object.keys(el.tags || {}),
        source: "osm",
      }));
    }
  } catch (err) {
    console.warn("Overpass fallback failed:", err);
  }

  return [];
}
