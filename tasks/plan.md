# tasks/plan.md — Architecture & Engineering Plan

## 1. System Architecture Overview
Aplikasi berjalan murni Client-Side Execution (CSR) dengan zero server-latency, menjamin kalkulasi instan di meja poker tanpa bergantung pada koneksi internet yang stabil saat bermain.

```
┌─────────────────────────────────────────────────────────────┐
│                 Next.js App Shell (page.tsx)                │
├──────────────────────────────┬──────────────────────────────┤
│       Poker Table View       │     Live Pot Summary Bar     │
│  - Oval Table Felt Canvas    │  - Total Pot (Chips & BB)    │
│  - Player Seats (2 - 10)     │  - Main Pot & Side Pots breakdown
│  - Active Bet Chip Display   │  - Current Street (Pre/Flop/..)
│  - Dealer Button Indicator   │  - Pot Odds Calculator       │
├──────────────────────────────┴──────────────────────────────┤
│               Player Action & Betting Panel                 │
│  - Fold / Check / Call / Raise / All-in Controls            │
│  - Quick Bet Sizing Slider & Presets (33%, 50%, 67%, Pot)    │
│  - Turn Indicator & Undo Last Action                        │
├─────────────────────────────────────────────────────────────┤
│            Mathematical Engine & Pure Utilities             │
│  - side-pot-calculator.ts (Recursive / Multi-stack Slices)  │
│  - bet-rules-engine.ts (Min-raise, Call-to-match logic)     │
│  - showdown-payout.ts (Pot distribution & odd chips)        │
└─────────────────────────────────────────────────────────────┘
```

## 2. Directory Structure (Simple Scalable Architecture)
```
/home/ubuntu/projects/poker-bet-calculator/
├── SPEC.md
├── CONSTRAINTS.md
├── DESIGN.md
├── tasks/
│   ├── plan.md
│   └── todo.md
├── src/
│   ├── app/
│   │   ├── globals.css              # Token CSS variables & @theme mapping
│   │   ├── layout.tsx               # Root layout with Inter font
│   │   └── page.tsx                 # Main Poker Table Workbench
│   ├── schemas/
│   │   ├── table-schema.ts          # Zod validation for blinds, seats, stacks
│   │   └── action-schema.ts         # Zod validation for bets, raises, payouts
│   ├── types/
│   │   └── poker.ts                 # Enums & infer types (Street, Position, PotTier)
│   ├── utils/
│   │   ├── side-pot-calculator.ts   # Core pure math for side pots
│   │   ├── bet-rules.ts             # Min-raise, legal actions, pot odds
│   │   └── format-chips.ts          # Chip formatting (K/M shorthand or full)
│   ├── stores/
│   │   └── poker-store.ts           # Zustand store (table state, undo stack)
│   └── components/
│       ├── ui/                      # Primitive UI (Button, Input, Badge, Modal)
│       └── poker/                   # Domain-specific components
│           ├── poker-table.tsx      # Oval felt table container
│           ├── player-seat.tsx      # Circular seat, avatar, stack, bet chips
│           ├── pot-display.tsx      # Main pot + Side pots badge breakdown
│           ├── action-controls.tsx  # Fold, Check, Call, Raise slider
│           ├── quick-bet-panel.tsx  # 1/3, 1/2, Pot sizing buttons
│           ├── table-settings-modal.tsx # Blinds & player configuration
│           └── showdown-modal.tsx   # Winner picker & payout allocator
```

## 3. Core Algorithm: Multi-Tier Side Pot Splitter
Algoritma penghitungan side pot yang menangani skenario N-pemain all-in dengan chip berbeda:
1. Kumpulkan seluruh kontribusi chip dari setiap pemain dalam hand.
2. Identifikasi seluruh tingkatan all-in unik yang lebih kecil dari bet maksimum.
3. Potong lapisan taruhan secara bertahap (*layered slicing*):
   - Ambil level terendah $L_1$: setiap pemain yang bertaruh $\ge L_1$ menyumbang $L_1$ ke `Main Pot`. Pemain yang fold sebelum $L_1$ menyumbang seluruh bet mereka ke pot tersebut.
   - Ambil level berikutnya $L_2$: setiap pemain yang bertaruh $\ge L_2$ menyumbang $(L_2 - L_1)$ ke `Side Pot 1`.
   - Lanjutkan hingga level tertinggi.
4. Tentukan *Eligible Players* untuk setiap pot: Hanya pemain yang belum fold dan telah mengontribusikan chip hingga level pot tersebut yang berhak memperebutkannya.
5. Invariant Assertion: `Sum(Pot[i].amount) === Sum(Player[j].totalContributed)`.
