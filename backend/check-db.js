const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnection() {
  try {
    await prisma.$connect();
    console.log("SUCCESS: Kết nối database thành công!");
  } catch (error) {
    console.error("FAIL: Không thể kết nối database.");
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
