// src/components/TripMap.jsx
import React, { useEffect, useRef, useState } from "react";
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
  useMap,
} from "react-leaflet";

function LeafletAutoCenter({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && map) {
      map.setView([target.lat, target.lng], 14, { animate: true });
    }
  }, [target, map]);
  return null;
}

export default function TripMap({ location, days, centerTarget }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || null;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "DUMMY_KEY", // always call the hook
  });

  const mapRef = useRef(null);

  const points = [];
  if (location) {
    points.push(location);
    days.forEach((d) =>
      d.items.forEach((it) => {
        if (it.lat && it.lng) points.push({ lat: it.lat,name: it?.title, lng: it.lng });
      })
    );
  }

  useEffect(() => {
    if (centerTarget && mapRef.current) {
      try {
        mapRef.current.panTo(centerTarget);
        mapRef.current.setZoom(14);
      } catch (e) {
        // ignore
      }
    }
  }, [centerTarget]);

  // Early returns are now safe since hooks have all been called above

  if (!location) return <div>No location available</div>;

  // Show Leaflet if no key
  if (!apiKey) {
    return (
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={12}
        style={{ height: "250px", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p, i) => (
          <LeafletMarker key={i} position={[p.lat, p.lng]} />
        ))}
        {points.length > 1 && (
          <LeafletPolyline positions={points.map((p) => [p.lat, p.lng])} color="blue" />
        )}
        {centerTarget && <LeafletAutoCenter target={centerTarget} />}
      </MapContainer>
    );
  }

  if (!isLoaded) return <div>Loading map...</div>;
  if (loadError) return <div>Map load error</div>;
  const colors = ["#2563EB", "#16A34A", "#F59E0B", "#DC2626"]; // blue, green, yellow, red
  const defaultColor = "#1E3A8A";
  return (
    <GoogleMap
      zoom={12}
      center={location}
      mapContainerClassName="w-full h-64 rounded-lg"
      onLoad={(map) => (mapRef.current = map)}
    >
      {/* {points.map((p, i) => (
        <Marker key={i} position={p} label={i === 0 ? "Start" : `${p?.name}`} />
      ))} */}
      {points.map((p, i) => (
        <Marker
          key={i}
          position={p} 
          label={{
            text: i === 0 ? "Start" : `${p?.name}`,
            className: "map-label",
            color: "black",
            fontWeight: "normal",
            fontSize: "10px",
            fontFamily: "sans-serif",
            padding: "2px 8px",
            borderRadius: "4px",
            
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: colors[i % colors.length] || defaultColor,
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#fff",
          }}
          onClick={() => setSelected(p)}
        />
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
