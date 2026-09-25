import React from "react";
import type { Player } from "@/types/poker";
import { formatChips } from "@/utils/format-chips";
import { Badge } from "@/components/ui/badge";
import { Coins, CircleDot } from "lucide-react";
import { cn } from "@/utils/cn";

export interface PlayerListViewProps {
  players: readonly Player[];
}

export function PlayerListView({ players }: PlayerListViewProps) {
  return (
    <div className="w-full max-w-lg mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
      {players.map((player) => {
        const isFolded = player.status === "folded";
        const isAllIn = player.status === "allin";
        const isTurn = player.isCurrentTurn;

        return (
          <div
            key={player.id}
            className={cn(
              "p-2.5 rounded-xl bg-surface border transition-all flex flex-col justify-between select-none",
              isTurn
                ? "border-gold shadow-gold/20 shadow-md ring-1 ring-gold/40 bg-surface-card"
                : isAllIn
                ? "border-purple shadow-purple/20 shadow-sm"
                : "border-border",
              isFolded && "opacity-40 grayscale"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-secondary">
                Seat {player.seatNumber}
              </span>
              <div className="flex items-center gap-1">
                <Badge
                  variant={player.position === "BTN" ? "gold" : "default"}
                  size="sm"
                  className="text-[9px] px-1 py-0"
                >
                  {player.position}
                </Badge>
                {isTurn && (
                  <CircleDot className="w-3 h-3 text-gold animate-pulse" />
                )}
              </div>
            </div>

            <div className="text-xs font-bold text-primary truncate">
              {player.name}
            </div>

            <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40 text-xs">
              <span className="text-[10px] text-muted">Stack:</span>
              <div className="flex items-center gap-1 font-bold text-emerald tabular-nums">
                <Coins className="w-3 h-3 text-emerald" />
                <span>{formatChips(player.stack)}</span>
              </div>
            </div>

            {player.currentRoundBet > 0 && (
              <div className="flex items-center justify-between mt-1 text-[11px] font-bold text-gold">
                <span className="text-[10px] text-muted">Bet:</span>
                <span className="tabular-nums">
                  {formatChips(player.currentRoundBet)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
