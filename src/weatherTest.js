const API_KEY = "67fe3285486a7f123b0fb08665aa9d51";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/onecall";

const getWeatherBtn = document.getElementById("get-weather-btn");
const cityListElement = document.getElementById('city-list');
const cityInput = document.getElementById("city-input");
const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const condition = document.getElementById("condition");
const details = document.getElementById("details");
const windSpeed = document.getElementById("wind-speed");
// const pressure = document.getElementById("pressure");
const temperatureElement = document.getElementById("temperature");

// Add an event listener to the input field to detect when the user enters text
cityInput.addEventListener("input", function () {
  const city = cityInput.value.trim(); // Remove any leading/trailing whitespace
  if (city.length > 0) {
    // If the input field is not empty, make an API call to find matching cities and their weather information
    const url = `https://api.openweathermap.org/data/2.5/find?q=${ encodeURIComponent(city) }&appid=${ API_KEY }`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Clear the previous options
        cityListElement.innerHTML = "";
        // Loop through the list of matching cities and append their name and country code as options to the datalist element
        for (let item of data.list) {
          const cityName = item.name;
          const countryName = item.sys.country;
          const optionElement = document.createElement("option");
          optionElement.value = `${ cityName }, ${ countryName }, ${ item.coord.lat }, ${ item.coord.lon }`;
          cityListElement.appendChild(optionElement);
        }
      })
      .catch(error => {
        console.error(error);
      });
  } else {
    // If the input field is empty, clear the datalist and weather output elements
    cityListElement.innerHTML = "";
  }
});

// add event listener for click event
getWeatherBtn.addEventListener("click", getWeather);

// add event listener for keypress event
cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});

// hide or show weather info
const weatherInfoContainer = document.querySelector('.weather-info-container');
const CityName1 = document.querySelector('#city-name');

function showWeatherInfo() {
  // Check if cityName is empty
  if (CityName1.textContent.trim() === "") {
    // Hide weatherInfoContainer using hidden attribute
    weatherInfoContainer.setAttribute('hidden', true);
  } else {
    // Show weatherInfoContainer by removing hidden attribute
    weatherInfoContainer.removeAttribute('hidden');
  }
}

// Listen for changes to the city name input
CityName1.addEventListener('DOMSubtreeModified', showWeatherInfo);

function getWeather() {
  // construct the URL for fetching weather information
  const weatherUrl = `${ WEATHER_URL }?q=${ cityInput.value }&appid=${ API_KEY }&units=metric`;

  // fetch weather information
  fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
      cityName.textContent = data.name;
      weatherIcon.src = `https://api.openweathermap.org/img/w/${ data.weather[ 0 ].icon }.png`;
      condition.textContent = data.weather[ 0 ].main;
      details.textContent = data.weather[ 0 ].description;
      windSpeed.textContent = data.wind.speed;

      // recommend clothes based on weather and temperature
      const temperature = data.main.temp;
      temperatureElement.textContent = `${ temperature.toFixed(1) }°C`;
      const weatherCondition = data.weather[ 0 ].main;

      let recommendedClothes = "";

      if (temperature > 20) {
        recommendedClothes = "shorts and a t-shirt";
      } else if (temperature > 10) {
        recommendedClothes = "a light jacket and pants";
      } else {
        recommendedClothes = "a heavy jacket and pants";
      }

      if (weatherCondition === "Rain") {
        recommendedClothes += " with a raincoat or an umbrella";
      }

      const recommendedClothesElement = document.getElementById("recommended-clothes");
      recommendedClothesElement.textContent = recommendedClothes;

      // get forecast information
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      const forecastUrl = `${ FORECAST_URL }?lat=${ lat }&lon=${ lon }&exclude=current,minutely,hourly,alerts&appid=${ API_KEY }&units=metric`;
      return fetch(forecastUrl);
    })
    .then(response => response.json())
    .then(forecastData => {
      const forecastList = document.getElementById("forecast-list");
      forecastList.innerHTML = ""; // clear previous forecast items
      for (let i = 0; i < 7; i++) {
        const forecast = forecastData.daily[ i ];

        // create forecast item element
        const forecastItem = document.createElement("li");
        forecastItem.classList.add("forecast-item");

        // create and add icon element
        const icon = document.createElement("img");
        icon.classList.add("forecast-icon");
        icon.src = `https://api.openweathermap.org/img/w/${ forecast.weather[ 0 ].icon }.png`;
        forecastItem.appendChild(icon);

        // create and add day of week element
        const dayOfWeek = document.createElement("div");
        dayOfWeek.classList.add("forecast-day-of-week");
        dayOfWeek.textContent = new Date(forecast.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });
        forecastItem.appendChild(dayOfWeek);

        // create and add temperature range element
        const tempRange = document.createElement("div");
        tempRange.classList.add("forecast-temp-range");
        tempRange.textContent = `${ forecast.temp.min.toFixed(1) }°C / ${ forecast.temp.max.toFixed(1) }°C`;
        forecastItem.appendChild(tempRange);

        // add forecast item to the forecast list
        forecastList.appendChild(forecastItem);
      }
    })
    .catch(error => {
      console.log(error);
      alert("An error occurred while fetching weather information.");
    });
}
