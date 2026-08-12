---
version: 1.0
name: MindMate-Editorial-Teal
description: A calming, editorial interface for the MindMate AI companion. The system anchors on a tinted cream canvas with serif display headlines, therapeutic teal CTAs, and stark dark navy surfaces reserved strictly for emergency/crisis intervention cards. The cream/teal pairing is deliberately warm and grounding to reduce anxiety. Type voice runs a slab-serif display ("Copernicus" / Tiempos Headline / Garamond) for h1/h2 and a humanist sans (Inter) for body and dashboard metrics.

colors:
  primary: "#0f766e"        # Teal 700 - Therapeutic, calming primary action
  primary-active: "#115e59" # Teal 800 - Hover state
  primary-disabled: "#e6dfd8"
  ink: "#141413"            # Warm dark, off-black for text
  body: "#3d3d3a"           # Default running text
  body-strong: "#252523"
  muted: "#6c6a64"
  muted-soft: "#8e8b82"
  hairline: "#e6dfd8"
  hairline-soft: "#ebe6df"
  canvas: "#faf9f5"         # Tinted cream canvas - The floor of the app
  surface-soft: "#f5f0e8"
  surface-card: "#efe9de"   # Slightly darker cream for dashboard cards
  surface-cream-strong: "#e8e0d2"
  surface-dark: "#181715"   # Reserved for Crisis Safety Net & Emergency Modals
  surface-dark-elevated: "#252320"
  on-primary: "#ffffff"
  on-dark: "#faf9f5"
  on-dark-soft: "#a09d96"
  mood-positive: "#10b981"  # Emerald 500
  mood-neutral: "#3b82f6"   # Blue 500
  mood-negative: "#f43f5e"  # Rose 500

typography:
  display-xl:
    fontFamily: "Copernicus, Tiempos Headline, Garamond, serif"
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -1.5px
  display-lg:
    fontFamily: "Copernicus, Tiempos Headline, Garamond, serif"
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -1px
  display-md:
    fontFamily: "Copernicus, Tiempos Headline, Garamond, serif"
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.5px
  title-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.3
  title-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.4
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  button:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1

rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px
  full: 9999px

spacing:
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 40px
  dashboard-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 32px
    shadow: "shadow-sm"
  emergency-modal:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.xl}"
    padding: 48px
    border: "2px solid {colors.mood-negative}"
  chat-bubble-ai:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    border: "1px solid {colors.hairline}"
    padding: 16px 24px
    rounded: "{rounded.xl}"
  chat-bubble-user:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: 16px 24px
    rounded: "{rounded.xl}"
---

## Do's and Don'ts

### Do
- Anchor every page on the cream canvas (`#faf9f5`). Pure white reads as sterile; the warm tint is the therapeutic differentiator.
- Use Serif display sizes for journal entry titles, AI greetings, and marketing h1s.
- Use Sans-serif (Inter) for dashboard numbers, mood logger buttons, and UI navigation.
- Apply `{spacing.section}` (96px) between major vertical sections to give the user cognitive breathing room.
- Render AI chat responses using the serif typography on a cream bubble to make it feel like a thoughtful letter rather than a robotic output.

### Don't
- Don't use pure black text. Use the Ink off-black to reduce eye strain.
- Don't repeat heavy borders. Let the `{colors.surface-card}` background color and padding visually group the dashboard elements.
- Don't use the dark surfaces (`{colors.surface-dark}`) for standard features. Keep it reserved purely for the Crisis Safety Net so it commands immediate attention when activated.