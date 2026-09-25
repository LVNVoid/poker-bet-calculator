# tasks/todo.md — Execution Checklist

## Phase 1: Scaffolding & Design System Tokens
- [ ] Inisialisasi project Next.js 15/16 App Router dengan TypeScript & Tailwind CSS di `/home/ubuntu/projects/poker-bet-calculator`
- [ ] Install core dependencies: `zustand`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`
- [ ] Setup `src/app/globals.css` dengan CSS variables mapping dari `DESIGN.md` (Zero hardcoded colors)

## Phase 2: Schemas & Pure Mathematical Engine (TDD)
- [ ] Definisikan Zod schemas & types di `src/schemas/table-schema.ts`, `src/schemas/action-schema.ts`, dan `src/types/poker.ts`
- [ ] Implementasikan `src/utils/side-pot-calculator.ts` (Algoritma multi-tier pot slicing)
- [ ] Buat unit tests komprehensif untuk side pot calculator (single pot, multi-stack all-in, uncalled bets, fold dead money)
- [ ] Implementasikan `src/utils/bet-rules.ts` (Min-raise, legal actions, pot odds calculation)
- [ ] Implementasikan `src/utils/format-chips.ts` (Tabular chip formatter)

## Phase 3: Domain State Management (Zustand Store)
- [ ] Implementasikan `src/stores/poker-store.ts`:
  - [ ] State: players, pot, sidePots, currentStreet, activePlayerIndex, dealerIndex, currentBet, minRaise
  - [ ] Actions: `initTable`, `startHand`, `playerAction` (Fold, Check, Call, Raise, AllIn), `advanceStreet`, `showdownPayout`, `undoLastAction`
  - [ ] Immutable snapshot tracking untuk fitur `Undo`

## Phase 4: UI Primitives & Poker Components
- [ ] Buat primitive UI di `src/components/ui/` (`button.tsx`, `input.tsx`, `badge.tsx`, `modal.tsx`, `slider.tsx`)
- [ ] Buat komponen poker visual di `src/components/poker/`:
  - [ ] `poker-table.tsx`: Meja oval hijau felt dengan border rail mahoni
  - [ ] `player-seat.tsx`: Kursi pemain melingkar, indikator dealer (D), status chip, bet in front
  - [ ] `pot-display.tsx`: Badge rincian Main Pot & Side Pots interaktif
  - [ ] `action-controls.tsx`: Panel tombol aksi bawah (Fold, Check, Call, Bet/Raise)
  - [ ] `quick-bet-panel.tsx`: Tombol cepat ukuran taruhan (Min, 33%, 50%, 67%, Pot, All-in)
  - [ ] `table-settings-modal.tsx`: Modal konfigurasi pemain & blind
  - [ ] `showdown-modal.tsx`: Dialog pemilihan pemenang & alokasi chip

## Phase 5: Assembly & Responsive Polish
- [ ] Rakit workbench di `src/app/page.tsx`
- [ ] Dukungan responsif (Mobile 1-hand quick action & Tablet/Desktop table felt)
- [ ] Audit zero hardcoded hex colors (`grep -rEn "#[0-9a-fA-F]{3,8}" src/`)

## Phase 6: Testing & Quality Gate
- [ ] Jalankan typecheck & build (`npm run typecheck && npm run build`)
- [ ] Jalankan Playwright verification (uji interaksi taruhan, all-in multi-pemain, pembagian pot)

## Phase 7: Obsidian Vault Sync & Closure
- [ ] Daftarkan project di `/home/ubuntu/obsidian-vault/01 - Projects/Active Projects.md`
- [ ] Buat dokumen MOC & Session Log di Obsidian Vault
- [ ] Commit & push project repo & Obsidian vault
