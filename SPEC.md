# Journali - Product Specification

## Overview

Journali is a personal daily reflection journal with a full-year calendar view. Users can see their entire year at a glance and click any day to write about their experiences, thoughts, and memories.

## Vision

A simple, beautiful journaling tool that makes daily reflection effortless. No complexity, no distractions—just you and your thoughts.

## Target Audience

- Primary: Personal use (private journaling)
- Future consideration: Optional sharing with family/close friends

## Core Features

### 1. Year Calendar View

The main interface displays all 365 days of the year in a single viewport.

**Desktop Layout:**
- 12 rows (months) × 31 columns (days)
- Month labels on the left (Jan–Dec)
- Day numbers at the top (1–31)
- Fills the entire viewport

**Mobile Layout:**
- Flipped: 12 columns (months) × 31 rows (days)
- Month labels at the top
- Day numbers on the left (hidden on very small screens)
- Optimized for portrait orientation

**Visual States:**
| State | Appearance |
|-------|------------|
| Empty | White with subtle border |
| Has entry | Sage green fill |
| Today | Warm amber with glow |
| Future | Faded, non-interactive |
| Selected | Dark border highlight |

### 2. Journal Entry Panel

Clicking a day opens a panel to write or edit the entry.

**Desktop:** Slide-in panel from the right (420px width)
**Mobile:** Bottom sheet (up to 85% viewport height)

**Panel Contents:**
- Date header (e.g., "Thu 2" / "Thursday, January 2")
- Text area for writing
- Status indicator (Saved / No entry)
- Character count
- Close button (also Escape key)

### 3. Stats Footer

Minimal statistics displayed at the bottom:
- **Entries:** Total number of journal entries
- **Streak:** Consecutive days with entries
- **Days:** Days passed in the current year

### 4. Photo Attachments (Planned)

Users can attach photos to any day's entry.

- Zero or multiple photos per day (user's choice)
- Photo gallery within the entry panel
- Thumbnail previews on calendar cells (optional)
- Supported formats: JPEG, PNG, WebP

### 5. Voice Input with AI Processing (Planned)

Speak your thoughts and let AI help structure them.

**Modes:**
1. **Smart Formatting:** AI organizes rambling speech into clean bullet points or paragraphs
2. **Full Rewrite:** AI transforms your thoughts into a polished journal entry

**Key Principles:**
- User always has final control—can edit any AI-generated text
- Original voice recording can be kept or discarded
- AI suggestions are clearly marked as AI-assisted

## Technical Specifications

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript |
| Build | Vite 7 |
| Styling | CSS (custom properties, no framework) |
| Hosting | Cloudflare Pages |
| Domain | Custom domain via Cloudflare |
| Database | Supabase or Cloudflare (TBD) |

### Data Storage

- **Cloud only:** All data stored in the cloud, requires authentication
- **No offline mode:** Internet connection required
- **Auto-save:** Entries save automatically as user types

### Data Model

```typescript
interface JournalEntry {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  content: string
  photos?: Photo[]
  voiceRecording?: VoiceRecording
  createdAt: Date
  updatedAt: Date
}

interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  uploadedAt: Date
}

interface VoiceRecording {
  id: string
  url: string
  duration: number
  transcription?: string
  aiProcessedText?: string
}
```

### Authentication (Planned)

- Email/password registration
- Social login (Google, Apple)
- Magic link option

## Design Principles

### Aesthetic

- **Warm and cozy:** Paper-like textures, cream backgrounds
- **Minimal:** No clutter, focus on content
- **Typography-first:** Elegant serif headers (Cormorant Garamond), clean sans-serif body (DM Sans)

### UX Principles

1. **One-tap access:** Click a day, start writing
2. **Always editable:** Return to any day to update or add more
3. **Visual progress:** See your year fill up with green
4. **No pressure:** Missing days are fine, no guilt mechanics
5. **Privacy first:** Your journal is private by default

## Non-Goals (For Now)

- Native mobile apps (iOS/Android)
- Offline mode
- Calendar integrations
- Export functionality
- Public sharing / social features
- Gamification beyond basic streak

## Milestones

### Phase 1: MVP (Current)
- [x] Year calendar view
- [x] Click-to-write entries
- [x] Responsive layout (desktop/mobile)
- [x] Visual states (empty, filled, today, future)
- [x] Basic stats (entries, streak, days)
- [ ] User authentication
- [ ] Cloud data persistence

### Phase 2: Media
- [ ] Photo uploads
- [ ] Photo gallery view
- [ ] Image compression/optimization

### Phase 3: Voice
- [ ] Voice recording
- [ ] Speech-to-text transcription
- [ ] AI formatting mode
- [ ] AI rewrite mode

### Phase 4: Polish
- [ ] Onboarding flow
- [ ] Settings page
- [ ] Year selector (view past years)
- [ ] Data backup/export

## Success Metrics

- Daily active users maintaining entries
- Average streak length
- Retention rate (users returning after 7, 30, 90 days)
- User satisfaction (qualitative feedback)
