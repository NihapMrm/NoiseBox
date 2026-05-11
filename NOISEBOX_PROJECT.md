# Noisebox — Project Documentation

> A white-label ambient sound mixer desktop app built with Tauri + React.
> Drag-and-drop canvas interface inspired by n8n. Mix unlimited layered sounds with full per-track control.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Features & Scope](#4-features--scope)
5. [Audio Engine](#5-audio-engine)
6. [Data Model](#6-data-model)
7. [State Management](#7-state-management)
8. [Preset System](#8-preset-system)
9. [Sound Library](#9-sound-library)
10. [Tauri Backend](#10-tauri-backend)
11. [Build & Distribution](#11-build--distribution)
12. [Roadmap](#12-roadmap)

---

## 1. Project Overview

Noisebox is a native Windows (and cross-platform) desktop application that lets users create personalized ambient noiseboxs by mixing multiple layered audio tracks on a free-form canvas. Each sound is a draggable card with individual volume control. Users can save and load named presets, import their own audio files, and set focus timers.

**Target users:** Developers, writers, remote workers, students — anyone who needs ambient audio for focus or relaxation.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Desktop shell | Tauri 2.x (Rust) | Native window, file system, tray |
| Frontend framework | React 18 + Vite | UI rendering |
| Styling | Tailwind CSS | Utility-first CSS |
| Drag & Drop | dnd-kit | Canvas card dragging |
| Audio playback | Howler.js | Looping, volume, fading |
| State management | Zustand | Global app state |
| Persistence | Tauri store plugin | Presets + settings saved locally |
| Icons | Lucide React | UI icons |
| Animations | Framer Motion | Card entrance, wave bars |
| Package manager | pnpm | Fast installs |

---

## 3. Folder Structure

```

├── src-tauri/                  # Rust / Tauri backend
│   ├── src/
│   │   ├── main.rs             # Tauri app entry
│   │   ├── commands.rs         # Custom Tauri commands
│   │   └── lib.rs
│   ├── tauri.conf.json         # Tauri config (app name, window size, permissions)
│   ├── Cargo.toml
│   └── icons/                  # App icons (png, ico, icns)
│
├── src/                        # React frontend
│   ├── main.tsx                # React entry
│   ├── App.tsx                 # Root component
│   │
│   ├── components/
│   │   ├── TopBar.tsx          # Logo, presets, master play
│   │   ├── BottomBar.tsx       # Master volume, timer, status
│   │   ├── Canvas.tsx          # Infinite grid drag canvas
│   │   ├── SoundCard.tsx       # Individual sound node card
│   │   ├── SearchPanel.tsx     # Sound search + add drawer
│   │   ├── Bin.tsx             # Trash bin drop target
│   │   ├── PresetModal.tsx     # Save / manage presets
│   │   └── TimerModal.tsx      # Sleep / pomodoro timer
│   │
│   ├── store/
│   │   ├── soundStore.ts       # Active sounds state (Zustand)
│   │   ├── presetStore.ts      # Presets state
│   │   └── settingsStore.ts    # Master volume, timer, theme
│   │
│   ├── audio/
│   │   ├── engine.ts           # Howler.js wrapper / audio engine
│   │   └── sounds.ts           # Built-in sound definitions
│   │
│   ├── hooks/
│   │   ├── useAudio.ts         # Hook to bind store → audio engine
│   │   ├── useDrag.ts          # Canvas drag logic
│   │   └── useTimer.ts         # Pomodoro / sleep timer logic
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   │
│   └── assets/
│       └── sounds/             # Bundled default audio files (.ogg)
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── NOISEBOX_PROJECT.md       # This file
```

---

## 4. Features & Scope

### v1.0 — Core (MVP)

- **Canvas workspace** — infinite dot-grid background, freely position sound cards anywhere
- **Sound cards** — per-card toggle, volume slider, animated wave bars when active
- **Drag & drop** — drag cards to reposition; drag to bin to delete
- **Search & add** — search panel with all available sounds, filter by name/tag, add to canvas
- **Built-in sounds** — minimum 14 default sounds (rain, thunder, birds, wind, fire, café, ocean, forest, fan, crowd, creek, train, keyboard, night bugs)
- **Master controls** — global play/pause, master volume slider
- **Presets** — save current mix as named preset, load/delete presets, stored locally
- **Timer** — sleep timer (stop after N minutes) + Pomodoro mode (25/5 cycle)
- **Custom import** — import any mp3/ogg/wav file as a new sound card
- **System tray** — minimize to tray, quick play/pause from tray icon

### v1.1 — Polish

- Fade in / fade out on toggle
- Card color themes (user can change card accent color)
- Mini-player mode (compact 300px window)
- Keyboard shortcuts (Space = play/pause, etc.)

### v2.0 — Future

- Online sound library (stream additional sounds)
- Collaborative presets (share a preset via link)
- EQ per track (bass/mid/treble sliders)
- Visualizer mode (full-screen animated wave background)

---

## 5. Audio Engine

Howler.js handles all playback. Each active sound card maps to one `Howl` instance.

```ts
// src/audio/engine.ts

import { Howl } from 'howler'

const instances: Record<string, Howl> = {}

export function playSound(id: string, src: string, volume: number) {
  if (instances[id]) {
    instances[id].volume(volume / 100)
    return
  }
  instances[id] = new Howl({
    src: [src],
    loop: true,
    volume: volume / 100,
    autoplay: true,
  })
}

export function stopSound(id: string) {
  instances[id]?.stop()
  delete instances[id]
}

export function setVolume(id: string, volume: number) {
  instances[id]?.volume(volume / 100)
}

export function fadeSound(id: string, toVolume: number, duration = 800) {
  const h = instances[id]
  if (!h) return
  h.fade(h.volume(), toVolume / 100, duration)
}

export function stopAll() {
  Object.keys(instances).forEach(stopSound)
}
```

**Key rules:**
- All sounds loop indefinitely (`loop: true`)
- Volume is always normalized 0–1 for Howler (divide UI value by 100)
- Fade on toggle (400ms fade-in, 600ms fade-out) for smooth UX
- Master volume multiplies per-track volume: `effectiveVol = (masterVol / 100) * (trackVol / 100)`

---

## 6. Data Model

```ts
// src/types/index.ts

export interface SoundDefinition {
  id: string           // unique key e.g. 'rain'
  name: string         // display name e.g. 'Rain'
  icon: string         // lucide icon name e.g. 'CloudRain'
  color: string        // card accent hex
  iconColor: string    // icon hex
  tag: string          // category: 'weather' | 'nature' | 'indoor' | 'travel' | 'custom'
  src: string          // audio file path or URL
}

export interface ActiveSound extends SoundDefinition {
  vol: number          // 0–100
  active: boolean      // playing or muted
  x: number            // canvas X position (px)
  y: number            // canvas Y position (px)
}

export interface Preset {
  id: string
  name: string
  createdAt: string
  sounds: ActiveSound[]
  masterVol: number
}

export interface AppSettings {
  masterVol: number
  timerMode: 'off' | 'sleep' | 'pomodoro'
  timerMinutes: number
  theme: 'dark' | 'light'
}
```

---

## 7. State Management

Zustand is used for all global state. Three separate stores keep concerns clean.

```ts
// src/store/soundStore.ts (simplified)

import { create } from 'zustand'
import { ActiveSound } from '../types'

interface SoundStore {
  sounds: ActiveSound[]
  addSound: (sound: ActiveSound) => void
  removeSound: (id: string) => void
  toggleSound: (id: string) => void
  setVolume: (id: string, vol: number) => void
  updatePosition: (id: string, x: number, y: number) => void
  loadSounds: (sounds: ActiveSound[]) => void
}

export const useSoundStore = create<SoundStore>((set) => ({
  sounds: [],
  addSound: (sound) => set((s) => ({ sounds: [...s.sounds, sound] })),
  removeSound: (id) => set((s) => ({ sounds: s.sounds.filter(s => s.id !== id) })),
  toggleSound: (id) => set((s) => ({
    sounds: s.sounds.map(s => s.id === id ? { ...s, active: !s.active } : s)
  })),
  setVolume: (id, vol) => set((s) => ({
    sounds: s.sounds.map(s => s.id === id ? { ...s, vol } : s)
  })),
  updatePosition: (id, x, y) => set((s) => ({
    sounds: s.sounds.map(s => s.id === id ? { ...s, x, y } : s)
  })),
  loadSounds: (sounds) => set({ sounds }),
}))
```

The `useAudio` hook watches the store and syncs changes to the Howler engine automatically.

---

## 8. Preset System

Presets are saved to disk via the Tauri store plugin (`@tauri-apps/plugin-store`). The store file lives at the OS app data directory.

```ts
// src/store/presetStore.ts (simplified)

import { Store } from '@tauri-apps/plugin-store'
import { Preset } from '../types'

const store = new Store('presets.json')

export async function savePreset(preset: Preset) {
  const all = await loadAllPresets()
  all.push(preset)
  await store.set('presets', all)
  await store.save()
}

export async function loadAllPresets(): Promise<Preset[]> {
  return (await store.get<Preset[]>('presets')) ?? []
}

export async function deletePreset(id: string) {
  const all = await loadAllPresets()
  await store.set('presets', all.filter(p => p.id !== id))
  await store.save()
}
```

---

## 9. Sound Library

Default sounds ship bundled with the app as `.ogg` files (smallest file size, best Howler.js compatibility).

| ID | Name | Tag | Source suggestion |
|---|---|---|---|
| rain | Rain | weather | freesound.org #401722 |
| thunder | Thunder | weather | freesound.org #103953 |
| birds | Birds | nature | freesound.org #473151 |
| wind | Wind | weather | freesound.org #366104 |
| fire | Fireplace | indoor | freesound.org #386752 |
| cafe | Café | indoor | freesound.org #205966 |
| ocean | Ocean Waves | nature | freesound.org #415758 |
| forest | Forest | nature | freesound.org #490513 |
| fan | Fan | indoor | freesound.org #264661 |
| crowd | Crowd | indoor | freesound.org #522426 |
| creek | Creek | nature | freesound.org #459827 |
| train | Train | travel | freesound.org #371277 |
| keyboard | Keyboard | indoor | freesound.org #542774 |
| night | Night Bugs | nature | freesound.org #399583 |

> All files from freesound.org are CC0 or CC-BY licensed. Check individual licenses before shipping.

For **custom imports**, Tauri's `dialog.open()` API is used to pick files, which are then copied to the app data directory and registered as user sounds.

---

## 10. Tauri Backend

Tauri is kept minimal — most logic lives in React. Custom Rust commands needed:

```rust
// src-tauri/src/commands.rs

#[tauri::command]
fn get_app_data_dir(app: tauri::AppHandle) -> String {
    app.path().app_data_dir()
        .unwrap()
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
fn open_file_dialog() -> Option<String> {
    // handled via tauri dialog plugin on frontend
    None
}
```

**Tauri plugins used:**

| Plugin | Purpose |
|---|---|
| `@tauri-apps/plugin-store` | Persist presets and settings |
| `@tauri-apps/plugin-dialog` | File picker for custom sounds |
| `@tauri-apps/plugin-fs` | Copy imported audio to app data dir |
| `@tauri-apps/plugin-autostart` | Optional: launch on startup |

**tauri.conf.json key settings:**

```json
{
  "app": {
    "windows": [{
      "title": "Noisebox",
      "width": 1100,
      "height": 680,
      "minWidth": 800,
      "minHeight": 500,
      "decorations": true,
      "transparent": false
    }]
  },
  "bundle": {
    "identifier": "io.noisebox.app",
    "icon": ["icons/icon.png", "icons/icon.ico"]
  }
}
```

---

## 11. Build & Distribution

### Dev setup

```bash
# Prerequisites: Node.js 18+, Rust, pnpm
pnpm install
pnpm tauri dev
```

### Production build

```bash
pnpm tauri build
# Output: src-tauri/target/release/bundle/
# Windows: .msi installer + .exe
# macOS: .dmg
# Linux: .AppImage + .deb
```

### Release checklist

- [ ] Test all 14 default sounds loop correctly
- [ ] Test preset save/load/delete
- [ ] Test custom audio import (mp3, ogg, wav)
- [ ] Test drag-to-bin deletion
- [ ] Test sleep timer stops audio at 0:00
- [ ] Test system tray minimize / restore
- [ ] Build on Windows, check installer
- [ ] Sign the binary (Windows SmartScreen)

---

## 12. Roadmap

| Version | Target | Key deliverable |
|---|---|---|
| v0.1 | Week 1 | Canvas + cards + drag working, no audio |
| v0.2 | Week 2 | Howler.js audio engine connected |
| v0.3 | Week 3 | Search panel + add/delete sounds |
| v0.4 | Week 4 | Presets save/load |
| v0.5 | Week 5 | Timer, tray icon, custom import |
| v1.0 | Week 6 | Polish, installer, release |
