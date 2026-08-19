import { getDb } from "@/db";
import { sleepRecords } from "@/db/schema";
import type { SleepInput } from "@/lib/validation/entries";

export async function createSleepRecord(userId: string, input: SleepInput) {
  const started = new Date(input.sleepStartedAt);
  const woke = new Date(input.wokeUpAt);
  const wentToBed = input.wentToBedAt ? new Date(input.wentToBedAt) : started;
  const gotOut = input.gotOutOfBedAt ? new Date(input.gotOutOfBedAt) : woke;
  const sleepDurationMinutes = Math.round(
    (woke.getTime() - started.getTime()) / 60_000,
  );
  const timeInBedMinutes = Math.round(
    (gotOut.getTime() - wentToBed.getTime()) / 60_000,
  );
  const sleepMidpoint = new Date(
    started.getTime() + (woke.getTime() - started.getTime()) / 2,
  );
  const [record] = await getDb()
    .insert(sleepRecords)
    .values({
      id: input.id,
      userId,
      sleepDate: input.sleepDate,
      timezone: input.timezone,
      wentToBedAt: wentToBed,
      sleepStartedAt: started,
      wokeUpAt: woke,
      gotOutOfBedAt: gotOut,
      awakeningsCount: input.awakeningsCount,
      subjectiveSleepQuality: input.subjectiveSleepQuality,
      eveningSleepiness: input.eveningSleepiness,
      morningDifficulty: input.morningDifficulty,
      sleepDurationMinutes,
      timeInBedMinutes,
      sleepMidpoint,
      note: input.note,
    })
    .returning({ id: sleepRecords.id });
  return { ...record, sleepDurationMinutes, timeInBedMinutes, sleepMidpoint };
}
