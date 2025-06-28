import { getCoordinates } from './geocode.js';
import { getWeather } from './weather.js';
import iconMap, { getTempComparison } from './normalize-weather.js';

const locationInput = document.getElementById('location-input');
const sentenceElement = document.querySelector('.sentence');
const mainIcon = document.querySelector('.main-icon');
const forecastContainer = document.getElementById('forecast-container');
const locationName = document.getElementById('location-name');
const welcomeText = document.getElementById('welcome-text');
const forecastNav = document.getElementById('forecast-nav');

let debounceTimer;
let currentWeatherData = null;
let dayOffset = 0;
const MIN_OFFSET = 0;
const MAX_OFFSET = 3;

function toggleMainUI(showForecast) {
  if (showForecast) {
    welcomeText.style.display = 'none';
    forecastNav.style.display = 'flex';
  } else {
    welcomeText.style.display = 'block';
    forecastContainer.innerHTML = '';
    forecastNav.style.display = 'none';
    sentenceElement.textContent = 'One Line Weather.';
    mainIcon.src = 'symbol/wi_partly-cloudy-day.svg';
    locationName.textContent = '';
  }
}

locationInput.addEventListener('input', () => {
  const query = locationInput.value.trim();

  if (!query) {
    clearTimeout(debounceTimer);
    toggleMainUI(false);
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    localStorage.setItem('lastLocation', query);
    const success = await handleLocation(query);
    toggleMainUI(success);
  }, 500);
});

document.addEventListener('DOMContentLoaded', async () => {
  const saved = localStorage.getItem('lastLocation');

  if (saved && saved.trim() !== '') {
    locationInput.value = saved;
    const success = await handleLocation(saved);
    toggleMainUI(success);
  } else {
    toggleMainUI(false);
  }
});

async function handleLocation(query) {
  sentenceElement.textContent = 'Loading…';
  mainIcon.src = 'symbol/wi_partly-cloudy-day.svg';

  const coords = await getCoordinates(query);
  if (!coords) return false;

  const weather = await getWeather(coords.lat, coords.lon);
  if (!weather) return false;

  const code = weather.daily.weathercode[0];
  const tMin = weather.daily.temperature_2m_min[0];
  const tMax = weather.daily.temperature_2m_max[0];
  const avg = (tMin + tMax) / 2;

  const yMin = weather.daily.temperature_2m_min[1];
  const yMax = weather.daily.temperature_2m_max[1];
  const yAvg = (yMin + yMax) / 2;

  const icon = iconMap[code] || 'not-available.svg';
  mainIcon.src = `symbol/${icon}`;
  sentenceElement.textContent = getTempComparison(avg, yAvg);

  currentWeatherData = weather;
  updateForecastDate();
  renderForecastItemsHourly(weather.hourly);
  return true;
}

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
    .filter(obj => obj.t >= startTimestamp && obj.t < startTimestamp + 86400000)
    .map(obj => obj.index);

  if (indices.length === 0) {
    forecastContainer.innerHTML = '<p>No forecast data available.</p>';
    return;
  }

  forecastContainer.innerHTML = '';

  timeRanges.forEach(range => {
    const rangeIndices = indices.filter(i => {
      const hour = new Date(hourly.time[i]).getHours();
      return range.label === 'Night' ? hour >= 20 || hour < 6 : hour >= range.start && hour < range.end;
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
    item.innerHTML = `
      <img src="symbol/${icon}" alt="${range.label} icon" class="weather-icon">
      <div class="forecast-content">
        <h3>${range.label}</h3>
        <p><img src="symbol/wi_thermometer.svg" class="inline-icon" alt="Temp"> ${avgTemp}°C</p>
        <p><img src="symbol/wi_umbrella.svg" class="inline-icon" alt="Rain"> ${avgRain}%</p>
      </div>
    `;
    forecastContainer.appendChild(item);
  });
}

function updateForecastDate() {
  const today = new Date();
  today.setDate(today.getDate() + dayOffset);

  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  document.getElementById('forecast-date').textContent = today.toLocaleDateString('en-EN', options);

  document.getElementById('prev-day').disabled = dayOffset <= MIN_OFFSET;
  document.getElementById('next-day').disabled = dayOffset >= MAX_OFFSET;
}

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
