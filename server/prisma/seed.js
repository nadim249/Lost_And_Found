// Database seed script
import "dotenv/config";
import {
  ItemType,
  ItemStatus,
  ClaimStatus,
  ReportStatus,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/db.js";


const hash = (pw) => bcrypt.hashSync(pw, 10);

async function main() {
  console.log("🌱 Seeding database…");

  // Wipe existing rows in dependency order
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Site Admin",
      email: "admin@example.com",
      passwordHash: hash("admin123"),
      role: Role.ADMIN,
    },
  });

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      passwordHash: hash("password123"),
    },
  });
  const bob = await prisma.user.create({
    data: {
      name: "Bob Martinez",
      email: "bob@example.com",
      passwordHash: hash("password123"),
    },
  });
  const carol = await prisma.user.create({
    data: {
      name: "Carol Singh",
      email: "carol@example.com",
      passwordHash: hash("password123"),
    },
  });

  const items = await prisma.$transaction([
    prisma.item.create({
      data: {
        title: "Black leather wallet",
        description:
          "Lost near the campus library. Contains my driver’s licence and a few cards.",
        category: "Wallets",
        type: ItemType.LOST,
        location: "Central Library",
        images: [
          "https://res.cloudinary.com/demo/image/upload/v1571218985/sample.jpg",
        ],
        userId: alice.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "iPhone 13, blue",
        description:
          "Found on a bench at Riverside Park. Lock screen has a photo of a golden retriever.",
        category: "Electronics",
        type: ItemType.FOUND,
        location: "Riverside Park",
        images: [
          "https://res.cloudinary.com/demo/image/upload/v1571218985/sample.jpg",
        ],
        userId: bob.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Set of house keys",
        description:
          "Lost keys on a red lanyard, possibly near the science building.",
        category: "Keys",
        type: ItemType.LOST,
        location: "Science Building",
        images: [],
        userId: carol.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Hydro Flask water bottle",
        description:
          'Stainless steel, navy blue, "Carol" engraved on the side.',
        category: "Bottles",
        type: ItemType.FOUND,
        location: "Student Center",
        images: [],
        userId: alice.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Calculus textbook (Stewart, 8th)",
        description: "Has my name on the inside cover in marker.",
        category: "Books",
        type: ItemType.LOST,
        location: "Engineering Hall",
        images: [],
        userId: bob.id,
      },
    }),
    prisma.item.create({
      data: {
        title: "Black umbrella",
        description: "Compact, automatic open/close.",
        category: "Accessories",
        type: ItemType.FOUND,
        location: "Bus Stop #4",
        images: [],
        userId: carol.id,
      },
    }),
  ]);

  // Claims — varied statuses
  await prisma.claim.create({
    data: {
      itemId: items[1].id, // bob's iPhone, claimed by alice
      claimantId: alice.id,
      proofDescription:
        "Lock-screen wallpaper is a golden retriever — that’s my dog Buster.",
      status: ClaimStatus.PENDING,
    },
  });

  await prisma.claim.create({
    data: {
      itemId: items[3].id, // alice's bottle, claimed by bob
      claimantId: bob.id,
      proofDescription: "I can describe the engraving on the bottle.",
      status: ClaimStatus.APPROVED,
    },
  });
  await prisma.item.update({
    where: { id: items[3].id },
    data: { status: ItemStatus.PENDING_CLAIM },
  });

  await prisma.claim.create({
    data: {
      itemId: items[0].id, // alice's wallet, claimed by carol
      claimantId: carol.id,
      proofDescription: "I had my social security card inside.",
      status: ClaimStatus.REJECTED,
    },
  });

  // Reports
  await prisma.report.create({
    data: {
      reporterId: bob.id,
      itemId: items[2].id,
      reason: "Suspected spam listing — vague description and no photo.",
      status: ReportStatus.OPEN,
    },
  });
  await prisma.report.create({
    data: {
      reporterId: alice.id,
      itemId: items[5].id,
      reason: "Item seems unrelated to the photo (no photo actually).",
      status: ReportStatus.OPEN,
    },
  });

  // Conversation between alice and bob
  const conv = await prisma.conversation.create({
    data: {
      participants: { create: [{ userId: alice.id }, { userId: bob.id }] },
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: bob.id,
      messageText: "Hi Alice, I think I found your iPhone at Riverside Park!",
    },
  });
  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: alice.id,
      messageText: "Oh wow, thank you! Can you describe the lock screen?",
    },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: alice.id,
        title: "Welcome!",
        message: "Your Lost & Found account is ready.",
      },
      {
        userId: bob.id,
        title: "New claim",
        message: "Alice filed a claim on your iPhone listing.",
      },
      {
        userId: carol.id,
        title: "Item update",
        message: "Your claim was rejected. View details.",
      },
    ],
  });

  console.log("✅ Seed complete.");
  console.log("   Admin: admin@example.com / admin123");
  console.log(
    "   Users: alice@example.com / bob@example.com / carol@example.com (password: password123)",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
