# CrystalDBC Estates – AI Coding Agent Guide

Concise, project-specific conventions to be immediately productive. Do not add speculative patterns; follow what exists.

## Stack & Build
- Tooling: Vite + React 18 + TypeScript + TailwindCSS + shadcn/radix UI components + React Router v6 + React Query (initialized, lightly used).
- Dev server: `npm run dev` (port 8080, host `::` per `vite.config.ts`). Production build: `npm run build`. Preview: `npm run preview`.
- Lint: `npm run lint` (ESLint flat config in `eslint.config.js`). Keep changes passing lint.
- Imports: Use path alias `@` -> `./src` (configured in `vite.config.ts` and `tsconfig.json`). Prefer absolute alias imports for cross-folder access.

## Application Architecture
- Entry: `src/main.tsx` mounts `<App />`.
- Global providers: Inside `App.tsx` – `QueryClientProvider`, `TooltipProvider`, dual toast systems (`Toaster`, `Sonner`), then `BrowserRouter`.
- Routing: Declared in `<Routes>` in `App.tsx` with nested layout route: root path `/` uses `<Layout />`. All new routes under this layout go ABOVE the catch-all `"*"` route.
- Layout Pattern: `Layout.tsx` composes persistent `Navigation` (fixed top), `Footer`, and page content through `<Outlet />`. New pages should be pure content components; avoid re-adding global chrome.
- Pages live in `src/pages/`. `Home`, `Listings`, `PropertyDetail`, `About`, `Contact`, `NotFound`. Add new page components here and register route.

## UI & Styling Conventions
- Design tokens: Defined as CSS variables (HSL only) in `src/index.css` (`@layer base :root` + `.dark`). Extend via variables first, then Tailwind `theme.extend` if necessary.
- Tailwind config: `tailwind.config.ts` sets `darkMode: ["class"]`. Toggle dark mode by adding/removing `class="dark"` at root (future enhancement; not yet implemented). Respect existing colors `luxury-*`, semantic sets (`background`, `accent`, etc.).
- Utility `cn(...)`: Use from `src/lib/utils.ts` to merge class names; ALWAYS wrap conditional class arrays through it instead of manual string concatenation.
- Reusable components: `src/components/ui/` houses wrappers around Radix primitives (buttons, dialogs, sheets, etc.). Follow existing prop signatures; do not rename exports. Add new primitives in same folder with a clear, PascalCase filename matching the export.
- Animation & micro-interactions: Prefer utility classes (`fade-in`, `hover-lift`, gradients) defined in `index.css`. Reuse rather than redefining inline `@keyframes`.

## Data & State Patterns
- Static Data: `src/data/properties.ts` contains `Property` interface + array. Use the interface when adding or manipulating property objects. Keep numeric sorting keys (`priceValue`, `sqftValue`) in sync if you add new fields.
- Detail Lookup: `PropertyDetail.tsx` finds a property via `useParams()` -> numeric ID. When adding new dynamic pages, parse route params early and guard null case with a fallback UI similar to existing not-found path.
- Sorting / Filtering: Example pattern in `Listings.tsx` – clone array then `sort()` based on local state. Keep pure operations; avoid in-place mutation of exported arrays.
- Async Expansion: React Query client is initialized even though no queries exist yet. For new remote data: define a `useQuery` hook inside page/component, set stable query keys (`['properties']`, etc.), and keep stale data handling local until a shared pattern is needed.
- Toasts: Import `{ toast }` or `useToast` from `src/components/ui/use-toast.ts` (which re-exports from `hooks/use-toast.ts`). Use for user feedback instead of `alert()`.

## Navigation & Accessibility
- Active link styling: `Navigation.tsx` computes `isActive(path)` via `location.pathname === path`. For dynamic routes, implement partial matching (e.g., includes) ONLY if needed—keep current approach for static paths.
- Mobile menu: Controlled by `isOpen` state. When extending nav, update `navLinks` array; maintain same object shape.
- Buttons & Links: Use `<Button asChild>` with `<Link>` for consistent styling. Avoid raw `<button>` unless semantics differ.

## Component Patterns
- Presentational vs Container: Pages are light containers orchestrating existing presentational components (`Hero`, `PropertyCard`). Follow this split—new logic heavy features can live beside pages as hooks or utilities rather than inside presentational components.
- PropertyCard usage: Spread property object (`<PropertyCard {...property} />`). Maintain prop names; if extending, update both interface and component.
- Detail gallery pattern: State `selectedImage` index, highlight selected with conditional border classes. Reuse same pattern if creating galleries.

## Adding Features (Examples)
- New Page: Create `src/pages/Agents.tsx`, export default component, add `<Route path="agents" element={<Agents />} />` before wildcard route in `App.tsx`.
- New Toast: `import { toast } from "@/components/ui/use-toast"; toast({ title: 'Saved', description: 'Property updated.' });`
- New Query: `const { data, isLoading } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });` placed inside a page under providers.

## Code Style & Constraints
- TypeScript: Strictness follows default TS config; add interfaces or types near their domain (data types in `data/`, UI-specific types colocated with components). Avoid `any`—extend `Property` if needed.
- Class Names: Compose with Tailwind utilities; prefer semantic tokens (e.g., `text-primary`, `bg-accent`) over raw HSL values.
- No global state library currently; introduce only if strong justification—prefer React Query for server-state and local component state for UI.

## Do / Avoid
- Do: Place shared logic in `src/hooks/` (match existing `use-mobile.tsx`, `use-toast.ts`).
- Do: Keep new route components free of layout wrappers—`Layout` already provides structure.
- Do: Use path alias `@` for imports (e.g., `@/components/PropertyCard`).
- Avoid: Direct mutation of exported arrays (`properties`).
- Avoid: Introducing disparate styling systems (CSS Modules, styled-components) without consolidation rationale.
- Avoid: Adding routes after wildcard `"*"` (will never match).

## Validation & Testing Workflow
- After edits: run `npm run lint` to ensure style/pattern compliance.
- Build check: `npm run build` before adding complex new dependencies to catch Vite config or type issues.

## Open Extension Points
- Dark mode toggle not implemented—if added, control `document.documentElement.classList` and persist preference (e.g., `localStorage`).
- React Query currently unused—safe area to introduce server-backed features.

## Quick Reference
- Root Providers: `App.tsx`
- Routing Definition: `App.tsx`
- Layout Shell: `components/Layout.tsx`
- Navigation: `components/Navigation.tsx`
- Data Model: `data/properties.ts`
- Design Tokens: `index.css` & `tailwind.config.ts`
- Utility Merge: `lib/utils.ts`

Request feedback if any section lacks clarity or if new patterns emerge.
