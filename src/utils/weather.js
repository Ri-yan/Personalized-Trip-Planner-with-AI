export async function getWeather(lat, lon) {
    const key = import.meta.env.VITE_WEATHER_API_KEY;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
      );
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Weather fetch failed", err);
      return null;
    }
  }
  