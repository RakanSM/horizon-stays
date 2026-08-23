import { describe, expect, it } from "vitest";
import { selectRangeDate } from "./TwoClickDateRangePicker";

describe("selectRangeDate", () => {
  it("uses the first click as check-in and the second later click as check-out", () => {
    const checkIn = selectRangeDate({ checkIn: "", checkOut: "" }, "2026-08-25");
    expect(checkIn).toEqual({ checkIn: "2026-08-25", checkOut: "" });
    expect(selectRangeDate(checkIn, "2026-08-29")).toEqual({ checkIn: "2026-08-25", checkOut: "2026-08-29" });
  });

  it("restarts check-in when the next click is the same date, earlier, or follows a completed range", () => {
    expect(selectRangeDate({ checkIn: "2026-08-25", checkOut: "" }, "2026-08-24")).toEqual({ checkIn: "2026-08-24", checkOut: "" });
    expect(selectRangeDate({ checkIn: "2026-08-25", checkOut: "2026-08-29" }, "2026-09-02")).toEqual({ checkIn: "2026-09-02", checkOut: "" });
  });
});
