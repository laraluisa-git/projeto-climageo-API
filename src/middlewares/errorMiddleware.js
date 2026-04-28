function errorMiddleware(err, req, res, next) {
  console.error(err);

  return res.status(503).json({
    erro: true,
    codigo: "SERVICO_EXTERNO_INDISPONIVEL",
    mensagem: "Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes",
    servico: "CPTEC"
  });
}

module.exports = errorMiddleware;