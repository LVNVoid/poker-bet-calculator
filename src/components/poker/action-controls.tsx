import React, { useState, useEffect } from "react";
import type { Player, TableConfig, ActionType } from "@/types/poker";
import { getLegalActions } from "@/utils/bet-rules";
import { formatChips } from "@/utils/format-chips";
import { Button } from "@/components/ui/button";
import { Undo2, Play, Sliders } from "lucide-react";

export interface ActionControlsProps {
  activePlayer: Player | null;
  currentRoundHighestBet: number;
  lastRaiseDelta: number;
  totalPotSize: number;
  config: TableConfig;
  isHandInProgress: boolean;
  canUndo: boolean;
  onAction: (action: ActionType, raiseTotalAmount?: number) => void;
  onStartHand: () => void;
  onUndo: () => void;
  onOpenSettings: () => void;
}

export function ActionControls({
  activePlayer,
  currentRoundHighestBet,
  lastRaiseDelta,
  totalPotSize,
  config,
  isHandInProgress,
  canUndo,
  onAction,
  onStartHand,
  onUndo,
  onOpenSettings,
}: ActionControlsProps) {
  const [raiseAmount, setRaiseAmount] = useState<number>(0);
  const [showRaiseSlider, setShowRaiseSlider] = useState<boolean>(false);

  const legalActions = activePlayer
    ? getLegalActions(
        activePlayer,
        currentRoundHighestBet,
        lastRaiseDelta,
        totalPotSize,
        config
      )
    : null;

  // Sync initial raise slider value to min-raise whenever active player changes
  useEffect(() => {
    if (legalActions) {
      setRaiseAmount(legalActions.minRaiseTotal);
      setShowRaiseSlider(false);
    }
  }, [activePlayer?.id, currentRoundHighestBet]);

  // If no hand is currently running, show Start New Hand CTA
  if (!isHandInProgress || !activePlayer) {
    return (
      <div className="w-full max-w-xl mx-auto p-3 sm:p-4 rounded-2xl bg-surface/95 backdrop-blur-md border border-border flex items-center justify-between gap-3 shadow-2xl">
        <Button variant="outline" size="md" onClick={onOpenSettings} className="gap-2 border-border hover:border-gold/50">
          <Sliders className="w-4 h-4 text-gold" />
          <span className="hidden sm:inline font-bold">Pengaturan Meja</span>
        </Button>

        <Button
          variant="gold"
          size="lg"
          onClick={onStartHand}
          className="flex-1 max-w-xs gap-2 text-sm sm:text-base font-black bg-gradient-to-r from-gold via-amber-400 to-gold-glow text-canvas shadow-[0_0_20px_rgba(234,179,8,0.4)] border border-amber-300"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Mulai Hand Baru</span>
        </Button>

        {canUndo && (
          <Button variant="ghost" size="icon" onClick={onUndo} title="Undo aksi terakhir">
            <Undo2 className="w-5 h-5 text-muted hover:text-gold" />
          </Button>
        )}
      </div>
    );
  }

  const { canCheck, canFold, canCall, callAmount, canBet, canRaise, minRaiseTotal, maxRaiseTotal, potOddsPercentage, quickBets } = legalActions!;

  const isRaise = canRaise || canBet;
  const raiseLabel = canBet ? "Bet" : "Raise to";

  return (
    <div className="w-full max-w-2xl mx-auto p-2.5 sm:p-3.5 rounded-2xl bg-surface/95 backdrop-blur-md border border-border shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col gap-2.5 select-none">
      {/* Turn Header & Pot Odds info */}
      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="text-secondary font-medium">Giliran:</span>
          <span className="font-black text-gold text-xs sm:text-sm truncate max-w-[170px] drop-shadow-sm">
            {activePlayer.name} ({activePlayer.position})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {potOddsPercentage !== null && (
            <div className="text-[11px] sm:text-xs">
              <span className="text-muted font-medium">Pot Odds: </span>
              <span className="font-black text-blue tabular-nums">
                {potOddsPercentage}%
              </span>
            </div>
          )}

          {canUndo && (
            <button
              onClick={onUndo}
              className="flex items-center gap-1 text-[11px] sm:text-xs text-muted hover:text-gold transition-colors font-medium"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Bet Sizing Preset Bar (when raising is legal) */}
      {isRaise && showRaiseSlider && (
        <div className="flex flex-col gap-2 p-2 rounded-xl bg-surface-muted/80 border border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.min)}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all"
            >
              Min ({formatChips(quickBets.min)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.thirdPot)}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all"
            >
              33% ({formatChips(quickBets.thirdPot)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.halfPot)}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all"
            >
              50% ({formatChips(quickBets.halfPot)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.twoThirdPot)}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all"
            >
              67% ({formatChips(quickBets.twoThirdPot)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.fullPot)}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all"
            >
              Pot ({formatChips(quickBets.fullPot)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.allIn)}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-purple/20 border border-purple/60 text-purple hover:bg-purple/30 transition-all"
            >
              All-In ({formatChips(quickBets.allIn)})
            </button>
          </div>

          {/* Range Slider & Manual Number Input */}
          <div className="flex items-center gap-3 mt-0.5">
            <input
              type="range"
              min={minRaiseTotal}
              max={maxRaiseTotal}
              step={config.bigBlind}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="flex-1 accent-gold h-2 bg-surface rounded-lg cursor-pointer"
            />
            <div className="w-24 text-right font-black text-gold tabular-nums text-xs sm:text-sm">
              {formatChips(raiseAmount)}
            </div>
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {/* Fold Button (Deep Crimson Velvet) */}
        <Button
          variant="danger"
          size="lg"
          disabled={!canFold && canCheck}
          onClick={() => onAction("fold")}
          className="text-xs sm:text-sm font-black bg-gradient-to-b from-crimson/90 to-crimson-glow border border-crimson text-white shadow-md active:scale-95"
        >
          Fold
        </Button>

        {/* Check / Call Button (Emerald or Royal Navy) */}
        {canCheck ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => onAction("check")}
            className="text-xs sm:text-sm font-black bg-gradient-to-b from-emerald/90 to-emerald-glow border border-emerald text-canvas shadow-md active:scale-95"
          >
            Check
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            disabled={!canCall}
            onClick={() => onAction("call")}
            className="text-xs sm:text-sm font-black bg-gradient-to-b from-blue/90 to-blue-glow border border-blue text-white shadow-md active:scale-95"
          >
            Call {formatChips(callAmount)}
          </Button>
        )}

        {/* Bet / Raise Button (Brushed Casino Gold) */}
        {isRaise ? (
          showRaiseSlider ? (
            <Button
              variant="gold"
              size="lg"
              onClick={() => {
                onAction("raise", raiseAmount);
                setShowRaiseSlider(false);
              }}
              className="text-xs sm:text-sm font-black bg-gradient-to-r from-gold via-amber-400 to-gold-glow text-canvas border border-amber-300 shadow-[0_0_15px_rgba(234,179,8,0.4)] active:scale-95"
            >
              Confirm {formatChips(raiseAmount)}
            </Button>
          ) : (
            <Button
              variant="gold"
              size="lg"
              onClick={() => setShowRaiseSlider(true)}
              className="text-xs sm:text-sm font-black bg-gradient-to-r from-gold via-amber-400 to-gold-glow text-canvas border border-amber-300 shadow-md active:scale-95"
            >
              {raiseLabel}
            </Button>
          )
        ) : (
          <Button
            variant="secondary"
            size="lg"
            disabled
            className="text-xs sm:text-sm font-bold opacity-40"
          >
            All-In Only
          </Button>
        )}
      </div>
    </div>
  );
}
