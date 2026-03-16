import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema/index.ts",
	out: "./drizzle",
	casing: "snake_case",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is required for migrations
		url: process.env.DATABASE_URL!,
	},
});
