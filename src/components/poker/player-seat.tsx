import React from "react";
import type { Player } from "@/types/poker";
import { formatChips } from "@/utils/format-chips";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { cn } from "@/utils/cn";

export interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  isDealer: boolean;
  className?: string;
}

export function PlayerSeat({
  player,
  isCurrentTurn,
  isDealer,
  className,
}: PlayerSeatProps) {
  const isFolded = player.status === "folded";
  const isAllIn = player.status === "allin";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center transition-all duration-300",
        isFolded && "opacity-40 grayscale",
        className
      )}
    >
      {/* Current Round Bet Floating Chip Tag (Placed toward center) */}
      {player.currentRoundBet > 0 && (
        <div className="absolute -top-6 sm:-top-7 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold text-canvas border border-gold-glow shadow-md text-[10px] sm:text-xs font-black tabular-nums animate-bounce-short">
          <Coins className="w-3 h-3 fill-current" />
          <span>{formatChips(player.currentRoundBet)}</span>
        </div>
      )}

      {/* Main Seat Card */}
      <div
        className={cn(
          "relative flex flex-col items-center p-1.5 sm:p-2 rounded-xl border min-w-[76px] sm:min-w-[96px] shadow-lg backdrop-blur-md transition-all",
          isCurrentTurn
            ? "bg-surface border-gold ring-2 ring-gold/60 shadow-[0_0_15px_rgba(234,179,8,0.35)] scale-105"
            : "bg-surface/90 border-border hover:border-gold/30",
          isAllIn && "border-purple ring-1 ring-purple/50"
        )}
      >
        {/* Dealer Button Chip */}
        {isDealer && (
          <div
            className="absolute -top-2 -left-2 z-30 w-5 h-5 rounded-full bg-gold text-canvas border border-canvas font-black text-[9px] flex items-center justify-center shadow-md"
            title="Dealer Button (BTN)"
          >
            D
          </div>
        )}

        {/* Turn Active Pulsing Dot */}
        {isCurrentTurn && (
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-gold animate-ping" />
        )}

        {/* Player Name & Role */}
        <div className="w-full flex items-center justify-between gap-1 text-[10px] sm:text-[11px] mb-0.5">
          <span className="font-extrabold text-primary truncate max-w-[55px] sm:max-w-[65px]">
            {player.name}
          </span>
          <span className="text-[9px] font-bold text-secondary uppercase">
            {player.position}
          </span>
        </div>

        {/* Remaining Chip Stack */}
        <div className="w-full flex items-center justify-center gap-1 font-mono font-black text-xs sm:text-sm text-gold tabular-nums">
          <span>{formatChips(player.stack)}</span>
        </div>

        {/* Status Tag (Folded / All-in) */}
        {isFolded ? (
          <Badge variant="crimson" size="sm" className="mt-1 text-[8px] py-0 px-1">
            FOLD
          </Badge>
        ) : isAllIn ? (
          <Badge variant="purple" size="sm" className="mt-1 text-[8px] py-0 px-1">
            ALL-IN
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
