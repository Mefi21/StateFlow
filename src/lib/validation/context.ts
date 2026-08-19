import { z } from "zod";

export const activityInputSchema = z.object({
  category: z.string().trim().min(1).max(80),
  startedAt: z.iso.datetime({ offset: true }),
  endedAt: z.iso.datetime({ offset: true }).optional(),
  durationMinutes: z.number().int().min(1).max(1440),
  difficulty: z.number().min(0).max(10).optional(),
  enjoyment: z.number().min(0).max(10).optional(),
  mastery: z.number().min(0).max(10).optional(),
  note: z.string().max(2000).optional(),
});

export const lifeEventInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  recordedAt: z.iso.datetime({ offset: true }),
  category: z.string().trim().min(1).max(80),
  valence: z.enum(["positive", "neutral", "negative", "mixed"]),
  intensity: z.number().min(0).max(10),
  note: z.string().max(4000).optional(),
});
