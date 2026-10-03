import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/config/db";

const app = createApp();
const email = `conv-test-${Date.now()}@example.com`;
let sessionCookie: string;
let userId: string;

describe("Conversations", () => {
  beforeAll(async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Conversation Tester",
      email,
      password: "Password123",
    });
    sessionCookie = res.headers["set-cookie"][0];
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.conversation.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/conversations");
    expect(res.status).toBe(401);
  });

  it("creates a conversation for the authenticated user", async () => {
    const res = await request(app)
      .post("/api/conversations")
      .set("Cookie", sessionCookie)
      .send({});
    expect(res.status).toBe(201);
    expect(res.body.data.conversation.title).toBe("New Chat");
  });

  it("lists only the user's own conversations", async () => {
    const res = await request(app)
      .get("/api/conversations")
      .set("Cookie", sessionCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.conversations)).toBe(true);
    expect(res.body.data.conversations.length).toBeGreaterThan(0);
  });

  it("renames a conversation", async () => {
    const create = await request(app)
      .post("/api/conversations")
      .set("Cookie", sessionCookie)
      .send({});
    const id = create.body.data.conversation.id;

    const rename = await request(app)
      .patch(`/api/conversations/${id}`)
      .set("Cookie", sessionCookie)
      .send({ title: "Renamed Chat" });

    expect(rename.status).toBe(200);
    expect(rename.body.data.conversation.title).toBe("Renamed Chat");
  });

  it("returns 404 for another user's conversation", async () => {
    const other = await request(app).post("/api/auth/register").send({
      name: "Other User",
      email: `other-${Date.now()}@example.com`,
      password: "Password123",
    });
    const otherCookie = other.headers["set-cookie"][0];

    const create = await request(app)
      .post("/api/conversations")
      .set("Cookie", otherCookie)
      .send({});
    const otherConversationId = create.body.data.conversation.id;

    const res = await request(app)
      .get(`/api/conversations/${otherConversationId}`)
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(404);

    await prisma.conversation.deleteMany({ where: { id: otherConversationId } });
    await prisma.user.deleteMany({ where: { id: other.body.data.user.id } });
  });

  it("deletes a conversation", async () => {
    const create = await request(app)
      .post("/api/conversations")
      .set("Cookie", sessionCookie)
      .send({});
    const id = create.body.data.conversation.id;

    const del = await request(app)
      .delete(`/api/conversations/${id}`)
      .set("Cookie", sessionCookie);
    expect(del.status).toBe(200);

    const get = await request(app)
      .get(`/api/conversations/${id}`)
      .set("Cookie", sessionCookie);
    expect(get.status).toBe(404);
  });
});
