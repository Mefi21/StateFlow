import { getDb } from "@/db";
import { caffeineEntries } from "@/db/schema";
import type { CaffeineInput } from "@/lib/validation/entries";

export async function createCaffeineEntry(
  userId: string,
  input: CaffeineInput,
) {
  const [record] = await getDb()
    .insert(caffeineEntries)
    .values({
      id: input.id,
      userId,
      recordedAt: new Date(input.recordedAt),
      timezone: input.timezone,
      beverageType: input.beverageType,
      caffeineMg: input.caffeineMg,
      amount: input.amount,
      note: input.note,
    })
    .returning({ id: caffeineEntries.id });
  return record;
}
