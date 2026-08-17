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

**Pages (`src/page/*.jsx`).** Page files follow a `PREFIX_Name.jsx` convention: `AS_*` for anything in the after-sales-service flow (`AS_Start`, `AS_ProductInfo`, `AS_MyList`, …), `MCM_*` for everything else (`MCM_Home`, `MCM_Login`, `MCM_Signup`, `MCM_Sahe`). No `Page` suffix. The default-exported component in each file is named exactly like the file, and the router imports it under that same name — keep all three in sync when adding a page. One file per route, no shared page-shell component — instead every page redeclares the same shell as local `styled-components`: an outer `Page` (white card, `border-radius: 12px`, subtle shadow) → `BodyRow` → `Body` (24px padding, column flex, `gap: 16px`), then a `SectionTitle`, and content organized into `Card` blocks (`background: #f9fafb`, `border: 1px solid #e5e7eb`, `border-radius: 6px`) laid out in one or two columns via a `Columns` grid (`minmax(0, 1fr) minmax(...)`, collapsing to one column under `max-width: 900px`). When adding or editing a page, match this existing shell/token set (colors `#1f2937` text / `#e5e7eb` borders / `#f9fafb` card bg / `#9ca3af` placeholder, font sizes 11–16px, 6px radii) rather than introducing a new visual system.

**Cross-page state.** Pages pass data forward via `useNavigate(path, { state: {...} })` and read it back with `useLocation().state`, always with sensible Korean-sample defaults so a page renders standalone if visited without state (see `AS_PickupReservation` reading `receiptInfo`, `AS_ReservationComplete` reading reservation details, `AS_AiEstimate` reading `formData`/`photos`).

**AS flow chain:** `MCM_Home` → `AS_Start` (`/as-start`) → `AS_ProductInfo` (`/product-info`, collects product/damage info + photos) → `AS_AiEstimate` (`/ai-estimate`, AI damage analysis + cost estimate, built from Figma) → `AS_PickupReservation` (`/pickup-reservation`) → `AS_ReservationComplete` (`/reservation-complete`). Separate/parallel routes: `AS_MyList`/`AS_MyDetail` (repair tracking), `AS_Pick`/`AS_AiConcierge` (AI consultation on an existing AS case), `MCM_Login`/`MCM_Signup`. `Header.jsx` links to `/product-info`, `/as-start`, `/my-as-list`, `/pick-as`.

**Unrouted pages.** `src/page/AS_Handover.jsx`, `AS_HandoverComplete.jsx`, and `AS_NoRecord.jsx` exist but are empty files with no entry in `src/router/index.jsx` — they're unreachable until they're implemented and a route is added. `src/page/MCM_Sahe.jsx` is a scratch/placeholder page wired to `/sehae`; don't treat it as a real feature route.

**Styling.** `styled-components` v6 only — no CSS modules/Tailwind. Variant props on styled components use a `$`-prefixed transient prop (e.g. `$variant="secondary"`, `$hasValue`, `$selected`) to avoid leaking non-standard attributes to the DOM, switched via `css` helper blocks or ternaries. Global reset lives in `src/css/index.css`.

**Shared components.** Besides `Header`/`Footer`, `src/components/Button.jsx` is the one reused UI primitive across pages — takes `variant` (`"filled"` default / `"stroke"`) and `size` (`"default"` / `"big"`) props, not raw `<button>`s. Everything else in a page (cards, form fields, layout) is page-local styled-components per the shell convention above, not extracted into `src/components`.

**No backend yet.** There is no API/fetch layer — pages work off local constants/mock data defined in the page file itself (e.g. `MCM_Home.jsx`'s `AS_ITEMS`) or off `useLocation().state` passed from the previous step. When implementing a feature that would need real data, follow this pattern (module-level mock array/object in the page) rather than introducing a data-fetching library.

**Compiler.** React Compiler is enabled (`babel-plugin-react-compiler` via `@rolldown/plugin-babel` in `vite.config.js`) — avoid manual `useMemo`/`useCallback` micro-optimizations that fight the compiler; write plain component code.

## Figma

This project has designs in Figma; the Figma MCP tools/skills (`figma-design-to-code`, etc.) are available and have been used to port screens (e.g. `AS_AiEstimate`). When implementing a Figma node, pull it with `get_design_context` and adapt the returned React+Tailwind reference into the page's existing styled-components shell/tokens above — don't paste Tailwind or introduce a second styling system.
