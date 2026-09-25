import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSidePots,
  distributePot,
  type PlayerPotContribution,
} from "./side-pot-calculator.js";

describe("calculateSidePots", () => {
  it("should handle simple pot with equal bets and no all-ins", () => {
    const players: PlayerPotContribution[] = [
      { id: "p1", name: "Alice", totalContributed: 200, isFolded: false, isAllIn: false },
      { id: "p2", name: "Bob", totalContributed: 200, isFolded: false, isAllIn: false },
      { id: "p3", name: "Charlie", totalContributed: 200, isFolded: false, isAllIn: false },
    ];

    const result = calculateSidePots(players);

    assert.equal(result.pots.length, 1);
    assert.equal(result.pots[0].name, "Main Pot");
    assert.equal(result.pots[0].amount, 600);
    assert.deepEqual(result.pots[0].eligiblePlayerIds, ["p1", "p2", "p3"]);
    assert.equal(result.totalPot, 600);
    assert.deepEqual(result.uncalledRefunds, {});
  });

  it("should handle blinds preflop with no all-ins into single Main Pot", () => {
    const players: PlayerPotContribution[] = [
      { id: "p1", name: "SB", totalContributed: 10, isFolded: false, isAllIn: false },
      { id: "p2", name: "BB", totalContributed: 20, isFolded: false, isAllIn: false },
    ];

    const result = calculateSidePots(players);

    assert.equal(result.pots.length, 1);
    assert.equal(result.pots[0].name, "Main Pot");
    assert.equal(result.pots[0].amount, 30);
    assert.deepEqual(result.pots[0].eligiblePlayerIds, ["p1", "p2"]);
    assert.equal(result.totalPot, 30);
  });

  it("should handle folded player dead money into main pot", () => {
    const players: PlayerPotContribution[] = [
      { id: "p1", name: "Alice", totalContributed: 100, isFolded: true },
      { id: "p2", name: "Bob", totalContributed: 300, isFolded: false, isAllIn: false },
      { id: "p3", name: "Charlie", totalContributed: 300, isFolded: false, isAllIn: false },
    ];

    const result = calculateSidePots(players);

    assert.equal(result.pots.length, 1);
    assert.equal(result.pots[0].name, "Main Pot");
    assert.equal(result.pots[0].amount, 700); // 100 + 300 + 300
    assert.deepEqual(result.pots[0].eligiblePlayerIds, ["p2", "p3"]);
    assert.equal(result.totalPot, 700);
  });

  it("should calculate Main Pot and Side Pot when one player is all-in for short stack", () => {
    const players: PlayerPotContribution[] = [
      { id: "p1", name: "ShortStack", totalContributed: 100, isFolded: false, isAllIn: true },
      { id: "p2", name: "MidStack", totalContributed: 300, isFolded: false, isAllIn: false },
      { id: "p3", name: "BigStack", totalContributed: 300, isFolded: false, isAllIn: false },
    ];

    const result = calculateSidePots(players);

    assert.equal(result.pots.length, 2);

    // Main Pot: 100 * 3 = 300, eligible: p1, p2, p3
    assert.equal(result.pots[0].name, "Main Pot");
    assert.equal(result.pots[0].amount, 300);
    assert.deepEqual(result.pots[0].eligiblePlayerIds, ["p1", "p2", "p3"]);

    // Side Pot 1: (300 - 100) * 2 = 400, eligible: p2, p3
    assert.equal(result.pots[1].name, "Side Pot 1");
    assert.equal(result.pots[1].amount, 400);
    assert.deepEqual(result.pots[1].eligiblePlayerIds, ["p2", "p3"]);

    assert.equal(result.totalPot, 700);
  });

  it("should calculate multi-tiered side pots (3 all-in stacks + caller)", () => {
    const players: PlayerPotContribution[] = [
      { id: "p1", name: "P1", totalContributed: 50, isFolded: false, isAllIn: true },
      { id: "p2", name: "P2", totalContributed: 150, isFolded: false, isAllIn: true },
      { id: "p3", name: "P3", totalContributed: 300, isFolded: false, isAllIn: true },
      { id: "p4", name: "P4", totalContributed: 300, isFolded: false, isAllIn: false },
      { id: "p5", name: "FoldedGuy", totalContributed: 75, isFolded: true },
    ];

    const result = calculateSidePots(players);

    assert.equal(result.pots.length, 3);
    assert.equal(result.pots[0].amount, 250);
    assert.deepEqual(result.pots[0].eligiblePlayerIds, ["p1", "p2", "p3", "p4"]);

    assert.equal(result.pots[1].amount, 325);
    assert.deepEqual(result.pots[1].eligiblePlayerIds, ["p2", "p3", "p4"]);

    assert.equal(result.pots[2].amount, 300);
    assert.deepEqual(result.pots[2].eligiblePlayerIds, ["p3", "p4"]);

    assert.equal(result.totalPot, 875);
    assert.equal(result.pots[0].amount + result.pots[1].amount + result.pots[2].amount, 875);
  });

  it("should refund uncalled bets if one player bets more than everyone else", () => {
    const players: PlayerPotContribution[] = [
      { id: "p1", name: "AllInP1", totalContributed: 100, isFolded: false, isAllIn: true },
      { id: "p2", name: "AllInP2", totalContributed: 200, isFolded: false, isAllIn: true },
      { id: "p3", name: "OverBettor", totalContributed: 500, isFolded: false, isAllIn: false }, // 300 is uncalled!
    ];

    const result = calculateSidePots(players);

    assert.equal(result.pots.length, 2);
    assert.equal(result.pots[0].amount, 300);
    assert.equal(result.pots[1].amount, 200);
    assert.equal(result.totalPot, 500);
    assert.equal(result.uncalledRefunds["p3"], 300);
    assert.equal(result.totalPot + result.uncalledRefunds["p3"], 100 + 200 + 500);
  });

  it("should award entire pot to sole survivor if everyone else folds", () => {
    const players: PlayerPotContribution[] = [
      { id: "p1", name: "Winner", totalContributed: 50, isFolded: false },
      { id: "p2", name: "Folder1", totalContributed: 50, isFolded: true },
      { id: "p3", name: "Folder2", totalContributed: 20, isFolded: true },
    ];

    const result = calculateSidePots(players);

    assert.equal(result.pots.length, 1);
    assert.equal(result.pots[0].amount, 120);
    assert.deepEqual(result.pots[0].eligiblePlayerIds, ["p1"]);
  });
});

describe("distributePot", () => {
  it("should divide pot equally among winners", () => {
    const payout = distributePot(300, ["p1", "p2", "p3"], ["p1", "p2", "p3"]);
    assert.deepEqual(payout, { p1: 100, p2: 100, p3: 100 });
  });

  it("should allocate odd chip to player closest to dealer left", () => {
    const payout = distributePot(100, ["p1", "p2", "p3"], ["p2", "p3", "p1"]);
    assert.equal(payout["p2"], 34);
    assert.equal(payout["p3"], 33);
    assert.equal(payout["p1"], 33);
    assert.equal(payout["p1"] + payout["p2"] + payout["p3"], 100);
  });
});
