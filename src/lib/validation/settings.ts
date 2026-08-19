import { z } from "zod";

const timezoneSchema = z
  .string()
  .min(1)
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value }).format();
      return true;
    } catch {
      return false;
    }
  }, "Invalid IANA timezone");

export const settingsInputSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  timezone: timezoneSchema,
  targetSleepMinutes: z.number().int().min(120).max(900),
  morningCheckInEnabled: z.boolean(),
  metrics: z
    .array(
      z.object({
        slug: z.string().min(1).max(100),
        enabled: z.boolean(),
        snapshotEnabled: z.boolean(),
        dailyEnabled: z.boolean(),
        dashboardEnabled: z.boolean(),
        sortOrder: z.number().int().min(0).max(1000),
      }),
    )
    .max(100),
});
