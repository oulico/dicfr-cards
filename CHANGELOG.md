# Changelog

All notable changes to dicfr-cards will be documented in this file.

## [0.2.0.0] - 2026-04-05

### Added
- FSRS adaptive spaced repetition algorithm (replaces SM-2) via `ts-fsrs`
- Review log storage with 90-day rolling window for future parameter optimization
- Streak system with consecutive day tracking, freeze logic, and study day merging
- React Router with 5 pages: Home, Study, Summary, Analytics, Settings
- Zustand state management with persistent stores (cards, streak, auth, settings)
- Learning analytics page with insight-first layout and Recharts visualizations
- Dark mode (dim mode with warm darks) with system preference detection
- Keyboard shortcuts for study sessions (Space to flip, 1/2/3/4 to rate)
- Audio pronunciation via Web Speech API (French)
- Session timer (elapsed count-up) during study
- Word of the Day component (lowest FSRS stability word)
- Daily goal progress tracking with configurable card targets
- Streak banner with milestone animations (7/30/100 days)
- Bottom tab bar navigation (Home, Study, Analytics, Settings)
- Schema versioning (v1 → v2) with automatic cold-start migration
- Vitest + @testing-library/react test framework with 21 tests

### Changed
- App.tsx restructured from God component to thin router shell
- Data model uses ts-fsrs Card type directly with Date↔ISO serialization
- All CSS colors migrated to custom properties for theme support
- Sync endpoint extended for review logs and study history

### Removed
- SM-2 algorithm (replaced by FSRS)
- Legacy Summary component (replaced by SummaryPage)
