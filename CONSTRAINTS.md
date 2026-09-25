# CONSTRAINTS.md — Quality Bar & Architectural Contract

## 1. Architectural Integrity & Rules
Sesuai dengan `Rules - Simple Scalable Architecture Nextjs` dan `Rules - Next.js App Router Workflow`:
- **Zero Logic in UI Components**: Seluruh logika matematika poker (penghitungan pot, kalkulasi side pot bertingkat, pot odds, min-raise validation, rotasi dealer button) WAJIB berada di pure functions (`src/utils/`) atau domain stores (`src/stores/`). Komponen UI murni menerima data props dan memicu callback event.
- **Zero `any` Policy**: TypeScript strict mode penuh. Seluruh data structures, action types, dan parameter kalkulator harus memiliki tipe data yang eksplisit.
- **Zod as Source of Truth**: Seluruh validasi input (nominal blind, stack awal, jumlah bet/raise) divalidasi melalui skema Zod di `src/schemas/`. Tipe TypeScript di-infer langsung dari Zod.
- **Group by Type Directory Pattern**:
  - `src/app/` (Next.js routing & shell)
  - `src/components/ui/` (Primitif tombol, modal, badge, input)
  - `src/components/poker/` (Komponen meja, kursi pemain, panel kontrol bet, dialog payout)
  - `src/stores/` (Zustand state management meja poker & history undo)
  - `src/utils/` (Pure math functions: pot splitter, bet sizing, odd chips)
  - `src/schemas/` (Zod validation schemas)
  - `src/types/` (Domain types & poker enums)

## 2. Mathematical Precision & Invariants
- **Conservation of Chips**: Total chip di meja (Jumlah Stack Seluruh Pemain + Total Pot di Meja) harus selalu bernilai konstan di setiap aksi, kecuali saat pemain melakukan rebuy atau addon.
- **Side Pot Invariant**:
  - Jumlah total dari (Main Pot + Semua Side Pots) harus tepat sama dengan akumulasi seluruh chip yang ditaruhkan pada hand tersebut.
  - Pemain yang fold tidak pernah berhak mendapatkan bagian dari pot mana pun.
  - Pemain all-in hanya berhak atas pot yang mencakup batas taruhannya (Main Pot atau Side Pot terkait).
  - Odd chip (keping ganjil dari pembagian split pot yang tidak habis dibagi rata) dialokasikan sesuai aturan resmi Texas Hold'em (pemain aktif terdekat searah jarum jam dari tombol Dealer).

## 3. Design System & CSS Token Constraints
- **Zero Hardcoded Hex Colors**: Dilarang menggunakan kode hex hardcoded (misal: `bg-[#0f2e1d]`, `text-[#fbbf24]`) di dalam komponen UI. Seluruh warna harus merujuk ke token CSS variables yang didefinisikan di `DESIGN.md` dan dimuat pada `src/app/globals.css`.
- **Touch Target Ergonomics**: Seluruh tombol aksi permainan (Fold, Check, Call, Raise, Quick Bet) wajib memiliki ukuran touch target minimal 44x44px untuk kenyamanan jempol di perangkat mobile.

## 4. Testing & Verification Gate (TDD)
- Modul kalkulasi matematika side pot (`src/utils/side-pot-calculator.ts`) wajib memiliki unit test komprehensif yang menguji:
  1. Situasi standar tanpa all-in (single main pot).
  2. 1 pemain all-in stack pendek (Main Pot + 1 Side Pot).
  3. Multi-way all-in dengan 3 atau 4 stack berbeda ukuran (Main Pot + Side Pot 1 + Side Pot 2 + Side Pot 3).
  4. Split pot ganda antar pemain all-in.
  5. Penanganan odd chips.
- Seluruh unit tests wajib lulus sebelum integrasi antarmuka UI.
