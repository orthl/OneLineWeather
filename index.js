import { getCoordinates } from './geocode.js';
import { getWeather } from './weather.js';
import iconMap, { getTempComparison } from './normalize-weather.js';

const locationInput = document.getElementById('location-input');
const sentenceElement = document.querySelector('.sentence');
const mainIcon = document.querySelector('.main-icon');
const forecastContainer = document.getElementById('forecast-container');
const locationName = document.getElementById('location-name');
const welcomeText = document.getElementById('welcome-text');

let debounceTimer;
let currentWeatherData = null;
let dayOffset = 0;
const MIN_OFFSET = 0;
const MAX_OFFSET = 3;


// Eingabe automatisch behandeln
locationInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const query = locationInput.value.trim();

    if (!query) {
      sentenceElement.textContent = 'One Line Weather.';
      forecastContainer.innerHTML = '';
      mainIcon.src = 'symbol/wi_partly-cloudy-day.svg';
      locationName.textContent = '';
      welcomeText.style.display = 'block';
      document.getElementById('forecast-nav').style.display = 'none';
      return;
    }

    localStorage.setItem('lastLocation', query);
    await handleLocation(query);
  }, 500);
});

// Seite geladen
document.addEventListener('DOMContentLoaded', async () => {
  const saved = localStorage.getItem('lastLocation');

  if (saved) {
    locationInput.value = saved;
    await handleLocation(saved);
    welcomeText.style.display = 'none';
  } else {
    sentenceElement.textContent = 'One Line Weather.';
    mainIcon.src = 'symbol/wi_partly-cloudy-day.svg';
    forecastContainer.innerHTML = '';
    locationName.textContent = '';
    welcomeText.style.display = 'block';
  }
});

// Ort behandeln
async function handleLocation(query) {
  sentenceElement.textContent = 'Loading…';
  if (mainIcon) mainIcon.src = 'symbol/wi_partly-cloudy-day.svg';

  const coords = await getCoordinates(query);
  if (!coords) {
    sentenceElement.textContent = 'Location not found.';
    forecastContainer.innerHTML = '';
    locationName.textContent = '';
    mainIcon.src = 'symbol/wi_partly-cloudy-day.svg';
    document.getElementById('forecast-nav').style.display = 'none';
    return;
  }

  const weather = await getWeather(coords.lat, coords.lon);
  if (!weather) {
    sentenceElement.textContent = 'No weather data.';
    forecastContainer.innerHTML = '';
    locationName.textContent = '';
    mainIcon.src = 'symbol/wi_partly-cloudy-day.svg';
    document.getElementById('forecast-nav').style.display = 'none';
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

  if (mainIcon) mainIcon.src = symbol/${icon};
  sentenceElement.textContent = getTempComparison(avg, yAvg);

  currentWeatherData = weather;
  updateForecastDate();
  document.getElementById('forecast-nav').style.display = 'flex';
  renderForecastItemsHourly(weather.hourly);

}

// Forecast mit Stunden und Offset
function renderForecastItemsHourly(hourly) {
  const timeRanges = [
    { label: 'Morning', start: 6, end: 12 },
    { label: 'Noon', start: 12, end: 16 },
    { label: 'Evening', start: 16, end: 20 },
    { label: 'Night', start: 20, end: 30 }
  ];

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setDate(baseDate.getDate() + dayOffset);
  const startTimestamp = baseDate.getTime();

  const indices = hourly.time
    .map((timestamp, index) => {
      const t = new Date(timestamp).getTime();
      return { t, index };
    })
    .filter(obj => obj.t >= startTimestamp && obj.t < startTimestamp + 24 * 60 * 60 * 1000)
    .map(obj => obj.index);

  if (indices.length === 0) {
    forecastContainer.innerHTML = '<p>No forecast data available.</p>';
    return;
  }

  forecastContainer.innerHTML = '';

  timeRanges.forEach(range => {
    const rangeIndices = indices.filter(i => {
      const hour = new Date(hourly.time[i]).getHours();
      if (range.label === 'Night') {
        return hour >= 20 || hour < 6;
      }
      return hour >= range.start && hour < range.end;
    });

    if (rangeIndices.length === 0) return;

    const avgTemp = Math.round(rangeIndices.reduce((sum, i) => sum + hourly.temperature_2m[i], 0) / rangeIndices.length);
    const avgRain = Math.round(rangeIndices.reduce((sum, i) => sum + hourly.precipitation_probability[i], 0) / rangeIndices.length);

    const codeCounts = {};
    rangeIndices.forEach(i => {
      const code = hourly.weathercode[i];
      codeCounts[code] = (codeCounts[code] || 0) + 1;
    });

    const mostFrequentCode = Object.entries(codeCounts).sort((a, b) => b[1] - a[1])[0][0];
    const icon = iconMap[mostFrequentCode] || 'not-available.svg';

    const item = document.createElement('div');
    item.classList.add('forecast-item');

    item.innerHTML = 
      <img src="symbol/${icon}" alt="${range.label} icon" class="weather-icon">
      <div class="forecast-content">
        <h3>${range.label}</h3>
        <p><img src="symbol/wi_thermometer.svg" class="inline-icon" alt="Temp"> ${avgTemp}°C</p>
        <p><img src="symbol/wi_umbrella.svg" class="inline-icon" alt="Rain"> ${avgRain}%</p>
      </div>
    ;

    forecastContainer.appendChild(item);
  });
}

// Datum aktualisieren (Englisch)
function updateForecastDate() {
  const today = new Date();
  today.setDate(today.getDate() + dayOffset);

  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  document.getElementById('forecast-date').textContent = today.toLocaleDateString('en-EN', options);

  document.getElementById('prev-day').disabled = dayOffset <= MIN_OFFSET;
  document.getElementById('next-day').disabled = dayOffset >= MAX_OFFSET;

}

// Navigation
document.getElementById('prev-day').addEventListener('click', () => {
  if (dayOffset > MIN_OFFSET) {
    dayOffset--;
    updateForecastDate();
    renderForecastItemsHourly(currentWeatherData.hourly);
  }
});

document.getElementById('next-day').addEventListener('click', () => {
  if (dayOffset < MAX_OFFSET) {
    dayOffset++;
    updateForecastDate();
    renderForecastItemsHourly(currentWeatherData.hourly);
  }
});
