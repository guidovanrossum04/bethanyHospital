---
name: CarePulse
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058bc'
  on-secondary: '#ffffff'
  secondary-container: '#0070eb'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00201d'
  on-tertiary-container: '#0c9488'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#004493'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is anchored in the concept of **Clinical Precision with Human Compassion**. It serves a dual purpose: providing medical professionals with a high-utility, low-friction interface for complex data management, while offering patients a sense of calm and reliability.

The visual style is **Corporate Modern with a Clinical Edge**. It utilizes a structured, flat UI that prioritizes information architecture over decorative elements. The aesthetic is clean and surgical, utilizing expansive white space to reduce cognitive load during critical decision-making. High contrast and a "utility-first" mindset ensure that the interface remains accessible and legible in high-pressure hospital environments.

## Colors
This design system uses a palette rooted in traditional medical trust and modern digital efficiency.

*   **Primary (Deep Navy):** Used for persistent navigation, sidebars, and primary headings to establish authority and permanence.
*   **Secondary (Medical Blue):** The core action color. Reserved for primary buttons, active states, and critical interactive elements.
*   **Tertiary (Soft Teal):** Dedicated to success states, healthy metrics, and "confirmed" status indicators.
*   **Neutral (Slate/Grey):** Used for secondary text, iconography, and structural borders to maintain a low-noise environment.
*   **Backgrounds:** Predominantly white (#FFFFFF) to emulate a clean, sterile, and professional atmosphere.

## Typography
Inter is selected for its exceptional legibility in data-heavy environments. The typeface features a large x-height and distinct letterforms, which are crucial for distinguishing between numbers and characters in medical dosages or patient IDs.

Numerical data should always use `tabular-nums` (monospaced numbers) within tables and dashboards to ensure columns align perfectly for quick scanning. Labels use a slightly heavier weight to differentiate them from user input and body text.

## Layout & Spacing
The layout follows a **structured fluid grid** system. To prevent "information density fatigue," the system utilizes a generous 8px base unit for all padding and margins.

*   **Dashboard Layout:** Uses a fixed left-hand navigation (240px) with a fluid content area.
*   **Forms:** Utilize a single-column layout for complex medical entries to ensure a logical top-to-bottom reading path. Large forms should be broken into logical sections using 48px vertical spacing.
*   **Responsiveness:** On mobile, margins reduce to 16px. Multi-column data tables should transition to a card-based vertical stack or utilize horizontal scrolling with locked first columns for patient names.

## Elevation & Depth
The design system employs **Tonal Layering** combined with subtle **Ambient Shadows** to define hierarchy.

*   **Surface Level (Level 0):** The main background is white.
*   **Sectional Depth (Level 1):** Cards and content containers use a 1px solid border (#E2E8F0) with no shadow to maintain a flat, clinical look.
*   **Interactive Elevation (Level 2):** Modals, dropdowns, and active cards use a soft, diffused shadow (0px 4px 12px rgba(15, 23, 42, 0.08)) to appear "hovering" above the workspace.
*   **Zero Shadows:** Buttons and input fields remain flat, using color shifts and border-weight changes rather than shadows to indicate state.

## Shapes
The system uses a "Soft" corner radius (4px) to balance professional rigidity with modern approachability.

*   **Buttons & Inputs:** 4px radius (Soft) maintains a precise, organized feel.
*   **Cards & Modals:** 8px radius (Large) helps soften the overall UI and visually separates major content sections.
*   **Status Badges:** Pill-shaped (Full radius) to distinguish them from interactive buttons.

## Components
Consistent component behavior is vital for reducing user error in medical workflows.

*   **Buttons:** Primary actions use #007AFF with white text. Secondary actions use a ghost style (grey border, navy text). Danger actions (e.g., Delete Record) use a high-contrast red (#DC2626).
*   **Input Fields:** Use a 1px #E2E8F0 border. On focus, the border transitions to 2px #007AFF. Error states must include both a red border and an assistive icon for accessibility.
*   **Status Chips:** Use a subtle background tint (10% opacity) of the status color with high-contrast text (e.g., Success: Light Teal BG / Dark Teal Text).
*   **Data Tables:** Rows must have a hover state (#F8FAFC) and subtle dividers. Dense data views should offer a "compact" toggle that reduces row padding from 16px to 8px.
*   **Patient Headers:** A specialized component for the top of patient records, containing essential info (Age, Blood Type, Allergies) in a high-visibility, light-blue banner.