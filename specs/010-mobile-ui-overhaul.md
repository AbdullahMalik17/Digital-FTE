# Mobile UI/UX Overhaul Specification

## 1. Vision & Aesthetic
**Goal:** Transform "Abdullah Junior" into a premium, futuristic, yet clean "Personal AI OS".
**Style:** "Modern Tech" / "Glassmorphism Lite".
- **Vibe:** Professional, Intelligent, Fluid.
- **Core Elements:** Deep backgrounds, subtle gradients, soft shadows, and fluid animations.

## 2. Design System

### A. Color Palette
Moving away from default Tailwind colors to a semantic token system.

*   **Backgrounds:**
    *   `bg-background`: `#0F172A` (Slate 900) - Deep, rich dark mode base.
    *   `bg-surface`: `#1E293B` (Slate 800) - Cards and panels.
    *   `bg-surface-highlight`: `#334155` (Slate 700) - Active states.
*   **Accents (The "AI" Glow):**
    *   `primary`: `#3B82F6` (Blue 500) -> `#60A5FA` (Blue 400) gradient.
    *   `secondary`: `#8B5CF6` (Violet 500) - For wisdom/skills.
    *   `success`: `#10B981` (Emerald 500) - For task completion.
    *   `alert`: `#EF4444` (Red 500) - For urgent notifications.
*   **Typography:**
    *   `text-primary`: `#F8FAFC` (Slate 50) - High contrast.
    *   `text-secondary`: `#94A3B8` (Slate 400) - Subtitles.
    *   `text-accent`: `#38BDF8` (Sky 400) - Highlights.

### B. Typography
*   **Font:** System font (San Francisco/Roboto) is fine, but weight and spacing matter.
*   **Headers:** `text-3xl font-bold tracking-tight` (Tight tracking feels more modern).
*   **Body:** `text-base font-medium leading-relaxed`.
*   **Labels:** `text-xs font-bold uppercase tracking-widest text-muted`.

### C. Effects
*   **Glassmorphism:** Use `expo-blur` for headers and floating elements (tab bar).
*   **Shadows:** Colored shadows (glows) instead of black shadows for active elements.

## 3. Component Enhancements

### A. "Glass" Tab Bar
Instead of the standard bottom bar:
*   Floating pill-shape container.
*   Blur background.
*   Active tab has a glowing dot indicator and slides into place.

### B. Dashboard Widgets
Transform simple lists into interactive Widgets:
1.  **"Pulse" Card:** Shows AI heartbeat/status (Online, Processing, Idle) with a gentle breathing animation.
2.  **Quick Actions Grid:** 2x2 grid for common tasks (Add Task, Voice Command, Scan Doc).
3.  **Timeline:** Vertical line connector for the Calendar/Schedule view.

### C. Animations (Reanimated)
*   **Entry:** Screens don't just appear; content *cascades* in (staggered fade-up).
*   **Press:** Buttons scale down (`0.98`) slightly on press for tactile feel.
*   **Lists:** New items slide in from the side.

## 4. Implementation Plan

### Phase 1: Foundation (Theming)
1.  Update `tailwind.config.js` with new semantic colors.
2.  Create `ThemeContext` (if not fully relying on NativeWind dark mode).
3.  Install `expo-blur` and `react-native-reanimated`.

### Phase 2: Core Components
1.  Refactor `Card` to support gradients and glass styles.
2.  Build `AnimatedButton` component.
3.  Create the Custom Tab Bar.

### Phase 3: Screen Revamps
1.  **Dashboard:** Implement the Widget grid.
2.  **Skills:** Use a "Hexagon" or "Grid" layout for skills instead of a simple list.
3.  **Chat:** Add bubble animations and typing indicators.

### Phase 4: Polish
1.  Add Haptics (`expo-haptics`) to all interactions.
2.  Verify accessibility (contrast ratios).
