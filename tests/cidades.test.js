const request = require("supertest");
const app = require("../src/app");

describe("GET /api/v1/cidades", () => {
  test("deve retornar lista de cidades", async () => {
    const res = await request(app).get("/api/v1/cidades/CE");

    expect(res.statusCode).toBe(200);
    expect(res.body.cidades.length).toBeGreaterThan(0);
  });

  test("deve retornar erro para UF inválida", async () => {
    const res = await request(app).get("/api/v1/cidades/XX");

    expect(res.statusCode).toBe(404);
  });
});