import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { usePokerStore } from "./poker-store.js";

describe("usePokerStore", () => {
  beforeEach(() => {
    usePokerStore.getState().resetTable();
  });

  it("should initialize default table with 6 players and 10/20 blinds", () => {
    const state = usePokerStore.getState();
    assert.equal(state.players.length, 6);
    assert.equal(state.config.smallBlind, 10);
    assert.equal(state.config.bigBlind, 20);
    assert.equal(state.isHandInProgress, false);
  });

  it("should deduct blinds and calculate initial pot on startNewHand", () => {
    const store = usePokerStore.getState();
    store.startNewHand();

    const state = usePokerStore.getState();
    assert.equal(state.isHandInProgress, true);
    assert.equal(state.currentStreet, "preflop");
    assert.equal(state.totalPot, 30); // 10 SB + 20 BB
    assert.equal(state.pots.length, 1);
    assert.equal(state.pots[0].amount, 30);
  });

  it("should support undoing player actions", () => {
    const store = usePokerStore.getState();
    store.startNewHand();

    const potBefore = usePokerStore.getState().totalPot;
    store.performAction("call");
    const potAfterCall = usePokerStore.getState().totalPot;
    assert.ok(potAfterCall > potBefore);

    // Undo!
    usePokerStore.getState().undoLastAction();
    const potAfterUndo = usePokerStore.getState().totalPot;
    assert.equal(potAfterUndo, potBefore);
  });
});
