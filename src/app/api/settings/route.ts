import { eq, inArray } from "drizzle-orm";
import { ZodError } from "zod";
import { getDb } from "@/db";
import {
  metricDefinitions,
  userMetricSettings,
  userSettings,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { isSameOriginRequest } from "@/lib/security/request";
import { settingsInputSchema } from "@/lib/validation/settings";
import { themeCookieName } from "@/lib/theme";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const input = settingsInputSchema.parse(await request.json());
    await getDb().transaction(async (tx) => {
      await tx
        .insert(userSettings)
        .values({
          userId: user.id,
          theme: input.theme,
          timezone: input.timezone,
          targetSleepMinutes: input.targetSleepMinutes,
          morningCheckInEnabled: input.morningCheckInEnabled,
        })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: {
            theme: input.theme,
            timezone: input.timezone,
            targetSleepMinutes: input.targetSleepMinutes,
            morningCheckInEnabled: input.morningCheckInEnabled,
            updatedAt: new Date(),
          },
        });
      if (input.metrics.length) {
        const definitions = await tx
          .select({ id: metricDefinitions.id, slug: metricDefinitions.slug })
          .from(metricDefinitions)
          .where(
            inArray(
              metricDefinitions.slug,
              input.metrics.map((metric) => metric.slug),
            ),
          );
        const ids = new Map(
          definitions.map((definition) => [definition.slug, definition.id]),
        );
        for (const metric of input.metrics) {
          const definitionId = ids.get(metric.slug);
          if (!definitionId) continue;
          await tx
            .insert(userMetricSettings)
            .values({
              userId: user.id,
              metricDefinitionId: definitionId,
              enabled: metric.enabled,
              snapshotEnabled: metric.snapshotEnabled,
              dailyEnabled: metric.dailyEnabled,
              dashboardEnabled: metric.dashboardEnabled,
              sortOrder: metric.sortOrder,
            })
            .onConflictDoUpdate({
              target: [
                userMetricSettings.userId,
                userMetricSettings.metricDefinitionId,
              ],
              set: {
                enabled: metric.enabled,
                snapshotEnabled: metric.snapshotEnabled,
                dailyEnabled: metric.dailyEnabled,
                dashboardEnabled: metric.dashboardEnabled,
                sortOrder: metric.sortOrder,
              },
            });
        }
      }
    });
    const response = apiSuccess({ saved: true });
    response.cookies.set(themeCookieName, input.theme, {
      path: "/",
      maxAge: 31_536_000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    const [settings] = await getDb()
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);
    return apiSuccess(settings ?? null);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
