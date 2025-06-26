import { getCoordinates } from './geocode.js';
import { getWeather } from './weather.js';
import iconMap, { getTempComparison } from './normalize-weather.js';

const locationInput = document.getElementById('location-input');
const sentenceElement = document.querySelector('.sentence');
const mainIcon = document.querySelector('.main-icon');
const forecastContainer = document.getElementById('forecast-container');

// Forecast-Items erzeugen mit Wetterdaten
function renderForecastItems(temp, rain, icon) {
  const times = ['Morning', 'Noon', 'Evening', 'Night'];
  const forecastContainer = document.getElementById('forecast-container');
  forecastContainer.innerHTML = '';

  times.forEach(time => {
    const item = document.createElement('div');
    item.classList.add('forecast-item');

    item.innerHTML = `
      <h3>${time}</h3>
      <img src="icons/${icon}" alt="${time} icon" class="weather-icon">
      <p>
        <img src="icons/thermometer.svg" alt="Temperature" class="inline-icon"> ${temp}°C<br>
        <img src="icons/umbrella.svg" alt="Rain" class="inline-icon"> ${rain}%
      </p>
    `;
    forecastContainer.appendChild(item);
  });
}


// DOM geladen
document.addEventListener('DOMContentLoaded', async () => {
  const saved = localStorage.getItem('lastLocation');
  if (saved) {
    locationInput.value = saved;
    await handleLocation(saved);
  }
});

// Eingabe behandeln
locationInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const query = locationInput.value.trim();
    if (!query) return;
    localStorage.setItem('lastLocation', query);
    await handleLocation(query);
  }
});

async function handleLocation(query) {
  sentenceElement.textContent = '🔄 Loading…';
  if (mainIcon) mainIcon.src = '';

  const coords = await getCoordinates(query);
  if (!coords) {
    sentenceElement.textContent = '❌ Location not found.';
    return;
  }

  const weather = await getWeather(coords.lat, coords.lon);
  if (!weather) {
    sentenceElement.textContent = '❌ No weather data.';
    return;
  }

  const code = weather.daily.weathercode[0];
  const tMin = weather.daily.temperature_2m_min[0];
  const tMax = weather.daily.temperature_2m_max[0];
  const rain = weather.daily.precipitation_probability_max[0];
  const avg = (tMin + tMax) / 2;

  const yMin = weather.daily.temperature_2m_min[1];
  const yMax = weather.daily.temperature_2m_max[1];
  const yAvg = (yMin + yMax) / 2;

  const icon = iconMap[code] || 'not-available.svg';

  // Haupt-Icon & Satz setzen
  if (mainIcon) mainIcon.src = `icons/${icon}`;
  sentenceElement.textContent = getTempComparison(avg, yAvg);

  // Forecast-Karten erzeugen mit aktuellen Werten
  renderForecastItems(tMax, rain, icon);
}
