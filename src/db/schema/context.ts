import { sql } from "drizzle-orm";
import {
  check,
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

export const sleepRecords = pgTable(
  "sleep_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sleepDate: date("sleep_date", { mode: "string" }).notNull(),
    timezone: text("timezone").notNull(),
    wentToBedAt: timestamp("went_to_bed_at", { withTimezone: true }),
    sleepStartedAt: timestamp("sleep_started_at", {
      withTimezone: true,
    }).notNull(),
    wokeUpAt: timestamp("woke_up_at", { withTimezone: true }).notNull(),
    gotOutOfBedAt: timestamp("got_out_of_bed_at", { withTimezone: true }),
    awakeningsCount: integer("awakenings_count").notNull().default(0),
    subjectiveSleepQuality: real("subjective_sleep_quality"),
    eveningSleepiness: real("evening_sleepiness"),
    morningDifficulty: real("morning_difficulty"),
    sleepDurationMinutes: integer("sleep_duration_minutes").notNull(),
    timeInBedMinutes: integer("time_in_bed_minutes"),
    sleepMidpoint: timestamp("sleep_midpoint", {
      withTimezone: true,
    }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sleep_records_user_date_idx").on(table.userId, table.sleepDate),
    check(
      "sleep_duration_positive_check",
      sql`${table.sleepDurationMinutes} > 0 AND ${table.sleepDurationMinutes} < 1440`,
    ),
  ],
);

export const caffeineEntries = pgTable(
  "caffeine_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    timezone: text("timezone").notNull(),
    beverageType: text("beverage_type").notNull(),
    caffeineMg: integer("caffeine_mg").notNull(),
    amount: text("amount"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("caffeine_entries_user_recorded_idx").on(
      table.userId,
      table.recordedAt,
    ),
    check(
      "caffeine_mg_check",
      sql`${table.caffeineMg} >= 0 AND ${table.caffeineMg} <= 2000`,
    ),
  ],
);

export const caffeinePresets = pgTable(
  "caffeine_presets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    beverageType: text("beverage_type").notNull(),
    caffeineMg: integer("caffeine_mg").notNull(),
    amount: text("amount"),
  },
  (table) => [index("caffeine_presets_user_idx").on(table.userId)],
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationMinutes: integer("duration_minutes").notNull(),
    difficulty: real("difficulty"),
    enjoyment: real("enjoyment"),
    mastery: real("mastery"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("activities_user_started_idx").on(table.userId, table.startedAt),
  ],
);

export const nicotineEntries = pgTable(
  "nicotine_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    mode: text("mode").notNull(),
    level: text("level"),
    episodes: integer("episodes"),
    note: text("note"),
  },
  (table) => [
    index("nicotine_entries_user_recorded_idx").on(
      table.userId,
      table.recordedAt,
    ),
  ],
);

export const substanceEntries = pgTable(
  "substance_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    substance: text("substance").notNull(),
    amount: text("amount"),
    note: text("note"),
  },
  (table) => [
    index("substance_entries_user_recorded_idx").on(
      table.userId,
      table.recordedAt,
    ),
  ],
);

export const medications = pgTable(
  "medications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    genericName: text("generic_name"),
    unit: text("unit").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("medications_user_idx").on(table.userId)],
);

export const medicationPeriods = pgTable(
  "medication_periods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    medicationId: uuid("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "cascade" }),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }),
    dose: real("dose").notNull(),
    schedule: text("schedule").notNull(),
    note: text("note"),
  },
  (table) => [
    index("medication_periods_user_medication_idx").on(
      table.userId,
      table.medicationId,
    ),
  ],
);

export const medicationEvents = pgTable(
  "medication_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    medicationId: uuid("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    previousDose: real("previous_dose"),
    newDose: real("new_dose"),
    note: text("note"),
  },
  (table) => [
    index("medication_events_user_medication_idx").on(
      table.userId,
      table.medicationId,
      table.recordedAt,
    ),
  ],
);

export const lifeEvents = pgTable(
  "life_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    category: text("category").notNull(),
    valence: text("valence").notNull(),
    intensity: real("intensity").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("life_events_user_recorded_idx").on(table.userId, table.recordedAt),
  ],
);

export const safetyPlans = pgTable("safety_plans", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  thingsThatHelp: text("things_that_help"),
  peopleToContact: text("people_to_contact"),
  helpfulPlaces: text("helpful_places"),
  reasonsToWait: text("reasons_to_wait"),
  emergencyInformation: text("emergency_information"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
