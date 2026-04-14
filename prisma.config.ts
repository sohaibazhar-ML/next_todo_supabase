import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 Configuration
 * 
 * Separates model definitions from environment-specific configuration.
 * The CLI uses this file for migrations and introspection.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
