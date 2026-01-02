# Changelog

All notable changes to Journali will be documented in this file.

## [0.1.1] - 2026-01-02

### Fixed
- Calendar date selection showing wrong day due to timezone conversion bug
  - Clicking on January 1st previously showed December 31st in the panel
  - Fixed `formatDateKey` to use local date methods instead of UTC-based `toISOString()`

## [0.1.0] - 2026-01-01

### Added
- Full-viewport year calendar displaying all 365 days
- Month-based grid layout (12 rows × 31 columns on desktop)
- Responsive design: months as rows on desktop, columns on mobile
- Day numbers header (1-31) for easy navigation
- Month labels (Jan-Dec) on the left side
- Hover tooltips showing full date (e.g., "Wednesday, January 1")
- Click-to-write journal entries with slide-in panel (desktop) or bottom sheet (mobile)
- Visual states for day cells:
  - Empty (white with border)
  - Has entry (sage green)
  - Today (warm amber with glow)
  - Future (faded, non-interactive)
  - Selected (dark border)
- Stats footer showing entries count, streak, and days passed
- Legend explaining cell colors
- Keyboard support (Escape to close panel)
- Auto-focus textarea when panel opens
- Warm, cozy aesthetic with paper-like textures
- Custom typography (Cormorant Garamond + DM Sans)

### Documentation
- Product specification (SPEC.md) defining vision, features, and roadmap
- Planned features: photo attachments, voice input with AI processing
- Four-phase roadmap from MVP to polish

### Technical
- React 19 with TypeScript
- Vite 7 for build tooling
- CSS custom properties for theming
- Flexbox-based responsive grid
- No external UI dependencies
