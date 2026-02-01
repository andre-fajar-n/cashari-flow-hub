import { PeriodOption, PeriodType } from "./types";
import { subDays, subMonths, subYears, parseISO, isAfter } from "date-fns";

export const periodOptions: PeriodOption[] = [
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "Semua" },
];

export const defaultYAxisFormatter = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

export const filterDataByPeriod = <T extends { date: string }>(
  data: T[],
  period: PeriodType
): T[] => {
  if (period === "ALL" || data.length === 0) {
    return data;
  }

  const now = new Date();
  let cutoffDate: Date;

  switch (period) {
    case "1M":
      cutoffDate = subDays(now, 30);
      break;
    case "3M":
      cutoffDate = subMonths(now, 3);
      break;
    case "6M":
      cutoffDate = subMonths(now, 6);
      break;
    case "1Y":
      cutoffDate = subYears(now, 1);
      break;
    default:
      return data;
  }

  return data.filter((item) => {
    const itemDate = parseISO(item.date);
    return isAfter(itemDate, cutoffDate);
  });
};
