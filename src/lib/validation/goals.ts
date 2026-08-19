import { z } from "zod";

export const goalInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(4000).optional(),
  whyItMatters: z.string().max(4000).optional(),
  startedAt: z.iso.date(),
  targetDate: z.iso.date().optional(),
  status: z
    .enum(["active", "paused", "completed", "abandoned"])
    .default("active"),
  progress: z.number().int().min(0).max(100).default(0),
  category: z.string().trim().min(1).max(80),
});

export const goalMeasurementInputSchema = z.object({
  recordedAt: z.iso.datetime({ offset: true }),
  wanting: z.number().min(0).max(10),
  excitement: z.number().min(0).max(10),
  confidence: z.number().min(0).max(10),
  mastery: z.number().min(0).max(10),
  effortWillingness: z.number().min(0).max(10),
  note: z.string().max(2000).optional(),
});

export const medicationInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  genericName: z.string().trim().max(160).optional(),
  unit: z.string().trim().min(1).max(40),
  startDate: z.iso.date(),
  dose: z.number().positive().max(100_000),
  schedule: z.string().trim().min(1).max(500),
  note: z.string().max(4000).optional(),
});
