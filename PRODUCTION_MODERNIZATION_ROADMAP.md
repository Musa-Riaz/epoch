# Production Modernization Roadmap

This roadmap breaks the upgrade into executable phases with quality gates so the app can be improved safely without breaking current workflows.

## Phase 1: Stability and Routing Integrity (Completed)

### Backend
- Fix route precedence issues in projects routes to prevent dynamic `/:id` handlers from shadowing manager and member endpoints.
- Add missing task detail route `GET /tasks/:id` to match existing frontend API usage.
- Harden task controller with:
  - ObjectId validation for route params and assignment payloads.
  - Correct empty-array handling for list endpoints.
  - Existence checks for assigned member lookups.

### Frontend
- Replace placeholder redirect page for manager projects with a full projects workspace.
- Add loading, empty, and error states.
- Add search and status filters.
- Add project health summary cards and per-project progress views.

### Quality Gate
- `server`: build/typecheck passes.
- `client`: lint and build pass.

## Phase 2: Backend Architecture Cleanup (Completed)

### Goals
- Reduce controller bloat and improve SOLID boundaries.
- Centralize validation and error mapping.
- Improve query efficiency and enforce consistent response contracts.

### Tasks
- Introduce service layer per domain (`auth`, `project`, `task`, `comment`) and move business logic out of controllers.
- Normalize API result envelope and remove leaking internal error details in production mode.
- Add reusable helpers for pagination, sort, and filtering.
- Add indexes for high-frequency filters in MongoDB models.
- Add request-level schema validation for update and params payloads.

### Progress Update (Current)
- Added `project.service.ts` and moved project business logic into a dedicated service layer.
- Refactored `project.controller.ts` to thin orchestration handlers with centralized service-error mapping.
- Added route-level validation for project params and update/status payloads.
- Decoupled task progress recalculation from controller-to-controller dependency by consuming project service directly.
- Added `task.service.ts` and moved task business logic into a dedicated service layer.
- Refactored `task.controller.ts` to thin orchestration handlers with centralized task-service error mapping.
- Added route-level validation for task params and create/update/assign request payloads.
- Added reusable list query utility (`query.util.ts`) for parsing pagination/search/sort inputs.
- Upgraded `GET /projects` and `GET /tasks` to support pagination + filter/sort query params while preserving array response data shape.
- Extended manager/member project list endpoints to support the same pagination + filter/sort query model.
- Hardened API error envelope to omit internal error details in production.
- Established backend test baseline with Jest + ts-jest and added first utility test suite for query parsing/pagination logic.
- Added `typecheck` script and verified test + typecheck + build pipeline locally.
- Added integration-style route tests for list endpoints (`/projects`, manager projects, `/tasks`) with authenticated requests.
- Removed duplicate invitation token index declaration to eliminate schema index warnings in test/runtime logs.

### Quality Gate
- `server`: lint, build, and unit tests pass.
- API integration checks for critical flows:
  - login/signup
  - project create/list/update
  - task create/list/update/assign

## Phase 3: Testing and Type Safety Baseline (Completed)

### Goals
- Establish reliable automated checks before deeper feature additions.

### Tasks
- Add unit test runner for backend and frontend utility logic.
- Add API-level integration tests for controllers using test database setup.
- Add `typecheck` scripts in both apps and enforce in CI.
- Add pre-merge checks: lint, typecheck, tests.

### Progress Update (Current)
- Added client and server `verify` scripts for pre-merge quality checks.
- Added GitHub Actions workflow for pull request and push quality gates.
- Added backend auth route integration tests for signup/login and role-protected user endpoints.
- Added backend task mutation integration tests covering create, update, assign, and validation paths.
- Added frontend utility tests for `helpers.utils.ts` and `date.utils.ts`.
- Added `test:coverage` scripts to both apps as the baseline coverage reporting path.
- Added backend service-layer unit tests for `project.service.ts` and `task.service.ts` with mocked model behavior.

