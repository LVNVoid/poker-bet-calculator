import { create } from "zustand";
import type {
  Player,
  PlayerStatus,
  TableConfig,
  Street,
  Pot,
  ActionType,
  PlayerActionRecord,
  PlayerPosition,
} from "@/types/poker";
import { calculateSidePots, distributePot } from "@/utils/side-pot-calculator";

interface TableSnapshot {
  readonly players: readonly Player[];
  readonly currentStreet: Street;
  readonly activePlayerIndex: number;
  readonly dealerIndex: number;
  readonly currentRoundHighestBet: number;
  readonly lastRaiseDelta: number;
  readonly pots: readonly Pot[];
  readonly totalPot: number;
  readonly uncalledRefunds: Readonly<Record<string, number>>;
  readonly actionLog: readonly PlayerActionRecord[];
  readonly isHandInProgress: boolean;
}

export interface PokerStoreState {
  readonly config: TableConfig;
  readonly players: readonly Player[];
  readonly currentStreet: Street;
  readonly activePlayerIndex: number;
  readonly dealerIndex: number;
  readonly currentRoundHighestBet: number;
  readonly lastRaiseDelta: number;
  readonly pots: readonly Pot[];
  readonly totalPot: number;
  readonly uncalledRefunds: Readonly<Record<string, number>>;
  readonly actionLog: readonly PlayerActionRecord[];
  readonly isHandInProgress: boolean;
  readonly handNumber: number;
  readonly history: readonly TableSnapshot[];

  // Actions
  readonly initTable: (config: TableConfig, initialPlayers: readonly { name: string; stack: number }[]) => void;
  readonly startNewHand: () => void;
  readonly performAction: (action: ActionType, raiseTotalAmount?: number) => void;
  readonly advanceStreet: () => void;
  readonly resolveShowdown: (allocations: readonly { potId: string; winnerIds: readonly string[] }[]) => void;
  readonly undoLastAction: () => void;
  readonly resetTable: () => void;
}

const DEFAULT_CONFIG: TableConfig = {
  smallBlind: 1000,
  bigBlind: 2000,
  ante: 0,
  minRaiseAmount: 2000,
};

const DEFAULT_PLAYERS_RAW = [
  { name: "Player 1", stack: 100000 },
  { name: "Player 2", stack: 100000 },
  { name: "Player 3", stack: 100000 },
  { name: "Player 4", stack: 100000 },
  { name: "Player 5", stack: 100000 },
  { name: "Player 6", stack: 100000 },
];

function assignPositions(playersCount: number, dealerIdx: number): PlayerPosition[] {
  const positions: PlayerPosition[] = new Array(playersCount).fill("MP");
  if (playersCount === 2) {
    positions[dealerIdx] = "BTN"; // In heads up, BTN is also SB
    positions[(dealerIdx + 1) % 2] = "BB";
    return positions;
  }

  positions[dealerIdx] = "BTN";
  positions[(dealerIdx + 1) % playersCount] = "SB";
  positions[(dealerIdx + 2) % playersCount] = "BB";

  if (playersCount >= 4) {
    positions[(dealerIdx + 3) % playersCount] = "UTG";
  }
  if (playersCount >= 5) {
    positions[(dealerIdx + playersCount - 1) % playersCount] = "CO";
  }
  if (playersCount >= 6) {
    positions[(dealerIdx + playersCount - 2) % playersCount] = "HJ";
  }

  return positions;
}

function getNextActiveIndex(
  players: readonly Player[],
  startIndex: number
): number {
  const count = players.length;
  for (let i = 1; i <= count; i++) {
    const idx = (startIndex + i) % count;
    if (players[idx].status === "active") {
      return idx;
    }
  }
  return startIndex;
}

