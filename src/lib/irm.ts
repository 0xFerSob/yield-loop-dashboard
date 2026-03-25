/**
 * Interest Rate Model calculations for Morpho Blue and Aave V3.
 *
 * Morpho: Adaptive Curve IRM
 *   - CURVE_STEEPNESS = 4
 *   - TARGET_UTILIZATION = 90%
 *   - borrowRate = (coeff * err + 1) * rateAtTarget
 *
 * Aave V3: Two-slope (kink) model
 *   - borrowRate = base + slope1 * (U / Uopt)           when U <= Uopt
 *   - borrowRate = base + slope1 + slope2 * excessU      when U > Uopt
 *   - slope1 is back-calculated from current rate/utilization for accuracy
 */

// Morpho constants
const CURVE_STEEPNESS = 4;
const TARGET_UTILIZATION = 0.9;

/**
 * Compute Morpho borrow APY at a given utilization using the adaptive curve.
 * apyAtTarget is already an annualized APY (decimal, e.g. 0.024 = 2.4%).
 */
export function morphoBorrowApy(
  utilization: number,
  apyAtTarget: number
): number {
  if (utilization <= 0) return apyAtTarget / CURVE_STEEPNESS;
  if (utilization >= 1) return apyAtTarget * CURVE_STEEPNESS;

  let err: number;
  if (utilization > TARGET_UTILIZATION) {
    err = (utilization - TARGET_UTILIZATION) / (1 - TARGET_UTILIZATION);
  } else {
    err = (utilization - TARGET_UTILIZATION) / TARGET_UTILIZATION;
  }

  const coeff = err < 0 ? 1 - 1 / CURVE_STEEPNESS : CURVE_STEEPNESS - 1;
  return (coeff * err + 1) * apyAtTarget;
}

// Aave V3 optimal utilization ratios per stablecoin (set by governance)
export const AAVE_OPTIMAL_UTILIZATION: Record<string, number> = {
  USDC: 0.92,
  USDT: 0.92,
  PYUSD: 0.9,
  RLUSD: 0.8,
};

// Aave V3 slope2 (steep slope above kink) — hardcoded since it's rarely hit
const AAVE_SLOPE2: Record<string, number> = {
  USDC: 0.4,
  USDT: 0.4,
  PYUSD: 0.6,
  RLUSD: 0.75,
};

/**
 * Calculate new utilization after adding debt to a market.
 */
export function newUtilization(
  currentBorrowedUsd: number,
  currentSuppliedUsd: number,
  additionalDebtUsd: number
): number {
  const newBorrowed = currentBorrowedUsd + additionalDebtUsd;
  if (currentSuppliedUsd <= 0) return 1;
  return Math.min(newBorrowed / currentSuppliedUsd, 1);
}

/**
 * Estimate Aave borrow APY at a new utilization, using the current rate
 * to back-calculate slope1 rather than relying on hardcoded values.
 *
 * When current utilization is below optimal (the common case):
 *   currentRate = slope1 * (currentUtil / optimalUtil)
 *   → slope1 = currentRate * optimalUtil / currentUtil
 *   → newRate = slope1 * (newUtil / optimalUtil)
 *            = currentRate * (newUtil / currentUtil)
 *
 * This ensures the estimated rate is consistent with the actual observed rate.
 */
export function aaveEstimateBorrowApy(
  currentUtilization: number,
  newUtilizationRate: number,
  currentBorrowApy: number, // decimal (e.g. 0.0328 = 3.28%)
  borrowAsset: string
): number {
  const optimalUtil =
    AAVE_OPTIMAL_UTILIZATION[borrowAsset] ?? 0.9;
  const slope2 = AAVE_SLOPE2[borrowAsset] ?? 0.5;

  if (currentUtilization <= 0 || currentBorrowApy <= 0) {
    return currentBorrowApy;
  }

  // Back-calculate slope1 from current observed rate
  // Assumes current utilization is below optimal (typical for stablecoins)
  const slope1 =
    currentUtilization < optimalUtil
      ? currentBorrowApy / (currentUtilization / optimalUtil)
      : currentBorrowApy; // fallback if above optimal

  // Calculate new rate
  if (newUtilizationRate <= optimalUtil) {
    return slope1 * (newUtilizationRate / optimalUtil);
  }

  // Above optimal — use kink formula
  const excessUtil =
    (newUtilizationRate - optimalUtil) / (1 - optimalUtil);
  return slope1 + slope2 * excessUtil;
}

/**
 * Estimate borrow APY after adding debt, using the appropriate IRM.
 */
export function estimateBorrowApyAfterDebt(opts: {
  venue: string;
  borrowAsset: string;
  currentBorrowedUsd: number;
  currentSuppliedUsd: number;
  additionalDebtUsd: number;
  currentBorrowApy: number; // decimal
  // Morpho
  morphoApyAtTarget?: number;
}): number {
  const currentUtil =
    opts.currentSuppliedUsd > 0
      ? opts.currentBorrowedUsd / opts.currentSuppliedUsd
      : 0;

  const newUtil = newUtilization(
    opts.currentBorrowedUsd,
    opts.currentSuppliedUsd,
    opts.additionalDebtUsd
  );

  if (opts.venue === "Morpho" && opts.morphoApyAtTarget != null) {
    return morphoBorrowApy(newUtil, opts.morphoApyAtTarget);
  }

  // Aave — back-calculate from current rate
  return aaveEstimateBorrowApy(
    currentUtil,
    newUtil,
    opts.currentBorrowApy,
    opts.borrowAsset
  );
}
