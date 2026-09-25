export type Street = "preflop" | "flop" | "turn" | "river" | "showdown";

export type PlayerStatus = "active" | "folded" | "allin";

export type PlayerPosition =
  | "BTN"
  | "SB"
  | "BB"
  | "UTG"
  | "UTG+1"
  | "MP"
  | "MP+1"
  | "HJ"
  | "CO";

export type ActionType = "fold" | "check" | "call" | "bet" | "raise" | "allin";

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly seatNumber: number;
  readonly stack: number;
  readonly currentRoundBet: number;
  readonly totalHandBet: number;
  readonly status: PlayerStatus;
  readonly position: PlayerPosition;
  readonly isDealer: boolean;
  readonly isCurrentTurn: boolean;
}

export interface Pot {
  readonly id: string;
  readonly name: string;
  readonly amount: number;
  readonly eligiblePlayerIds: readonly string[];
}

export interface TableConfig {
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly ante: number;
  readonly minRaiseAmount: number;
}

export interface PlayerActionRecord {
  readonly playerId: string;
  readonly playerName: string;
  readonly action: ActionType;
  readonly amount: number;
  readonly street: Street;
  readonly timestamp: number;
}