export const usePokerStore = create<PokerStoreState>((set, get) => {
  const initialSetup = (
    config: TableConfig,
    rawPlayers: readonly { name: string; stack: number }[],
    dealerIdx: number = 0
  ) => {
    const count = rawPlayers.length;
    const positions = assignPositions(count, dealerIdx);

    const players: Player[] = rawPlayers.map((p, idx) => ({
      id: `player-${idx + 1}`,
      name: p.name,
      seatNumber: idx + 1,
      stack: p.stack,
      currentRoundBet: 0,
      totalHandBet: 0,
      status: "active",
      position: positions[idx],
      isDealer: idx === dealerIdx,
      isCurrentTurn: false,
    }));

    return {
      config,
      players,
      currentStreet: "preflop" as Street,
      activePlayerIndex: 0,
      dealerIndex: dealerIdx,
      currentRoundHighestBet: 0,
      lastRaiseDelta: config.bigBlind,
      pots: [],
      totalPot: 0,
      uncalledRefunds: {},
      actionLog: [],
      isHandInProgress: false,
      handNumber: 1,
      history: [],
    };
  };

  return {
    ...initialSetup(DEFAULT_CONFIG, DEFAULT_PLAYERS_RAW, 0),

    initTable: (config, initialPlayers) => {
      set(initialSetup(config, initialPlayers, 0));
    },

    resetTable: () => {
      set(initialSetup(DEFAULT_CONFIG, DEFAULT_PLAYERS_RAW, 0));
    },

    startNewHand: () => {
      const state = get();
      const count = state.players.length;
      if (count < 2) return;

      // Next dealer index
      const nextDealerIdx = state.isHandInProgress
        ? (state.dealerIndex + 1) % count
        : state.dealerIndex;

      const positions = assignPositions(count, nextDealerIdx);

      // Clean players state
      let updatedPlayers: Player[] = state.players.map((p, idx) => ({
        ...p,
        currentRoundBet: 0,
        totalHandBet: 0,
        status: (p.stack > 0 ? "active" : "folded") as PlayerStatus,
        position: positions[idx],
        isDealer: idx === nextDealerIdx,
        isCurrentTurn: false,
      }));

      // Collect Blinds & Ante
      const sbIdx = count === 2 ? nextDealerIdx : (nextDealerIdx + 1) % count;
      const bbIdx = count === 2 ? (nextDealerIdx + 1) % count : (nextDealerIdx + 2) % count;

      const sbAmount = Math.min(state.config.smallBlind, updatedPlayers[sbIdx].stack);
      const bbAmount = Math.min(state.config.bigBlind, updatedPlayers[bbIdx].stack);

      // Deduct SB
      updatedPlayers[sbIdx] = {
        ...updatedPlayers[sbIdx],
        stack: updatedPlayers[sbIdx].stack - sbAmount,
        currentRoundBet: sbAmount,
        totalHandBet: sbAmount,
        status: updatedPlayers[sbIdx].stack - sbAmount === 0 ? "allin" : "active",
      };

      // Deduct BB
      updatedPlayers[bbIdx] = {
        ...updatedPlayers[bbIdx],
        stack: updatedPlayers[bbIdx].stack - bbAmount,
        currentRoundBet: bbAmount,
        totalHandBet: bbAmount,
        status: updatedPlayers[bbIdx].stack - bbAmount === 0 ? "allin" : "active",
      };

      // Deduct Ante if configured
      if (state.config.ante > 0) {
        updatedPlayers = updatedPlayers.map((p) => {
          if (p.stack <= 0) return p;
          const anteToPay = Math.min(state.config.ante, p.stack);
          return {
            ...p,
            stack: p.stack - anteToPay,
            totalHandBet: p.totalHandBet + anteToPay,
            status: p.stack - anteToPay === 0 ? "allin" : p.status,
          };
        });
      }

      // Action starts UTG (left of BB)
      const firstActionIdx = count === 2 ? sbIdx : (bbIdx + 1) % count;
      const activeIdx = updatedPlayers[firstActionIdx].status === "active"
        ? firstActionIdx
        : getNextActiveIndex(updatedPlayers, firstActionIdx);

      updatedPlayers[activeIdx] = {
        ...updatedPlayers[activeIdx],
        isCurrentTurn: true,
      };

      const potContributions = updatedPlayers.map((p) => ({
        id: p.id,
        name: p.name,
        totalContributed: p.totalHandBet,
        isFolded: p.status === "folded",
        isAllIn: p.status === "allin",
      }));

      const potCalc = calculateSidePots(potContributions);

      set({
        players: updatedPlayers,
        dealerIndex: nextDealerIdx,
        currentStreet: "preflop",
        activePlayerIndex: activeIdx,
        currentRoundHighestBet: state.config.bigBlind,
        lastRaiseDelta: state.config.bigBlind,
        pots: potCalc.pots,
        totalPot: potCalc.totalPot,
        uncalledRefunds: potCalc.uncalledRefunds,
        isHandInProgress: true,
        actionLog: [
          {
            playerId: updatedPlayers[sbIdx].id,
            playerName: updatedPlayers[sbIdx].name,
            action: "bet",
            amount: sbAmount,
            street: "preflop",
            timestamp: Date.now(),
          },
          {
            playerId: updatedPlayers[bbIdx].id,
            playerName: updatedPlayers[bbIdx].name,
            action: "raise",
            amount: bbAmount,
            street: "preflop",
            timestamp: Date.now(),
          },
        ],
        history: [],
      });
    },

    performAction: (action, raiseTotalAmount) => {
      const state = get();
      if (!state.isHandInProgress) return;

      const player = state.players[state.activePlayerIndex];
      if (!player || player.status !== "active") return;

      // Save immutable snapshot for Undo
      const snapshot: TableSnapshot = {
        players: state.players,
        currentStreet: state.currentStreet,
        activePlayerIndex: state.activePlayerIndex,
        dealerIndex: state.dealerIndex,
        currentRoundHighestBet: state.currentRoundHighestBet,
        lastRaiseDelta: state.lastRaiseDelta,
        pots: state.pots,
        totalPot: state.totalPot,
        uncalledRefunds: state.uncalledRefunds,
        actionLog: state.actionLog,
        isHandInProgress: state.isHandInProgress,
      };

      let newStack = player.stack;
      let newRoundBet = player.currentRoundBet;
      let newTotalBet = player.totalHandBet;
      let newStatus: PlayerStatus = player.status;
      let newHighestBet = state.currentRoundHighestBet;
      let newLastRaiseDelta = state.lastRaiseDelta;
      let actionAmount = 0;

      if (action === "fold") {
        newStatus = "folded";
      } else if (action === "check") {
        actionAmount = 0;
      } else if (action === "call") {
        const callNeeded = state.currentRoundHighestBet - player.currentRoundBet;
        actionAmount = Math.min(callNeeded, player.stack);
        newStack -= actionAmount;
        newRoundBet += actionAmount;
        newTotalBet += actionAmount;
        if (newStack === 0) newStatus = "allin";
      } else if (action === "bet" || action === "raise" || action === "allin") {
        const targetBet = raiseTotalAmount ?? state.currentRoundHighestBet + state.lastRaiseDelta;
        const additionalChips = targetBet - player.currentRoundBet;
        actionAmount = Math.min(additionalChips, player.stack);
        newStack -= actionAmount;
        newRoundBet += actionAmount;
        newTotalBet += actionAmount;

        if (newRoundBet > newHighestBet) {
          newLastRaiseDelta = newRoundBet - newHighestBet;
          newHighestBet = newRoundBet;
        }

        if (newStack === 0) newStatus = "allin";
      }

      // Update current player
      const updatedPlayers = state.players.map((p, idx) => {
        if (idx === state.activePlayerIndex) {
          return {
            ...p,
            stack: newStack,
            currentRoundBet: newRoundBet,
            totalHandBet: newTotalBet,
            status: newStatus,
            isCurrentTurn: false,
          };
        }
        return p;
      });

      // Recalculate pots & side pots
      const potContributions = updatedPlayers.map((p) => ({
        id: p.id,
        name: p.name,
        totalContributed: p.totalHandBet,
        isFolded: p.status === "folded",
        isAllIn: p.status === "allin",
      }));
      const potCalc = calculateSidePots(potContributions);

      const newActionLog: PlayerActionRecord = {
        playerId: player.id,
        playerName: player.name,
        action,
        amount: actionAmount,
        street: state.currentStreet,
        timestamp: Date.now(),
      };

      // Check if hand is won because everyone folded
      const nonFolded = updatedPlayers.filter((p) => p.status !== "folded");
      if (nonFolded.length === 1) {
        const winner = nonFolded[0];
        const winnerIndex = updatedPlayers.findIndex((p) => p.id === winner.id);
        const awardedStack = winner.stack + potCalc.totalPot;
        updatedPlayers[winnerIndex] = {
          ...updatedPlayers[winnerIndex],
          stack: awardedStack,
        };

        set({
          players: updatedPlayers,
          pots: potCalc.pots,
          totalPot: potCalc.totalPot,
          isHandInProgress: false,
          currentStreet: "showdown",
          actionLog: [...state.actionLog, newActionLog],
          history: [...state.history, snapshot],
        });
        return;
      }

      // Check if betting round is complete:
      // All non-folded players must have either acted and matched the highest bet, or are all-in.
      const activePlayers = updatedPlayers.filter((p) => p.status === "active");
      const isRoundFinished = activePlayers.every(
        (p) => p.currentRoundBet === newHighestBet
      );

      // If active players have matched bets, advance street!
      if (isRoundFinished) {
        const nextStreetMap: Record<Street, Street> = {
          preflop: "flop",
          flop: "turn",
          turn: "river",
          river: "showdown",
          showdown: "showdown",
        };
        const nextStreet = nextStreetMap[state.currentStreet];

        if (nextStreet === "showdown" || activePlayers.length <= 1) {
          // Move to Showdown!
          set({
            players: updatedPlayers.map((p) => ({ ...p, isCurrentTurn: false })),
            currentStreet: "showdown",
            pots: potCalc.pots,
            totalPot: potCalc.totalPot,
            uncalledRefunds: potCalc.uncalledRefunds,
            actionLog: [...state.actionLog, newActionLog],
            history: [...state.history, snapshot],
          });
          return;
        }

        // Advance to next street: reset round bets to 0
        const streetResetPlayers = updatedPlayers.map((p) => ({
          ...p,
          currentRoundBet: 0,
        }));

        // First active player after dealer button
        const firstStreetPlayerIdx = getNextActiveIndex(
          streetResetPlayers,
          state.dealerIndex
        );

        streetResetPlayers[firstStreetPlayerIdx] = {
          ...streetResetPlayers[firstStreetPlayerIdx],
          isCurrentTurn: true,
        };

        set({
          players: streetResetPlayers,
          currentStreet: nextStreet,
          activePlayerIndex: firstStreetPlayerIdx,
          currentRoundHighestBet: 0,
          lastRaiseDelta: state.config.bigBlind,
          pots: potCalc.pots,
          totalPot: potCalc.totalPot,
          uncalledRefunds: potCalc.uncalledRefunds,
          actionLog: [...state.actionLog, newActionLog],
          history: [...state.history, snapshot],
        });
        return;
      }

      // Otherwise, pass turn to next active player
      const nextActiveIdx = getNextActiveIndex(
        updatedPlayers,
        state.activePlayerIndex
      );

      updatedPlayers[nextActiveIdx] = {
        ...updatedPlayers[nextActiveIdx],
        isCurrentTurn: true,
      };

      set({
        players: updatedPlayers,
        activePlayerIndex: nextActiveIdx,
        currentRoundHighestBet: newHighestBet,
        lastRaiseDelta: newLastRaiseDelta,
        pots: potCalc.pots,
        totalPot: potCalc.totalPot,
        uncalledRefunds: potCalc.uncalledRefunds,
        actionLog: [...state.actionLog, newActionLog],
        history: [...state.history, snapshot],
      });
    },

    advanceStreet: () => {
      const state = get();
      const nextStreetMap: Record<Street, Street> = {
        preflop: "flop",
        flop: "turn",
        turn: "river",
        river: "showdown",
        showdown: "showdown",
      };
      const nextStreet = nextStreetMap[state.currentStreet];

      const streetResetPlayers = state.players.map((p) => ({
        ...p,
        currentRoundBet: 0,
      }));

      const firstActiveIdx = getNextActiveIndex(
        streetResetPlayers,
        state.dealerIndex
      );

      streetResetPlayers[firstActiveIdx] = {
        ...streetResetPlayers[firstActiveIdx],
        isCurrentTurn: nextStreet !== "showdown",
      };

      set({
        players: streetResetPlayers,
        currentStreet: nextStreet,
        activePlayerIndex: firstActiveIdx,
        currentRoundHighestBet: 0,
        lastRaiseDelta: state.config.bigBlind,
      });
    },

    resolveShowdown: (allocations) => {
      const state = get();
      const count = state.players.length;
      const orderFromDealer = Array.from(
        { length: count },
        (_, i) => state.players[(state.dealerIndex + 1 + i) % count].id
      );

      const stackGains: Record<string, number> = {};

      for (const alloc of allocations) {
        const targetPot = state.pots.find((p) => p.id === alloc.potId);
        if (!targetPot || alloc.winnerIds.length === 0) continue;

        const potPayout = distributePot(
          targetPot.amount,
          alloc.winnerIds,
          orderFromDealer
        );

        for (const [playerId, amount] of Object.entries(potPayout)) {
          stackGains[playerId] = (stackGains[playerId] ?? 0) + amount;
        }
      }

      // Add uncalled refunds back to owners
      for (const [playerId, amount] of Object.entries(state.uncalledRefunds)) {
        stackGains[playerId] = (stackGains[playerId] ?? 0) + amount;
      }

      const updatedPlayers: Player[] = state.players.map((p) => ({
        ...p,
        stack: p.stack + (stackGains[p.id] ?? 0),
        currentRoundBet: 0,
        totalHandBet: 0,
        status: (p.stack + (stackGains[p.id] ?? 0) > 0 ? "active" : "folded") as PlayerStatus,
        isCurrentTurn: false,
      }));

      set({
        players: updatedPlayers,
        pots: [],
        totalPot: 0,
        uncalledRefunds: {},
        isHandInProgress: false,
        currentStreet: "showdown",
        handNumber: state.handNumber + 1,
      });
    },

    undoLastAction: () => {
      const state = get();
      if (state.history.length === 0) return;

      const previousSnapshot = state.history[state.history.length - 1];
      const remainingHistory = state.history.slice(0, -1);

      set({
        players: previousSnapshot.players,
        currentStreet: previousSnapshot.currentStreet,
        activePlayerIndex: previousSnapshot.activePlayerIndex,
        dealerIndex: previousSnapshot.dealerIndex,
        currentRoundHighestBet: previousSnapshot.currentRoundHighestBet,
        lastRaiseDelta: previousSnapshot.lastRaiseDelta,
        pots: previousSnapshot.pots,
        totalPot: previousSnapshot.totalPot,
        uncalledRefunds: previousSnapshot.uncalledRefunds,
        actionLog: previousSnapshot.actionLog,
        isHandInProgress: previousSnapshot.isHandInProgress,
        history: remainingHistory,
      });
    },
  };
});
