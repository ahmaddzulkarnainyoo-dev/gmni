import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@infomarhaen.or.id" },
  });
  if (!admin) throw new Error("admin not found");
  await prisma.user.update({
    where: { id: admin.id },
    data: { tokenUndangan: "fase3-test-token" },
  });
  console.log("TOKEN_SET");
}

const nodeProcess = (globalThis as any).process;

main()
  .catch((e) => {
    console.error(e);
    if (nodeProcess) {
      nodeProcess.exit(1);
    }
  })
  .finally(() => prisma.$disconnect());