### Latest Slice Outcome
- Added service-level unit tests in:
  - `server/src/app/services/project.service.test.ts`
  - `server/src/app/services/task.service.test.ts`
- Validation: `server` test, coverage, and typecheck all pass.
- Coverage lift after this slice:
  - `src/app/services` statements: **68.1%**
  - overall server statements: **46.43%**

### Remaining Tests Slice (Completed)
- Added server middleware and token utility tests:
  - `server/src/app/middlewares/authMiddleware.test.ts`
  - `server/src/app/utils/token.util.test.ts`
- Added client store tests:
  - `client/src/stores/auth.store.test.ts`
  - `client/src/stores/task.store.test.ts`
- Validation status:
  - `server`: test + coverage + typecheck pass (51 tests)
  - `client`: lint + typecheck + test + coverage + build pass (17 tests)
- Updated server coverage snapshot after this slice:
  - `token.util.ts`: **100%** statements/branches/functions
  - `authMiddleware.ts`: **96%** statements, **100%** branches/functions
  - overall server statements: **46.88%**

### Final Completion Slice
- Added project mutation and detail route integration tests:
  - `server/src/app/routes/project-routes-mutations.test.ts`
- Added auth profile and manager analytics route integration tests:
  - `server/src/app/routes/auth-profile-routes.test.ts`
- Fixed auth profile unauthorized handling bug in:
  - `server/src/app/controllers/auth.controller.ts` (`getProfile` now safely handles missing request body)
- Final validation status:
  - `server`: test + coverage + typecheck pass (**63 tests**)
  - `client`: verify pass (lint + typecheck + test + build, **17 tests**)
- Latest server coverage snapshot:
  - overall statements: **51.6%**
  - `src/app/controllers` statements: **38.63%**
  - `src/app/services` statements: **68.1%**

### Quality Gate
- Achieved for phase completion:
  - Pre-merge checks enforced (`lint`, `typecheck`, `test`, `build`) and green across `client` and `server`.
  - Coverage reporting established in both apps (`test:coverage`).
  - Critical auth/project/task API flows are covered by route integration tests and service-level unit tests.
- Stretch targets (coverage percentages) remain a continuing improvement track for upcoming hardening slices.

## Phase 4: Product Features and UX Maturity (Completed)

### Goals
- Close feature gaps and improve task/project operations for production use.

### Candidate Features
- Saved project views and advanced filters.
- Bulk task actions and status transitions.
- Activity feed backed by real events.
- Notifications center with read/unread support.
- Role-aware analytics pages for manager and member insights.

### Progress Update (Current)
- Implemented advanced project filtering support end-to-end:
  - backend query support for `minProgress`, `maxProgress`, `deadlineFrom`, `deadlineTo`
  - wired into project list endpoints for user/manager/member views
- Upgraded manager projects workspace with:
  - advanced filter controls (status, sort, deadline window, progress range)
  - saved filter views persisted in local browser storage
- Implemented bulk task status transitions end-to-end:
  - backend `PATCH /api/tasks/bulk-status` endpoint with request validation and service-level progress recalculation
  - manager tasks UI support for multi-select, page-level select-all, and bulk status apply actions
  - client API and task store bulk status action wiring
- Implemented activity feed backed by real events:
  - backend activity domain (`activity` model + service + controller + route) exposed at `GET /api/activities`
  - task, project, and comment mutation flows now emit activity events for feed visibility
  - manager dashboard recent activity and activity log tabs now consume live activity API data
- Implemented persisted notifications center with read/unread support:
  - backend notification domain (`notification` model + service + controller + routes)
  - notification APIs: list, mark single as read, mark all as read
  - manager header notification dropdown now uses persisted notification state and unread badge counts
- Enriched activity payloads for clearer UI context:
  - activity records now include actor/project/target naming fields when available
  - task/project/comment activity rendering now prefers readable actor and project labels over fallback IDs
- Added/updated automated coverage for bulk task status behavior:
  - route mutation coverage for `PATCH /api/tasks/bulk-status`
  - service-level bulk update tests
