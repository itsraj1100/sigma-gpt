import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/config/db";

/**
 * Integration tests that hit a real (test) Postgres database via Prisma.
 * Point DATABASE_URL at a disposable test database before running these -
 * see the README's "Testing" section.
 */
const app = createApp();
const testEmail = `test-${Date.now()}@example.com`;

describe("Auth", () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it("registers a new user and returns a session cookie", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: testEmail,
      password: "Password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects registering the same email twice", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: testEmail,
      password: "Password123",
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejects weak passwords", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Weak Pass",
      email: `weak-${Date.now()}@example.com`,
      password: "weak",
    });
    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "Password123",
    });
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects login with the wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "WrongPassword1",
    });
    expect(res.status).toBe(401);
  });

  it("rejects /me without a session", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
