const request = require("supertest");
const app = require("../src/app");

describe("GET /api/v1/clima", () => {
  test("deve retornar clima para cidade válida", async () => {
    const res = await request(app).get("/api/v1/clima/Fortaleza");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("nome");
    expect(res.body).toHaveProperty("clima");
  });

  test("deve retornar erro para cidade inválida", async () => {
    const res = await request(app).get("/api/v1/clima/Xyzabc123");

    expect(res.statusCode).toBe(404);
  });
});