import React, { useEffect, useState } from "react";
import { fetchWeather } from "../utils/weather";

export default function WeatherWidget({ location }) {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    if (location) {
      fetchWeather(location.lat, location.lng).then(setForecast);
    }
  }, [location]);

  if (!forecast.length) return <div>Loading weather...</div>;

  return (
    <div className="bg-blue-50 rounded-xl p-4 shadow">
      <h4 className="font-semibold mb-2">🌤️ Weather Forecast</h4>
      <div className="flex gap-3 overflow-x-auto">
        {forecast.map((f, i) => (
          <div key={i} className="p-2 bg-white rounded shadow text-center">
            <div className="text-sm">{new Date(f.dt).toLocaleDateString()}</div>
            <img
              src={`https://openweathermap.org/img/wn/${f.icon}.png`}
              alt={f.weather}
              className="mx-auto"
            />
            <div className="text-sm">{Math.round(f.temp)}°C</div>
            <div className="text-xs text-gray-500">{f.weather}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
