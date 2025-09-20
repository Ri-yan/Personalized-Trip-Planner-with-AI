// src/components/TripMap.jsx
import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useLoadScript,
} from "@react-google-maps/api";
import {
  MapContainer,
  TileLayer,
  Marker as LeafletMarker,
  Polyline as LeafletPolyline,
} from "react-leaflet";

export default function TripMap({ location, days }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || null;
  if (!location) return <div>No location available</div>;
  // Collect points (city + activities with lat/lng if present)
  const points = [location];
  days.forEach((d) =>
    d.items.forEach((it) => {
      if (it.lat && it.lng) points.push({ lat: it.lat, lng: it.lng });
    })
  );

  // ✅ Fallback to Leaflet if no Google Maps key
  if (!apiKey) {
    return (
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={12}
        style={{ height: "250px", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} />
        ))}
        {points.length > 1 && (
          <Polyline
            positions={points.map((p) => [p.lat, p.lng])}
            color="blue"
          />
        )}
      </MapContainer>
    );
  }

  // ✅ Use Google Maps if key exists
  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey });
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      zoom={12}
      center={location}
      mapContainerClassName="w-full h-64 rounded-lg"
    >
      {points.map((p, i) => (
        <Marker key={i} position={p} label={i === 0 ? "Start" : `${i}`} />
      ))}
      {points.length > 1 && (
        <Polyline
          path={points}
          options={{
            strokeColor: "#1E3A8A",
            strokeOpacity: 0.8,
            strokeWeight: 3,
          }}
        />
      )}
    </GoogleMap>
  );
}
