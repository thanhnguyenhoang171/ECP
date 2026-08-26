<!-- impeccable:design-schema 1 -->

# DESIGN.md — ECP Admin Design System & Audited Code Reality

## Architectural Foundation
- **Framework**: Next.js App Router (React 19, `@/app` & `@/src` architecture)
- **Styling Pipeline**: Tailwind CSS v4 with `@tailwindcss/postcss` and CSS Variables in `@/src/index.css`
- **UI Components**: `@radix-ui/react-*` primitive wrappers customized with `class-variance-authority` (shadcn pattern)
- **Icons**: `lucide-react` with standard `size-4` shrink-0 sizing in buttons
- **State & Data**: `@tanstack/react-query` v5 for server state, `zustand` v5 for local app state, `react-hook-form` + `zod` for forms

## Visual Aesthetic & Audited Tokens

### Background & Canvas Identity
- **Canvas Base**: Full-height viewport lock (`100dvh`, fixed scroll control)
- **Dot Matrix Pattern**:
  - Light mode: Pure white `#ffffff` background layered with a subtle blue dot grid (`radial-gradient(rgba(37, 99, 235, 0.18) 1.2px, transparent 1.2px)` on a `24px 24px` grid).
  - Dark mode: `hsl(var(--background))` with white dot grid (`radial-gradient(rgba(255, 255, 255, 0.1) 1.2px, transparent 1.2px)`).

### Color Palette Tokens
- **Primary Accent**: `hsl(221.2 83.2% 53.3%)` (#2563eb / Royal Blue)
- **Primary Hover/Border**: `#1d4ed8` (primary-700), `#2563eb` (primary-600)
- **Borders & Inputs**: `hsl(var(--border))` (`214.3 31.8% 91.4%` light, `217.2 32.6% 17.5%` dark)
- **Card & Popovers**: Pure white in light mode, `hsl(222.2 84% 4.9%)` in dark mode.

## Core Component Specifications

### 1. Buttons (`@/components/ui/button.tsx`)
Buttons feature a distinct tactical 3D push-down feel with subtle bottom borders:
- **Default (Primary)**: `bg-primary text-primary-foreground shadow-md shadow-primary/25 border-b-2 border-blue-700 hover:bg-primary/95 hover:-translate-y-0.5 active:border-b-0`
- **Destructive**: `bg-destructive text-destructive-foreground shadow-md shadow-rose-500/20 border-b-2 border-rose-700 hover:bg-destructive/90 hover:-translate-y-0.5 active:border-b-0`
- **Outline**: `border border-slate-200/90 border-b-2 border-b-slate-300 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:-translate-y-0.5 active:border-b-slate-200`
- **Ghost**: `hover:bg-blue-50 hover:text-blue-600`
- **Sizes**: `sm` (h-8 px-3 text-xs), `default` (h-9 px-4 py-2 text-sm), `lg` (h-11 px-8 text-base), `icon` (h-9 w-9).

### 2. Status Badges (`@/components/ui/badge.tsx`)
- **Default**: `bg-primary text-primary-foreground`
- **Secondary**: `bg-secondary text-secondary-foreground`
- **Destructive**: `bg-destructive text-destructive-foreground`
- **Success**: `bg-emerald-500 text-white shadow hover:bg-emerald-500/80`
- **Outline**: `border text-foreground`

### 3. Data Table (`@/components/common/DataTable.tsx`)
- **Headers**: Uppercase sub-text (`text-[11px] font-bold uppercase py-4 text-slate-500 whitespace-nowrap bg-slate-50/50`).
- **Zebra Row Striping**: Alternate row background (`even:bg-slate-100/40 border-b border-slate-50 hover:bg-slate-200`).
- **Skeleton Loaders**: Alignment-aware skeletons (`w-16 mx-auto` for center, `w-20 ml-auto` for right, `w-28` for left).
- **Empty State**: Central fallback using `EmptyState` component with custom title, description, and icon.

### 4. Common Reusable UI Toolkit (`@/components/common`)
- `DataTable` & `DataCard` (Tabular and card view formats for feature entities)
- `StatsCard` (Metric summary blocks with trends and icons)
- `DetailDialog` & `FormActionsBar` (Modal inspection and form action containers)
- `FileUpload` & `ImageUpload` (Drag & drop file handlers with crop preview modal `AvatarCropModal`)
- `FormattedNumberInput` & `DateInput` (Masked input controls for currency and dates)
- `NextPagination` (Page control navigation component)
- `Breadcrumbs` & `PageHeader` (Unified top-level page headers)

## UX Constraints & AGENTS.md Standards
- **Strict TypeScript**: All exports must be explicitly typed; no `any`.
- **Component Rules**: Functional components with hooks only; client components declared with `'use client'`.
- **Navigation Progress**: Integrated `nprogress` bar tuned to `#nprogress .bar { background: hsl(var(--primary)) !important; }`.
- **Notifications**: Toast alerts via `sonner`.
