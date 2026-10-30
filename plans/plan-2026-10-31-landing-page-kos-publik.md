# Public Kos Landing Page Implementation Plan

## Goal and Acceptance Criteria

Turn `/` into a server-rendered public kos listing backed by `GET /public/kos`, and add `/kos/[id]` as a server-rendered public detail page backed by `GET /public/kos/{id}`. Preserve owner authentication and dashboard behavior; keep the existing `/login` route available and adjust only links/navigation that need to point to it.

Acceptance criteria:
- `/` displays API-backed results and metadata-driven pagination, with distinct error, empty, and success states.
- `/kos/[id]` validates the route ID, handles API 404 with `notFound()`, displays available response fields, and generates truthful metadata.
- API requests use a configurable `NEXT_PUBLIC_API_BASE_URL`, defaulting to the OpenAPI server URL, and join paths without duplicate slashes.
- Public pages do not require or expose dashboard authentication tokens; internal owner data is not rendered.
- Contact and map actions exist only when their corresponding values are present.
- Login and dashboard routes continue to work; layout is responsive, keyboard-accessible, and has visible focus and WCAG AA text contrast.
- `npm run lint` and `npm run build` pass after implementation; list/detail, pagination, error, 404, mobile, keyboard, and browser-console behavior are manually checked.

## Current Project Understanding

Observed facts:
- `app/page.tsx` currently redirects `/` to `/dashboard`.
- `app/(auth)/login/page.tsx` implements the existing `/login` credentials flow and routes successful sign-in to `/dashboard`.
- Dashboard pages are under `app/(dashboard)/dashboard/`; `app/layout.tsx` provides the root layout and providers.
- `package.json` uses Next.js 16.4.3, React 19.3.0, and defines `lint` and `build` scripts. No separate typecheck script is defined.
- `AGENTS.md` says this installed Next.js version has breaking changes and its local documentation under `node_modules/next/dist/docs/` must be read before writing code.
- `DESIGN.md` describes Bandcamp and is not a CariinKos brand guide.
- OpenAPI defines `/public/kos` with `page` and `per_page` and a response containing `data` and `meta` (`page`, `per_page`, `total`, `last_page`). `/public/kos/{id}` returns `{ data }` and documents 404.
- The `Kos` schema includes fields such as name, address, province, city, district, monthly price, availability, minimum rent months, type, nullable description/rules/map link, list-only nullable `cover_photo`, facilities, contact, and detail photos. `user_id` and `status` are in the schema but should not be public presentation content. Owner data includes email and should not be rendered without a clear need.
- Backend `KosController.Index` delegates to `GetAllData`; `KosRepository.GetAllData` currently queries kos without a visible status filter and preloads `User`. Public-only publication behavior is therefore not verified and must not be assumed.

## Scope and Assumptions

Included:
- Frontend public API client, listing, pagination, detail page, metadata, and distinct page states.
- Minimal navigation adjustment so public visitors can reach the existing `/login` and owners can still access `/dashboard` where appropriate.
- Visual direction: an informative, utilitarian kos-search interface using CariinKos text branding and actual API photos only; no invented logo, fallback imagery, statistics, reviews, or promotional claims.

Excluded under the current conservative assumption:
- Backend behavior or schema changes, database changes, dependency changes, and deployment configuration beyond documenting the environment variable.
- Search/filter/sorting controls not supported by the verified public API.

Assumptions:
- Scope remains frontend-only because no explicit approval to expand into backend was received. Backend publication filtering remains a release risk and should be resolved separately before treating the endpoint as safe for public exposure.
- Existing `/login` and `/dashboard` URLs remain unchanged; “login tinggal disesuaikan” means adjust public navigation links as needed, not rename the route.
- Use explicit server-side fetch cache/revalidation settings suitable for public listings; select a modest revalidation interval during implementation and document it.

## Implementation Steps

