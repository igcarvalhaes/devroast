import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { languageEnum, roastModeEnum } from "./enums";

export const submissions = pgTable("submissions", {
	id: uuid().primaryKey().defaultRandom(),
	code: text().notNull(),
	language: languageEnum().notNull().default("other"),
	mode: roastModeEnum().notNull().default("roast"),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
