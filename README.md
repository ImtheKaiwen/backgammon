# 🎲 KAIWEN BACKGAMMON

A modern, high-performance, deterministic TypeScript Backgammon engine and interactive web application with intelligent AI heuristic opponents, Web Audio procedural sound design, full standard tournament rules (including Mars / Gammon & Katmerli Mars / Backgammon point calculations), and an OpenAI-inspired minimal luxury interface.

Live Demo: **[https://imthekaiwen.github.io/backgammon/](https://imthekaiwen.github.io/backgammon/)**

---

## ✨ Features

- **Standard Tournament Backgammon Rules:**
  - 24-point standard triangular layout (15 White vs 15 Black checkers).
  - Accurate direction: White moves counter-clockwise (24 ➔ 1), Black moves clockwise (1 ➔ 24).
  - Doubles rolling giving 4 moves.
  - Hitting blots (Kırma) with central Bar storage and mandatory re-entry before board moves.
  - Making primes/doors (Kapı alma) with 2+ checkers blocking the point.
  - Bearing off (Taş toplama) strictly when all 15 checkers reach the home quadrant.
- **Victory & Mars Point System:**
  - **Normal Win (1 Point):** Opponent bore off at least 1 checker.
  - **Mars / Gammon (2 Points):** Winner bears off all 15 checkers before opponent bears off any.
  - **Katmerli Mars / Backgammon (3 Points):** Winner bears off all 15 checkers before opponent bears off any, and opponent still has a checker on the bar or in winner's home quadrant.
- **Smart Heuristic AI Bot:**
  - 3 Difficulty levels: **Casual**, **Intermediate**, and **Master**.
  - Dynamic heuristic evaluation balancing pip progress, making golden points, escaping home traps, hitting enemy blots, and minimizing blot vulnerability.
- **Synthesized Web Audio Effects:**
  - Procedural sound engine (no external audio files needed):
    - Realistic dice tumble and rattle.
    - Solid wooden checker clicks.
    - Hit punch sound when sending checkers to the bar.
    - Bearing off slide and chimes.
    - Victory and Mars fanfares.
- **Customizable Board & Visual Themes:**
  - **Classic Walnut Wood** (Luxury traditional game board).
  - **Midnight Slate** (Dark mode graphite & neon blue).
  - **Emerald Velvet Table** (Monte Carlo casino green & gold).
  - **Sapphire Night** (Deep indigo with icy highlights).
  - System-wide **Dark Mode** and **Light Mode** toggle.
- **Bilingual Support (i18n):**
  - Full Turkish (Tavla) and English language support.
- **Match History & Leaderboard:**
  - Persisted local statistics (Wins, Losses, Win Rate, Total Points, Mars count).
  - Interactive rules handbook modal.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/ImtheKaiwen/backgammon.git
cd backgammon

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛠️ Architecture

```
src/
├── engine/
│   ├── types.ts              # Game types, Point, Move, WinType, BoardState
│   └── backgammonEngine.ts   # Deterministic rules, legal moves, execution, win detection
├── services/
│   ├── backgammonAi.ts       # Multi-level heuristic Backgammon AI
│   └── statsService.ts       # Match stats, Mars tracking, and history storage
├── utils/
│   ├── sound.ts              # Web Audio API procedural sound synthesizer
│   └── i18n.ts               # Turkish & English localization
├── components/
│   ├── Header.tsx            # Navigation, branding & quick toggles
│   ├── BackgammonBoard.tsx   # SVG & CSS 24-point board, bar, bear-off trays
│   ├── DiceView.tsx          # 3D animated rolling dice with dot faces
│   ├── GameSidebar.tsx       # Player cards, pip counts, controls & event log
│   ├── GameOverModal.tsx     # Victory celebration with Mars & confetti
│   ├── SettingsModal.tsx     # Themes, mode, difficulty, audio & language
│   ├── RulesModal.tsx        # Visual guide for Backgammon rules
│   └── StatsModal.tsx        # Performance stats & match records
├── styles/
│   ├── theme.css             # Design tokens, palette & 4 board styles
│   └── components.css        # Responsive layouts & micro-animations
├── App.tsx                   # Central game controller
└── main.tsx                  # React 19 entry point
```

---

## 📜 License

MIT License © 2026 [Kaiwen](https://github.com/ImtheKaiwen)
