import type { Player, TableConfig } from "@/types/poker";

export interface LegalActions {
  readonly canFold: boolean;
  readonly canCheck: boolean;
  readonly canCall: boolean;
  readonly callAmount: number;
  readonly canBet: boolean;
  readonly canRaise: boolean;
  readonly minRaiseTotal: number;
  readonly maxRaiseTotal: number;
  readonly potOddsPercentage: number | null;
  readonly quickBets: {
    readonly min: number;
    readonly thirdPot: number;
    readonly halfPot: number;
    readonly twoThirdPot: number;
    readonly fullPot: number;
    readonly allIn: number;
  };
}

/**
 * Calculates all legal actions and quick bet sizes for the active player.
 */
export function getLegalActions(
  player: Player,
  currentRoundHighestBet: number,
  lastRaiseDelta: number,
  totalPotSize: number,
  config: TableConfig
): LegalActions {
  const playerRoundBet = player.currentRoundBet;
  const playerStack = player.stack;

  // Amount needed to match current highest bet
  const neededToCall = Math.max(0, currentRoundHighestBet - playerRoundBet);
  const actualCallAmount = Math.min(neededToCall, playerStack);

  const canCheck = neededToCall === 0;
  const canFold = neededToCall > 0;
  const canCall = neededToCall > 0 && playerStack > 0;

  // Min raise size in Texas Hold'em
  const minDelta = Math.max(lastRaiseDelta, config.bigBlind);
  const minRaiseTotal = currentRoundHighestBet === 0
    ? config.bigBlind
    : currentRoundHighestBet + minDelta;

  const maxRaiseTotal = playerRoundBet + playerStack;
  const canBet = currentRoundHighestBet === 0 && playerStack >= config.bigBlind;
  const canRaise = currentRoundHighestBet > 0 && playerStack > neededToCall;

  // Pot odds calculation
  let potOddsPercentage: number | null = null;
  if (canCall && actualCallAmount > 0) {
    const finalPot = totalPotSize + actualCallAmount;
    potOddsPercentage = Math.round((actualCallAmount / finalPot) * 1000) / 10;
  }

  // Quick Bet sizing calculations
  // Pot calculation before raise: total pot on table plus the uncalled call amount
  const potAfterCall = totalPotSize + actualCallAmount;

  const calculateQuickRaise = (fraction: number): number => {
    const raiseIncrement = Math.round(potAfterCall * fraction);
    const targetBet = currentRoundHighestBet + raiseIncrement;
    const clampedTarget = Math.max(minRaiseTotal, Math.min(targetBet, maxRaiseTotal));
    return clampedTarget;
  };

  const thirdPot = calculateQuickRaise(0.33);
  const halfPot = calculateQuickRaise(0.5);
  const twoThirdPot = calculateQuickRaise(0.67);
  const fullPot = calculateQuickRaise(1.0);
  const minBet = Math.min(minRaiseTotal, maxRaiseTotal);
  const allIn = maxRaiseTotal;

  return {
    canFold,
    canCheck,
    canCall,
    callAmount: actualCallAmount,
    canBet,
    canRaise,
    minRaiseTotal: Math.min(minRaiseTotal, maxRaiseTotal),
    maxRaiseTotal,
    potOddsPercentage,
    quickBets: {
      min: minBet,
      thirdPot,
      halfPot,
      twoThirdPot,
      fullPot,
      allIn,
    },
  };
}
