const iconMap = {
  "0": "wi_clear-day.svg",
  "1": "wi_partly-cloudy-day.svg",
  "2": "wi_partly-cloudy-day.svg",
  "3": "wi_overcast-day.svg",
  "45": "wi_fog.svg",
  "48": "wi_fog-day.svg",
  "51": "wi_partly-cloudy-day-drizzle.svg",
  "53": "wi_drizzle.svg",
  "55": "wi_rain.svg",
  "56": "wi_sleet.svg",
  "57": "wi_partly-cloudy-day-sleet.svg",
  "61": "wi_rain.svg",
  "63": "wi_rain.svg",
  "65": "wi_thunderstorms-rain.svg",
  "66": "wi_sleet.svg",
  "67": "wi_sleet.svg",
  "71": "wi_snow.svg",
  "73": "wi_snowflake.svg",
  "75": "wi_partly-cloudy-day-snow.svg",
  "77": "wi_snowflake.svg",
  "80": "wi_partly-cloudy-day-rain.svg",
  "81": "wi_partly-cloudy-day-rain.svg",
  "82": "wi_thunderstorms-day-rain.svg",
  "85": "wi_partly-cloudy-day-snow.svg",
  "86": "wi_partly-cloudy-day-snow.svg",
  "95": "wi_thunderstorms-day.svg",
  "96": "wi_thunderstorms-day-rain.svg",
  "99": "wi_thunderstorms-day-snow.svg",

  // Specials
  "999-sun-rain": "wi_partly-cloudy-day-rain.svg",
  "999-sun-snow": "wi_partly-cloudy-day-snow.svg",
  "999-cloud-rain": "wi_overcast-day.svg",
  "999-cloud-snow": "wi_snow.svg",
  "999-sun-thunder": "wi_thunderstorms-day.svg",
  "999-fog-sun": "wi_partly-cloudy-day-fog.svg",
  "999-wind-rain": "wi_wind-beaufort-6.svg",

  // Nachtzustände
  "999-night-clear": "wi_clear-night.svg",
  "999-night-cloudy": "wi_partly-cloudy-night.svg",
  "999-night-rain": "wi_partly-cloudy-night-rain.svg",
  "999-night-snow": "wi_partly-cloudy-night-snow.svg",
  "999-night-thunder": "wi_thunderstorms-night.svg"
};

export default iconMap;

export function getTempComparison(todayAvg, yesterdayAvg) {
  const diff = todayAvg - yesterdayAvg;

  if (diff > 3) return "It is warmer today than yesterday.";
  if (diff < -3) return "It is colder today than yesterday.";
  return "Temperatures are similar to yesterday.";
}
