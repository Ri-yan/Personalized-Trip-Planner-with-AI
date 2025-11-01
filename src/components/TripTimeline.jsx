import React from "react";
import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";

const categoryColors = {
  Culture: "bg-yellow-100 text-yellow-800",
  Adventure: "bg-red-100 text-red-700",
  Food: "bg-green-100 text-green-700",
  Nature: "bg-blue-100 text-blue-700",
  Shopping: "bg-pink-100 text-pink-700",
  Nightlife: "bg-purple-100 text-purple-700",
  Sightseeing: "bg-orange-100 text-orange-700",
};

export default function TripTimeline({ trip }) {
  if (!trip?.days?.length) {
    return (
      <div className="p-4 text-gray-500 italic text-center">
        No itinerary available yet.
      </div>
    );
  }

  return (
    <div className="relative border-l-4 border-indigo-200 pl-6 mt-4 space-y-8">
      {trip.days.map((day, dIdx) => (
        <motion.div
          key={dIdx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: dIdx * 0.2 }}
        >
          {/* Day Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-indigo-800">
              Day {day.day}
            </h3>
          </div>

          {/* Activities */}
          <div className="space-y-3">
            {day.items.map((item, iIdx) => (
              <motion.div
                key={iIdx}
                whileHover={{ scale: 1.02 }}
                className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800">{item.title}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[item.category] || "bg-gray-100 text-gray-600"}`}
                  >
                    {item.category}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {item.time || "Anytime"}
                  </span>
                  {item.bestTime && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {item.bestTime}
                    </span>
                  )}
                </div>

                {item.score && (
                  <div className="mt-2 text-xs text-gray-400">
                    Score: {item.score}/100
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