1. Before coding, read the applicable local Next.js 16.4.3 docs from `node_modules/next/dist/docs/` and inspect only the relevant current frontend patterns and API-related types.
2. Define typed response shapes matching the OpenAPI contract and add a server-side public API client. Normalize base URL/path joining, preserve response envelopes, pass pagination query values, and distinguish not-found from upstream/network errors.
3. Replace the redirect in `app/page.tsx` with the server-rendered listing. Read `page` from search params, request the public endpoint with an explicit cache/revalidation policy, render real data, and build previous/next links solely from API metadata.
4. Add a public listing component area for kos rows/cards and pagination, displaying only useful public fields and `cover_photo` when present. Avoid fabricated fallback assets.
5. Add `app/kos/[id]/page.tsx` using the public detail endpoint, validate ID format, call `notFound()` for 404, and render only available description, address, type, price, availability, minimum duration, rules, photos, facilities, contact actions, and map action.
6. Add detail `generateMetadata` based only on fetched kos values, with a truthful description fallback when description is empty.
7. Add distinct error/retry behavior for failed list and detail requests. Retry should perform a real request (for example, a retry URL parameter or a refresh action) and must not disguise failures as empty results.
8. Adjust only navigation links needed for public `/`, existing `/login`, and `/dashboard`; preserve the existing login flow and dashboard route protection.
9. Apply the agreed visual direction and accessibility requirements, including responsive layout, keyboard-operable links/controls, visible focus, contrast, and touch target sizing. Record concise design rationale for color, typography, composition, imagery, and motion in the implementation handoff or appropriate project note.
10. Run the approved verification set and manually exercise routes and browser interactions; audit all interactive controls and console output.

## Likely Files and Components

Existing files likely to change:
- `cariinkos-frontend/app/page.tsx`
- `cariinkos-frontend/app/layout.tsx` (only if public metadata/layout needs a minimal adjustment)
- `cariinkos-frontend/app/globals.css`
- `cariinkos-frontend/app/(auth)/login/page.tsx` (only if navigation or route links require adjustment)

Proposed new files:
- `cariinkos-frontend/lib/public-kos-api.ts`
- `cariinkos-frontend/app/kos/[id]/page.tsx`
- `cariinkos-frontend/components/public/...` for focused listing, detail, pagination, and retry UI as justified by existing project patterns.
- `cariinkos-frontend/types/...` only if response types do not have a suitable existing home.

No backend files are included under the current scope assumption.

## Validation

Proposed checks, subject to separate command-verification approval:
- `npm run lint`
- `npm run build`
- Run the app and verify `/`, page query handling, previous/next pagination, `/kos/[id]`, invalid ID, API 404, empty response, upstream/network failure and functioning retry.
- Confirm contact and map links are omitted when their data is absent and actionable when present; confirm detail does not assume `cover_photo` exists.
- Confirm no JWT is used by public requests and no owner email/user ID is rendered.
- Verify existing `/login` and `/dashboard` behavior remains intact.
- Inspect desktop and mobile layout, keyboard traversal/focus, overflow, and browser console.
- Check implementation against the task's anti-slop requirements and record the visual rationale and any remaining issue.

## Risks and Edge Cases

- Backend list and detail handlers currently appear to expose all records rather than only published records. Frontend-only work cannot make public API publication safe; backend owner should verify/fix this before public release.
- `cover_photo` is documented only on list responses; detail gallery must use `photos[]` and handle it being absent/empty.
- OpenAPI schemas include required internal fields and optional/null values; UI must not assume nullable fields or nested associations are populated.
- The API base URL default points at `http://localhost:3000/api/v1`; deployments must set `NEXT_PUBLIC_API_BASE_URL` appropriately.
- Server-side fetch failures should remain distinguishable from a successful empty page, and retries must trigger a fresh request.
- Dynamic route params and metadata APIs may differ in this installed Next.js version; follow its local docs rather than older examples.

## Open Questions

- No response was received to the prior question about expanding scope to fix the backend publication filter. This plan therefore keeps backend changes excluded and flags the issue as a blocker/risk.
- No explicit CariinKos brand palette or additional `rules.md`/`Rules.md` was supplied. The plan uses the conservative visual direction above and the inspected `AGENTS.md` plus attached task requirements.

## Feedback

The frontend work is feasible with the existing App Router and installed dependencies; no new dependency appears necessary. The highest-risk issue is not UI implementation but the backend's unfiltered public query. Do not consider public release safe until publication eligibility is verified and corrected server-side. The existing login route can remain unchanged, with the root becoming public and navigation adjusted around it.
