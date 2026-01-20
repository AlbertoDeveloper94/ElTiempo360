const weatherApiUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=41.3888&longitude=2.159&hourly=temperature_2m&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,rain";

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