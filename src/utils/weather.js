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
  

  export async function fetchWeather(lat, lng) {
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
  
      // Map into simpler structure
      return data.list.slice(0, 5).map((entry) => ({
        dt: entry.dt_txt,
        temp: entry.main.temp,
        weather: entry.weather[0].main,
        icon: entry.weather[0].icon,
      }));
    } catch (err) {
      console.error("❌ Weather fetch failed:", err);
      return [];
    }
  }
  