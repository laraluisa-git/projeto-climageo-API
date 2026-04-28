const axios = require("axios");

async function getCities(uf, limite) {
  const res = await axios.get(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
  );

  return res.data
    .map(c => ({ nome: c.nome }))
    .slice(0, limite); // 🔥 AQUI ESTÁ A CORREÇÃO
}

module.exports = { getCities };