const axios = require("axios");

async function getClima(lat, lon) {
  const res = await axios.get(
    "https://api.open-meteo.com/v1/forecast",
    {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true
      }
    }
  );

  return res.data.current_weather;
}

module.exports = { getClima };