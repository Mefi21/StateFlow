import { and, eq, inArray } from "drizzle-orm";
import { ZodError } from "zod";
import { getDb } from "@/db";
import { metricDefinitions, metricValues, morningEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { isSameOriginRequest } from "@/lib/security/request";
import { morningInputSchema } from "@/lib/validation/entries";
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const input = morningInputSchema.parse(await request.json());
    const result = await getDb().transaction(async (tx) => {
      const [entry] = await tx
        .insert(morningEntries)
        .values({
          userId: user.id,
          entryDate: input.entryDate,
          timezone: input.timezone,
          sleepQuality: input.sleepQuality,
          note: input.note,
        })
        .onConflictDoUpdate({
          target: [morningEntries.userId, morningEntries.entryDate],
          set: {
            timezone: input.timezone,
            sleepQuality: input.sleepQuality,
            note: input.note,
            updatedAt: new Date(),
          },
        })
        .returning({ id: morningEntries.id });
      const entries = Object.entries(input.metrics);
      const definitions = await tx
        .select({ id: metricDefinitions.id, slug: metricDefinitions.slug })
        .from(metricDefinitions)
        .where(
          inArray(
            metricDefinitions.slug,
            entries.map(([slug]) => slug),
          ),
        );
      const ids = new Map(
        definitions.map((definition) => [definition.slug, definition.id]),
      );
      await tx
        .delete(metricValues)
        .where(
          and(
            eq(metricValues.userId, user.id),
            eq(metricValues.entryType, "morning"),
            eq(metricValues.entryId, entry.id),
          ),
        );
      await tx.insert(metricValues).values(
        entries.map(([slug, value]) => ({
          userId: user.id,
          metricDefinitionId: ids.get(slug)!,
          entryType: "morning",
          entryId: entry.id,
          value,
          recordedAt: new Date(),
        })),
      );
      return entry;
    });
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
