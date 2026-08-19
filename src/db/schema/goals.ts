import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    whyItMatters: text("why_it_matters"),
    startedAt: date("started_at", { mode: "string" }).notNull(),
    targetDate: date("target_date", { mode: "string" }),
    status: text("status").notNull().default("active"),
    progress: integer("progress").notNull().default(0),
    category: text("category").notNull(),
    archived: boolean("archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("goals_user_status_idx").on(table.userId, table.status)],
);

export const goalMeasurements = pgTable(
  "goal_measurements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    wanting: real("wanting").notNull(),
    excitement: real("excitement").notNull(),
    confidence: real("confidence").notNull(),
    mastery: real("mastery").notNull(),
    effortWillingness: real("effort_willingness").notNull(),
    note: text("note"),
  },
  (table) => [
    index("goal_measurements_user_goal_recorded_idx").on(
      table.userId,
      table.goalId,
      table.recordedAt,
    ),
  ],
);
