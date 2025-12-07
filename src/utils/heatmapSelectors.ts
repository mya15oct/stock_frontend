import type { HeatmapData } from "@/types/market";

export type HeatmapStatus = {
  advancing: number;
  declining: number;
  unchanged: number;
  cashFlow: {
    advancing: number;
    declining: number;
    unchanged: number;
  };
};

export function deriveHeatmapStatus(data: HeatmapData | null): HeatmapStatus | null {
  if (!data || !data.sectors || !Array.isArray(data.sectors)) return null;

  const allStocks = data.sectors.flatMap((s) => s.stocks);
  if (allStocks.length === 0) return null;

  let advancing = 0;
  let declining = 0;
  let unchanged = 0;

  let flowAdvancing = 0;
  let flowDeclining = 0;
  let flowUnchanged = 0;

  allStocks.forEach((stock) => {
    const cp = stock.changePercent ?? 0;
    const cashFlow = (stock.price ?? 0) * (stock.volume ?? 0);

    if (cp > 0) {
      advancing += 1;
      flowAdvancing += cashFlow;
    } else if (cp < 0) {
      declining += 1;
      flowDeclining += cashFlow;
    } else {
      unchanged += 1;
      flowUnchanged += cashFlow;
    }
  });

  return {
    advancing,
    declining,
    unchanged,
    cashFlow: {
      advancing: flowAdvancing,
      declining: flowDeclining,
      unchanged: flowUnchanged,
    },
  };
}


