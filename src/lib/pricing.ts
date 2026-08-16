export type NightlyPriceInput = {
  date: string;
  basePrice: number;
  weekdayPrice?: number | null;
  weekendPrice?: number | null;
  weekendDays?: number[];
  overridePrice?: number | null;
};

/** Pricing order used by the back-office calendar and public quote endpoint. */
export function resolveNightlyPrice({ date, basePrice, weekdayPrice, weekendPrice, weekendDays = [5, 6], overridePrice }: NightlyPriceInput): number {
  if (overridePrice !== null && overridePrice !== undefined) return overridePrice;
  const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();
  if (weekendDays.includes(dayOfWeek) && weekendPrice !== null && weekendPrice !== undefined) return weekendPrice;
  if (!weekendDays.includes(dayOfWeek) && weekdayPrice !== null && weekdayPrice !== undefined) return weekdayPrice;
  return basePrice;
}
