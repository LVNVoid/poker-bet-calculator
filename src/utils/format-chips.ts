/**
 * Formats chip amounts into clean Indonesian Rupiah localized strings (e.g. Rp 1.000, Rp 20.000).
 * Includes optional compact formatting (e.g. 1500000 -> Rp 1,5 jt).
 */
export function formatChips(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === 0) return "Rp 0";

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (compact && absAmount >= 1_000) {
    let formattedCompact = "";
    if (absAmount >= 1_000_000_000) {
      formattedCompact = (absAmount / 1_000_000_000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + " M";
    } else if (absAmount >= 1_000_000) {
      formattedCompact = (absAmount / 1_000_000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + " jt";
    } else {
      formattedCompact = (absAmount / 1_000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + " rb";
    }
    return `${isNegative ? "-" : ""}Rp ${formattedCompact}`;
  }

  const formatted = new Intl.NumberFormat("id-ID").format(absAmount);
  return `${isNegative ? "-" : ""}Rp ${formatted}`;
}
