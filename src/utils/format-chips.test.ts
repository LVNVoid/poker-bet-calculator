import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatChips } from "./format-chips.js";

describe("formatChips in Rupiah", () => {
  it("should format 0 as Rp 0", () => {
    assert.equal(formatChips(0), "Rp 0");
  });

  it("should format standard nominals with Indonesian thousand dots", () => {
    assert.equal(formatChips(1000), "Rp 1.000");
    assert.equal(formatChips(20000), "Rp 20.000");
    assert.equal(formatChips(1500000), "Rp 1.500.000");
  });

  it("should format compact Rupiah correctly when requested", () => {
    assert.equal(formatChips(1000, true), "Rp 1 rb");
    assert.equal(formatChips(50000, true), "Rp 50 rb");
    assert.equal(formatChips(2500000, true), "Rp 2,5 jt");
  });
});
