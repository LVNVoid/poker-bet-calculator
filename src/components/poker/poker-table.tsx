import React from "react";
import type { Player, Pot, Street } from "@/types/poker";
import { PlayerSeat } from "./player-seat";
import { PotDisplay } from "./pot-display";
import { Badge } from "@/components/ui/badge";

export interface PokerTableProps {
  players: readonly Player[];
  pots: readonly Pot[];
  totalPot: number;
  currentStreet: Street;
  playerNames: Readonly<Record<string, string>>;
}

export function PokerTable({
  players,
  pots,
  totalPot,
  currentStreet,
  playerNames,
}: PokerTableProps) {
  const count = players.length;

  // Calculate polar coordinates for each seat around the oval felt table.
  // We offset by (Math.PI / count) so seats sit symmetrically around left/right
  // without directly blocking the vertical center pot display.
  const getSeatPosition = (index: number) => {
    const angle = Math.PI / 2 + Math.PI / count + (index * (2 * Math.PI)) / count;
    // Oval radii in percentages (Rx: 40%, Ry: 36%)
    const rx = 40;
    const ry = 36;
    const x = 50 + rx * Math.cos(angle);
    const y = 50 + ry * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[48vh] sm:h-[56vh] min-h-[300px] max-h-[460px] flex items-center justify-center p-2 select-none">
      {/* Outer Wooden Armrest Rail */}
      <div className="relative w-full h-full rounded-[9999px] bg-table-rail border-[6px] sm:border-8 border-table-rail-border shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-visible flex items-center justify-center p-2 sm:p-4">
        {/* Inner Green Felt Canvas */}
        <div className="relative w-full h-full rounded-[9999px] bg-table-felt border-2 sm:border-4 border-table-felt-border shadow-[inset_0_0_40px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-visible">
          {/* Subtle Felt Texture Watermark */}
          <div className="absolute inset-0 rounded-[9999px] opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Central Pot & Street Info */}
          <div className="z-10 flex flex-col items-center justify-center gap-1.5 max-w-[240px] sm:max-w-xs text-center pointer-events-none">
            <Badge variant="gold" size="sm" className="font-extrabold tracking-widest text-[9px] py-0 px-2 shadow-sm">
              {currentStreet.toUpperCase()}
            </Badge>

            <PotDisplay
              pots={pots}
              totalPot={totalPot}
              playerNames={playerNames}
            />
          </div>

          {/* Player Seats Positioned in Symmetrical Oval Layout */}
          {players.map((player, idx) => {
            const pos = getSeatPosition(idx);
            return (
              <div
                key={player.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
                style={{ left: pos.left, top: pos.top }}
              >
                <PlayerSeat
                  player={player}
                  isCurrentTurn={player.isCurrentTurn}
                  isDealer={player.isDealer}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
