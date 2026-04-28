const { getCities } = require("../services/ibgeService");

async function listarCidades(req, res) {
  try {
    const uf = req.params.uf;

    if (!uf || uf.length !== 2) {
      return res.status(400).json({
        erro: true,
        codigo: "SIGLA_UF_INVALIDA",
        mensagem: "A sigla do estado deve conter exatamente 2 letras",
        sigla_uf_informada: uf
      });
    }

     let limite = parseInt(req.query.limite);

    if (!limite) limite = 10;

    if (limite < 1 || limite > 100) {
      return res.status(400).json({
        erro: true,
        codigo: "LIMITE_INVALIDO",
        mensagem: "O limite de cidades mostradas é entre 1 e 100",
        limite_informado: limite
      });
    }

    const cidades = await getCities(uf, limite);

    if (!cidades || cidades.length === 0) {
      return res.status(404).json({
        erro: true,
        codigo: "UF_NAO_ENCONTRADA",
        mensagem: "Estado com a sigla informada não foi encontrado",
        sigla_uf_informada: uf
      });
    }

    return res.json({
      uf: uf.toUpperCase(),
      quantidade_retornada: cidades.length,
      cidades,
      consultado_em: new Date().toISOString()
    });

  } catch (err) {
    console.error(err);

    return res.status(503).json({
      erro: true,
      codigo: "SERVICO_EXTERNO_INDISPONIVEL",
      mensagem: "Erro ao buscar cidades"
    });
  }
}

module.exports = {
  listarCidades
};