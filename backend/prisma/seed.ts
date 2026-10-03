/**
 * Optional demo seed. Creates one demo user with a sample conversation
 * so you have something to look at immediately after setup.
 *
 * Run with: npm run seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@example.com";
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Demo User",
      email,
      passwordHash,
    },
  });

  const existing = await prisma.conversation.findFirst({
    where: { userId: user.id },
  });

  if (!existing) {
    await prisma.conversation.create({
      data: {
        userId: user.id,
        title: "Welcome to your AI chat",
        messages: {
          create: [
            { role: "user", content: "Hi, what can you help me with?" },
            {
              role: "assistant",
              content:
                "Hello! I can answer questions, help you write and debug code, brainstorm ideas, summarize text, and much more. What would you like to work on?",
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Demo login -> email: ${email}  password: ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
