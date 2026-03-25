import {
  DateRange,
  HistoricalDataPoint,
  DefiLlamaChartPoint,
  MorphoHistoricalPoint,
  CoinGeckoPricePoint,
} from "./types";

export function rangeToDays(range: DateRange): number {
  switch (range) {
    case "1m": return 30;
    case "3m": return 90;
    case "1y": return 365;
    case "max": return 9999;
  }
}

export function filterByRange(
  data: HistoricalDataPoint[],
  range: DateRange
): HistoricalDataPoint[] {
  if (range === "max") return data;
  const days = rangeToDays(range);
  const cutoff = Date.now() / 1000 - days * 86400;
  return data.filter((d) => d.timestamp >= cutoff);
}

export function formatChartDate(ts: number, range: DateRange): string {
  const d = new Date(ts * 1000);
  if (range === "1m" || range === "3m") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function parseDefiLlamaChart(
  raw: DefiLlamaChartPoint[],
  field: "apy" | "apyBase" | "tvlUsd"
): HistoricalDataPoint[] {
  return raw
    .filter((p) => p[field] !== null && p[field] !== undefined)
    .map((p) => ({
      timestamp: Math.floor(new Date(p.timestamp).getTime() / 1000),
      date: "",
      value: p[field] as number,
    }));
}

export function parseMorphoHistory(
  raw: MorphoHistoricalPoint[]
): HistoricalDataPoint[] {
  return raw
    .map((p) => ({
      timestamp: p.x,
      date: "",
      value: p.y * 100,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

export function parseCoinGeckoPrice(
  raw: CoinGeckoPricePoint[]
): HistoricalDataPoint[] {
  return raw.map((p) => ({
    timestamp: Math.floor(p.timestamp / 1000),
    date: "",
    value: p.price,
  }));
}

export const SERIES_COLORS: string[] = [
  "#10b981", // emerald
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];
