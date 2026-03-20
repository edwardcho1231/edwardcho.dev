const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const fs = require("node:fs");
const path = require("node:path");

function ensureRootCert() {
  if (process.env.PGSSLROOTCERT) {
    return;
  }

  const cert = process.env.SUPABASE_CA_CERT;

  if (!cert) {
    return;
  }

  const certPath = path.join("/tmp", "supabase-ca.crt");

  if (!fs.existsSync(certPath)) {
    fs.writeFileSync(certPath, cert.trimEnd() + "\n", {
      encoding: "utf8",
      mode: 0o600,
    });
  }

  process.env.PGSSLROOTCERT = certPath;

  if (process.env.SSL_DEBUG === "1") {
    const exists = fs.existsSync(certPath);
    console.log(`[db] PGSSLROOTCERT set to ${certPath} (exists=${exists})`);
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

ensureRootCert();

const globalForPrisma = globalThis;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    adapter,
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}

module.exports = { prisma };
