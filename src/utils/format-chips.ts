/**
 * Formats chip amounts into clean localized strings with thousand separators (1,000).
 * Includes optional compact formatting (e.g. 1500 -> 1.5K).
 */
export function formatChips(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === 0) return "0";

  if (compact && Math.abs(amount) >= 1000) {
    if (Math.abs(amount) >= 1_000_000) {
      return (amount / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    return (amount / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  return new Intl.NumberFormat("en-US").format(amount);
}
