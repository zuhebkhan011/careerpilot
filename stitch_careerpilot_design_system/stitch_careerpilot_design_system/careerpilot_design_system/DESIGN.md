---
name: CareerPilot Design System
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#465f88'
  on-secondary: '#ffffff'
  secondary-container: '#b6d0ff'
  on-secondary-container: '#3f5881'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2f1400'
  on-tertiary-container: '#bb7336'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#aec7f6'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#2d476f'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  numeric-score:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is built on the philosophy of **"Professional Precision with Human Warmth."** It targets the ambitious Indian workforce, balancing the high-stakes nature of career advancement with a supportive, agentic AI experience. 

The aesthetic deviates from typical "AI-as-magic" tropes (gradients, glows, futuristic blurs) and instead adopts a **Modern Editorial** style. It uses high-contrast typography and a structured, "fintech-grade" information density that conveys reliability, authority, and clarity. The visual language is grounded in professionalism, utilizing a warm substrate to remain approachable rather than sterile.

## Colors

The palette is anchored by a warm off-white background to reduce eye strain and provide a "paper-like" editorial feel. 

- **Primary & Text:** Deep Charcoal is used for maximum legibility. Deep Navy functions as the structural primary color for interaction states and key navigation elements.
- **Secondary Accent:** Muted Saffron is used sparingly as a "highlighter" for AI-driven insights, match scores, or "new" indicators, nodding to a modern Indian context without being overwhelming.
- **Semantic Colors:** Reserved strictly for status and feedback. They use professional, slightly desaturated tones to maintain the premium feel.

## Typography

This design system uses **Manrope** for its balanced, modern geometric proportions that remain highly legible in data-heavy contexts. 

- **Hierarchy:** Use `display-lg` for impactful landing sections. `headline-lg` and `headline-md` should be used for page titles and section headers respectively.
- **Body Text:** `body-md` is the standard for job descriptions and application details. 
- **Metadata:** Use `label-md` in All-Caps for tags, category headers, or small metadata strings.
- **Numbers:** For AI Match Scores or salary figures, use the bold weights to emphasize the data-driven nature of the agent.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict margin rules to ensure a "contained" professional feel on larger screens.

- **Mobile:** 4-column grid with 16px margins and 16px gutters. Elements should prioritize vertical stacking and high-touch areas at the bottom.
- **Desktop:** 12-column grid. The main content area should be capped at 1200px wide for optimal readability of long-form text (job descriptions, resumes).
- **Rhythm:** Use increments of 4px for all internal spacing. Components like cards and list items should use `lg` (24px) padding to maintain an airy, premium feel.

## Elevation & Depth

This design system avoids heavy shadows, instead using **Tonal Layering** and **Subtle Outlines** to define hierarchy.

- **Layer 0 (Background):** #FAF9F6.
- **Layer 1 (Cards/Surface):** Pure White (#FFFFFF) with a 1px solid border (#E5E5E5).
- **Layer 2 (Popovers/Toasts):** Pure White with a "Large Soft" shadow: `0px 12px 32px rgba(0, 0, 0, 0.08)`.
- **Interaction:** On hover, cards should not "lift" excessively. Instead, a subtle border-color change to Primary Accent (#002147) is preferred to signify focus.

## Shapes

The shape language is **Structured and Geometric.** 

- **Standard Elements:** Use a 6px - 8px radius for buttons, input fields, and small cards. This creates a sharp, professional tool-like aesthetic.
- **Containers:** Large job cards or application dashboard panels use a 12px radius.
- **Tags/Badges:** These are the only elements permitted to use a full "pill" radius (999px) to distinguish them from interactive buttons.
- **Borders:** Always 1px. Avoid thick borders or decorative dividers; whitespace should be the primary separator.

## Components

### Buttons
- **Primary:** Deep Navy (#002147) background, white text. No gradient. 8px radius.
- **Secondary:** Warm Saffron (#F4A261) background with Deep Charcoal text. Use only for "Apply Now" or "Magic Fix" AI actions.
- **Outline:** Transparent background, 1px border (#E5E5E5), Deep Charcoal text.
- **Ghost:** No border or background. Deep Navy text.

### Inputs
- **Text/Search:** White background, 1px #E5E5E5 border. On focus, the border changes to Deep Navy with a 2px outer "halo" of 10% opacity Deep Navy.
- **File Upload:** A dashed 1px border (#E5E5E5) with a light gray background (#F4F4F4). Use a centralized "Upload Resume" icon in Primary Accent.

### Badges & Tags
- **Match Score:** Uses a circular progress indicator or a pill-shaped badge with a Muted Saffron background to highlight AI confidence.
- **Status Tags:** Use low-saturation background tints (e.g., light green for 'Hired', light amber for 'Interviewing') with high-contrast text of the same hue.

### Cards
- **Job Card:** White background, 1px border. Title in `title-md`, company name in `body-sm` (gray). Footer of the card should contain metadata (location, salary) separated by small dots.

### Navigation
- **Desktop Sidebar:** Fixed width (260px). Deep Navy background or White with a right-hand border. Active states use a subtle side-accent of Muted Saffron.
- **Mobile Bottom Nav:** Pure White surface with 1px top border. Icons should be "line-art" style, 24px, becoming filled when active.

### Feedback
- **Toasts:** Positioned top-center. Minimal design with a solid semantic left-border (Success/Error).
- **Empty States:** Use monochromatic line-art illustrations and a clear Primary CTA button. Avoid playful/cartoonish styles.