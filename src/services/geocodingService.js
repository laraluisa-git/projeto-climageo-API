const axios = require("axios");

async function getCoordinates(city) {
  const res = await axios.get(
    "https://geocoding-api.open-meteo.com/v1/search",
    { params: { name: city, count: 1 } }
  );

  if (!res.data.results) return null;

  const c = res.data.results[0];

  return {
    latitude: c.latitude,
    longitude: c.longitude,
    name: c.name,
    state: c.admin1
  };
}

module.exports = { getCoordinates };