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
    <div className="flex flex-col items-center justify-center p-1.5 xs:p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-canvas/75 border border-border/80 backdrop-blur-md shadow-lg max-w-[200px] xs:max-w-[250px] sm:max-w-sm w-full mx-auto select-none">
      {/* Total Pot Header */}
      <div className="flex items-center gap-1.5">
        <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold animate-pulse" />
        <span className="text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-secondary">
          Total Pot
        </span>
      </div>

      <div className="text-lg xs:text-2xl sm:text-3xl font-extrabold text-gold tracking-tight tabular-nums mt-0.5 drop-shadow-sm">
        {formatChips(totalPot)}
      </div>

      {/* Main Pot & Side Pots breakdown */}
      {pots.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 mt-1 sm:mt-2 w-full pt-1 sm:pt-1.5 border-t border-border/40">
          {pots.map((pot) => {
            const isMain = pot.name === "Main Pot";
            const eligibleNames = pot.eligiblePlayerIds
              .map((id) => playerNames[id] || id)
              .join(", ");

            return (
              <div
                key={pot.id}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg bg-surface/90 border border-border/60 text-[10px] sm:text-xs"
                title={`Berhak: ${eligibleNames}`}
              >
                <Badge
                  variant={isMain ? "gold" : "purple"}
                  size="sm"
                  className="font-bold text-[8px] sm:text-[10px] py-0 px-1"
                >
                  {pot.name}
                </Badge>
                <span className="font-bold text-primary tabular-nums text-[10px] sm:text-xs">
                  {formatChips(pot.amount)}
                </span>
                <span className="text-[9px] text-muted hidden sm:inline">
                  ({pot.eligiblePlayerIds.length} pemain)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
