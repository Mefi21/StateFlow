import { format, subDays } from "date-fns";
import { mean, spearmanCorrelation } from "@/lib/statistics";

export type DemoDay = {
  date: string;
  futureWanting: number;
  anticipation: number;
  goalDrive: number;
  pleasure: number;
  lifeInterest: number;
  energy: number;
  anxiety: number;
  activation: number;
  mastery: number;
  pride: number;
  escapeUrge: number;
  emotionalIntensity: number;
  sleepHours: number;
  caffeineMg: number;
  programmingMinutes: number;
  walkingMinutes: number;
  workMinutes: number;
  snapshots: number;
};

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const bounded = (value: number, min = 0, max = 10) =>
  round(Math.max(min, Math.min(max, value)));

export function generateDemoDays(count = 365): DemoDay[] {
  const random = mulberry32(11_082_026);
  const end = new Date("2026-08-18T12:00:00Z");
  let previousCaffeine = 140;
  return Array.from({ length: count }, (_, index) => {
    const date = subDays(end, count - 1 - index);
    const weekday = date.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const longWave = Math.sin(index / 34) * 0.75 + Math.sin(index / 91) * 0.5;
    const sleepHours = bounded(
      7.25 - Math.max(0, previousCaffeine - 220) / 310 + (random() - 0.5) * 1.8,
      4.4,
      9.4,
    );
    const programmingMinutes = Math.round(
      Math.max(0, (isWeekend ? 80 : 35) + (random() - 0.43) * 150),
    );
    const walkingMinutes = Math.round(Math.max(0, 32 + (random() - 0.45) * 75));
    const workMinutes = isWeekend
      ? Math.round(random() * 80)
      : Math.round(390 + random() * 150);
    const caffeineMg = Math.round(
      Math.max(0, (isWeekend ? 105 : 165) + (random() - 0.5) * 190),
    );
    const mastery = bounded(
      3.7 +
        programmingMinutes / 75 +
        workMinutes / 320 +
        longWave * 0.5 +
        (random() - 0.5) * 2.1,
    );
    const futureWanting = bounded(
      4.6 +
        (sleepHours - 7) * 0.62 +
        mastery * 0.24 +
        longWave +
        (random() - 0.5) * 1.8,
    );
    const pleasure = bounded(
      4.7 +
        walkingMinutes / 70 +
        (isWeekend ? 0.5 : 0) +
        longWave * 0.45 +
        (random() - 0.5) * 2.2,
    );
    const anticipation = bounded(
      futureWanting * 0.72 + longWave * 0.5 + (random() - 0.5) * 1.7,
    );
    const goalDrive = bounded(
      futureWanting * 0.48 + mastery * 0.4 + (random() - 0.5) * 1.6,
    );
    const lifeInterest = bounded(
      futureWanting * 0.45 + pleasure * 0.45 + (random() - 0.5) * 1.5,
    );
    const anxiety = bounded(
      5.6 - sleepHours * 0.31 + workMinutes / 330 + (random() - 0.5) * 2.8,
    );
    const energy = bounded(
      3.5 +
        (sleepHours - 5) * 0.72 +
        caffeineMg / 240 +
        longWave * 0.35 +
        (random() - 0.5) * 1.7,
    );
    const activation = bounded(
      2.3 + caffeineMg / 92 + anxiety * 0.2 + (random() - 0.5) * 2,
    );
    previousCaffeine = caffeineMg;
    return {
      date: format(date, "yyyy-MM-dd"),
      futureWanting,
      anticipation,
      goalDrive,
      pleasure,
      lifeInterest,
      energy,
      anxiety,
      activation,
      mastery,
      pride: bounded(mastery * 0.72 + (random() - 0.5) * 1.5),
      escapeUrge: bounded(
        7.4 - futureWanting * 0.55 + anxiety * 0.22 + (random() - 0.5) * 2,
      ),
      emotionalIntensity: bounded(
        3.2 + activation * 0.37 + (random() - 0.5) * 2.4,
      ),
      sleepHours,
      caffeineMg,
      programmingMinutes,
      walkingMinutes,
      workMinutes,
      snapshots: 1 + Math.floor(random() * 4),
    };
  });
}

export const demoDays = generateDemoDays();

export const demoSummary = {
  current: demoDays.at(-1)!,
  previous: demoDays.at(-2)!,
  last7: demoDays.slice(-7),
  previous7: demoDays.slice(-14, -7),
  last30: demoDays.slice(-30),
};

export function compareWeeks(
  key: keyof Pick<
    DemoDay,
    | "futureWanting"
    | "pleasure"
    | "energy"
    | "anxiety"
    | "sleepHours"
    | "mastery"
  >,
  days: DemoDay[] = demoDays,
) {
  const current = mean(days.slice(-7).map((day) => day[key])) ?? 0;
  const previous = mean(days.slice(-14, -7).map((day) => day[key])) ?? 0;
  return {
    current: round(current),
    previous: round(previous),
    delta: round(current - previous),
  };
}

export const demoCorrelations = {
  sleepFuture: spearmanCorrelation(
    demoDays.slice(-90, -1).map((day) => day.sleepHours),
    demoDays.slice(-89).map((day) => day.futureWanting),
  ),
  masteryFuture: spearmanCorrelation(
    demoDays.slice(-90).map((day) => day.mastery),
    demoDays.slice(-90).map((day) => day.futureWanting),
  ),
  caffeineActivation: spearmanCorrelation(
    demoDays.slice(-90).map((day) => day.caffeineMg),
    demoDays.slice(-90).map((day) => day.activation),
  ),
};
