import { pgEnum } from "drizzle-orm/pg-core";

export const roastModeEnum = pgEnum("roast_mode", ["honest", "roast"]);

export const roastStatusEnum = pgEnum("roast_status", [
	"pending",
	"processing",
	"completed",
	"failed",
]);

export const languageEnum = pgEnum("language", [
	"javascript",
	"typescript",
	"python",
	"java",
	"csharp",
	"go",
	"rust",
	"sql",
	"html",
	"css",
	"other",
]);
