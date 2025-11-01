import React, { useEffect, useState } from "react";
import { fetchWeather } from "../utils/weather";
import { RefreshCw, Wind, Droplets, Thermometer } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function WeatherWidget({ location }) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadWeather() {
    if (!location?.lat || !location?.lng) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(location.lat, location.lng);
      setForecast(data || []);
    } catch (err) {
      console.error("❌ Weather load failed:", err);
      setError("Failed to load weather data.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadWeather();
  }, [location]);

  if (loading) {
    return (
      <div className="bg-blue-50 rounded-xl p-4 shadow text-center animate-pulse">
        Fetching weather data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  if (!forecast.length) return null;

  const current = forecast[0];
  const rest = forecast.slice(1, 6);

  const getTempColor = (temp) => {
    if (temp >= 32) return "bg-red-100 border-red-300";
    if (temp <= 20) return "bg-blue-100 border-blue-300";
    return "bg-green-100 border-green-300";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md p-5 space-y-6">
      {/* --- Header --- */}
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
          🌤️ Weather Forecast
        </h4>
        <button
          onClick={loadWeather}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 transition"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* --- Current Weather Highlight --- */}
      {current && (
        <div
          className={`p-4 rounded-xl border ${getTempColor(
            current.temp
          )} shadow-inner flex flex-col sm:flex-row justify-between items-center gap-3`}
        >
          <div className="flex items-center gap-3">
            <img
              src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
              alt={current.weather}
              className="w-16 h-16"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {Math.round(current.temp)}°C — {current.weather}
              </h3>
              <p className="text-gray-500 text-sm">
                {new Date(current.dt).toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-gray-600">
            <div className="flex items-center gap-1 text-sm">
              <Droplets size={16} />
              {current.humidity || "—"}%
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Wind size={16} />
              {current.wind || "—"} km/h
            </div>
          </div>
        </div>
      )}

      {/* --- 5-Day Forecast Cards --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {rest.map((f, i) => (
          <div
            key={i}
            className={`rounded-xl border p-3 text-center shadow-sm hover:shadow-md transition ${getTempColor(
              f.temp
            )}`}
          >
            <div className="text-sm font-medium text-gray-700">
              {new Date(f.dt).toLocaleDateString(undefined, {
                weekday: "short",
              })}
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${f.icon}.png`}
              alt={f.weather}
              className="w-10 h-10 mx-auto"
            />
            <div className="font-semibold text-gray-800">
              {Math.round(f.temp)}°C
            </div>
            <div className="text-xs text-gray-500">{f.weather}</div>
            <div className="text-[11px] text-gray-400 mt-1">
              {Math.round(f.temp_min)}° / {Math.round(f.temp_max)}°
            </div>
          </div>
        ))}
      </div>

      {/* --- Temperature Trend Chart --- */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex items-center gap-2 mb-2">
          <Thermometer size={18} className="text-blue-700" />
          <h5 className="font-semibold text-gray-700">Temperature Trend</h5>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={forecast.map((f) => ({
              name: new Date(f.dt).toLocaleDateString(undefined, {
                weekday: "short",
              }),
              temp: Math.round(f.temp),
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12 }}
              label={{
                value: "°C",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3, fill: "#1d4ed8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
