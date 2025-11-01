// DirectionsModal.jsx
import React from "react";

export default function DirectionsModal({ show, onClose, destination }) {
  if (!show || !destination) return null;

  const { lat, lng, name } = destination;
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=14&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 md:w-2/3 lg:w-1/2 p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-3">Destination: {name}</h2>

        <div className="w-full h-80 rounded overflow-hidden mb-3">
          <iframe
            title="map preview"
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>

        <div className="flex justify-end gap-2">
          <PopupExample directionsUrl={directionsUrl} />
          {/* <button
            onClick={() => window.open(directionsUrl, "_blank")}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Open Directions in Google Maps
          </button> */}
        </div>
      </div>
    </div>
  );
}
function PopupExample({ directionsUrl }) {
  const openPopup = () => {
    const width = 900;
    const height = 500;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      directionsUrl,
      "popupWindow",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`
    );

    if (popup) {
      popup.focus();
    } else {
      alert("Please allow popups for this site.");
    }
  };

  return (
    <button
      onClick={openPopup}
      className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
    >
      Open Directions in Google Maps
    </button>
  );
}
