import { useEffect, useMemo, useState } from "react";

export type DateRangeValue = {
  checkIn: string;
  checkOut: string;
};

type MonthView = { year: number; month: number };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isoDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

function monthFromIso(date: string): MonthView {
  const [year, month] = date.split("-").map(Number);
  return { year, month: month - 1 };
}

function dateForDisplay(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

/**
 * Selection intentionally mirrors the residence calendar: click once for
 * check-in, click a later date for check-out, then start a new range on the
 * next click. ISO dates compare chronologically as strings.
 */
export function selectRangeDate(current: DateRangeValue, date: string): DateRangeValue {
  if (!current.checkIn || current.checkOut || date <= current.checkIn) {
    return { checkIn: date, checkOut: "" };
  }
  return { checkIn: current.checkIn, checkOut: date };
}

export function TwoClickDateRangePicker({
  value,
  minDate,
  locale,
  checkInLabel,
  checkOutLabel,
  onChange,
  onComplete,
}: {
  value: DateRangeValue;
  minDate: string;
  locale: string;
  checkInLabel: string;
  checkOutLabel: string;
  onChange: (next: DateRangeValue) => void;
  onComplete?: (next: DateRangeValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<MonthView>(() => monthFromIso(value.checkIn || minDate));
  const firstDay = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(Date.UTC(view.year, view.month, 1))),
    [locale, view.month, view.year],
  );
  const canGoPrevious = view.year > Number(minDate.slice(0, 4)) || (view.year === Number(minDate.slice(0, 4)) && view.month > Number(minDate.slice(5, 7)) - 1);

  useEffect(() => {
    if (open) setView(monthFromIso(value.checkIn || minDate));
  }, [minDate, open, value.checkIn]);

  const updateView = (offset: number) => {
    const base = new Date(Date.UTC(view.year, view.month + offset, 1));
    setView({ year: base.getUTCFullYear(), month: base.getUTCMonth() });
  };

  const choose = (date: string) => {
    if (date < minDate) return;
    const next = selectRangeDate(value, date);
    onChange(next);
    if (next.checkOut) {
      setOpen(false);
      onComplete?.(next);
    }
  };

  const triggerLabel = value.checkIn && value.checkOut
    ? `${dateForDisplay(value.checkIn, locale)} – ${dateForDisplay(value.checkOut, locale)}`
    : value.checkIn
      ? `${checkInLabel}: ${dateForDisplay(value.checkIn, locale)} · ${checkOutLabel}`
      : `${checkInLabel} – ${checkOutLabel}`;

  return (
    <div className="horizon-range-picker" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      <button
        type="button"
        className="horizon-range-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{triggerLabel}</span>
        <i aria-hidden="true" />
      </button>
      {open && (
        <section className="horizon-range-popover" role="dialog" aria-label={`${checkInLabel} / ${checkOutLabel}`}>
          <header className="horizon-range-header">
            <button type="button" onClick={() => updateView(-1)} disabled={!canGoPrevious} aria-label="Previous month">←</button>
            <strong>{monthLabel}</strong>
            <button type="button" onClick={() => updateView(1)} aria-label="Next month">→</button>
          </header>
          <div className="horizon-range-weekdays" aria-hidden="true">
            {WEEKDAYS.map((day) => <span key={day}>{new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(Date.UTC(2023, 0, WEEKDAYS.indexOf(day) + 1)))}</span>)}
          </div>
          <div className="horizon-range-days">
            {Array.from({ length: firstDay }).map((_, index) => <span className="horizon-range-blank" key={`blank-${index}`} />)}
            {Array.from({ length: dayCount }).map((_, index) => {
              const day = index + 1;
              const date = isoDate(view.year, view.month, day);
              const disabled = date < minDate;
              const isStart = value.checkIn === date;
              const isEnd = value.checkOut === date;
              const isMiddle = Boolean(value.checkIn && value.checkOut && date > value.checkIn && date < value.checkOut);
              return (
                <button
                  type="button"
                  key={date}
                  className={`horizon-range-day${isStart ? " is-start" : ""}${isEnd ? " is-end" : ""}${isMiddle ? " is-middle" : ""}`}
                  disabled={disabled}
                  aria-label={dateForDisplay(date, locale)}
                  onClick={() => choose(date)}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p>{value.checkIn && !value.checkOut ? checkOutLabel : `${checkInLabel} → ${checkOutLabel}`}</p>
        </section>
      )}
    </div>
  );
}
