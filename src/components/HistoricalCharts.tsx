"use client";

import { useState } from "react";
import { AssetConfig, MorphoMarket, DateRange } from "@/lib/types";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import DateRangeToggle from "./charts/DateRangeToggle";
import PriceChart from "./charts/PriceChart";
import ApyChart from "./charts/ApyChart";
import BorrowRatesChart from "./charts/BorrowRatesChart";

interface Props {
  asset: AssetConfig;
  morphoMarkets: MorphoMarket[];
}

export default function HistoricalCharts({ asset, morphoMarkets }: Props) {
  const [range, setRange] = useState<DateRange>("3m");
  const { priceHistory, apyHistory, borrowRateSeries, isLoading } =
    useHistoricalData(asset, morphoMarkets, range);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Historical Data</h3>
        <DateRangeToggle selected={range} onChange={setRange} />
      </div>

      {isLoading && (
        <div className="text-center text-gray-500 py-8 animate-pulse">
          Loading historical data...
        </div>
      )}

      <div className="grid gap-4">
        <PriceChart
          data={priceHistory}
          range={range}
          assetName={asset.displayName}
        />
        <ApyChart
          data={apyHistory}
          range={range}
          assetName={asset.displayName}
        />
        <BorrowRatesChart series={borrowRateSeries} range={range} />
      </div>
    </div>
  );
}
