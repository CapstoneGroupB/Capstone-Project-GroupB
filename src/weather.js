// const API_KEY = "9ac40eb25495f48e470b86839c4e8a4b";
// const API_KEY = "9336659e97dc88345c4e1df3f8b2dca9";
// const API_KEY = "0fb98056d14c0b3b443c610b4ebe30e9";
const API_KEY = "b954dc65c5ccd233e352b2ff1ba92d2c";

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
const clothingOptions = document.getElementById("options");
let recommendedClothes = "";
let clothingVisible = true;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
const MAX_ITEMS = 10;

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
      clothesImages[ i ].style.display = "none";
    }
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
  
  const weatherUrl = `${ WEATHER_URL }?q=${ cityInput.value }&appid=${ API_KEY }&units=metric`;

  console.log(weatherUrl);

  // fetch weather information
  fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
      if (data.cod === 429) {
        // If the API key is invalid, show an error message
        alert("api key exceeding limit, please wait for 10 minutes");
      } else if (data.cod === 401) {
        // If the API key is invalid, show an error message
        alert("api key is invalid");
      } else if (data.cod === 404) {
        // If the city is not found, show an error message
        alert("city not found, Make sure it is spelled correctly, alternativly we might not have data for that city yet");
      }
      console.log(data.weather[0].icon)
      cityName.textContent = data.name;

      //add cityName to searchHistory
      if (!searchHistory.includes(cityName.textContent) && cityInput.value !== "") { searchHistory.push(cityName.textContent); }
      //limit search items to 10 
      if (searchHistory.length > MAX_ITEMS) {
        searchHistory = searchHistory.slice(-MAX_ITEMS);
      }
      //store search items in localStorage for data persistence
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      try {
        weatherIcon.src = `https://api.openweathermap.org/img/w/${ data.weather[ 0 ].icon }.png`;
        condition.textContent = data.weather[ 0 ].main;
        details.textContent = data.weather[ 0 ].description;
        sunrise.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        sunset.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        windSpeed.textContent = data.wind.speed;

        // recommend clothes based on weather and temperature
        const temperature = data.main.temp;
        temperatureElement.textContent = `${ temperature.toFixed(1) }°C`;
        const weatherCondition = data.weather[ 0 ].main;

        showClothes(temperature, weatherCondition);

        // get forecast information
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        //https://api.openweathermap.org/data/2.5/weather?q=Halifax&appid=9336659e97dc88345c4e1df3f8b2dca9&units=metric
        const forecastUrl = `${ FORECAST_URL }?lat=${ lat }&lon=${ lon }&exclude=current,minutely,hourly,alerts&appid=${ API_KEY }&units=metric`;
        // return fetch(forecastUrl);
        
      } catch (err) {
        console.log(err);
      }
    })
    // .then(response => response.json(console.log(response)))
    // .then(forecastData => {

    //   const forecastContainer = document.getElementById("forecast-container");

    //   // clear previous forecast items
    //   forecastContainer.innerHTML = "";
    //   console.log(forecastData);
    //   for (let i = 0; i < 7; i++) {
    //     const forecast = forecastData.daily[ i ];

    //     // create forecast item element
    //     const forecastItem = document.createElement("div");
    //     forecastItem.classList.add("forecast-item");

    //     // create and add icon element
    //     const icon = document.createElement("img");
    //     icon.classList.add("forecast-icon");
    //     try {
    //       // code that may throw an error
    //       icon.src = `https://api.openweathermap.org/img/w/${ forecast.weather[ 0 ].icon }.png`;
    //     } catch (err) {
    //       // code that handles the error
    //       console.log(err);
    //     }

    //     forecastItem.appendChild(icon);

    //     // create and add day of week element
    //     const dayOfWeek = document.createElement("div");
    //     dayOfWeek.classList.add("forecast-day-of-week");
    //     dayOfWeek.textContent = new Date(forecast.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });
    //     forecastItem.appendChild(dayOfWeek);

    //     // create and add temperature range element
    //     const tempRange = document.createElement("div");
    //     tempRange.classList.add("forecast-temp-range");
    //     tempRange.textContent = `${ forecast.temp.min.toFixed(1) }°C / ${ forecast.temp.max.toFixed(1) }°C`;
    //     forecastItem.appendChild(tempRange);

    //     // append the forecast item to the container element
    //     forecastContainer.appendChild(forecastItem);
    //   }
    // })
}



