# KAIWEN BACKGAMMON

A modern, high-performance, deterministic TypeScript Backgammon engine and interactive web application featuring heuristic artificial intelligence, Web Audio procedural sound synthesis, complete tournament rules (including Gammon and Backgammon calculations), and a minimal luxury interface.

Repository: [https://github.com/ImtheKaiwen/backgammon](https://github.com/ImtheKaiwen/backgammon)

---

## Features

- **Standard Tournament Backgammon Rules:**
  - 24-point standard triangular layout (15 White vs 15 Black checkers).
  - Accurate direction: White moves counter-clockwise (24 to 1), Black moves clockwise (1 to 24).
  - Doubles rolling giving four moves.
  - Hitting blots with central Bar storage and mandatory re-entry before board moves.
  - Making primes/doors with two or more checkers blocking the point.
  - Bearing off strictly when all 15 checkers reach the home quadrant.
- **Victory & Point System:**
  - **Normal Win (1 Point):** Opponent bore off at least one checker.
  - **Mars / Gammon (2 Points):** Winner bears off all 15 checkers before opponent bears off any.
  - **Katmerli Mars / Backgammon (3 Points):** Winner bears off all 15 checkers before opponent bears off any, and opponent still has a checker on the bar or in the winner home quadrant.
- **Heuristic AI Opponent:**
  - Three difficulty levels: Casual, Intermediate, and Master.
  - Heuristic evaluation balancing pip progress, making golden points, escaping home traps, hitting enemy blots, and minimizing blot vulnerability.
- **Synthesized Web Audio Effects:**
  - Procedural sound engine requiring zero external audio assets:
    - Dice tumble and rattle.
    - Solid wooden checker clicks.
    - Hit punch sound when sending checkers to the bar.
    - Bearing off slide and chimes.
    - Victory fanfares.
- **Customizable Board & Visual Themes:**
  - Classic Walnut Wood (Traditional tournament game board).
  - Midnight Slate (Modern graphite and neon blue).
  - Emerald Velvet Table (Monte Carlo casino green and gold).
  - Sapphire Night (Deep indigo with contrast highlights).
  - System-wide Dark Mode and Light Mode toggle.
- **Bilingual Support (i18n):**
  - Full Turkish (Tavla) and English language support.
- **Match History & Performance Metrics:**
  - Persisted local statistics (Wins, Losses, Win Rate, Total Points, Mars count).
  - Interactive rules handbook modal.

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
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

## Architecture

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
│   └── i18n.ts               # Turkish and English localization
├── components/
│   ├── Header.tsx            # Navigation, branding and quick toggles
│   ├── BackgammonBoard.tsx   # Board rendering, bar, bear-off trays
│   ├── DiceView.tsx          # 3D animated rolling dice with dot faces
│   ├── GameSidebar.tsx       # Player cards, pip counts, controls and event log
│   ├── GameOverModal.tsx     # Victory celebration with Mars and confetti
│   ├── SettingsModal.tsx     # Themes, mode, difficulty, audio and language
│   ├── RulesModal.tsx        # Visual guide for Backgammon rules
│   └── StatsModal.tsx        # Performance stats and match records
├── styles/
│   ├── theme.css             # Design tokens, palette and board styles
│   └── components.css        # Responsive layouts and animations
├── App.tsx                   # Central game controller
└── main.tsx                  # React entry point
```

---

## License

MIT License (c) 2026 Kaiwen
