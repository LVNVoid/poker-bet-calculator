import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getLegalActions } from "./bet-rules.js";
import type { Player, TableConfig } from "@/types/poker";

describe("getLegalActions", () => {
  const config: TableConfig = {
    smallBlind: 10,
    bigBlind: 20,
    ante: 0,
    minRaiseAmount: 20,
  };

  const samplePlayer: Player = {
    id: "p1",
    name: "Alice",
    seatNumber: 1,
    stack: 1000,
    currentRoundBet: 0,
    totalHandBet: 0,
    status: "active",
    position: "BTN",
    isDealer: true,
    isCurrentTurn: true,
  };

  it("should allow Check and Bet when no bet has been made in current round", () => {
    const actions = getLegalActions(samplePlayer, 0, 20, 100, config);
    assert.equal(actions.canCheck, true);
    assert.equal(actions.canFold, false);
    assert.equal(actions.canCall, false);
    assert.equal(actions.canBet, true);
    assert.equal(actions.minRaiseTotal, 20); // 1 BB min bet
  });

  it("should allow Fold, Call, and Raise when facing a bet", () => {
    const actions = getLegalActions(samplePlayer, 50, 30, 200, config);
    assert.equal(actions.canCheck, false);
    assert.equal(actions.canFold, true);
    assert.equal(actions.canCall, true);
    assert.equal(actions.callAmount, 50);
    assert.equal(actions.canRaise, true);
    assert.equal(actions.minRaiseTotal, 80); // 50 + 30
    assert.ok(actions.potOddsPercentage !== null);
  });

  it("should handle short stack all-in call", () => {
    const shortPlayer: Player = {
      ...samplePlayer,
      stack: 30,
    };
    const actions = getLegalActions(shortPlayer, 100, 50, 300, config);
    assert.equal(actions.canCall, true);
    assert.equal(actions.callAmount, 30); // capped at stack
    assert.equal(actions.canRaise, false); // cannot raise beyond stack
  });
});
