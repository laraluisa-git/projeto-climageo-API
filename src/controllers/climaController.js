const geo = require("../services/geocodingService");
const clima = require("../services/climaService");
const mapear = require("../utils/mapearClima");

async function buscarClima(req, res, next) {
    try {
        const cidade = req.params.cidade;

        // 🔴 Validação (400)
        if (!cidade || cidade.length < 2) {
            return res.status(400).json({
                erro: true,
                codigo: "NOME_INVALIDO",
                mensagem: "O nome da cidade deve conter pelo menos 2 caracteres",
                nome_informado: cidade || "X"
            });
        }

        const local = await geo.getCoordinates(cidade);

        // 🔴 Cidade não encontrada (404)
        if (!local) {
            return res.status(404).json({
                erro: true,
                codigo: "CIDADE_NAO_ENCONTRADA",
                mensagem: "Nenhuma cidade encontrada com o nome informado, digite o nome correto!",
                nome_informado: cidade
            });
        }

        const dados = await clima.getClima(local.latitude, local.longitude);

        // segurança caso API externa falhe silenciosamente
        if (!dados) {
            throw new Error("Falha ao obter dados climáticos");
        }

        const condicao = mapear(dados.weathercode) || "Não informado";

        return res.status(200).json({
            nome: local.name,
            estado: local.state,
            clima: {
                temperatura_min: dados.temperature_min || dados.temperature,
                temperatura_max: dados.temperature_max || dados.temperature,
                condicao: condicao,
                unidades: { temperatura: "°C" }
            },
            consultado_em: new Date().toISOString()
        });

    } catch (e) {
        next(e);
    }
}

module.exports = { buscarClima };