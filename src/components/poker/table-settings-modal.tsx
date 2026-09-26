import React, { useState } from "react";
import type { TableConfig, Player } from "@/types/poker";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus, Save } from "lucide-react";

export interface TableSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TableConfig;
  players: readonly Player[];
  onSave: (config: TableConfig, players: readonly { name: string; stack: number }[]) => void;
}

export function TableSettingsModal({
  isOpen,
  onClose,
  config,
  players,
  onSave,
}: TableSettingsModalProps) {
  const [sb, setSb] = useState<number>(config.smallBlind);
  const [bb, setBb] = useState<number>(config.bigBlind);
  const [ante, setAnte] = useState<number>(config.ante);

  const [playerList, setPlayerList] = useState<Array<{ name: string; stack: number }>>(
    players.map((p) => ({ name: p.name, stack: p.stack }))
  );

  const handleAddPlayer = () => {
    if (playerList.length >= 10) return;
    setPlayerList([
      ...playerList,
      { name: `Player ${playerList.length + 1}`, stack: 1000 },
    ]);
  };

  const handleRemovePlayer = (index: number) => {
    if (playerList.length <= 2) return;
    setPlayerList(playerList.filter((_, idx) => idx !== index));
  };

  const handlePlayerChange = (
    index: number,
    field: "name" | "stack",
    value: string | number
  ) => {
    const updated = [...playerList];
    if (field === "name") {
      updated[index].name = String(value);
    } else {
      updated[index].stack = Math.max(0, Number(value));
    }
    setPlayerList(updated);
  };

  const handleSave = () => {
    const newConfig: TableConfig = {
      smallBlind: Math.max(1, sb),
      bigBlind: Math.max(2, bb),
      ante: Math.max(0, ante),
      minRaiseAmount: Math.max(2, bb),
    };
    onSave(newConfig, playerList);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Meja Poker"
      description="Konfigurasi nominal blind, ante, dan daftar pemain serta chip stack."
    >
      <div className="space-y-5">
        {/* Blinds & Ante Config */}
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Small Blind (Rp)"
            type="number"
            value={sb}
            onChange={(e) => setSb(Number(e.target.value))}
          />
          <Input
            label="Big Blind (Rp)"
            type="number"
            value={bb}
            onChange={(e) => setBb(Number(e.target.value))}
          />
          <Input
            label="Ante (Rp)"
            type="number"
            value={ante}
            onChange={(e) => setAnte(Number(e.target.value))}
          />
        </div>

        {/* Players List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
              Daftar Pemain ({playerList.length} / 10)
            </h3>
            {playerList.length < 10 && (
              <button
                type="button"
                onClick={handleAddPlayer}
                className="flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-glow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Pemain</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {playerList.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-surface-muted/50 border border-border/60"
              >
                <span className="text-xs font-bold text-muted w-5">#{idx + 1}</span>
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handlePlayerChange(idx, "name", e.target.value)}
                  className="flex-1 h-9 px-2 text-xs bg-surface border border-border rounded-lg text-primary"
                  placeholder="Nama Pemain"
                />
                <input
                  type="number"
                  value={player.stack}
                  onChange={(e) => handlePlayerChange(idx, "stack", e.target.value)}
                  className="w-24 h-9 px-2 text-xs bg-surface border border-border rounded-lg text-primary tabular-nums text-right"
                  placeholder="Stack (Rp)"
                />
                {playerList.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(idx)}
                    className="p-1.5 rounded-lg text-muted hover:text-crimson transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button variant="gold" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