function showClothes(temperature, weatherCondition) {
  recommendedClothes = "";
  // Select all images within the clothes-images div
  const topsElement = document.getElementById("tops");
  const bottomsElement = document.getElementById("bottoms");
  const footwearElement = document.getElementById("footwear");
  const accessoriesElement = document.getElementById("accessories");

  if (temperature > 20) {
    recommendedClothes = "shorts, t-shirt, and sandals.";

    topsElement.innerHTML = `<img id="shirt-image" src="../Images/tops/shirts/shirtNoColor.png" alt="Shirt" style="z-index: 1">`;

    bottomsElement.innerHTML = `<img id="shorts-image" src="../Images/bottoms/shortsNoColor.png" alt="Shorts" style="z-index: 1">`;

    footwearElement.innerHTML = `<img id="sandals-image" src="../Images/footwear/sandals.png" alt="Sandals" style="z-index: 1">`;

    accessoriesElement.innerHTML = ``;

  } else if (temperature > 10) {
    recommendedClothes = "a light jacket, pants, and sneakers";

    topsElement.innerHTML = `<img id="light-jacket-image" src="../Images/tops/Jacket/hoodieBlue.png" alt="Hoodie" style="z-index: 1">`;

    bottomsElement.innerHTML = `<img id="pants-image" src="../Images/bottoms/jeansRipped.png" alt="Pants" style="z-index: 1">`;

    footwearElement.innerHTML = `<img id="shoes-image" src="../Images/footwear/shoesColor.png" alt="Shoes" style="z-index: 1">`;

    accessoriesElement.innerHTML = ``;

  } else {
    recommendedClothes = "a heavy jacket, pants, and boots.";

    topsElement.innerHTML = `<img id="jacket-image" src="../Images/tops/Jacket/jacketRedPuffer.png" alt="Jacket" style="z-index: 1">`;

    bottomsElement.innerHTML = `<img id="pants-image" src="../Images/bottoms/jeans.png" alt="Pants" style="z-index: 1">`;

    footwearElement.innerHTML = `<img id="heavy-boots-image" src="../Images/footwear/heavy-boots.png" alt="Boots" style="z-index: 1">`;

    accessoriesElement.innerHTML = ``;
  }

  if (weatherCondition === "Rain") {
    recommendedClothes += " with rainboots and an umbrella";

    topsElement.innerHTML = `<img id="jacket-image" src="../Images/tops/Jacket/jacketRedPuffer.png" alt="Jacket" style="z-index: 1">`;

    bottomsElement.innerHTML = `<img id="pants-image" src="../Images/bottoms/jeans.png" alt="Pants" style="z-index: 1">`;

    footwearElement.innerHTML = `<img id="rainboots-image" src="../Images/footwear/rain-boots.png" alt="Boots" style="z-index: 1">`;

    accessoriesElement.innerHTML = `<img id="umbrella-image" src="../Images/accessories/umbrella.png" alt="Umbrella" style="z-index: 1">`;

  }

  const recommendedClothesElement = document.getElementById("recommended-clothes");
  recommendedClothesElement.textContent = recommendedClothes;
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


function topSelection() {
  //populate 4 images of tops for the user to look at
  clothingOptions.innerHTML = "";
  if (recommendedClothes.includes("shirt")) {
    clothingOptions.innerHTML += `<img id="shirt-image1" src="../Images/tops/shirts/shirtNoColor.png" alt="Shirt" style="z-index: 1">`;
    clothingOptions.innerHTML += `<img id="shirt-image2" src="../Images/tops/shirts/shirtNoColor.png" alt="Shirt" style="z-index: 1">`;
    clothingOptions.innerHTML += `<img id="shirt-image3" src="../Images/tops/shirts/shirtNoColor.png" alt="Shirt" style="z-index: 1">`;
    clothingOptions.innerHTML += `<img id="shirt-image4" src="../Images/tops/shirts/shirtNoColor.png" alt="Shirt" style="z-index: 1">`;
  } else if (recommendedClothes.includes("jacket")) {
    clothingOptions.innerHTML += `<img id="jacket-image1" src="../Images/tops/Jacket/coatLeather.png" alt="Jacket" style="z-index: 1">`;
    clothingOptions.innerHTML += `<img id="jacket-image2" src="../Images/tops/Jacket/hoodieBlue.png" alt="Jacket" style="z-index: 1">`;
    clothingOptions.innerHTML += `<img id="jacket-image3" src="../Images/tops/Jacket/jacketRedPuffer.png" alt="Jacket" style="z-index: 1">`;
  }
}
function bottomSelection() {
  //populate 4 images of bottoms for the user to look at
  clothingOptions.innerHTML = "";
  if (recommendedClothes.includes("shorts")) {
    clothingOptions.innerHTML += `<img id="shorts-image1" src="../Images/bottoms/shortsNoColor.png" alt="Shorts" style="z-index: 1">`;
    clothingOptions.innerHTML += `<img id="shorts-image1" src="../Images/bottoms/skirtNoColor.png" alt="Shorts" style="z-index: 1">`;
    clothingOptions.innerHTML += `<img id="shorts-image1" src="../Images/bottoms/denim-shortsColor.png" alt="Shorts" style="z-index: 1">`;
  }  else if (recommendedClothes.includes("pants")) {
    clothingOptions.innerHTML += `<img id="pants-image1" src="../Images/bottoms/jeansRipped.png" alt="Pants" style="z-index: 1">`;
    clothingOptions.innerHTML += `<img id="pants-image1" src="../Images/bottoms/trousersNoColor.png" alt="Pants" style="z-index: 1">`;
    clothingOptions.innerHTML += `<img id="pants-image1" src="../Images/bottoms/trousersOrange.png" alt="Pants" style="z-index: 1">`;
  }
}
function footSelection() {
  //populate 4 images of footwear for the user to look at
  clothingOptions.innerHTML = "";
  if (recommendedClothes.includes("")) {

  }  else if (recommendedClothes.includes("")) {

  }
}
function accSelection() {
  //populate 4 images of accessories for the user to look at
  clothingOptions.innerHTML = "";
  if (recommendedClothes.includes("")) {
    
  }  else if (recommendedClothes.includes("")) {
    
  }
}