---
name: Bethany Nature Care
colors:
  surface: '#f9faf6'
  surface-dim: '#d9dad7'
  surface-bright: '#f9faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f0'
  surface-container: '#edeeea'
  surface-container-high: '#e7e9e5'
  surface-container-highest: '#e2e3df'
  on-surface: '#1a1c1a'
  on-surface-variant: '#414844'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#f0f1ed'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#2b694d'
  on-secondary: '#ffffff'
  secondary-container: '#b0f1cc'
  on-secondary-container: '#327053'
  tertiary: '#3f1d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f2f00'
  on-tertiary-container: '#ea9147'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#b0f1cc'
  secondary-fixed-dim: '#94d4b1'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#0c5136'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb781'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#f9faf6'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3df'
  forest-deep: '#081C15'
  sage-wash: '#D8E2DC'
  bark-brown: '#606C38'
  sun-warmth: '#FEFAE0'
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
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1280px
---

## Brand & Style
The design system for Bethany Nature Care is defined by the narrative of **Ayurvedic Vitality and Clinical Excellence**. It bridges the gap between traditional holistic healing and modern medical reliability. The brand personality is nurturing, grounded, and serene, yet retains a rigorous professional structure suitable for healthcare.

The visual style is **Modern Minimalism with Tactile Organicism**. It moves away from sterile whites and clinical blues toward a palette that evokes a forest floor—dense greens, dappled sunlight, and earthy textures. High-quality whitespace is treated as "breathing room," and the UI maintains a refined, clean structure to ensure that the natural aesthetic never compromises the clarity required for patient care and data management.

## Colors
The color palette is inspired by the layers of a forest, using varying shades of green and warm earth tones to create a calming, therapeutic environment.

*   **Primary (Forest Green):** A deep, authoritative green used for core branding, primary navigation, and headers to establish a sense of grounded wisdom.
*   **Secondary (Soft Sage):** A light, revitalizing green reserved for primary action buttons, success states, and progress indicators.
*   **Tertiary (Warm Wood):** An autumnal brown used for subtle accents, specialized notifications, or to highlight holistic treatment plans.
*   **Neutral (Parchment):** A soft, off-white background (#F8F9F5) that is easier on the eyes than pure white, evoking the feel of organic paper.
*   **Functional Colors:** Errors are represented by a muted terracotta rather than a jarring bright red, maintaining the organic harmony while signaling importance.

## Typography
Inter remains the typographic foundation to ensure clinical precision. Its high legibility and neutral character provide a necessary counter-balance to the lush color palette.

To lean into the nature-inspired direction, headings should utilize tighter letter-spacing for a modern, editorial feel. Large numerical displays (vital signs, dosages) must use the `tabular-nums` OpenType feature to ensure vertical alignment in data grids. Text hierarchy is strictly enforced to guide users through complex medical records without overwhelm.

## Layout & Spacing
The layout follows a **fluid grid** model with a focus on "open-air" composition. Wide margins and generous vertical rhythm prevent the interface from feeling cramped or stressful.

*   **Grid:** A 12-column grid for desktop, collapsing to 4 columns on mobile. 
*   **Rhythm:** Vertical spacing should follow a 4x increment. Use 48px or 64px sections to separate distinct patient data modules.
*   **Reflow:** On smaller screens, sidebars transition to a bottom-fixed navigation bar or a hidden drawer to prioritize the reading area.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Soft Organic Shadows**. Instead of harsh grey shadows, this system uses low-opacity shadows tinted with the primary forest green to create a more natural, integrated appearance.

*   **Layer 0 (Base):** The neutral parchment background.
*   **Layer 1 (Cards):** Containers use a 1px solid border in `sage-wash` with no shadow for a flat, modern look.
*   **Layer 2 (Interactive):** Floating elements like modals or active dropdowns use a "Dappled Shadow"—a very soft, wide-spread blur (0 8px 24px) with a 5% opacity green tint, simulating a soft lift from the surface.

## Shapes
The shape language is "Rounded," drawing inspiration from smooth river stones and botanical curves. This approach softens the clinical nature of the application and makes it feel more accessible.

*   **Inputs & Buttons:** Use the standard 0.5rem (8px) radius.
*   **Containers:** Larger cards and modals use 1rem (16px) to emphasize the friendly, welcoming nature of the care center.
*   **Icons:** Should feature rounded terminals and avoid sharp points to remain consistent with the overall soft-geometric aesthetic.

## Components
Components are designed to be high-contrast and easy to interact with, even in busy care environments.

*   **Buttons:** Primary buttons are `Forest Green` with white text. Secondary buttons use a `Sage Wash` background with `Forest Green` text. This provides a clear hierarchy while maintaining the botanical theme.
*   **Inputs:** Fields are bordered in `Bark Brown` at low opacity. On focus, they transition to a 2px `Secondary Green` border with a subtle inner glow.
*   **Cards:** Use a flat style with 16px internal padding. Headers within cards should have a subtle `Sun Warmth` background to differentiate the title area from the content.
*   **Progress Bars:** Designed as "Vines," using a continuous green line that grows across the screen, avoiding the harsh blue or red default states.
*   **Status Indicators:** Ayurvedic health status (e.g., Vata, Pitta, Kapha) should be represented by organic, pill-shaped chips with low-saturation background fills.