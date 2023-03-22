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
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const windSpeed = document.getElementById("wind-speed");
const forecastList = document.getElementById("forecast-list");
const temperatureElement = document.getElementById("temperature");
const list = document.getElementById("search-list")


let clothingVisible = true;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
const MAX_ITEMS = 10;
// Add an event listener to the input field to detect when the user enters text
cityInput.addEventListener("input", function () {
  //clear list
  list.innerHTML = "";
  const city = cityInput.value.trim(); // Remove any leading/trailing whitespace
  if (city.length > 0) {
    // If the input field is not empty, make an API call to find matching cities and their weather information
    const url = `https://api.openweathermap.org/data/2.5/find?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
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
          optionElement.value = `${cityName}, ${countryName}, ${item.coord.lat}, ${item.coord.lon}`;
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

function hideClothing() {

  if (clothingVisible) {
    const clothesImages = document.getElementById("clothes-images").querySelectorAll("img");
    for (let i = 0; i < clothesImages.length; i++) {
      clothesImages[i].style.display = "none";
    }
    document.getElementById("rainboots-image").style.display = "none";
    document.getElementById("umbrella-image").style.display = "none";
    clothingVisible = false;
    return;
  }

  getWeather();
  clothingVisible = true;
}

// Listen for changes to the city name input
CityName1.addEventListener('DOMSubtreeModified', showWeatherInfo);

function getWeather() {
  // construct the URL for fetching weather information
  const weatherUrl = `${WEATHER_URL}?q=${cityInput.value}&appid=${API_KEY}&units=metric`;

  // fetch weather information
  fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
      cityName.textContent = data.name;
      //add cityName to searchHistory
      if (!searchHistory.includes(cityName.textContent) && cityInput.value !== "") { searchHistory.push(cityName.textContent); }
      //limit search items to 10 
      if (searchHistory.length > MAX_ITEMS) {
        searchHistory = searchHistory.slice(-MAX_ITEMS);
      }
      //store search items in localStorage for data persistence
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

      weatherIcon.src = `https://api.openweathermap.org/img/w/${data.weather[0].icon}.png`;
      condition.textContent = data.weather[0].main;
      details.textContent = data.weather[0].description;
      sunrise.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      sunset.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      windSpeed.textContent = data.wind.speed;

      // recommend clothes based on weather and temperature
      const temperature = data.main.temp;
      temperatureElement.textContent = `${temperature.toFixed(1)}°C`;
      const weatherCondition = data.weather[0].main;

      let recommendedClothes = "";
      // Select all images within the clothes-images div and hide them
      const clothesImages = document.querySelectorAll("#clothes-images img");
      clothesImages.forEach(image => {
        image.style.display = "none";
      });
      document.getElementById("footwear").style.display = "block";
      document.getElementById("rainboots-image").style.display = "none";
      document.getElementById("umbrella-image").style.display = "none";

      if (temperature > 20) {
        recommendedClothes = "shorts, t-shirt, and sandals.";
        document.getElementById("shorts-image").style.display = "inline-block";
        document.getElementById("shirt-image").style.display = "inline-block";
        document.getElementById("sandals-image").style.display = "inline-block";
        document.getElementById("sandals-image").style.display = "inline-block";

      } else if (temperature > 10) {
        recommendedClothes = "a light jackett, pants, and sneakers";
        document.getElementById("light-jacket-image").style.display = "inline-block";
        document.getElementById("pants-image").style.display = "inline-block";
        document.getElementById("shoes-image").style.display = "inline-block";

      } else {
        recommendedClothes = "a heavy jacket, pants, and boots.";
        document.getElementById("jacket-image").style.display = "inline-block";
        document.getElementById("pants-image").style.display = "inline-block";
        document.getElementById("heavy-boots-image").style.display = "inline-block";

      }

      if (weatherCondition === "Rain") {
        recommendedClothes += " with rainboots and an umbrella";
        document.getElementById("footwear").style.display = "none";
        document.getElementById("rainboots-image").style.display = "inline-block";
        document.getElementById("umbrella-image").style.display = "inline-block";

      }

      const recommendedClothesElement = document.getElementById("recommended-clothes");
      recommendedClothesElement.textContent = recommendedClothes;

      // get forecast information
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      const forecastUrl = `${FORECAST_URL}?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${API_KEY}&units=metric`;
      return fetch(forecastUrl);
    })

    .then(response => response.json())
    .then(forecastData => {

      const forecastContainer = document.getElementById("forecast-container");

      // clear previous forecast items
      forecastContainer.innerHTML = "";

      for (let i = 0; i < 7; i++) {
        const forecast = forecastData.daily[i];

        // create forecast item element
        const forecastItem = document.createElement("div");
        forecastItem.classList.add("forecast-item");

        // create and add icon element
        const icon = document.createElement("img");
        icon.classList.add("forecast-icon");
        try {
          // code that may throw an error
          icon.src = `https://api.openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
        } catch (err) {
          // code that handles the error
          console.log("This mf piece of mf shit: " + err);
        }

        forecastItem.appendChild(icon);

        // create and add day of week element
        const dayOfWeek = document.createElement("div");
        dayOfWeek.classList.add("forecast-day-of-week");
        dayOfWeek.textContent = new Date(forecast.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });
        forecastItem.appendChild(dayOfWeek);

        // create and add temperature range element
        const tempRange = document.createElement("div");
        tempRange.classList.add("forecast-temp-range");
        tempRange.textContent = `${forecast.temp.min.toFixed(1)}°C / ${forecast.temp.max.toFixed(1)}°C`;
        forecastItem.appendChild(tempRange);

        // append the forecast item to the container element
        forecastContainer.appendChild(forecastItem);
      }
    })
}

function hideSearchHistoryDropdown() {
  list.style.display = "none";
}
function showSearchHistoryDropdown() {
  list.style.display = "block";
}
function populateSearchHistoryDropdown() {
  list.innerHTML = "";
  searchHistory.forEach((searchedItem) => {
    let a = document.createElement("a");
    let br = document.createElement("br");
    a.innerHTML = searchedItem;
    a.classList.add("list-item")
    a.onclick = () => { cityInput.value = a.innerHTML; list.innerHTML = ""; }
    list.appendChild(a);
    list.appendChild(br);
  });
}

cityInput.onfocus = () => {
  populateSearchHistoryDropdown();
  showSearchHistoryDropdown();
};

cityInput.onblur = () => {
  setTimeout(hideSearchHistoryDropdown, 200);
};

