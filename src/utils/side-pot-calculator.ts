import type { Pot } from "@/types/poker";

export interface PlayerPotContribution {
  readonly id: string;
  readonly name: string;
  readonly totalContributed: number;
  readonly isFolded: boolean;
  readonly isAllIn?: boolean;
}

export interface PotCalculationResult {
  readonly pots: readonly Pot[];
  readonly totalPot: number;
  readonly uncalledRefunds: Readonly<Record<string, number>>;
}

/**
 * Pure mathematical function to compute Main Pot and Side Pots in Texas Hold'em.
 * Rules:
 * - Side pots only occur when at least one player is all-in.
 * - If no player is all-in, all chips in play belong to the Main Pot.
 * - Dead money from folded players is included in the lowest available pot they contributed to.
 * - If a player bets more than any other contesting player, the uncalled surplus is refunded.
 */
export function calculateSidePots(
  contributions: readonly PlayerPotContribution[]
): PotCalculationResult {
  const totalChips = contributions.reduce(
    (sum, p) => sum + Math.max(0, p.totalContributed),
    0
  );

  if (contributions.length === 0 || totalChips === 0) {
    return { pots: [], totalPot: 0, uncalledRefunds: {} };
  }

  const nonFolded = contributions.filter(
    (p) => !p.isFolded && p.totalContributed > 0
  );

  // If 1 or 0 non-folded players left
  if (nonFolded.length <= 1) {
    return {
      pots: [
        {
          id: "main-pot",
          name: "Main Pot",
          amount: totalChips,
          eligiblePlayerIds: nonFolded.map((p) => p.id),
        },
      ],
      totalPot: totalChips,
      uncalledRefunds: {},
    };
  }

  // Check if any non-folded player is all-in
  const hasAllIn = nonFolded.some((p) => p.isAllIn);

  // If no one is all-in, there are no side pots! Everything is in Main Pot.
  if (!hasAllIn) {
    return {
      pots: [
        {
          id: "main-pot",
          name: "Main Pot",
          amount: totalChips,
          eligiblePlayerIds: nonFolded.map((p) => p.id),
        },
      ],
      totalPot: totalChips,
      uncalledRefunds: {},
    };
  }

  // When all-in exists, slice into layers based on unique all-in and maximum contribution thresholds
  // Sort distinct all-in contribution levels, plus the maximum contribution level
  const allInLevels = nonFolded
    .filter((p) => p.isAllIn)
    .map((p) => p.totalContributed);
  const maxContribution = Math.max(...nonFolded.map((p) => p.totalContributed));

  const uniqueLevels = Array.from(
    new Set([...allInLevels, maxContribution])
  ).sort((a, b) => a - b);

  const pots: Pot[] = [];
  const uncalledRefunds: Record<string, number> = {};
  let prevLevel = 0;
  let potIndex = 0;

  for (const currentLevel of uniqueLevels) {
    const sliceDelta = currentLevel - prevLevel;
    if (sliceDelta <= 0) continue;

    let sliceAmount = 0;
    for (const player of contributions) {
      if (player.totalContributed > prevLevel) {
        const contributedInSlice = Math.min(
          player.totalContributed - prevLevel,
          sliceDelta
        );
        sliceAmount += contributedInSlice;
      }
    }

    const eligible = nonFolded.filter((p) => p.totalContributed >= currentLevel);

    if (sliceAmount > 0) {
      if (eligible.length === 1) {
        // Uncalled surplus
        const singleId = eligible[0].id;
        uncalledRefunds[singleId] = (uncalledRefunds[singleId] ?? 0) + sliceAmount;
      } else {
        const name = potIndex === 0 ? "Main Pot" : `Side Pot ${potIndex}`;
        pots.push({
          id: `pot-${potIndex}`,
          name,
          amount: sliceAmount,
          eligiblePlayerIds: eligible.map((p) => p.id),
        });
        potIndex++;
      }
    }

    prevLevel = currentLevel;
  }

  const netPotAmount = pots.reduce((sum, pot) => sum + pot.amount, 0);

  return {
    pots,
    totalPot: netPotAmount,
    uncalledRefunds,
  };
}

/**
 * Split a pot among winners, handling odd chips in Texas Hold'em.
 */
export function distributePot(
  potAmount: number,
  winnerIds: readonly string[],
  playerOrderFromDealer: readonly string[]
): Record<string, number> {
  if (winnerIds.length === 0 || potAmount <= 0) return {};

  const baseShare = Math.floor(potAmount / winnerIds.length);
  let oddChips = potAmount % winnerIds.length;

  const result: Record<string, number> = {};
  for (const id of winnerIds) {
    result[id] = baseShare;
  }

  if (oddChips > 0) {
    for (const playerId of playerOrderFromDealer) {
      if (winnerIds.includes(playerId) && oddChips > 0) {
        result[playerId] = (result[playerId] ?? 0) + 1;
        oddChips--;
      }
    }
  }

  return result;
}
