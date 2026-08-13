# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MCM 케어 (MCM Care) — a React + Vite front-end for an MCM after-sales-service (AS) product: product registration, AI-based damage/estimate analysis, pickup scheduling, and repair status tracking. All user-facing text is Korean.

## Commands

```
npm run dev       # start Vite dev server
npm run build      # production build (vite build)
npm run lint       # oxlint (config: .oxlintrc.json)
npm run preview    # preview a production build
```

There is no test suite in this repo.

Known environment issue: in some Windows shells `npm run build` exits non-zero (exit 127) right after "transforming... N modules transformed" even on unmodified code — this is a pre-existing toolchain/environment issue (Vite 8 + `@rolldown/plugin-babel`), not a code error. Verify changes with `npm run dev` and `npm run lint` instead of relying on `npm run build` succeeding in that shell.

## Architecture

**Entry / routing.** `src/main.jsx` mounts `RouterProvider` with the router from `src/router/index.jsx` (re-exported through `src/router/index.js`). Every route is nested under a single `MainLayout` at `/`, defined with `createBrowserRouter`. `src/App.jsx` (rendering bare `<MainLayout />`) is unused by the actual entry point — `main.jsx` goes straight to the router.

**Layout.** `src/layouts/MainLayout.jsx` renders `Header` (fixed top nav, `src/components/Header.jsx`) plus an `Outlet` with top padding to clear the fixed header. `Footer.jsx` currently renders `null`. Add new routes as children of `MainLayout` in `src/router/index.jsx` and, if they should be reachable from the nav, add a link in `Header.jsx`.

**Pages (`src/page/*.jsx`).** One file per route, no shared page-shell component — instead every page redeclares the same shell as local `styled-components`: an outer `Page` (white card, `border-radius: 12px`, subtle shadow) → `BodyRow` → `Body` (24px padding, column flex, `gap: 16px`), then a `SectionTitle`, and content organized into `Card` blocks (`background: #f9fafb`, `border: 1px solid #e5e7eb`, `border-radius: 6px`) laid out in one or two columns via a `Columns` grid (`minmax(0, 1fr) minmax(...)`, collapsing to one column under `max-width: 900px`). When adding or editing a page, match this existing shell/token set (colors `#1f2937` text / `#e5e7eb` borders / `#f9fafb` card bg / `#9ca3af` placeholder, font sizes 11–16px, 6px radii) rather than introducing a new visual system.

**Cross-page state.** Pages pass data forward via `useNavigate(path, { state: {...} })` and read it back with `useLocation().state`, always with sensible Korean-sample defaults so a page renders standalone if visited without state (see `PickupReservationPage` reading `receiptInfo`, `ReservationCompletePage` reading reservation details, `AiEstimatePage` reading `formData`/`photos`).

**AS flow chain:** `home` → `AsStartPage` (`/as-start`) → `ProductInfoPage` (`/product-info`, collects product/damage info + photos) → `AiEstimatePage` (`/ai-estimate`, AI damage analysis + cost estimate, built from Figma) → `PickupReservationPage` (`/pickup-reservation`) → `ReservationCompletePage` (`/reservation-complete`). Separate/parallel routes: `MyAsListPage`/`MyAsDetailPage` (repair tracking), `PickAsPage`/`AiConciergePage` (AI consultation on an existing AS case), `login`/`signup`. `Header.jsx` links to `/product-info`, `/as-start`, `/my-as-list`, `/pick-as`.

**Unrouted pages.** `src/page/HandoverPage.jsx`, `HandoverCompletePage.jsx`, and `NoRecordPage.jsx` exist but currently have no entry in `src/router/index.jsx` — they're unreachable until a route is added. `src/page/sahe.jsx` is a scratch/placeholder page wired to `/sehae`; don't treat it as a real feature route.

**Styling.** `styled-components` v6 only — no CSS modules/Tailwind. Variant props on styled components use a `$`-prefixed transient prop (e.g. `$variant="secondary"`, `$hasValue`, `$selected`) to avoid leaking non-standard attributes to the DOM, switched via `css` helper blocks or ternaries. Global reset lives in `src/css/index.css`.

**Compiler.** React Compiler is enabled (`babel-plugin-react-compiler` via `@rolldown/plugin-babel` in `vite.config.js`) — avoid manual `useMemo`/`useCallback` micro-optimizations that fight the compiler; write plain component code.

## Figma

This project has designs in Figma; the Figma MCP tools/skills (`figma-design-to-code`, etc.) are available and have been used to port screens (e.g. `AiEstimatePage`). When implementing a Figma node, pull it with `get_design_context` and adapt the returned React+Tailwind reference into the page's existing styled-components shell/tokens above — don't paste Tailwind or introduce a second styling system.
