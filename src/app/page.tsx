"use client";

import React, { useState } from "react";
import { usePokerStore } from "@/stores/poker-store";
import { PokerTable } from "@/components/poker/poker-table";
import { PlayerListView } from "@/components/poker/player-list-view";
import { ActionControls } from "@/components/poker/action-controls";
import { TableSettingsModal } from "@/components/poker/table-settings-modal";
import { ShowdownModal } from "@/components/poker/showdown-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sliders,
  RotateCcw,
  LayoutGrid,
  CircleDot,
  History,
  Spade,
} from "lucide-react";
import { formatChips } from "@/utils/format-chips";

export default function PokerCalculatorPage() {
  const {
    config,
    players,
    currentStreet,
    activePlayerIndex,
    currentRoundHighestBet,
    lastRaiseDelta,
    pots,
    totalPot,
    actionLog,
    isHandInProgress,
    handNumber,
    history,
    initTable,
    startNewHand,
    performAction,
    resolveShowdown,
    undoLastAction,
    resetTable,
  } = usePokerStore();

  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isShowdownOpen, setIsShowdownOpen] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);

  // Map of player ID to player name for quick lookups
  const playerNames = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of players) {
      map[p.id] = p.name;
    }
    return map;
  }, [players]);

  const activePlayer = isHandInProgress && players[activePlayerIndex]
    ? players[activePlayerIndex]
    : null;

  // Auto open showdown modal when street reaches showdown and there are pots to allocate
  React.useEffect(() => {
    if (currentStreet === "showdown" && pots.length > 0) {
      setIsShowdownOpen(true);
    }
  }, [currentStreet, pots.length]);

  return (
    <main className="min-h-[100dvh] h-[100dvh] max-h-[100dvh] overflow-hidden bg-canvas text-primary flex flex-col justify-between p-1.5 sm:p-2.5 md:p-4 select-none">
      {/* Top Header Bar */}
      <header className="shrink-0 w-full max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 pb-1.5 sm:pb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 rounded-lg sm:rounded-xl bg-gold/10 border border-gold/40 flex items-center justify-center text-gold shadow-sm">
            <Spade className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-primary flex items-center gap-1.5 truncate">
              <span className="truncate">Hold&apos;em Bet &amp; Pot</span>
              <Badge variant="gold" size="sm" className="hidden xs:inline-flex text-[9px] sm:text-[10px] py-0 px-1.5 shrink-0">
                Hand #{handNumber}
              </Badge>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-secondary truncate">
              Blinds: {formatChips(config.smallBlind)} / {formatChips(config.bigBlind)}
              {config.ante > 0 && ` (Ante: ${formatChips(config.ante)})`}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* View Toggle */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-lg sm:rounded-xl bg-surface-muted/60 border border-border">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-surface text-gold shadow-sm"
                  : "text-muted hover:text-primary"
              }`}
              title="Table Felt View"
            >
              <CircleDot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-surface text-gold shadow-sm"
                  : "text-muted hover:text-primary"
              }`}
              title="List View"
            >
              <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            className="gap-1 px-2 sm:px-2.5 h-7 sm:h-8 text-[11px] sm:text-xs"
            title="Riwayat Aksi"
          >
            <History className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden md:inline">Log</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="gap-1 px-2 sm:px-2.5 h-7 sm:h-8 text-[11px] sm:text-xs"
            title="Pengaturan Meja"
          >
            <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden md:inline">Setting</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={resetTable}
            className="w-7 h-7 sm:w-8 sm:h-8 text-muted hover:text-crimson"
            title="Reset Meja"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </header>

      {/* Main Playing Area */}
      <div className="flex-1 min-h-0 w-full max-w-5xl mx-auto my-1 flex flex-col justify-center items-center overflow-hidden">
        {viewMode === "table" ? (
          <PokerTable
            players={players}
            pots={pots}
            totalPot={totalPot}
            currentStreet={currentStreet}
            playerNames={playerNames}
          />
        ) : (
          <div className="w-full h-full overflow-y-auto space-y-4 pr-1">
            <div className="flex justify-center sticky top-0 z-10 py-1 bg-canvas/90 backdrop-blur-sm">
              <Badge variant="gold" size="md" className="font-extrabold tracking-widest text-xs">
                {currentStreet.toUpperCase()} • TOTAL POT: {formatChips(totalPot)}
              </Badge>
            </div>
            <PlayerListView players={players} />
          </div>
        )}
      </div>

      {/* Action Controls Footer */}
      <footer className="shrink-0 w-full max-w-5xl mx-auto pt-1 pb-1">
        <ActionControls
          activePlayer={activePlayer}
          currentRoundHighestBet={currentRoundHighestBet}
          lastRaiseDelta={lastRaiseDelta}
          totalPotSize={totalPot}
          config={config}
          isHandInProgress={isHandInProgress}
          canUndo={history.length > 0}
          onAction={performAction}
          onStartHand={startNewHand}
          onUndo={undoLastAction}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </footer>

      {/* Activity Log Drawer */}
      {showLogDrawer && (
        <aside className="fixed top-12 sm:top-14 right-2 sm:right-4 z-40 w-[calc(100vw-1rem)] max-w-xs max-h-[70vh] bg-surface border border-border rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
              Riwayat Aksi Hand #{handNumber}
            </h3>
            <button
              onClick={() => setShowLogDrawer(false)}
              className="text-xs text-muted hover:text-primary"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pt-2 space-y-1.5 text-xs">
            {actionLog.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">Belum ada aksi.</p>
            ) : (
              actionLog.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-surface-muted/50 border border-border/40 text-[11px]"
                >
                  <span className="font-bold text-primary truncate max-w-[90px]">
                    {log.playerName}
                  </span>
                  <Badge
                    variant={
                      log.action === "fold"
                        ? "crimson"
                        : log.action === "check"
                        ? "default"
                        : log.action === "call"
                        ? "blue"
                        : "gold"
                    }
                    size="sm"
                    className="text-[9px] py-0"
                  >
                    {log.action}
                  </Badge>
                  <span className="tabular-nums font-bold text-gold text-[10px]">
                    {log.amount > 0 ? formatChips(log.amount) : "-"}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      {/* Modals */}
      <TableSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        players={players}
        onSave={(newConfig, newPlayers) => {
          initTable(newConfig, newPlayers);
        }}
      />

      <ShowdownModal
        isOpen={isShowdownOpen}
        onClose={() => setIsShowdownOpen(false)}
        pots={pots}
        players={players}
        onConfirmPayout={(allocations) => {
          resolveShowdown(allocations);
        }}
      />
    </main>
  );
}
