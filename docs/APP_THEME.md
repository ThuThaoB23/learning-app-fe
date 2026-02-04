# Learning App Theme Guide

This document defines the primary visual theme for the app so future changes
stay consistent across pages and components.

## 1) Brand Direction
- Personality: Calm, focused, disciplined, modern.
- Mood: Warm neutrals with energetic accents.
- Keywords: Clarity, momentum, trust, progress.

## 2) Typography
- Primary: Geist Sans (already configured).
- Monospace: Geist Mono (for code or IDs).
- Scale:
  - H1: 40-48px / 1.1
  - H2: 28-32px / 1.2
  - H3: 20-24px / 1.25
  - Body: 14-16px / 1.6
  - Small: 12-13px / 1.4
- Weight: 400-600. Avoid extra-bold except hero headlines.

## 3) Color System
### Core
- Ink (primary text): #0B0F14
- Fog (secondary text): #64748B
- Paper (background): #F7F4EF
- Card (surface): #FFFFFF

### Accent
- Blue: #3B82F6
- Emerald: #34D399
- Amber: #FBBF24
- Rose: #FB7185

### Admin Dark
- Admin Background: #0B0F14
- Admin Surface: #0F172A
- Admin Border: rgba(255,255,255,0.10)
- Admin Text: #E7EDF3

### Gradients
- Warm Glow: radial-gradient(circle at center, #F9D27C, transparent 70%)
- Mint Glow: radial-gradient(circle at center, #8BD6C8, transparent 70%)
- Admin Blue: radial-gradient(circle at center, #1D4ED8, transparent 70%)
- Admin Gold: radial-gradient(circle at center, #FBBF24, transparent 70%)

## 4) Layout Foundations
- Max width: 1200-1500px depending on area.
- Global padding: 24px mobile, 40px desktop.
- Section spacing: 48-72px.
- Cards: rounded 16-24px, soft shadows.

## 5) Components
### Buttons
- Primary: solid ink or dark surface, white text.
- Secondary: white surface with subtle border.
- Admin: translucent dark + white text.
- Radius: 12-999px depending on shape (CTA uses pill).

### Inputs
- Background: white.
- Border: #E5E7EB.
- Focus: ring with 20% opacity of primary (ink or blue).
- Radius: 12px.

### Cards
- Light mode: white surface, soft shadow.
- Admin: glass surface with 10% white border.

### Badges/Chips
- Use soft tint backgrounds (10-20% opacity).
- Status mapping:
  - Success: Emerald
  - Warning: Amber
  - Error: Rose
  - Info: Blue

## 6) Motion
- Subtle, confident.
- Default transitions: 200-250ms ease-out.
- Hover: slight lift (translateY -1px) or background tint.

## 7) Page Themes
### Marketing
- Background: Paper with warm/mint glow blobs.
- Typography: large headline, calm body.
- CTAs: pill-shaped.

### Auth
- Shared with marketing but tighter card layout.
- Background blobs and glass card.

### Admin
- Dark foundation with blue/gold glow.
- Glass cards, stronger contrast.
- Emphasis on data density and hierarchy.

## 8) Usage Rules
- Prefer neutrals for most UI; reserve accents for highlights.
- Keep contrast strong for accessibility.
- Avoid mixing more than 2 accents in one section.
- Maintain consistent border radius and spacing.
