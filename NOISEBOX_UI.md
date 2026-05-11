# Noisebox — UI Design Documentation

> Visual design system, component specs, layout rules, and interaction behavior for the Noisebox desktop app.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Sizing](#4-spacing--sizing)
5. [Layout Structure](#5-layout-structure)
6. [Components](#6-components)
   - [TopBar](#topbar)
   - [Canvas](#canvas)
   - [SoundCard](#soundcard)
   - [SearchPanel](#searchpanel)
   - [Bin](#bin)
   - [BottomBar](#bottombar)
   - [PresetModal](#presetmodal)
   - [TimerModal](#timermodal)
7. [Interactions & Animations](#7-interactions--animations)
8. [Drag & Drop Behavior](#8-drag--drop-behavior)
9. [Responsive & Window Sizing](#9-responsive--window-sizing)
10. [Icons](#10-icons)
11. [Dark Mode](#11-dark-mode)

---

## 1. Design Philosophy

Noisebox's UI is inspired by **n8n** — a node-canvas workflow tool. The core idea is a dark infinite grid where the user owns the workspace. There are no rigid layouts, no sidebars forcing order. Cards float freely.

**Principles:**

- **Canvas-first** — the grid IS the app. Bars are minimal chrome, not the focus.
- **Dark by default** — ambient work environments are low-light. Dark UI reduces eye strain.
- **No clutter** — each card shows only what's needed. Advanced options are hidden until needed.
- **Feedback everywhere** — wave bars animate, the bin turns red, toggles slide. Every action has a visible response.
- **Flat, not glass** — no gradients, no blur, no glassmorphism. Flat surfaces, sharp edges, thin borders.

---

## 2. Color System

### Base palette

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#161616` | Canvas / app background |
| `bg-surface` | `#1e1e1e` | Cards, bars, panels |
| `bg-elevated` | `#252525` | Hover states, pill backgrounds |
| `border-subtle` | `#2a2a2a` | Default borders (0.5px) |
| `border-mid` | `#333333` | Panel borders, separator |
| `border-strong` | `#444444` | Hover border states |
| `text-primary` | `#d0d0d0` | Card names, main labels |
| `text-secondary` | `#888888` | Volume labels, status text |
| `text-muted` | `#555555` | Off-state labels, muted info |

### Accent — Purple (primary brand)

| Token | Hex | Usage |
|---|---|---|
| `accent` | `#7c6af7` | Active card borders, toggle, sliders, wave bars, logo icon |
| `accent-bg` | `#2d2540` | Active pill background, icon button active bg |
| `accent-text` | `#c4b8ff` | Active pill text, active icon button color |
| `accent-hover` | `#6a58e0` | Master play button hover |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `danger` | `#e24b4a` | Bin active border + icon |
| `danger-bg` | `#2a1515` | Bin active background |

### Sound card accent colors

Each sound card has its own icon background and icon color to create visual identity at a glance.

| Sound | Card bg | Icon color |
|---|---|---|
| Rain | `#1a3a5c` | `#4da6ff` |
| Thunder | `#2a1a4a` | `#a78bfa` |
| Birds | `#1a3a28` | `#4ade80` |
| Wind | `#2a2a1a` | `#fbbf24` |
| Fireplace | `#3a1a1a` | `#f97316` |
| Café | `#2a1e10` | `#d4a76a` |
| Ocean | `#0f2a35` | `#38bdf8` |
| Forest | `#1a2e1a` | `#86efac` |
| Fan | `#252525` | `#aaaaaa` |
| Crowd | `#2a1a2a` | `#e879f9` |
| Creek | `#0f2a2a` | `#67e8f9` |
| Train | `#1e1e2a` | `#94a3b8` |
| Keyboard | `#1a1a2e` | `#818cf8` |
| Night Bugs | `#0f1a2a` | `#c4b5fd` |

---

## 3. Typography

| Use | Size | Weight | Color |
|---|---|---|---|
| App name / logo | 15px | 500 | `#e0e0e0` |
| Card name | 13px | 500 | `#d0d0d0` |
| Card status | 11px | 400 | `#555` (off) / `#7c6af7` (active) |
| Volume label | 11px | 400 | `#555` (off) / `#888` (active) |
| Preset pill | 12px | 400 | `#888` (default) / `#c4b8ff` (active) |
| Search input | 13px | 400 | `#d0d0d0` |
| Search item name | 13px | 400 | `#d0d0d0` |
| Search item tag | 11px | 400 | `#555` |
| Bottom bar labels | 12px | 400 | `#555` |
| Status text | 12px | 400 | `#555` |

**Font stack:** System font stack — `ui-sans-serif, system-ui, -apple-system, sans-serif`. No custom fonts needed for v1.

---

## 4. Spacing & Sizing

### Window

| Property | Value |
|---|---|
| Default width | 1100px |
| Default height | 680px |
| Min width | 800px |
| Min height | 500px |

### Bars

| Bar | Height | Padding |
|---|---|---|
| TopBar | 48px | 0 16px |
| BottomBar | 48px | 0 16px |
| Canvas area | window height - 96px | — |

### Sound card

| Property | Value |
|---|---|
| Width | 165px |
| Border radius | 12px |
| Border | 0.5px solid `#2e2e2e` |
| Card header padding | 11px 11px 9px |
| Card body padding | 9px 11px 11px |
| Card icon size | 32×32px, border-radius 8px |
| Card icon font size | 16px |
| Toggle size | 28×16px |
| Toggle knob | 12×12px |

### Search panel

| Property | Value |
|---|---|
| Width | 240px |
| Position | Above search button, 16px from left |
| Border radius | 12px |
| Input area padding | 10px 12px |
| Result item padding | 9px 12px |
| Max height (results) | 200px (scrollable) |
| Result icon size | 28×28px, border-radius 7px |
| Add button size | 22×22px, border-radius 6px |

### Floating action buttons (search, bin)

| Property | Value |
|---|---|
| Size | 36×36px (search) / 48×48px (bin) |
| Border radius | 10px (search) / 12px (bin) |
| Position bottom offset | 60px from bottom of canvas area |

### Grid

| Property | Value |
|---|---|
| Grid size | 32×32px |
| Grid line color | `#222222` |
| Grid line width | 1px |

---

## 5. Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  TopBar (48px)                                      │
│  [Logo] [Sep] [Presets...] ──────── [Timer] [Play] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Canvas (flex-grow)                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│    Infinite dot grid background                    │
│  │  [SoundCard]  [SoundCard]  [SoundCard]        │  │
│                                                    │
│  │  [SoundCard]  [SoundCard]                     │  │
│   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                                     │
│  [SearchBtn] (bottom-left)    [Bin] (bottom-right)  │
│  [SearchPanel floats above SearchBtn when open]     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  BottomBar (48px)                                   │
│  [Volume icon + slider + %] [Timer] ── [● Playing] │
└─────────────────────────────────────────────────────┘
```

**Z-index layers:**

| Layer | z-index | Elements |
|---|---|---|
| Grid background | 0 | `#grid-bg` |
| Cards (default) | 1–10 | `.sound-card` |
| Dragging card | 999 | `.sound-card.dragging` |
| Floating buttons | 50 | Search btn, Bin |
| Search panel | 200 | `#search-panel` |
| Bars | 100 | TopBar, BottomBar |
| Modals | 500 | Preset modal, Timer modal |

---

## 6. Components

### TopBar

```
[~ Noisebox] | [Deep Focus ×] [Rainy Night] [+ Save] ──── [⏰] [▶]
```

- Logo: ripple icon (purple) + "Noisebox" text
- Separator: 0.5px vertical line `#2a2a2a`, height 24px
- Preset pills: scrollable horizontally if overflow
- Active preset pill: `bg-accent-bg`, `border-accent`, `text-accent-text`
- Timer icon button: highlights `active` state when timer is running
- Master play button: solid purple `#7c6af7`, white icon, 32×32px

**Preset pill states:**

| State | Background | Border | Text |
|---|---|---|---|
| Default | `#252525` | `#333` | `#888` |
| Hover | `#252525` | `#7c6af7` | `#bbb` |
| Active | `#2d2540` | `#7c6af7` | `#c4b8ff` |

---

### Canvas

- Full area between TopBar and BottomBar
- `background: #161616` with CSS grid overlay (32px, `#222`)
- Cursor: `grab` by default, `grabbing` while dragging a card
- Cards positioned absolutely with `left` / `top` from store state
- Canvas does NOT scroll in v1 — cards are constrained to visible area
- In v2, add canvas pan (middle-mouse drag) and zoom (Ctrl+scroll)

---

### SoundCard

**Anatomy:**

```
┌─────────────────────────┐
│ [Icon]  Name       [●]  │  ← card-header
│         Status          │
├─────────────────────────┤
│ Volume          75%     │  ← card-body
│ ━━━━━━━━━━━━━━━━━━━━━━  │  ← range slider
│   ▂ ▄ ▆ ▃ ▅            │  ← wave bars
└─────────────────────────┘
```

**States:**

| State | Border | Status text | Wave bars | Toggle knob |
|---|---|---|---|---|
| Off | `#2e2e2e` | `#555` "Off" | `#2a2a2a` flat | left `#555` |
| Active | `#7c6af7` | `#7c6af7` "Playing" | `#7c6af7` animated | right `#fff` |
| Dragging | `#2e2e2e` | — | — | — |
| Over bin | 0.4 opacity | — | — | — |

**Wave bars:**
- 4–6 bars per card depending on card (defined per sound)
- When active: heights animate randomly every 500ms between 4px and 22px
- When inactive: all bars collapse to 4px
- Transition: `height 0.3s ease`

**Volume slider:**
- `accent-color: #7c6af7` (CSS)
- Track height: 3px
- Range: 0–100, step 1
- Live label updates on input

---

### SearchPanel

Floats above the search button. Opens/closes on button click. Closes on outside click.

**Search input:**
- Search icon left (`#555`)
- Placeholder: "Search sounds..."
- Input background: transparent (panel bg shows through)
- Border-bottom: 0.5px `#2a2a2a` separates from results

**Result items:**
- Icon (28×28 colored bg + sound icon)
- Name + tag
- Add button (right): purple outline → fills purple on hover
- Already-added sounds: name dimmed `#555`, add button shows checkmark, non-clickable

**Empty state:**
```
No sounds found
```
Centered, 13px, `#444`.

---

### Bin

Positioned bottom-right, always visible while dragging.

| State | Border | Icon color | Background | Pointer events |
|---|---|---|---|---|
| Idle (no drag) | `#2a2a2a` | `#444` | `#1e1e1e` | none |
| Drag active | `#2a2a2a` | `#444` | `#1e1e1e` | auto |
| Card hovering over bin | `#e24b4a` | `#e24b4a` | `#2a1515` | auto |

**Drop animation:** On successful drop, bin plays a short scale pulse (`scale(1) → scale(1.2) → scale(1)`, 250ms).

---

### BottomBar

```
[🔊 ━━━━━━━━ 75%]   [⏰ 25:00 remaining]   ──────   [● Playing · 4 active]
```

- Volume icon: `ti-volume`, 15px, `#555`
- Master volume slider: 80px wide, `accent-color: #7c6af7`
- Volume percentage: live update, 12px `#666`
- Timer: hidden when timer is off
- Status dot: purple `#7c6af7`, 6px circle, pulsing animation when playing; `#444` when paused
- Status text: "Playing · N active" or "Paused · N active"

---

### PresetModal

Triggered by "+ Save" preset pill.

```
┌────────────────────────────┐
│  Save preset               │
│  ┌──────────────────────┐  │
│  │ Preset name...       │  │
│  └──────────────────────┘  │
│  [Cancel]        [Save ✓]  │
└────────────────────────────┘
```

- Background overlay: `rgba(0,0,0,0.6)`
- Modal: `#1e1e1e`, border `#333`, border-radius 12px, padding 20px
- Input: full-width, `#252525` bg, `#333` border, border-radius 8px
- Save button: solid `#7c6af7`
- Cancel button: transparent, `#555` text

**Preset list (manage view):**

Each saved preset shows:
- Preset name
- Sound count (e.g. "4 sounds")
- Load button + Delete button (trash icon, red on hover)

---

### TimerModal

Two modes selectable via tabs: **Sleep** and **Pomodoro**.

**Sleep mode:**
- Duration picker: 15 / 30 / 45 / 60 / 90 min presets + custom input
- "Start timer" button

**Pomodoro mode:**
- Focus: 25min (adjustable), Break: 5min (adjustable)
- Shows current phase (Focus / Break) and countdown
- Auto-pauses audio during break phase

---

## 7. Interactions & Animations

| Interaction | Animation | Duration |
|---|---|---|
| Toggle sound on | Wave bars grow from 4px to natural heights | 300ms |
| Toggle sound off | Wave bars collapse to 4px | 300ms |
| Card toggle switch | Knob slides left/right, bg color change | 200ms |
| Sound added from search | Card fades in + slight scale up | 200ms |
| Card deleted (bin drop) | Card fades out, bin pulses | 250ms |
| Search panel open | Slide up + fade in | 150ms |
| Preset pill click | Instant swap (no animation) | — |
| Master play/pause | Icon swaps instantly | — |
| Status dot | Pulse loop (opacity 1 → 0.3 → 1) | 2000ms |
| Wave bars (active) | Random height change | every 500ms, 300ms transition |
| Bin ready state | Border + icon color swap | 150ms |

---

## 8. Drag & Drop Behavior

**Card dragging:**

1. `mousedown` on card (not on input/button) → start drag
2. Store `dragOffX` / `dragOffY` relative to card top-left
3. On `mousemove` → update card `left` / `top` in real time
4. Constrain to canvas bounds: `x: [0, canvasWidth - cardWidth]`, `y: [0, canvasHeight - cardHeight]`
5. On `mouseup` → end drag, update position in store

**Bin interaction:**

1. When drag starts → bin becomes pointer-events active
2. On `mousemove`, check if cursor is within bin bounding rect
3. If over bin → bin turns red, card drops to 40% opacity
4. If cursor leaves bin → bin resets, card back to 80% opacity
5. On `mouseup` over bin → remove sound from store, play bin pop animation
6. On `mouseup` elsewhere → drop card at current position, save position to store
7. When drag ends → bin pointer-events set back to none

**Touch support (v1.1):** Add `touchstart` / `touchmove` / `touchend` equivalents for tablet support.

---

## 9. Responsive & Window Sizing

Noisebox is a desktop app — no mobile layout needed. But window resizing must be handled:

| Window width | Behavior |
|---|---|
| < 800px | Minimum enforced by Tauri, not reachable |
| 800–1000px | Cards may be partially off-canvas; user can drag back |
| 1000px+ | Normal layout |

**Cards on resize:** Cards stay at their absolute positions. If a card ends up outside the visible area after resize, user can drag it back. No auto-reflow.

**TopBar overflow:** Preset pills scroll horizontally (`overflow-x: auto`, hidden scrollbar) if too many presets.

---

## 10. Icons

All icons from **Lucide React** (`lucide-react` npm package).

| Context | Icon name |
|---|---|
| App logo | `Ripple` |
| Rain | `CloudRain` |
| Thunder | `Zap` |
| Birds | `Feather` |
| Wind | `Wind` |
| Fireplace | `Flame` |
| Café | `Coffee` |
| Ocean | `Waves` |
| Forest | `Trees` |
| Fan | `Fan` |
| Crowd | `Users` |
| Creek | `Droplets` |
| Train | `Train` |
| Keyboard | `Keyboard` |
| Night Bugs | `Moon` |
| Play | `Play` |
| Pause | `Pause` |
| Volume | `Volume2` |
| Search | `Search` |
| Add | `Plus` |
| Check (added) | `Check` |
| Trash / Bin | `Trash2` |
| Timer | `Clock` |
| Upload / Import | `Upload` |
| Settings | `Settings` |
| Save | `Save` |
| Close | `X` |

Icon size: 16px inline, 18px for logo, 20px for floating buttons.

---

## 11. Dark Mode

v1 ships **dark mode only**. Light mode is a v1.1 consideration.

The entire color system is built on dark tokens — no light mode overrides needed for v1.

When light mode is added in v1.1:

| Dark token | Light equivalent |
|---|---|
| `#161616` (bg-base) | `#f4f4f4` |
| `#1e1e1e` (bg-surface) | `#ffffff` |
| `#252525` (bg-elevated) | `#eeeeee` |
| `#2a2a2a` (border-subtle) | `#e0e0e0` |
| `#d0d0d0` (text-primary) | `#111111` |
| `#888888` (text-secondary) | `#555555` |
| `#7c6af7` (accent) | `#6a55e8` |

Wave bar colors and card icon colors remain the same in both modes (they are per-sound colored).
