import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const metricDefinitions = pgTable(
  "metric_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    shortName: text("short_name").notNull(),
    description: text("description").notNull(),
    minValue: integer("min_value").notNull().default(0),
    maxValue: integer("max_value").notNull().default(10),
    midpoint: real("midpoint").notNull().default(5),
    category: text("category").notNull(),
    direction: text("direction").notNull().default("neutral"),
    sortOrder: integer("sort_order").notNull(),
    isCore: boolean("is_core").notNull().default(true),
    defaultEnabled: boolean("default_enabled").notNull().default(true),
    snapshotEnabled: boolean("snapshot_enabled").notNull().default(false),
    dailyEnabled: boolean("daily_enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "metric_definition_range_check",
      sql`${table.minValue} < ${table.maxValue}`,
    ),
  ],
);

export const userMetricSettings = pgTable(
  "user_metric_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    metricDefinitionId: uuid("metric_definition_id")
      .notNull()
      .references(() => metricDefinitions.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull().default(true),
    snapshotEnabled: boolean("snapshot_enabled").notNull().default(false),
    dailyEnabled: boolean("daily_enabled").notNull().default(true),
    dashboardEnabled: boolean("dashboard_enabled").notNull().default(false),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    uniqueIndex("user_metric_settings_user_metric_uidx").on(
      table.userId,
      table.metricDefinitionId,
    ),
    index("user_metric_settings_user_idx").on(table.userId),
  ],
);

export const metricValues = pgTable(
  "metric_values",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    metricDefinitionId: uuid("metric_definition_id")
      .notNull()
      .references(() => metricDefinitions.id, { onDelete: "restrict" }),
    entryType: text("entry_type").notNull(),
    entryId: uuid("entry_id").notNull(),
    value: real("value").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "metric_values_scale_check",
      sql`${table.value} >= 0 AND ${table.value} <= 10`,
    ),
    uniqueIndex("metric_values_entry_metric_uidx").on(
      table.entryType,
      table.entryId,
      table.metricDefinitionId,
    ),
    index("metric_values_user_recorded_idx").on(table.userId, table.recordedAt),
    index("metric_values_user_metric_recorded_idx").on(
      table.userId,
      table.metricDefinitionId,
      table.recordedAt,
    ),
  ],
);
