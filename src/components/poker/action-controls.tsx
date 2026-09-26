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
      <div className="w-full max-w-xl mx-auto p-2.5 xs:p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface/95 backdrop-blur-md border border-border flex items-center justify-between gap-2 sm:gap-3 shadow-2xl">
        <Button
          variant="outline"
          size="md"
          onClick={onOpenSettings}
          className="gap-1.5 sm:gap-2 px-2.5 sm:px-3 text-xs sm:text-sm border-border hover:border-gold/50 shrink-0"
        >
          <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
          <span className="hidden xs:inline font-bold">Pengaturan Meja</span>
        </Button>

        <Button
          variant="gold"
          size="lg"
          onClick={onStartHand}
          className="flex-1 max-w-xs gap-1.5 sm:gap-2 text-xs xs:text-sm sm:text-base font-black bg-gradient-to-r from-gold via-amber-400 to-gold-glow text-canvas shadow-[0_0_20px_rgba(234,179,8,0.4)] border border-amber-300 py-2 sm:py-3"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          <span>Mulai Hand Baru</span>
        </Button>

        {canUndo && (
          <Button variant="ghost" size="icon" onClick={onUndo} title="Undo aksi terakhir" className="shrink-0">
            <Undo2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted hover:text-gold" />
          </Button>
        )}
      </div>
    );
  }

  const { canCheck, canFold, canCall, callAmount, canBet, canRaise, minRaiseTotal, maxRaiseTotal, potOddsPercentage, quickBets } = legalActions!;

  const isRaise = canRaise || canBet;
  const raiseLabel = canBet ? "Bet" : "Raise to";

  return (
    <div className="w-full max-w-2xl mx-auto p-2 xs:p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-surface/95 backdrop-blur-md border border-border shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col gap-1.5 xs:gap-2 sm:gap-2.5 select-none">
      {/* Turn Header & Pot Odds info */}
      <div className="flex items-center justify-between text-xs pb-1 sm:pb-1.5 border-b border-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-secondary font-medium text-[11px] sm:text-xs shrink-0">Giliran:</span>
          <span className="font-black text-gold text-xs sm:text-sm truncate drop-shadow-sm">
            {activePlayer.name} ({activePlayer.position})
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {potOddsPercentage !== null && (
            <div className="text-[10px] xs:text-[11px] sm:text-xs">
              <span className="text-muted font-medium">Odds: </span>
              <span className="font-black text-blue tabular-nums">
                {potOddsPercentage}%
              </span>
            </div>
          )}

          {canUndo && (
            <button
              onClick={onUndo}
              className="flex items-center gap-1 text-[10px] xs:text-[11px] sm:text-xs text-muted hover:text-gold transition-colors font-medium"
            >
              <Undo2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Bet Sizing Preset Bar (when raising is legal) */}
      {isRaise && showRaiseSlider && (
        <div className="flex flex-col gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl bg-surface-muted/80 border border-border/80">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.min)}
              className="px-1.5 xs:px-2 py-1 text-[10px] xs:text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all whitespace-nowrap"
            >
              Min ({formatChips(quickBets.min)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.thirdPot)}
              className="px-1.5 xs:px-2 py-1 text-[10px] xs:text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all whitespace-nowrap"
            >
              33% ({formatChips(quickBets.thirdPot)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.halfPot)}
              className="px-1.5 xs:px-2 py-1 text-[10px] xs:text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all whitespace-nowrap"
            >
              50% ({formatChips(quickBets.halfPot)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.twoThirdPot)}
              className="px-1.5 xs:px-2 py-1 text-[10px] xs:text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all whitespace-nowrap"
            >
              67% ({formatChips(quickBets.twoThirdPot)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.fullPot)}
              className="px-1.5 xs:px-2 py-1 text-[10px] xs:text-[11px] font-bold rounded-lg bg-surface border border-border hover:border-gold/60 text-secondary hover:text-primary transition-all whitespace-nowrap"
            >
              Pot ({formatChips(quickBets.fullPot)})
            </button>
            <button
              type="button"
              onClick={() => setRaiseAmount(quickBets.allIn)}
              className="px-1.5 xs:px-2 py-1 text-[10px] xs:text-[11px] font-bold rounded-lg bg-purple/20 border border-purple/60 text-purple hover:bg-purple/30 transition-all whitespace-nowrap"
            >
              All-In ({formatChips(quickBets.allIn)})
            </button>
          </div>

          {/* Range Slider & Manual Number Input */}
          <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
            <input
              type="range"
              min={minRaiseTotal}
              max={maxRaiseTotal}
              step={config.bigBlind}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="flex-1 accent-gold h-2 bg-surface rounded-lg cursor-pointer"
            />
            <div className="w-20 xs:w-24 text-right font-black text-gold tabular-nums text-[11px] xs:text-xs sm:text-sm whitespace-nowrap">
              {formatChips(raiseAmount)}
            </div>
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {/* Fold Button (Deep Crimson Velvet) */}
        <Button
          variant="danger"
          size="lg"
          disabled={!canFold && canCheck}
          onClick={() => onAction("fold")}
          className="h-10 sm:h-12 py-2 sm:py-3 text-[11px] xs:text-xs sm:text-sm font-black bg-gradient-to-b from-crimson/90 to-crimson-glow border border-crimson text-white shadow-md active:scale-95"
        >
          Fold
        </Button>

        {/* Check / Call Button (Emerald or Royal Navy) */}
        {canCheck ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => onAction("check")}
            className="h-10 sm:h-12 py-2 sm:py-3 text-[11px] xs:text-xs sm:text-sm font-black bg-gradient-to-b from-emerald/90 to-emerald-glow border border-emerald text-canvas shadow-md active:scale-95"
          >
            Check
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            disabled={!canCall}
            onClick={() => onAction("call")}
            className="h-10 sm:h-12 py-2 sm:py-3 text-[11px] xs:text-xs sm:text-sm font-black bg-gradient-to-b from-blue/90 to-blue-glow border border-blue text-white shadow-md active:scale-95 truncate"
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
              className="h-10 sm:h-12 py-2 sm:py-3 text-[11px] xs:text-xs sm:text-sm font-black bg-gradient-to-r from-gold via-amber-400 to-gold-glow text-canvas border border-amber-300 shadow-[0_0_15px_rgba(234,179,8,0.4)] active:scale-95 truncate"
            >
              Konfirmasi {formatChips(raiseAmount)}
            </Button>
          ) : (
            <Button
              variant="gold"
              size="lg"
              onClick={() => setShowRaiseSlider(true)}
              className="h-10 sm:h-12 py-2 sm:py-3 text-[11px] xs:text-xs sm:text-sm font-black bg-gradient-to-r from-gold via-amber-400 to-gold-glow text-canvas border border-amber-300 shadow-md active:scale-95"
            >
              {raiseLabel}
            </Button>
          )
        ) : (
          <Button
            variant="secondary"
            size="lg"
            disabled
            className="h-10 sm:h-12 py-2 sm:py-3 text-[11px] xs:text-xs sm:text-sm font-bold opacity-40"
          >
            All-In Only
          </Button>
        )}
      </div>
    </div>
  );
}
