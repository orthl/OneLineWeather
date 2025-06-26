// Handles location form submission and weather fetching

async function fetchCoordinates(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data || !data.length) throw new Error('Ort nicht gefunden');
  return { lat: data[0].lat, lon: data[0].lon };
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,weathercode&timezone=auto`;
  const res = await fetch(url);
  return res.json();
}

function updateForecast(data) {
  const items = document.querySelectorAll('.forecast-item');
  const now = new Date();
  const startIndex = data.hourly.time.findIndex(t => new Date(t) > now);
  for (let i = 0; i < items.length; i++) {
    const idx = startIndex + i * 6;
    if (idx >= data.hourly.time.length) break;
    const time = data.hourly.time[idx].substring(11, 16);
    const temp = data.hourly.temperature_2m[idx];
    const rain = data.hourly.precipitation_probability[idx];
    const code = data.hourly.weathercode[idx];
    const iconName = weatherCodeToIcon(code, true);
    const item = items[i];
    item.querySelector('img').src = `icons/${iconName}.svg`;
    item.querySelector('h3').textContent = time;
    item.querySelector('p').innerHTML = `🌡 ${temp}°C<br>💧 ${rain} %`;
  }
}

document.getElementById('location-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = document.getElementById('location-input').value.trim();
  if (!query) return;
  const sentence = document.querySelector('.sentence');
  sentence.textContent = 'Lade Wetter...';
  try {
    const { lat, lon } = await fetchCoordinates(query);
    const weather = await fetchWeather(lat, lon);
    updateForecast(weather);
    sentence.textContent = query;
  } catch (err) {
    sentence.textContent = 'Fehler beim Laden';
  }
});
