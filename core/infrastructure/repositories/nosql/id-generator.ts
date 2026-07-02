import type { Prisma } from "@prisma/client";

type PrismaLike = Prisma.TransactionClient;

export async function getNextSequence(client: PrismaLike, name: string): Promise<number> {
  const counter = await client.counter.upsert({
    where: { id: name },
    update: { seq: { increment: 1 } },
    create: { id: name, seq: 1 },
  });

  return counter.seq;
}
