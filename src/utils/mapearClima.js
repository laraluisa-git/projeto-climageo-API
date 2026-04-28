module.exports = function mapearClima(code) {
  const mapa = {
    0: "Céu Limpo",
    1: "Parcialmente Nublado",
    2: "Nublado",
    51: "Chuva Leve",
    61: "Chuva",
    80: "Pancadas de chuva",
    95: "Tempestade"
  };

  return mapa[code] || "Indefinido";
};