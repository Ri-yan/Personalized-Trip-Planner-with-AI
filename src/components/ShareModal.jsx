import React, { useState } from "react";

function ShortToast({ show, text }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black text-white px-4 py-2 rounded-md shadow-md text-sm">
        {text}
      </div>
    </div>
  );
}

export  function ShareModal({ open, onClose, tripTitle, shareUrl }) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const encodedUrl = encodeURIComponent(shareUrl);
  const text = `Check out my trip: ${tripTitle}`;
  const encodedText = encodeURIComponent(text);

  const whatsappUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent("My Trip: " + tripTitle)}&body=${encodedText}%0A%0A${encodedUrl}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("Copy failed", e);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  // QR via Google Chart API (quick and no extra lib)
  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=${encodedUrl}`;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed z-50 inset-x-4 top-1/4 mx-auto max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Share trip</h3>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share this itinerary with friends or save it for later.
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Native share */}
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: tripTitle, text, url: shareUrl });
                      onClose();
                    } catch (err) {
                      console.warn("share cancelled or failed", err);
                    }
                    return;
                  }
                  // fallback to copy if share not available
                  copyLink();
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700"
              >
                {navigator.share ? "Share (device)" : "Copy link"}
              </button>

              <button
                onClick={copyLink}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Copy link
              </button>
            </div>

            {/* Quick social links */}
            <div className="grid grid-cols-3 gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:shadow-sm"
              >
                <span className="text-green-600 font-medium">WhatsApp</span>
              </a>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:shadow-sm"
              >
                <span className="text-sky-500 font-medium">Twitter</span>
              </a>
              <a
                href={mailUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:shadow-sm"
              >
                <span className="text-rose-600 font-medium">Email</span>
              </a>
            </div>

            {/* QR + link preview */}
            <div className="flex gap-4 items-center">
              <div className="w-28 h-28 bg-gray-50 rounded-lg flex items-center justify-center p-1">
                <img src={qrUrl} alt="QR code" className="w-full h-full object-contain" />
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-600 line-clamp-2">{shareUrl}</div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => window.open(shareUrl, "_blank")}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    Open link
                  </button>
                  <button
                    onClick={() => {
                      // download QR as image
                      const a = document.createElement("a");
                      a.href = qrUrl;
                      a.download = `${(tripTitle || "trip").replace(/\s+/g, "_")}_qr.png`;
                      a.click();
                    }}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    Download QR
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              Shared link contains the trip reference only — no sensitive data.
            </div>
          </div>
        </div>
      </div>

      <ShortToast show={copied} text="Link copied to clipboard" />
    </>
  );
}



/**
 * Props:
 * - trip: trip object
 * - createShareUrl(trip)?: optional function that returns a shareable URL (string).
 *    If not provided, component will use current location.href.
 */
export  function ShareButton({ trip, createShareUrl }) {
  const [open, setOpen] = useState(false);

  // If you have a function to create encrypted url: use it, else fallback
  const url = createShareUrl ? createShareUrl(trip) : window.location.href;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 bg-indigo-600 text-white rounded inline-flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 8v8M9 8v8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Share
      </button>

      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        tripTitle={trip?.title || "Trip"}
        shareUrl={url}
      />
    </>
  );
}
