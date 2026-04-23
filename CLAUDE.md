# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Red_5_Gaming is a client-side web application for scoring "红五五家" (Red Five Five-Person), a Chinese card game. The app runs entirely in the browser with no backend server, using localStorage for data persistence.

## Development Setup

This is a static web application with no build process. To run:

```bash
# Serve the files using any static file server
# Using Python 3:
python -m http.server 8000

# Using Node.js http-server:
npx http-server .

# Or simply open index.html directly in a browser (some features may be limited)
```

Open `http://localhost:8000` in your browser to access the application.

## Application Architecture

### File Structure

- `index.html` - Main scoring interface with player management, round entry, and statistics
- `login.html` - Authentication page (simple hardcoded credentials)
- `games.html` - Game selection landing page
- `app.js` - Core application logic (~1165 lines)
- `auth.js` - Authentication module
- `styles.css` - Application styling
- `hongwu-wujia-score-tool-design.md` - Design documentation

### Core Components

**Authentication (`auth.js`)**
- Simple localStorage-based authentication
- Default credentials: username "于人", password "123456"
- Provides page protection and redirect utilities

**Main Application (`app.js`)**
- State management with localStorage persistence
- Rule-based scoring system with two rule tables: `NORMAL_RULES` and `SOLO_RULES`
- Player management (5 fixed slots with IDs A-E, renameable)
- Round recording with three modes: normal, solo, and escape
- Statistics computation and leaderboard generation
- CSV/JSON export functionality

### Data Model

**Application State** (stored in `localStorage` key `"hwwj.appState.v1"`):
```javascript
{
  appVersion: "v2",
  ruleVersion: "baike-normal-solo-escape",
  players: [{ id: "A", name: "A" }, ...], // 5 players
  rounds: [{
    id: "round-timestamp-random",
    roundNo: 1,
    mode: "normal" | "solo",
    finishType: "score" | "escape",
    dealerId: "A",
    partnerId: "B", // null for solo mode
    idlePlayerIds: ["C", "D", "E"],
    idleScore: 120, // null for escape
    escapePlayerId: "C", // null for score
    winnerSide: "dealer" | "idle" | null,
    winnerPlayerIds: ["A", "B"],
    settlement: { A: 10, B: 5, C: -5, D: -5, E: -5 },
    ruleSnapshot: { dealerScore: 10, partnerScore: 5, idleScorePerPlayer: -5 },
    note: "",
    createdAt: "2026-04-24T...",
    updatedAt: "2026-04-24T..."
  }]
}
```

### Scoring Rules

The application uses Baidu Encyclopedia rules for Red Five scoring:

- **Normal mode**: 2 players vs 3 players (dealer + partner vs idle players)
- **Solo mode**: 1 player vs 4 players (dealer vs idle players)
- **Score threshold**: 120 points determines winner (dealer wins if idle score < 120)
- **Escape mode**: Fixed penalties (-80 for normal, -200 for solo)

Rule tables map idle scores to point values for each player role.

### Key Functions in `app.js`

- `settleRound()` - Main scoring logic that dispatches to mode-specific functions
- `settleNormalScoreRound()` - Handles normal mode scoring
- `settleSoloScoreRound()` - Handles solo mode scoring  
- `settleEscapeRound()` - Handles escape penalty scoring
- `computeStats()` - Calculates leaderboards, win rates, and dealer rates
- `sanitizeRound()` - Validates and normalizes round data from storage
- `render()` - Main render function that updates UI components

### Form Flow

1. User selects mode (normal/solo) and finish type (score/escape)
2. Form fields show/hide based on selection
3. User fills required fields and clicks "预览结算" (Preview)
4. System calculates and displays settlement preview
5. User clicks "保存本局" (Save) to persist the round

## Important Notes

- No build process or dependencies required
- All data stored in browser localStorage
- Application is Chinese-language focused
- Player IDs are fixed (A-E) but names can be changed
- Round numbers must be unique across all rounds
- Form validation prevents invalid state combinations
- Export files include UTF-8 BOM for proper Chinese character display

## Testing Changes

When making changes:
1. Refresh the page to load updated JavaScript
2. Test form validation for all mode combinations
3. Verify scoring calculations against the rule tables
4. Check localStorage persistence after page reload
5. Test export functionality with Chinese characters
