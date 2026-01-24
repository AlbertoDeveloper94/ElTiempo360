const weatherApiUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=41.3888&longitude=2.159&hourly=temperature_2m&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,rain";

function weatherCodes(code) {
  const codes = {
    0: ["Soleado", "assets/icons/sun.png"],
    3: ["Nublado", "assets/icons/cloud.png"],
    45: ["Niebla", "assets/icons/fog.svg"],
    61: ["Lluvia ligera", "assets/icons/light-rain.png"],
    63: ["Lluvia moderada", "assets/icons/rain.png"],
    65: ["Lluvia intensa", "assets/icons/heavy-rain.png"],
    73: ["Nieve moderada", "assets/icons/snow.png"],
    95: ["Tormenta", "assets/icons/storm.png"],
  };
  return codes[code];
}


async function GetCoordinatesCity(city) {
  try {
    const responseCity = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`,
    );
    const dataCity = await responseCity.json();

    if (!responseCity.ok) {
      throw new Error("Error al Cargar el JSON");
    }

    if (!dataCity.results || dataCity.results.length == 0) {
      alert("Ciudad No encontrada");
      return null;
    }
    return dataCity.results[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}
async function getCityWeather(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m,rain&hourly=precipitation_probability`,
  );
  const dataWeatherCity = await response.json();

  return {
    currentWeather: dataWeatherCity.current,
    weatherHourly: dataWeatherCity.hourly,
  };
}
async function searchWeatherCity() {
  let city = document.getElementById("searchCity").value;

  if (city == "") {
    city = "Barcelona";
  }
  if (!city) {
    return alert("Escribe una ciudad");
  }

  const cityCoordinates = await GetCoordinatesCity(city);

  if (!cityCoordinates) {
    alert("Ciudad no encontrada");
    return;
  }

  const weather = await getCityWeather(
    cityCoordinates.latitude,
    cityCoordinates.longitude,
  );
  ShowWeather(cityCoordinates, weather);
}

function ShowWeather(cityCoordinates, weather) {
  const { name, country_code } = cityCoordinates;
  console.log(country_code)
  const {
    temperature_2m,
    weathercode,
    wind_speed_10m,
    relative_humidity_2m,
    rain,
  } = weather.currentWeather;
  const { precipitation_probability } = weather.weatherHourly;

 
  document.getElementById("weatherBanner").innerHTML = `
    <div class="flex mt-7">
      <img
        src="https://flagcdn.com/w40/${country_code.toLowerCase()}.png"
        class="rounded mr-2"
      />
      <h1 class="text-end text-4xl font-[400]">${name}</h1>
    </div>
    <time datetime="" class="text-5xl mt-10 opacity-40">${new Date().toLocaleString(
      "es",
    )}</time>
        <img src="${weatherCodes(weathercode)[1]}" class="w-1/3">
        
        <div>
            <p>
                <strong class="text-8xl">${temperature_2m}º </strong>
            </p> 
            <p class="text-3xl text-center mt-3 text-blue-600">${
              weatherCodes(weathercode)[0]
            }</p>
        </div>
        <dl class="flex justify-around w-full text-2xl text-center">
            <div class="text-center">
                <div class="flex justify-center">
                  <img src="assets/icons/wind.png" class="w-10"/>
                </div>
                <div class="flex flex-col">
                  <dt>${wind_speed_10m} km/h</dt>
                  <dd>Viento</dd>
                </div>
            </div>
            <div>
                <div class="flex justify-center">
                  <img src="assets/icons/humidity.png" class="w-10"/>
                </div>
                <div class="flex flex-col">
                  <dt>${relative_humidity_2m} %</dt>
                  <dd>Humedad</dd>
                </div>
            </div>
            <div>
                <div class="flex justify-center">
                  <img src="assets/icons/rain.png" class="w-10"/>
                </div>
                <div class="flex flex-col">
                  <dt>${precipitation_probability[0]} %</dt>
                  <dd>Lluvia</dd>
                </div>
            </div>
        </dl>
  `;
}

const buttonWeatherSearch = document.getElementById("submitCity");
buttonWeatherSearch.addEventListener("click", searchWeatherCity);

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("searchCity").value = "Barcelona";
  searchWeatherCity();
});