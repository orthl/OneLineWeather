const iconMap = {
  // Klarer Himmel
  "0": "clear-day.svg",

  // Leicht bewölkt
  "1": "partly-cloudy-day.svg",
  "2": "partly-cloudy-day.svg",

  // Stark bewölkt / bedeckt
  "3": "overcast-day.svg",

  // Nebel
  "45": "fog.svg",
  "48": "fog-day.svg",

  // Leichter Sprühregen
  "51": "partly-cloudy-day-drizzle.svg",
  "53": "drizzle.svg",
  "55": "raindrop.svg",

  // Gefrierender Sprühregen / Nieselregen
  "56": "sleet.svg",
  "57": "partly-cloudy-day-sleet.svg",

  // Leichter bis mäßiger Regen
  "61": "raindrops.svg",
  "63": "rain.svg",
  "65": "thunderstorms-rain.svg", // ggf. starker Regen

  // Gefrierender Regen
  "66": "sleet.svg",
  "67": "sleet.svg",

  // Schneefall
  "71": "snow.svg",
  "73": "snowflake.svg",
  "75": "partly-cloudy-day-snow.svg",
  "77": "snowflake.svg",

  // Schauer
  "80": "partly-cloudy-day-rain.svg",
  "81": "partly-cloudy-day-rain.svg",
  "82": "thunderstorms-day-rain.svg",

  // Schnee-Schauer
  "85": "partly-cloudy-day-snow.svg",
  "86": "partly-cloudy-day-snow.svg",

  // Gewitter
  "95": "thunderstorms-day.svg",
  "96": "thunderstorms-day-rain.svg",
  "99": "thunderstorms-day-snow.svg",

  // Eigene Kombinationen / Specials
  "999-sun-rain": "partly-cloudy-day-rain.svg",
  "999-sun-snow": "partly-cloudy-day-snow.svg",
  "999-cloud-rain": "overcast-day.svg",
  "999-cloud-snow": "snow.svg",
  "999-sun-thunder": "thunderstorms-day.svg",
  "999-fog-sun": "partly-cloudy-day-fog.svg",
  "999-wind-rain": "wind-beaufort-6.svg",

  // Nachtzustände
  "999-night-clear": "clear-night.svg",
  "999-night-cloudy": "partly-cloudy-night.svg",
  "999-night-rain": "partly-cloudy-night-rain.svg",
  "999-night-snow": "partly-cloudy-night-snow.svg",
  "999-night-thunder": "thunderstorms-night.svg"
};

export default iconMap;

export function getTempComparison(todayAvg, yesterdayAvg) {
  const diff = todayAvg - yesterdayAvg;

    if (diff > 1.5) return "It is warmer today than yesterday.";
    if (diff < -1.5) return "It is colder today than yesterday.";
    return "Temperatures are similar to yesterday.";

}
