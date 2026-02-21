---
id: "0005"
title: "Mobile App 9 Integrations Update"
stage: general
date: "2026-02-21"
surface: agent
model: claude-sonnet-4-6
feature: mobile-integrations
branch: main
user: Abdullah
command: "Update mobile app to show 9 integrations matching web frontend"
labels: ["mobile", "expo", "react-native", "integrations", "channels", "nativewind"]
links:
  SPEC: "null"
  TICKET: "null"
  ADR: "null"
  PR: "null"
files:
  - "mobile/app/(tabs)/_layout.tsx"
  - "mobile/app/(tabs)/index.tsx"
  - "mobile/app/(tabs)/integrations.tsx"
  - "mobile/app/(tabs)/settings.tsx"
tests: []
---

## Prompt

Update the Expo React Native mobile app at /mnt/e/WEB DEVELOPMENT/Hacathan_2/mobile/ to reflect 9 integrations (matching what the web frontend now shows).

The app currently has 5 integrations shown. We need it to show all 9: Gmail, WhatsApp, LinkedIn, Telegram, Twitter/X, Facebook, Instagram, Discord (coming soon), Slack (coming soon).

## Response

Made the following targeted changes:

### 1. `_layout.tsx` — Added "Channels" tab
- Imported `Zap` from `lucide-react-native`
- Added a new `<Tabs.Screen name="integrations">` entry with `title: 'Channels'` and `Zap` icon, inserted before the Settings tab

### 2. `index.tsx` (Dashboard) — Added Active Channels section + updated system info
- Added a new "Active Channels" section above System Info, rendering 9 `ChannelRow` components (7 active / 2 "Soon")
- Added a `ChannelRow` helper component at the bottom of the file (emoji icon, name, green/grey status dot + "Live"/"Soon" label)
- Tapping "View all" navigates to `/integrations`
- Updated system info footer text from "5 agents running" to "9 channels connected"

### 3. `integrations.tsx` — New screen (created)
- Full `IntegrationsScreen` with `LinearGradient` background, `SafeAreaView`, `ScrollView`
- Stats row: Active (7), Total (9), Soon (2)
- One card per integration with coloured icon box, name, description, env key, and status dot
- Discord and Slack shown at 0.6 opacity with grey "Soon" status

### 4. `settings.tsx` — Added Integrations Config section
- Inserted a new `SectionLabel` + `SettingsCard` between "Server Configuration" and "Notifications"
- Shows a note about `config/integrations.env`, then lists all 9 integrations with their env keys and green/grey status dots
- Dimmed (0.5 opacity) rows for Discord and Slack

## Outcome

All 4 files updated. The mobile app now reflects the same 9-integration channel list as the web frontend.