- Added automated route coverage for activity feed retrieval (`/api/activities`).
- Added automated route coverage for notification retrieval/read flows (`/api/notifications`, mark single, mark all).
- Added/updated coverage for new filtering behavior in project service tests.
- Added dedicated manager notifications workspace page with unread filtering, pagination, and read actions.
- Added realtime push updates for notifications and activity feed via socket room subscriptions (`user` and `project`).
- Added manager sidebar navigation entry for notifications and wired header “View all notifications” to the new route.
- Validation completed:
  - `server`: tests + typecheck + build pass
  - `client`: lint + typecheck + tests + build pass

### Quality Gate
- End-to-end smoke tests for primary user journeys.
- Performance checks for dashboard load and project list interactions.
- Achieved for phase completion:
  - realtime notification and activity updates integrated and visible in manager UX
  - dedicated notifications center route delivered with persisted read/unread behavior
  - quality checks pass across `server` and `client` (`lint`, `typecheck`, `test`, `build`)

## Phase 5: UI System Revamp (In Progress)

### Goals
- Move to a cohesive, premium visual system while preserving functionality.

### Tasks
- Define a tokenized design language (spacing, elevation, radius, motion curves).
- Refactor shared dashboard shell and navigation hierarchy.
- Redesign all role dashboards with consistent interaction states.
- Add accessibility pass for keyboard navigation and visible focus indicators.

### Progress Update (Current)
- Implemented Phase 5 kickoff token pass in global styles:
  - refined color/radius/ring tokens for a cohesive visual system in light and dark modes
  - added global focus-visible outlines and text-wrap improvements for readability
  - added skip-link styling and smooth-scroll baseline utilities
- Refactored shared dashboard shell:
  - upgraded content container rhythm (`max-width`, responsive paddings, semantic `main` landmark)
  - aligned shell spacing across manager/member views through shared layout only
- Improved navigation hierarchy and interaction states in shared shell:
  - role-aware brand/home and settings destinations in sidebar
  - stronger active-state matching for nested routes and `aria-current` support
  - improved header controls with explicit accessibility labels and role-aware notification routing
- Validation completed for this slice:
  - `client`: `verify` pass (`lint`, `typecheck`, `test`, `build`)
- Implemented role dashboard redesign slice with consistent interaction-state behavior:
  - manager dashboard now uses populated KPI cards (active/completed/pending/deadline signals) instead of placeholder values
  - manager overview now includes robust empty-state handling for recent projects
  - member dashboard now includes summary badges (task volume, completion, project count)
  - member board now includes a dedicated empty-state panel when no assigned tasks are available
  - placeholder member action controls are explicitly disabled to avoid dead-action affordances
- Validation completed for this dashboard slice:
  - `client`: `verify` pass (`lint`, `typecheck`, `test`, `build`)
- Extended Phase 5 consistency pass to manager project/task workspaces:
  - aligned manager projects page with shared shell rhythm and reduced page-level style drift
  - improved manager tasks page interaction reliability by separating create/edit dialog state
  - added manager tasks page summary badges for quick workload comprehension
  - improved manager task cards with accurate project-name mapping and clearer assignee fallback states
  - added explicit manager task loading skeletons and surfaced task-level API errors inline
- Validation completed for this slice:
  - `client`: `verify` pass (`lint`, `typecheck`, `test`, `build`)

### Quality Gate
- Visual regression snapshots for major routes.
- Accessibility checks for WCAG AA contrast and focus behavior.

## Phase 6: Release Readiness and Operations (Next)

### Goals
- Ensure reliable deployments and observability.

### Tasks
- Add structured logging and request correlation IDs.
- Add environment configuration validation at startup.
- Add health and readiness checks.
- Document runbooks for seed, migration, rollback, and incident response.

### Quality Gate
- Staging deployment sign-off with rollback drill.
- Zero-severity known issues before production release.

## Execution Notes
- Keep each PR scoped to one sub-area and one quality gate.
- Prefer incremental refactors over rewrite-heavy changes.
- Do not merge if lint, typecheck, or tests fail.
