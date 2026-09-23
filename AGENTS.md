# Project Guidance

## User Preferences

- All user-facing content in Vietnamese
- Deep teal primary with pale mint accents and dark navy headings, matching the reference screenshots
- The pilot pricing popup must be dismissible and must not reappear in the same session
- The student login and signup screens must visually match the rest of the site
- The mentor advice chatbot sits fixed in the page corner
- Assessment and suggestions may appear inline or as a popup, not necessarily a separate page

## Verified Commands

- **typecheck**: `pnpm --dir app typecheck`
- **fix**: `pnpm --dir app/src/frontend fix`
- **build**: `pnpm --dir app build`

## Learnings

- OQL Entity.manual/.payload implicit _toRow instances need explicit per-primitive imports (mo:caffeineai-oql/PrincipalValue, NatValue, BoolValue), otherwise M0230 'Cannot determine implicit argument _toRow'.
- Under enhanced migration a stable actor field must be type-only; its initializer belongs in the migration NewActor output.
- A query method must not persist state — writes inside a query are silently discarded; recompute deterministically instead.
- Motoko triple-quoted strings are unsupported by this toolchain; build Markdown as concatenated single-line Text literals with \n escapes and avoid leading '#' inside string literals.
- Biome a11y/noLabelWithoutControl cannot be satisfied by htmlFor when the control is a Radix Checkbox (renders a button); use a plain div wrapper.
- Tailwind has no size-4.5 token; use size-4 or size-5 for icon sizing.
- A component can be fully implemented and typecheck clean yet be dead code — always verify its import site, not just its definition.
- useInternetIdentity() exposes isAuthenticated and isLoggingIn directly; deriving auth from loginStatus === 'success' misses restored sessions on reload.
