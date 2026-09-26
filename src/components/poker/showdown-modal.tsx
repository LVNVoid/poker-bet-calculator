import React, { useState, useEffect } from "react";
import type { Pot, Player } from "@/types/poker";
import { formatChips } from "@/utils/format-chips";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ShowdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  pots: readonly Pot[];
  players: readonly Player[];
  onConfirmPayout: (allocations: readonly { potId: string; winnerIds: readonly string[] }[]) => void;
}

export function ShowdownModal({
  isOpen,
  onClose,
  pots,
  players,
  onConfirmPayout,
}: ShowdownModalProps) {
  // Map of potId -> array of selected winner playerIds
  const [winnerSelections, setWinnerSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Default selection: empty or first eligible player
    const initial: Record<string, string[]> = {};
    for (const pot of pots) {
      if (pot.eligiblePlayerIds.length === 1) {
        initial[pot.id] = [pot.eligiblePlayerIds[0]];
      } else {
        initial[pot.id] = [];
      }
    }
    setWinnerSelections(initial);
  }, [pots, isOpen]);

  const toggleWinner = (potId: string, playerId: string) => {
    const current = winnerSelections[potId] ?? [];
    if (current.includes(playerId)) {
      setWinnerSelections({
        ...winnerSelections,
        [potId]: current.filter((id) => id !== playerId),
      });
    } else {
      setWinnerSelections({
        ...winnerSelections,
        [potId]: [...current, playerId],
      });
    }
  };

  const isAllPotsAllocated =
    pots.length > 0 &&
    pots.every((p) => (winnerSelections[p.id]?.length ?? 0) > 0);

  const handleConfirm = () => {
    if (!isAllPotsAllocated) return;
    const allocations = pots.map((p) => ({
      potId: p.id,
      winnerIds: winnerSelections[p.id],
    }));
    onConfirmPayout(allocations);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Showdown & Pembagian Pot"
      description="Pilih pemenang untuk setiap pot (bisa pilih lebih dari 1 untuk split pot)."
    >
      <div className="space-y-4 select-none">
        {pots.map((pot) => {
          const eligiblePlayers = players.filter((p) =>
            pot.eligiblePlayerIds.includes(p.id)
          );
          const selectedWinners = winnerSelections[pot.id] ?? [];

          return (
            <div
              key={pot.id}
              className="p-3.5 rounded-2xl bg-surface-muted/60 border border-border"
            >
              {/* Pot Title & Amount */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold" />
                  <span className="font-bold text-sm text-primary">{pot.name}</span>
                </div>
                <Badge variant="gold" size="md" className="font-black tabular-nums">
                  {formatChips(pot.amount)}
                </Badge>
              </div>

              {/* Eligible Players Selection Buttons */}
              <div className="text-xs text-secondary mb-2 font-medium">
                Pilih Pemenang (Klik untuk memilih / toggle split pot):
              </div>
              <div className="grid grid-cols-2 gap-2">
                {eligiblePlayers.map((player) => {
                  const isSelected = selectedWinners.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => toggleWinner(pot.id, player.id)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all",
                        isSelected
                          ? "bg-gold text-canvas border-gold shadow-md font-black"
                          : "bg-surface border-border text-secondary hover:text-primary hover:border-gold/40"
                      )}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span className="truncate">{player.name}</span>
                      </div>
                      <span className="text-[10px] opacity-80 uppercase">
                        {player.position}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant="gold"
            size="lg"
            disabled={!isAllPotsAllocated}
            onClick={handleConfirm}
            className="flex-1 max-w-xs font-black shadow-lg"
          >
            Selesaikan & Bagikan Pot
          </Button>
        </div>
      </div>
    </Modal>
  );
}
