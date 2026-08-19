import { z } from "zod";
import { coreMetrics } from "@/features/metrics/definitions";

const metricSlugs = new Set(coreMetrics.map((metric) => metric.slug));
const metricValuesSchema = z
  .record(z.string(), z.number().min(0).max(10))
  .superRefine((values, context) => {
    for (const slug of Object.keys(values)) {
      if (!metricSlugs.has(slug)) {
        context.addIssue({
          code: "custom",
          message: `Unknown metric: ${slug}`,
          path: [slug],
        });
      }
    }
  });

export const snapshotInputSchema = z.object({
  id: z.uuid(),
  recordedAt: z.iso.datetime({ offset: true }),
  timezone: z.string().min(1).max(100),
  note: z.string().max(500).optional(),
  isImportant: z.boolean().default(false),
  metrics: metricValuesSchema,
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export const snapshotSyncSchema = z.object({
  snapshots: z.array(snapshotInputSchema).min(1).max(50),
});

export const snapshotUpdateSchema = z.object({
  version: z.number().int().positive(),
  note: z.string().max(500).nullable().optional(),
  isImportant: z.boolean().optional(),
  metrics: metricValuesSchema.optional(),
});

export const dailyEntryInputSchema = z.object({
  id: z.uuid().optional(),
  entryDate: z.iso.date(),
  timezone: z.string().min(1).max(100),
  isDraft: z.boolean().default(false),
  metrics: metricValuesSchema,
  contextualAnswers: z.record(z.string(), z.string().max(1000)).default({}),
  note: z.string().max(10_000).optional(),
});

export const sleepInputSchema = z
  .object({
    id: z.uuid().optional(),
    sleepDate: z.iso.date(),
    timezone: z.string().min(1).max(100),
    wentToBedAt: z.iso.datetime({ offset: true }).optional(),
    sleepStartedAt: z.iso.datetime({ offset: true }),
    wokeUpAt: z.iso.datetime({ offset: true }),
    gotOutOfBedAt: z.iso.datetime({ offset: true }).optional(),
    awakeningsCount: z.number().int().min(0).max(100).default(0),
    subjectiveSleepQuality: z.number().min(0).max(10).optional(),
    eveningSleepiness: z.number().min(0).max(10).optional(),
    morningDifficulty: z.number().min(0).max(10).optional(),
    note: z.string().max(2000).optional(),
  })
  .refine((data) => new Date(data.wokeUpAt) > new Date(data.sleepStartedAt), {
    message: "Wake time must be after sleep start",
    path: ["wokeUpAt"],
  });

export const caffeineInputSchema = z.object({
  id: z.uuid().optional(),
  recordedAt: z.iso.datetime({ offset: true }),
  timezone: z.string().min(1).max(100),
  beverageType: z.enum([
    "espresso",
    "coffee",
    "energy_drink",
    "black_tea",
    "green_tea",
    "custom",
  ]),
  caffeineMg: z.number().int().min(0).max(2000),
  amount: z.string().max(100).optional(),
  note: z.string().max(1000).optional(),
});

export const morningInputSchema = z.object({
  entryDate: z.iso.date(),
  timezone: z.string().min(1).max(100),
  sleepQuality: z.number().int().min(0).max(10),
  metrics: metricValuesSchema,
  note: z.string().max(2000).optional(),
});

export type SnapshotInput = z.infer<typeof snapshotInputSchema>;
export type DailyEntryInput = z.infer<typeof dailyEntryInputSchema>;
export type SleepInput = z.infer<typeof sleepInputSchema>;
export type CaffeineInput = z.infer<typeof caffeineInputSchema>;
