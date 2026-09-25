# SPEC.md — Texas Hold'em Poker Bet & Pot Calculator

## 1. Project Overview
Aplikasi web modern berbasis Next.js App Router (TypeScript, Tailwind CSS, Zustand, Zod) yang dirancang khusus untuk menghitung, melacak, dan mengelola akumulasi taruhan (*bets*), total pot, serta pembagian *side pot* multi-pemain dalam permainan Texas Hold'em Poker secara *realtime*, akurat, dan mudah digunakan langsung di meja permainan (mobile/tablet/desktop).

## 2. Core Problem & User Needs
Dalam permainan poker langsung (home game maupun turnamen komunitas):
1. **Kebingungan Side Pot**: Ketika satu atau lebih pemain melakukan *All-In* dengan jumlah chip yang berbeda, menghitung pembagian *Main Pot* dan *Side Pot 1, 2, dst.* beserta siapa saja pemain yang berhak memperebutkannya (*eligible players*) sering memicu perselisihan dan memperlambat ritme permainan.
2. **Pelacakan Taruhan Multi-Ronde**: Melacak kontribusi bet setiap pemain di setiap putaran jalan (*Pre-Flop, Flop, Turn, River*) serta menghitung sisa chip (*stack*) masing-masing pemain secara presisi.
3. **Penyelesaian Showdown**: Mendistribusikan pot ke pemenang dengan benar, termasuk kondisi *split pot* (seri) dan pembagian sisa keping ganjil (*odd chip*).

## 3. Core Functional Requirements

### 3.1 Setup Meja Permainan (Table Config)
- **Kapasitas Meja**: Mendukung 2 hingga 10 pemain (Heads-Up, 6-Max, hingga 9-10 Full Ring).
- **Konfigurasi Blind**:
  - Small Blind (SB) dan Big Blind (BB) yang dapat disesuaikan.
  - Opsi Ante (BB Ante atau Traditional Ante per pemain).
- **Pemain & Stack**:
  - Nama pemain (default: Player 1..N, dapat diganti).
  - Chip stack awal masing-masing pemain.
  - Posisi Dealer Button (BTN) yang otomatis bergeser searah jarum jam saat hand baru dimulai.
  - Penetapan posisi otomatis: SB, BB, UTG, MP, CO, BTN.

### 3.2 Alur Ronde Taruhan (Betting Engine)
- **Tahapan Permainan (Streets)**:
  - `Pre-flop`: Penarikan otomatis SB & BB (dan Ante), aksi dimulai dari UTG / sebelah kiri BB.
  - `Flop`: 3 kartu komunitas, aksi dimulai dari SB / pemain aktif sebelah kiri BTN.
  - `Turn`: 1 kartu komunitas.
  - `River`: 1 kartu komunitas terakhir.
  - `Showdown`: Pemenang dipilih untuk setiap sub-pot (Main Pot & Side Pots).
- **Aksi Pemain (Player Actions)**:
  - `Fold`: Pemain keluar dari hand saat ini, chip yang sudah masuk tetap berada di pot.
  - `Check`: Meneruskan giliran jika tidak ada bet yang harus disamakan.
  - `Call`: Menyamakan bet tertinggi saat ini.
  - `Bet / Raise`: Memasang atau menaikkan taruhan dengan validasi batas minimum raise (min-raise).
  - `All-in`: Mempertaruhkan seluruh sisa stack pemain.
- **Preset Tombol Ukuran Bet (Quick Bet Sizing)**:
  - `Min Raise`
  - `33% Pot` (1/3 Pot)
  - `50% Pot` (1/2 Pot)
  - `67% Pot` (2/3 Pot)
  - `100% Pot` (Pot Sized Bet)
  - `All-In`
- **Audit & Koreksi**: Tombol `Undo` aksi terakhir jika terjadi kesalahan input chip oleh pengguna.

### 3.3 Algoritma Pot & Side Pot (Core Mathematical Engine)
- Menghitung total chip yang dikontribusikan setiap pemain di ronde berjalan dan total hand.
- Memproses *All-In* bertingkat secara otomatis menjadi:
  - `Main Pot`: Batas chip all-in terkecil dikalikan jumlah pemain aktif yang menyamai.
  - `Side Pot 1, 2, ... N`: Sisa kelebihan bet antar pemain all-in berikutnya hingga pemain dengan stack terbesar.
- Menampilkan dengan jelas:
  - Nilai nominal setiap pot (Main Pot dan masing-masing Side Pot).
  - Daftar pemain yang berhak memperebutkannya (*Eligible Players*).
- Menghitung *Pot Odds* (%) bagi pemain yang menghadapi taruhan untuk mengambil keputusan.

### 3.4 Distribusi Pemenang (Showdown Payout)
- Tampilan pemilihan pemenang interaktif untuk setiap pot.
- Mendukung pemenang tunggal (*sole winner*) atau pemenang ganda (*split pot*).
- Otomatis mengkreditkan chip kemenangan ke stack pemain dan siap memulai hand berikutnya (`Next Hand`).

## 4. UI & UX Architecture
- **Responsive Dual Mode**:
  - `Table Felt View`: Visualisasi meja oval kasino dengan posisi melingkar, indikator dealer button, chip pot di tengah, dan status tiap pemain.
  - `List / Compact View`: Mode daftar vertikal ergonomis untuk pengoperasian cepat satu tangan di smartphone.
- **Micro-Interactions**: Animasi chip bet, status aktif/folded dengan kontras jelas, notifikasi pemenang yang intuitif.

## 5. Tech Stack
- **Framework**: Next.js 16 (App Router), TypeScript (Strict Mode).
- **State Management**: Zustand (Domain store dengan immutability & undo history).
- **Styling**: Tailwind CSS v4, Token CSS Variables (`DESIGN.md`).
- **Validation**: Zod (Validasi input stack, blind, dan nominal bet).
- **Icons**: Lucide React.
- **Typography**: Inter (Google Fonts).
