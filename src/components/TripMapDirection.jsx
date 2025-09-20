// src/components/TripMap.jsx
import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useLoadScript,
} from "@react-google-maps/api";

export default function TripMapDirection({ location, days }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (!isLoaded || !location) return;

    // Collect all activity points (with lat/lng)
    const points = [location];
    days.forEach((d) =>
      d.items.forEach((it) => {
        if (it.lat && it.lng) points.push({ lat: it.lat, lng: it.lng });
      })
    );

    if (points.length < 2) return;

    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: points[0],
        destination: points[points.length - 1],
        waypoints: points.slice(1, -1).map((p) => ({ location: p })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [isLoaded, location, days]);

  if (!isLoaded) return <div>Loading map...</div>;
  if (!location) return <div>No location available</div>;

  return (
    <GoogleMap
      zoom={12}
      center={location}
      mapContainerClassName="w-full h-64 rounded-lg"
    >
      {/* Render directions if available */}
      {directions ? (
        <DirectionsRenderer
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: "#1E3A8A", // Indigo
              strokeWeight: 4,
            },
            suppressMarkers: false, // keep markers
          }}
        />
      ) : (
        <Marker position={location} label="Start" />
      )}
    </GoogleMap>
  );
}
