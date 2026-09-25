# tasks/todo.md — Execution Checklist

## Phase 1: Scaffolding & Design System Tokens
- [x] Inisialisasi project Next.js 15 App Router dengan TypeScript & Tailwind CSS di `/home/ubuntu/projects/poker-bet-calculator`
- [x] Install core dependencies: `zustand`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`
- [x] Setup `src/app/globals.css` dengan CSS variables mapping dari `DESIGN.md` (Zero hardcoded colors)

## Phase 2: Schemas & Pure Mathematical Engine (TDD)
- [x] Definisikan Zod schemas & types di `src/schemas/table-schema.ts`, `src/schemas/action-schema.ts`, dan `src/types/poker.ts`
- [x] Implementasikan `src/utils/side-pot-calculator.ts` (Algoritma multi-tier pot slicing)
- [x] Buat unit tests komprehensif untuk side pot calculator (single pot, multi-stack all-in, uncalled bets, fold dead money)
- [x] Implementasikan `src/utils/bet-rules.ts` (Min-raise, legal actions, pot odds calculation)
- [x] Implementasikan `src/utils/format-chips.ts` (Tabular chip formatter)

## Phase 3: Domain State Management (Zustand Store)
- [x] Implementasikan `src/stores/poker-store.ts`:
  - [x] State: players, pot, sidePots, currentStreet, activePlayerIndex, dealerIndex, currentBet, minRaise
  - [x] Actions: `initTable`, `startNewHand`, `performAction` (Fold, Check, Call, Raise, AllIn), `advanceStreet`, `resolveShowdown`, `undoLastAction`
  - [x] Immutable snapshot tracking untuk fitur `Undo`

## Phase 4: UI Primitives & Poker Components
- [x] Buat primitive UI di `src/components/ui/` (`button.tsx`, `input.tsx`, `badge.tsx`, `modal.tsx`)
- [x] Buat komponen poker visual di `src/components/poker/`:
  - [x] `poker-table.tsx`: Meja oval hijau felt dengan border rail mahoni
  - [x] `player-seat.tsx`: Kursi pemain melingkar, indikator dealer (D), status chip, bet in front
  - [x] `pot-display.tsx`: Badge rincian Main Pot & Side Pots interaktif
  - [x] `action-controls.tsx`: Panel tombol aksi bawah (Fold, Check, Call, Bet/Raise)
  - [x] Quick bet sizing presets (Min, 33%, 50%, 67%, Pot, All-in)
  - [x] `table-settings-modal.tsx`: Modal konfigurasi pemain & blind
  - [x] `showdown-modal.tsx`: Dialog pemilihan pemenang & alokasi chip

## Phase 5: Assembly & Responsive Polish
- [x] Rakit workbench di `src/app/page.tsx`
- [x] Dukungan responsif (Mobile 1-hand quick action & Tablet/Desktop table felt)
- [x] Audit zero hardcoded hex colors (`src/app/globals.css` single source of truth)

## Phase 6: Testing & Quality Gate
- [x] Jalankan typecheck & build (`npm run typecheck && npm run build`) — Clean exit 0
- [x] Jalankan Playwright verification (uji interaksi taruhan, all-in multi-pemain, pembagian pot) — Verified

## Phase 7: Obsidian Vault Sync & Closure
- [x] Daftarkan project di `/home/ubuntu/obsidian-vault/01 - Projects/Active Projects.md`
- [x] Buat dokumen MOC & Session Log di Obsidian Vault
- [x] Commit & push project repo & Obsidian vault
