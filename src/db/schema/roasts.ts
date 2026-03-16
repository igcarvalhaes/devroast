import { pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { roastStatusEnum } from "./enums";
import { submissions } from "./submissions";

export const roasts = pgTable("roasts", {
	id: uuid().primaryKey().defaultRandom(),
	submissionId: uuid()
		.notNull()
		.unique()
		.references(() => submissions.id, { onDelete: "cascade" }),
	status: roastStatusEnum().notNull().default("pending"),
	score: real(),
	feedback: text(),
	suggestedCode: text(),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	completedAt: timestamp({ withTimezone: true }),
});
