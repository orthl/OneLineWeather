// Map open-meteo weather codes to icon names from meteocons
const WEATHER_ICON_MAP = {
  0: { day: 'clear-day', night: 'clear-night' },
  1: { day: 'partly-cloudy-day', night: 'partly-cloudy-night' },
  2: { day: 'partly-cloudy-day', night: 'partly-cloudy-night' },
  3: { day: 'cloudy', night: 'cloudy' },
  45: { day: 'fog', night: 'fog' },
  48: { day: 'fog', night: 'fog' },
  51: { day: 'drizzle', night: 'drizzle' },
  53: { day: 'drizzle', night: 'drizzle' },
  55: { day: 'drizzle', night: 'drizzle' },
  61: { day: 'rain', night: 'rain' },
  63: { day: 'rain', night: 'rain' },
  65: { day: 'rain', night: 'rain' },
  66: { day: 'sleet', night: 'sleet' },
  67: { day: 'sleet', night: 'sleet' },
  71: { day: 'snow', night: 'snow' },
  73: { day: 'snow', night: 'snow' },
  75: { day: 'snow', night: 'snow' },
  77: { day: 'snow', night: 'snow' },
  80: { day: 'partly-cloudy-day-rain', night: 'partly-cloudy-night-rain' },
  81: { day: 'partly-cloudy-day-rain', night: 'partly-cloudy-night-rain' },
  82: { day: 'rain', night: 'rain' },
  85: { day: 'snow', night: 'snow' },
  86: { day: 'snow', night: 'snow' },
  95: { day: 'thunderstorms-day', night: 'thunderstorms-night' },
  96: { day: 'thunderstorms-day-rain', night: 'thunderstorms-night-rain' },
  99: { day: 'thunderstorms-day-rain', night: 'thunderstorms-night-rain' },
};

function weatherCodeToIcon(code, isDay) {
  const entry = WEATHER_ICON_MAP[code];
  if (!entry) return 'cloudy';
  return isDay ? entry.day : entry.night;
}

// expose global helper
window.weatherCodeToIcon = weatherCodeToIcon;
