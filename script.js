//  WeatherAPI key
const API_KEY = "a74be9a67d67470bbc7162657250504";

// DOM element references
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const currentLocationBtn = document.getElementById("current-location-btn");
const weatherDisplay = document.getElementById("weather-display");
const forecastDisplay = document.getElementById("forecast-display");
const recentDropdown = document.getElementById("recent-dropdown");
const recentSearches = document.getElementById("recent-searches");
const errorMessage = document.getElementById("error-message");

// Event listener (search weather by city name)
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name.");
  fetchWeather(city);
});

// Event listener (search weather using current geolocation)
currentLocationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeather(`${latitude},${longitude}`);
    },
    () => showError("Unable to access location.")
  );
});

// Event listener (select from recent search dropdown)
recentDropdown.addEventListener("change", () => {
  const city = recentDropdown.value;
  if (city) fetchWeather(city);
});

// Fetching weather data from API
function fetchWeather(query) {
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=5&aqi=yes`)
    .then((res) => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then((data) => {
      displayWeather(data);
      displayForecast(data.forecast.forecastday);
      saveRecentSearch(data.location.name);
    })
    .catch((err) => showError(err.message));
}

// Display weather information
function displayWeather(data) {
  document.getElementById("location").textContent = `${data.location.name}, ${data.location.region}, ${data.location.country}`;
  document.getElementById("temperature").textContent = `Temperature: ${data.current.temp_c}°C`;
  document.getElementById("humidity").textContent = `Humidity: ${data.current.humidity}%`;
  document.getElementById("wind-speed").textContent = `Wind: ${data.current.wind_kph} km/h (${data.current.wind_dir})`;
  document.getElementById("weather-icon").src = `https:${data.current.condition.icon}`;
  weatherDisplay.classList.remove("hidden");
  errorMessage.classList.add("hidden");
}

// Display weather forecast of 5 days
function displayForecast(days) {
  forecastDisplay.innerHTML = "";
  days.forEach((day) => {
    const card = document.createElement("div");
    card.className = "bg-blue-200 rounded-xl p-2 text-center";
    card.innerHTML = `
      <p class="font-semibold">${day.date}</p>
      <img src="https:${day.day.condition.icon}" class="mx-auto" />
      <p>${day.day.avgtemp_c}°C</p>
      <p>💧 ${day.day.avghumidity}%</p>
      <p>🌬 ${day.day.maxwind_kph} km/h</p>
    `;
    forecastDisplay.appendChild(card);
  });
  forecastDisplay.classList.remove("hidden");
}

// Show error messages
function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.remove("hidden");
}

// Save recent searches in localStorage
function saveRecentSearch(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
  populateRecentSearches();
}

// Populate recent searches dropdown
function populateRecentSearches() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentDropdown.innerHTML = cities.map((c) => `<option value="${c}">${c}</option>`).join("");
  recentSearches.classList.toggle("hidden", cities.length === 0);
}

// Populate dropdown on page load
window.onload = populateRecentSearches;