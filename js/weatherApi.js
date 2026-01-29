function weatherCodes(code) {
  const codes = {
    0: ["Soleado", "assets/icons/sun.png"],
    1: ["Mayormente despejado", "assets/icons/cloudy.png"],
    2: ["Parcialmente nublado", "assets/icons/cloudy_middle.png"],
    3: ["Nublado", "assets/icons/cloud.png"],
    45: ["Niebla", "assets/icons/fog.svg"],
    51: ["Llovizna ligera", "assets/icons/lightDrizzle.png"],
    53: ["Llovizna moderada", "assets/icons/mediumDrizzle.png"],
    55: ["Llovizna intensa", "assets/icons/heavyDrizzle.png"],
    61: ["Lluvia ligera", "assets/icons/light-rain.png"],
    63: ["Lluvia moderada", "assets/icons/rain.png"],
    65: ["Lluvia intensa", "assets/icons/heavy-rain.png"],
    73: ["Nieve", "assets/icons/snow.png"],
    77: ["Granizo", "assets/icons/snowGrain.png"],
    95: ["Tormenta", "assets/icons/storm.png"],
  };
  return codes[code] || ["Tiempo Desconocido", "assets/icons/unknown.png"];
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
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m,rain&hourly=precipitation_probability,temperature_2m,weathercode&daily=temperature_2m_mean,precipitation_sum`,
  );
  const dataWeatherCity = await response.json();
  console.log(dataWeatherCity);

  return {
    currentWeather: dataWeatherCity.current,
    weatherHourly: dataWeatherCity.hourly,
    weatherWeek: dataWeatherCity.daily,
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
  const { temperature_2m, weathercode, wind_speed_10m, relative_humidity_2m } =
    weather.currentWeather;
  const isRainingNow = weathercode >= 51 && weathercode <= 82;

  const containerWeatherHourly = document.getElementById("weatherHourly");
  containerWeatherHourly.innerHTML = "";

  document.getElementById("weatherBanner").innerHTML = `

    <div class="flex items-center justify-center gap-3">
      <img src="https://flagcdn.com/w40/${country_code.toLowerCase()}.png"
        class="rounded w-8 h-6"
        alt="Bandera"
      />
      <h2 class="text-4xl font-normal text-center">${name}</h2>
    </div>


    <time class="block text-center text-lg mt-4 opacity-40">${new Date().toLocaleString("es")}</time>

    <div class="flex justify-center mt-6">
      <img
        src="${weatherCodes(weathercode)[1]}"
        class="w-28"
        alt="Clima"
      />
    </div>

    <div class="mt-4 text-center">
      <p>
        <strong class="text-5xl block">
          ${temperature_2m}°
        </strong>
      </p>
      <p class="text-xl mt-2 text-blue-600">
        ${weatherCodes(weathercode)[0]}
      </p>
    </div>


    <dl class="flex justify-between mt-8 w-full text-center text-lg">

      <div class="flex flex-col items-center gap-2 w-1/3">
        <img src="assets/icons/wind.png" class="w-8" />
        <dt class="font-semibold">${wind_speed_10m} km/h</dt>
        <dd class="opacity-60">Viento</dd>
      </div>

      <div class="flex flex-col items-center gap-2 w-1/3">
        <img src="assets/icons/humidity.png" class="w-8" />
        <dt class="font-semibold">${relative_humidity_2m}%</dt>
        <dd class="opacity-60">Humedad</dd>
      </div>

      <div class="flex flex-col items-center gap-2 w-1/3">
        <img src="assets/icons/rain.png" class="w-8" />
        <dt class="font-semibold">
          ${isRainingNow ? "Sí" : "No"}
        </dt>
        <dd class="opacity-60">Lluvia</dd>
      </div>

    </dl>
  `;

  const hoursSave = [];
  const currentHour = new Date().getHours();

  for (let i = 0; i < 24; i++) {
    const hourIndex =
      (currentHour + i) % weather.weatherHourly.weathercode.length;
    hoursSave.push({
      hour: i === 0 ? "Ahora" : `${hourIndex % 24}:00`,
      weatherIcon: weatherCodes(
        weather.weatherHourly.weathercode[hourIndex],
      )[1],
      temperature: weather.weatherHourly.temperature_2m[hourIndex],
    });

    const hourlyCard = document.createElement("div");

    hourlyCard.className =
      "min-w-[120px] flex flex-col items-center justify-between rounded-2xl bg-blue-500 text-center text-white p-3";

    hourlyCard.innerHTML = `
      <h4 class="text-xl font-medium">${hoursSave[i].hour}</h4>
      <img src="${hoursSave[i].weatherIcon}" class="w-16 h-16 object-contain my-2" alt="Clima"
      />

      <time class="text-2xl font-bold"> ${hoursSave[i].temperature}° </time>
    `;
    containerWeatherHourly.appendChild(hourlyCard);
  }
  const { time } = weather.weatherWeek;

  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  const WeekDaysUpdate = [];
  for (let i = 0; i < time.length; i++) {
    const diaNumero = new Date(time[i]).getDay();
    WeekDaysUpdate.push({
      weekDays: diasSemana[diaNumero],
      weekIcons: weatherCodes(weather.weatherHourly.weathercode[i])[1],
      temperature: weather.weatherWeek.temperature_2m_mean[i],
    });

    const containerWeek = document.getElementById("weatherWeek");
    const week = document.createElement("div");

    week.className =
      "flex justify-around w-[80%]  m-auto gap-4 rounded-2xl bg-blue-500 text-center text-white my-6 p-3";
    week.innerHTML = `
   
      <h4 class="text-2xl w-1/3 text-left">${WeekDaysUpdate[i].weekDays}</h4>

      <div class="w-1/3 flex justify-center">
      <img src="${WeekDaysUpdate[i].weekIcons}" class="w-10 h-10 object-contain" alt="Weather icon"
    />
  </div>

  <time class="text-xl font-bold w-1/3 text-right">${WeekDaysUpdate[i].temperature}°C</time>

    `;
    containerWeek.appendChild(week);
  }
}

const buttonWeatherSearch = document.getElementById("submitCity");
buttonWeatherSearch.addEventListener("click", searchWeatherCity);

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("searchCity").value = "Barcelona";
  searchWeatherCity();
});
