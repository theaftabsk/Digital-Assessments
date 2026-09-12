# GREATCAMPUS UI/UX DESIGN SYSTEM — APPLE LIQUID GLASS & MONOCHROME SPECIFICATION

## 1. Core Visual Identity
- **Strict Black & White Palette**:
  - Background Canvas: `#F5F5F7` (Apple signature light neutral)
  - Primary Surface Cards: `rgba(255, 255, 255, 0.78)` with `backdrop-filter: blur(24px)`
  - Primary Elements / Accents / Buttons: `#000000` (Pure deep black)
  - Primary Text: `#000000`
  - Secondary Text: `#71717A` / `#A1A1AA`
  - Borders: `rgba(0, 0, 0, 0.05)` or `1px solid rgba(255, 255, 255, 0.9)`
  - Active Pills / Highlights: Solid black background with white text, or frosted translucent black (`bg-black/[0.04] text-black`)
  - **Zero colorful badges**: No generic blue, indigo, emerald, purple, orange, or yellow backgrounds on buttons, cards, or metrics. Everything must be monochrome with subtle dots or outline pills.

## 2. iPhone / Apple Liquid Glass Aesthetics
- Frosted glass cards:
  ```css
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.03);
  ```
- Corner Radius: High radius (`rounded-2xl` and `rounded-3xl`).
- Typography: Primary font is **Satoshi** with negative letter spacing (`tracking-tight`).
- Micro-interactions: Smooth hover transforms (`hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)]`).

## 3. Layout Rules
- **No Duplicate In-Page Header Titles**:
  - The top navigation bar (Header) already dynamically displays the active page title inside an Apple frosted pill (e.g. `• Exams & Assessments`).
  - Do NOT display duplicate large headers with paragraphs inside the page body.
  - Keep action buttons (`+ Create`, `Refresh`, `Filter`) right-aligned or in a sleek liquid glass toolbar.
- **Top Header Branding**:
  - Logo: Only display Super Admin's uploaded logo if present; otherwise show solely the organization name (`tenantName`).
  - No "Portal" text suffix.
  - Right side: User Profile Avatar & Role pill.
  - Sidebar collapse button is positioned at the bottom of the sidebar.
