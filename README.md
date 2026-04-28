# ClimaGeo API

API REST de agregação de dados climáticos e geográficos para cidades brasileiras, desenvolvida como atividade prática da disciplina Técnicas de Integração de Sistemas (N703).

A aplicação recebe apenas o nome de uma cidade, resolve suas coordenadas geográficas dinamicamente e retorna dados climáticos em tempo real combinados com informações de localização — sem nenhuma coordenada fixa em código.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [APIs Externas Utilizadas](#apis-externas-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Endpoints](#endpoints)
  - [Health Check](#1-health-check)
  - [Clima por Cidade](#2-clima-por-cidade)
  - [Cidades por Estado](#3-cidades-por-estado)
- [Tratamento de Erros](#tratamento-de-erros)
- [Testes](#testes)
- [Coleção Postman](#coleção-postman)
- [Cidades para Teste](#cidades-para-teste)

---

## Visão Geral

O fluxo de integração funciona da seguinte forma:

```
Usuário informa nome da cidade
        |
        v
Geocoding Service resolve coordenadas dinamicamente
        |
        v
Open-Meteo retorna dados climáticos (via lat/lon)
        |
        v
IBGE retorna lista de municípios por estado
        |
        v
API agrega e retorna resposta padronizada em JSON
```

Nenhuma coordenada geográfica é definida manualmente no código. Toda resolução é feita em tempo de execução.

---

## Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | >= 18 | Runtime |
| Express | ^4.18.2 | Framework HTTP |
| Axios | ^1.6.0 | Consumo de APIs externas |
| CORS | ^2.8.5 | Habilitação de acesso cross-origin |
| Jest | ^29.7.0 | Framework de testes |
| Supertest | ^6.3.4 | Testes de integração HTTP |
| Nodemon | ^3.0.0 | Recarga automática em desenvolvimento |

---

## APIs Externas Utilizadas

| API | Finalidade | Documentação |
|---|---|---|
| Open-Meteo Forecast | Dados climáticos em tempo real via latitude/longitude | https://open-meteo.com/en/docs |
| Open-Meteo Geocoding | Resolução de nome de cidade para coordenadas geográficas | https://open-meteo.com/en/docs |
| IBGE Localidades | Listagem de municípios por estado | https://servicodados.ibge.gov.br/api/docs/localidades |

Todas as APIs são públicas e gratuitas, sem necessidade de autenticação.

---

## Estrutura do Projeto

```
climageo-api/
├── README.md
├── INTEGRANTES.md
├── package.json
├── src/
│   ├── server.js               # Ponto de entrada — inicia o servidor na porta 3000
│   ├── app.js                  # Configuração do Express, middlewares e rotas
│   ├── controllers/
│   │   ├── climaController.js  # Lógica do endpoint /clima/:cidade
│   │   └── cidadesController.js# Lógica do endpoint /cidades/:uf
│   ├── routes/
│   │   ├── climaRoutes.js      # Definição da rota de clima
│   │   └── cidadesRoutes.js    # Definição da rota de cidades
│   ├── services/
│   │   ├── geocodingService.js # Resolução de cidade -> coordenadas
│   │   ├── climaService.js     # Consumo da API Open-Meteo Forecast
│   │   └── ibgeService.js      # Consumo da API IBGE
│   ├── middlewares/
│   │   └── errorMiddleware.js  # Tratamento global de erros (503)
│   └── utils/
│       └── mapearClima.js      # Mapeamento de WMO weather codes para texto
├── tests/
│   ├── clima.test.js           # Testes do endpoint de clima
│   └── cidades.test.js         # Testes do endpoint de cidades
└── docs/
    └── postman_collection.json # Coleção Postman exportada
```

---

## Requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Conexão com internet (necessária para consumo das APIs externas)

---

## Instalação e Execução

**1. Clone o repositório**

```bash
git clone https://github.com/<seu-usuario>/climageo-api.git
cd climageo-api
```

**2. Instale as dependências**

```bash
npm install
```

**3. Inicie a aplicação**

Em modo de produção:

```bash
npm start
```

Em modo de desenvolvimento (com recarga automática):

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`.

**4. Verifique se a API está funcionando**

```bash
curl http://localhost:3000/api/v1/health
```

Resposta esperada:

```json
{
  "status": "healthy",
  "versao": "1.0.0",
  "timestamp": "2025-03-15T14:30:00Z"
}
```

---

## Endpoints

### 1. Health Check

Verifica se a API está operacional.

```
GET /api/v1/health
```

**Resposta — 200 OK (serviço saudável)**

```json
{
  "status": "healthy",
  "versao": "1.0.0",
  "timestamp": "2025-03-15T14:30:00Z"
}
```

**Resposta — 200 OK (serviço degradado)**

```json
{
  "status": "degraded",
  "versao": "1.0.0",
  "timestamp": "2025-03-15T14:30:00Z",
  "motivo": "Serviço externo indisponível"
}
```

---

### 2. Clima por Cidade

Retorna dados climáticos e geográficos de uma cidade brasileira. A partir do nome da cidade, a API resolve as coordenadas dinamicamente e consulta os dados de temperatura e condição do tempo em tempo real.

```
GET /api/v1/clima/{nome_cidade}
```

| Parâmetro | Tipo | Obrigatório | Descricao |
|---|---|---|---|
| `nome_cidade` | string | Sim | Nome da cidade (minimo 2 caracteres) |

**Exemplo de requisição**

```
GET /api/v1/clima/Fortaleza
```

**Resposta — 200 OK**

```json
{
  "nome": "Fortaleza",
  "estado": "CE",
  "clima": {
    "temperatura_min": 24,
    "temperatura_max": 32,
    "condicao": "Parcialmente Nublado",
    "unidades": {
      "temperatura": "°C"
    }
  },
  "consultado_em": "2025-03-15T14:30:00Z"
}
```

**Condições climáticas mapeadas**

| WMO Code | Condição retornada |
|---|---|
| 0 | Céu Limpo |
| 1 | Parcialmente Nublado |
| 2 | Nublado |
| 51 | Chuva Leve |
| 61 | Chuva |
| 80 | Pancadas de chuva |
| 95 | Tempestade |
| outros | Indefinido |

**Resposta — 400 Bad Request (nome muito curto)**

```json
{
  "erro": true,
  "codigo": "NOME_INVALIDO",
  "mensagem": "O nome da cidade deve conter pelo menos 2 caracteres",
  "nome_informado": "X"
}
```

**Resposta — 404 Not Found (cidade não encontrada)**

```json
{
  "erro": true,
  "codigo": "CIDADE_NAO_ENCONTRADA",
  "mensagem": "Nenhuma cidade encontrada com o nome informado",
  "nome_informado": "CidadeInexistente"
}
```

**Resposta — 503 Service Unavailable (falha em API externa)**

```json
{
  "erro": true,
  "codigo": "SERVICO_EXTERNO_INDISPONIVEL",
  "mensagem": "Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes",
  "servico": "CPTEC"
}
```

---

### 3. Cidades por Estado

Retorna uma lista paginada de municípios de um estado brasileiro, consultando a API do IBGE em tempo real.

```
GET /api/v1/cidades/{sigla_uf}
```

| Parâmetro | Tipo | Obrigatório | Descricao |
|---|---|---|---|
| `sigla_uf` | string | Sim | Sigla do estado com exatamente 2 letras (ex: CE, SP) |

**Query parameters opcionais**

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `limite` | integer | 10 | Quantidade de cidades retornadas (1 a 100) |

**Exemplo de requisição**

```
GET /api/v1/cidades/CE?limite=5
```

**Resposta — 200 OK**

```json
{
  "uf": "CE",
  "quantidade_retornada": 5,
  "cidades": [
    { "nome": "Abaiara" },
    { "nome": "Acarape" },
    { "nome": "Acaraú" },
    { "nome": "Acopiara" },
    { "nome": "Aiuaba" }
  ],
  "consultado_em": "2025-03-15T14:30:00Z"
}
```

**Resposta — 400 Bad Request (sigla inválida)**

```json
{
  "erro": true,
  "codigo": "SIGLA_UF_INVALIDA",
  "mensagem": "A sigla do estado deve conter exatamente 2 letras",
  "sigla_uf_informada": "ceara"
}
```

**Resposta — 400 Bad Request (limite fora do intervalo)**

```json
{
  "erro": true,
  "codigo": "LIMITE_INVALIDO",
  "mensagem": "O limite de cidades mostradas é entre 1 e 100",
  "limite_informado": 200
}
```

**Resposta — 404 Not Found (UF inexistente)**

```json
{
  "erro": true,
  "codigo": "UF_NAO_ENCONTRADA",
  "mensagem": "Estado com a sigla informada não foi encontrado",
  "sigla_uf_informada": "XX"
}
```

---

## Tratamento de Erros

Todos os erros seguem um formato JSON padronizado:

```json
{
  "erro": true,
  "codigo": "CODIGO_DO_ERRO",
  "mensagem": "Descrição legível do problema"
}
```

| Código HTTP | Codigo do Erro | Situação |
|---|---|---|
| 400 | `NOME_INVALIDO` | Nome da cidade com menos de 2 caracteres |
| 400 | `SIGLA_UF_INVALIDA` | Sigla da UF com número de caracteres diferente de 2 |
| 400 | `LIMITE_INVALIDO` | Parâmetro `limite` fora do intervalo 1–100 |
| 404 | `CIDADE_NAO_ENCONTRADA` | Nenhuma cidade corresponde ao nome informado |
| 404 | `UF_NAO_ENCONTRADA` | Sigla de UF não existe na base do IBGE |
| 503 | `SERVICO_EXTERNO_INDISPONIVEL` | Falha na comunicação com API externa |

Erros inesperados são capturados pelo middleware global `errorMiddleware.js` e retornam HTTP 503 com o código `SERVICO_EXTERNO_INDISPONIVEL`.

---

## Testes

Os testes são escritos com Jest e Supertest, cobrindo os cenários de sucesso e erro de cada endpoint.

**Executar todos os testes**

```bash
npm test
```

**Cobertura dos testes**

| Arquivo | Cenários testados |
|---|---|
| `tests/clima.test.js` | Retorno 200 para cidade válida, retorno 404 para cidade inexistente |
| `tests/cidades.test.js` | Retorno 200 com lista de cidades, retorno 404 para UF inexistente |

> Os testes realizam chamadas reais às APIs externas. É necessária conexão com a internet para que todos passem.

---

## Coleção Postman

A coleção com todas as requisições pré-configuradas está disponível em:

```
docs/postman_collection.json
```

Para importar no Postman: **File > Import** e selecione o arquivo acima.

**Requisições incluídas na coleção**

| Nome | Método | URL |
|---|---|---|
| Health Check | GET | `/api/v1/health` |
| Clima - Fortaleza | GET | `/api/v1/clima/Fortaleza` |
| Clima - São Paulo | GET | `/api/v1/clima/Sao%20Paulo` |
| Clima - Erro 404 | GET | `/api/v1/clima/xyz123` |
| Clima - Erro 400 | GET | `/api/v1/clima/x` |
| Cidades - CE | GET | `/api/v1/cidades/CE` |
| Cidades - CE com limite | GET | `/api/v1/cidades/CE?limite=5` |
| Cidades - Erro 404 | GET | `/api/v1/cidades/XX` |
| Cidades - Erro 400 (UF) | GET | `/api/v1/cidades/CEARA` |
| Cidades - Erro 400 (limite) | GET | `/api/v1/cidades/CE?limite=200` |

---

## Cidades para Teste

| Cidade | UF |
|---|---|
| Fortaleza | CE |
| São Paulo | SP |
| Rio de Janeiro | RJ |
| Brasília | DF |
| Salvador | BA |
| Belo Horizonte | MG |
| Curitiba | PR |
| Manaus | AM |

---

## Disciplina

Grupo 8 - 2026.1
Técnicas de Integração de Sistemas — N703
Análise e Desenvolvimento de Sistemas
Universidade de Fortaleza
projeto-climageo-API
