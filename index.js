import { getCoordinates } from './geocode.js';
import { getWeather } from './weather.js';
import iconMap, { getTempComparison } from './normalize-weather.js';

const locationInput = document.getElementById('location-input');
const sentenceElement = document.querySelector('.sentence');
const mainIcon = document.querySelector('.main-icon');
const forecastContainer = document.getElementById('forecast-container');
const locationName = document.getElementById('location-name');

let debounceTimer;
let currentWeatherData = null;
let dayOffset = 0;

// Eingabe automatisch behandeln
locationInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const query = locationInput.value.trim();

    if (!query) {
      sentenceElement.textContent = 'One Line Weather.';
      forecastContainer.innerHTML = '';
      mainIcon.src = 'symbol/wi_partly-cloudy-day.svg'; // Standard Icon
      locationName.textContent = '';
      return;
    }

    localStorage.setItem('lastLocation', query);
    await handleLocation(query);
  }, 500);
});

// Forecast-Items erzeugen mit Wetterdaten
/* ALT: renderForecastItems ersetzt */
function renderForecastItems_OLD(temp, rain, icon) {
  const times = ['Morning', 'Noon', 'Evening', 'Night'];
  forecastContainer.innerHTML = '';

  times.forEach(time => {
    const item = document.createElement('div');
    item.classList.add('forecast-item');

    item.innerHTML = `
      <img src="symbol/${icon}" alt="${time} icon" class="weather-icon">
      <div class="forecast-content">
        <h3>${time}</h3>
        <p><img src="symbol/wi_thermometer.svg" alt="Temperature" class="inline-icon"> ${temp}°C</p>
        <p><img src="symbol/wi_umbrella.svg" alt="Rain" class="inline-icon"> ${rain}%</p>
      </div>
    `;
    forecastContainer.appendChild(item);
  });
}

// Wenn Seite geladen wird
document.addEventListener('DOMContentLoaded', async () => {
  const saved = localStorage.getItem('lastLocation');

  if (saved) {
    locationInput.value = saved;
    await handleLocation(saved);
  } else {
    // Standardanzeige bei leerem Start
    sentenceElement.textContent = 'One Line Weather.';
    mainIcon.src = 'symbol/wi_partly-cloudy-day.svg'; // Standard Icon
    forecastContainer.innerHTML = '';
    locationName.textContent = '';
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
    mainIcon.src = 'symbol/wi_partly-cloudy-day.svg'; // Standard Icon bei Fehler
    return;
  }

  const weather = await getWeather(coords.lat, coords.lon);
  if (!weather) {
    sentenceElement.textContent = 'No weather data.';
    forecastContainer.innerHTML = '';
    locationName.textContent = '';
    mainIcon.src = 'symbol/wi_partly-cloudy-day.svg'; // Standard Icon bei Fehler
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

  if (mainIcon) mainIcon.src = `symbol/${icon}`;
  sentenceElement.textContent = getTempComparison(avg, yAvg);

  currentWeatherData = weather;
  updateForecastDate();

  renderForecastItemsHourly(weather.hourly);
}

const welcomeText = document.getElementById('welcome-text');

locationInput.addEventListener('input', () => {
  const query = locationInput.value.trim();

  if (query) {
    welcomeText.style.display = 'none';
  } else {
    welcomeText.style.display = 'block';
  }
});

// Beim Laden prüfen
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('lastLocation');
  if (saved && saved.trim()) {
    welcomeText.style.display = 'none';
  } else {
    welcomeText.style.display = 'block';
  }
});


function renderForecastItemsHourly(hourly) {
  const timeRanges = [
  { label: 'Morning', start: 6, end: 12 },
  { label: 'Noon', start: 12, end: 16 },
  { label: 'Evening', start: 16, end: 20 },
  { label: 'Night', start: 20, end: 30 }
];

forecastContainer.innerHTML = '';

timeRanges.forEach(range => {
  let indices = [];
  for (let h = range.start; h < range.end; h++) {
    let index = (h + dayOffset * 24) % 168; // 168 Stunden = 7 Tage
    if (index < 0) index += 168;
    indices.push(index);
  }

  const avgTemp = Math.round(indices.reduce((sum, i) => sum + hourly.temperature_2m[i], 0) / indices.length);
  const avgRain = Math.round(indices.reduce((sum, i) => sum + hourly.precipitation_probability[i], 0) / indices.length);

  const codeCounts = {};
  indices.forEach(i => {
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


  const temps = hourly.temperature_2m;
  const rains = hourly.precipitation_probability;
  const codes = hourly.weathercode;

  forecastContainer.innerHTML = '';

  timeRanges.forEach(range => {
    let indices = [];
    for (let h = range.start; h < range.end; h++) {
      indices.push(h % 24); // wrap-around für Nacht (z.B. 25 => 1 Uhr)
    }

    const avgTemp = Math.round(indices.reduce((sum, i) => sum + temps[i], 0) / indices.length);
    const avgRain = Math.round(indices.reduce((sum, i) => sum + rains[i], 0) / indices.length);

    const codeCounts = {};
    indices.forEach(i => {
      const code = codes[i];
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
  document.getElementById('forecast-date').textContent = today.toLocaleDateString(undefined, options);

  document.getElementById('prev-day').disabled = dayOffset <= -3;
  document.getElementById('next-day').disabled = dayOffset >= 3;
}

document.getElementById('prev-day').addEventListener('click', () => {
  if (dayOffset > -3) {
    dayOffset--;
    updateForecastDate();
    renderForecastItemsHourly(currentWeatherData.hourly);
  }
});

document.getElementById('next-day').addEventListener('click', () => {
  if (dayOffset < 3) {
    dayOffset++;
    updateForecastDate();
    renderForecastItemsHourly(currentWeatherData.hourly);
  }
});
