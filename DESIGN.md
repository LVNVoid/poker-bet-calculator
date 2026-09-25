---
version: 1.0.0
name: Casino Felt & Luxury Poker Design System
description: Modern casino table design system for Texas Hold'em Poker Bet Calculator with deep velvet felt, brushed gold accents, high-contrast chip denominations, Inter typography, and touch-ergonomic geometry.
colors:
  dark:
    canvas: "#070b0e"
    table-felt: "#0c3322"
    table-felt-border: "#185338"
    table-rail: "#1a130e"
    table-rail-border: "#2b1f17"
    surface: "#111822"
    surface-card: "#182230"
    surface-muted: "#1f2d40"
    border: "#2a3b52"
    border-focus: "#eab308"
    primary: "#f8fafc"
    secondary: "#94a3b8"
    muted: "#64748b"
  accents:
    gold: "#eab308"
    gold-glow: "#ca8a04"
    emerald: "#10b981"
    emerald-glow: "#059669"
    crimson: "#ef4444"
    crimson-glow: "#dc2626"
    blue: "#3b82f6"
    blue-glow: "#2563eb"
    purple: "#a855f7"
  chips:
    chip-white: "#f8fafc"
    chip-red: "#ef4444"
    chip-blue: "#3b82f6"
    chip-green: "#10b981"
    chip-black: "#1e293b"
    chip-purple: "#a855f7"
    chip-gold: "#eab308"
typography:
  font-heading: "Inter, sans-serif"
  font-body: "Inter, sans-serif"
  font-mono: "ui-monospace, monospace"
radii:
  table: "9999px"
  card: "16px"
  button: "12px"
  badge: "9999px"
  input: "10px"
---

# Casino Felt & Luxury Poker Design System Spec

## 1. Visual Metaphor & Table Feel
- **The Table Felt (`table-felt`)**: Menggunakan warna hijau beludru kasino klasik yang dalam (`#0c3322`) dengan border gradien lembut (`#185338`), memberikan nuansa meja poker turnamen internasional tanpa silau mata.
- **The Armrest Rail (`table-rail`)**: Menggunakan aksen kulit gelap bertekstur kayu mahoni (`#1a130e`) yang mengelilingi meja felt.
- **Card & Seat Surfaces (`surface-card`)**: Kursi pemain dan panel kontrol menggunakan kontras abu-abu kebiruan malam (`#182230`) yang solid dan bersih, memisahkan pemain aktif, pemain folded (opacity 40%), dan pemain all-in (border emas berpendar).

## 2. Color Palette & Functional Semantics
- **Gold Accent (`#eab308`)**: Indikator Dealer Button (D), Pot Utama (Main Pot), dan penanda pemenang showdown.
- **Emerald Accent (`#10b981`)**: Tombol aksi positif (Call, Check, Min-Raise, Start Hand).
- **Crimson Accent (`#ef4444`)**: Tombol keluar / bahaya (Fold, Reset Meja).
- **Blue Accent (`#3b82f6`)**: Tombol kalkulasi dan preset sizing (33%, 50%, 67%, Pot).
- **Purple Accent (`#a855f7`)**: Indikator All-In dan Side Pot 1, 2, dst.

## 3. Typography (Inter)
- **Angka Chip & Pot**: Menggunakan font Inter dengan tabular numbers (`tabular-nums font-bold`) agar digit nominal tidak bergeser saat nilai pot bertambah secara realtime.
- **Label Posisi & Street**: Uppercase dengan tracking lebar (`tracking-wider text-xs font-semibold`).

## 4. Touch Targets & Ergonomics
- Tombol aksi utama (Fold, Check, Call, Raise) berukuran minimal tinggi 48px dengan radius `rounded-xl`, mudah ditekan dengan jempol saat smartphone dipegang satu tangan di meja poker.
