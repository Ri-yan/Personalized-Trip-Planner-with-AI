// src/components/ActivityActions.jsx
import React, { useState } from "react";
import { fetchNearbyPlaces } from "../utils/places";
import ExploreModal from "./ExploreModal.jsx";
import DirectionsModal from "./DirectionsModal.jsx";

export default function ActivityActions({ item, centerLocation, onCenterMap }) {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [show, setShow] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  async function handleExplore() {
    setLoading(true);
    const lat = item.lat || centerLocation.lat;
    const lng = item.lng || centerLocation.lng;
    const nearby = await fetchNearbyPlaces({
      lat,
      lng,
      radius: 2000,
      type: "restaurant",
    });
    setPlaces(nearby);
    setShow(true);
    setLoading(false);
  }

  function openDirections() {
    setShowDirections(true);
    // const lat = item.lat || centerLocation.lat;
    // const lng = item.lng || centerLocation.lng;
    // // open Google Maps directions from current location (user) to place coords
    // const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    // window.open(url, "_blank");
  }

  function viewOnMap(p) {
    // when user selects a place from modal, center in map
    onCenterMap && onCenterMap({ lat: p.lat, lng: p.lng, name: p.name });
    setShow(false);
  }

  return (
    <>
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleExplore}
          className="px-3 py-1 bg-gray-100 border rounded text-sm"
          disabled={loading}
        >
          {loading ? "Searching..." : " Nearby"}
        </button>

        <button
          onClick={openDirections}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Direction
        </button>

        <button
          onClick={() =>
            onCenterMap &&
            onCenterMap({
              lat: item.lat || centerLocation.lat,
              lng: item.lng || centerLocation.lng,
              name: item.title,
            })
          }
          className="px-3 py-1 border rounded text-sm"
        >
          View
        </button>
      </div>

      <ExploreModal
        show={show}
        places={places}
        onClose={() => setShow(false)}
        onSelectPlace={viewOnMap}
      />

      <DirectionsModal
        show={showDirections}
        onClose={() => setShowDirections(false)}
        destination={{
          lat: item.lat || centerLocation.lat,
          lng: item.lng || centerLocation.lng,
          name: item.title,
        }}
      />
    </>
  );
}
