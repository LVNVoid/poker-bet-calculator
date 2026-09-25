import React from "react";
import type { Pot } from "@/types/poker";
import { formatChips } from "@/utils/format-chips";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";

export interface PotDisplayProps {
  totalPot: number;
  pots: readonly Pot[];
  playerNames: Readonly<Record<string, string>>;
}

export function PotDisplay({ totalPot, pots, playerNames }: PotDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-canvas/60 border border-border/80 backdrop-blur-md shadow-lg max-w-sm w-full mx-auto select-none">
      {/* Total Pot */}
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-gold animate-pulse" />
        <span className="text-xs uppercase tracking-widest font-bold text-secondary">
          Total Pot
        </span>
      </div>
      <div className="text-3xl font-extrabold text-gold tracking-tight tabular-nums mt-0.5">
        {formatChips(totalPot)}
      </div>

      {/* Main Pot & Side Pots breakdown */}
      {pots.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 w-full pt-2 border-t border-border/40">
          {pots.map((pot) => {
            const isMain = pot.name === "Main Pot";
            const eligibleNames = pot.eligiblePlayerIds
              .map((id) => playerNames[id] || id)
              .join(", ");

            return (
              <div
                key={pot.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface/80 border border-border/60 text-xs"
                title={`Berhak: ${eligibleNames}`}
              >
                <Badge
                  variant={isMain ? "gold" : "purple"}
                  size="sm"
                  className="font-bold text-[10px]"
                >
                  {pot.name}
                </Badge>
                <span className="font-bold text-primary tabular-nums">
                  {formatChips(pot.amount)}
                </span>
                <span className="text-[10px] text-muted hidden sm:inline">
                  ({pot.eligiblePlayerIds.length} players)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
