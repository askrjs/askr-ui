# Component Hardening Scorecard

This file tracks the component-by-component hardening program.

## Operating Mode

This document is now the execution control plane for hardening, not just a status board.

- Sequencing strategy: risk-first.
- Timeline strategy: quality-driven (no fixed deadline).
- Closure strategy: evidence-based only.

## Current Inventory

The current hardening scope is the exported surface from `src/components/index.ts` and `tests/public-api.test.ts`.

- Primitives: 23
- Composites: 18
- Patterns: 3
- Total shipping surface tracked here: 44 component families

Do not add scorecard rows for removed or non-exported components.

## World-Class Policies

### Performance Budget Policy

- Every component pass must either:
	- include benchmark coverage for its hot paths, or
	- record a temporary waiver with rationale and expiry date.
- Any benchmarked component that regresses by more than 10% from the prior accepted baseline is blocked from closing until investigated.
- Perf budgets are enforced at category level:
	- Presentational and layout primitives: stable mount/update path with no avoidable work spikes.
	- Form and selection primitives: stable interaction throughput under repeated input events.
	- Overlay and navigation composites: stable open/close and item navigation paths.
	- Pattern components: explicit scenario benchmarks for realistic row/layout counts.

### API Stability Policy

- After a component reaches done, only the following changes are allowed without deprecation:
	- additive non-breaking props,
	- additive data attributes,
	- bug fixes that preserve documented behavior.
- Breaking API or semantic behavior changes require:
	- a deprecation note in docs,
	- migration guidance,
	- updated type tests and contract tests,
	- explicit sign-off in this file notes.
- Public API, docs, and type contract parity is mandatory before close.

## Global Phase Gates

No phase can close unless all gates below are green:

1. Build gate: npm run build
2. Test gate: npm test
3. Type gate: npm run test:types
4. API contract gate: tests/public-api.test.ts and tests/types/public-api.type-test.ts
5. Docs contract gate: tests/docs-contract.test.ts
6. Performance gate: benchmark evidence or active waiver record per component

## Execution Metadata

Each component row must be backed by execution metadata in notes (or linked issue) before closure:

- Risk tier: high, medium, low
- Dependency state: clear, blocked-dependency, blocked-architecture, blocked-decision
- Workstream owner
- Last reviewed date
- Evidence links (tests, bench output, docs/export updates)

## Done Bar

A component is ready to close when all of the following are true:

- API and naming are coherent with the rest of the library.
- Slot and styling hooks are intentional, minimal, and documented by tests.
- Accessibility semantics are automatic and misuse fails loudly.
- Internal architecture keeps state ownership clear and avoids needless brittleness.
- Behavior, accessibility, and determinism tests reflect the current contract.
- Performance coverage is present for hot paths or explicitly tracked as a gap.
- Docs and exports stay aligned with the public surface.

## Ready-To-Close Evidence

Before changing a component status to done, capture all of the following:

1. Contract: behavior and accessibility assertions updated for current semantics.
2. Determinism: deterministic render and interaction guarantees verified.
3. Performance: benchmark proof or waiver with expiry.
4. Surface: public API exports, docs imports, and type tests aligned.
5. Notes: open decisions resolved or explicitly tracked as blockers.

## Workflow

1. Standardize
2. Test
3. Optimize
4. Verify gates
5. Ready to commit

## Status Legend

- `pending`: not started
- `in progress`: active component pass
- `done`: pass complete
- `blocked`: legacy blocked marker (prefer scoped blocked states)
- `blocked-dependency`: waiting on another component or shared primitive
- `blocked-architecture`: waiting on architecture decision or refactor pattern
- `blocked-decision`: waiting on product/API semantics decision

## Dependency Map

- Dialog -> AlertDialog
- FocusScope + DismissableLayer -> Dialog, Popover, Tooltip, NavigationMenu
- Popover + Menu-family overlay semantics -> NavigationMenu
- Collapsible -> Accordion
- Collapsible + collection patterns -> Tabs hardening close
- Field control adapter decision -> Input, Textarea, Checkbox, Switch

## Risk-First Execution Queue

### Track A: Architecture Unblockers

1. Input and Textarea field-control asChild decision
2. Checkbox and Switch uncontrolled semantics lock
3. Determinism rules for delayed and async overlay interactions

### Track B: High-Risk Composites

1. Dialog
2. AlertDialog
3. Popover
4. Tooltip
5. NavigationMenu

### Track C: Parallel Low-Risk Closures

1. Spinner
2. Skeleton
3. Avatar
4. Progress
5. ProgressCircle
6. VisuallyHidden

## Waiver Record Template

Use this format when a component cannot immediately satisfy a gate:

- Component:
- Gate:
- Reason:
- Mitigation in place:
- Expiry date:
- Owner:
- Follow-up issue:

## Weekly Governance Loop

Run this loop every week until all phases are complete:

1. Re-rank high-risk components and blockers.
2. Validate dependency map against current work.
3. Verify gate evidence for components moved to done.
4. Expire or renew waivers with explicit rationale.
5. Update notes with resolved decisions and regressions.

## Phase 1 — Reference Primitives

| Component | Status      | API/Naming | Slots/Styling | A11y   | Architecture | Tests | Perf    | Docs/Exports | Notes                                                               |
| --------- | ----------- | ---------- | ------------- | ------ | ------------ | ----- | ------- | ------------ | ------------------------------------------------------------------- |
| Button    | done        | done       | done          | done   | done         | done  | covered | done         | Interaction contract and `asChild` behavior locked                  |
| Label     | done        | done       | done          | done   | done         | done  | covered | done         | Native label contract and `asChild` merge path locked               |
| Input     | done        | done       | done          | done   | done         | done  | covered | done         | `asChild` now fails loudly unless the host is a native `<input>`; targeted behavior, a11y, and determinism suites are green |
| Separator | done        | done       | done          | done   | done         | done  | covered | done         | Semantic vs decorative separator contract locked                    |

## Phase 2 — Presentational Primitives

| Component      | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                        |
| -------------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | -------------------------------------------- |
| Badge          | done    | done       | done          | done    | done         | done    | covered | done         | Passive variant hooks and asChild contract locked |
| Spinner        | done    | done       | done          | done    | done         | done    | covered | done         | Alias contract remains intentionally minimal and stable; focused behavior, a11y, and determinism suites are green |
| Skeleton       | done    | done       | done          | done    | done         | done    | covered | done         | Slot contract is minimal and deterministic; focused behavior, a11y, and determinism suites are green |
| Avatar         | done    | done       | done          | done    | done         | done    | covered | done         | Scoped-context root/image/fallback flow replaced child scanning and hidden injected props while preserving load/fallback semantics |
| Progress       | done    | done       | done          | done    | done         | done    | covered | done         | Scoped-context root/indicator contract replaced tree rewriting and hidden injected props; focused suites are green |
| ProgressCircle | done    | done       | done          | done    | done         | done    | covered | done         | Scoped-context root/indicator contract replaced tree rewriting and hidden injected props; Spinner alias remains stable on top |
| VisuallyHidden | done    | done       | done          | done    | done         | done    | covered | done         | Hidden-content contract is stable and deterministic; focused behavior, a11y, and determinism suites are green |

## Phase 3 — Layout Primitives

| Component | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf | Docs/Exports | Notes                                 |
| --------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ---- | ------------ | ------------------------------------- |
| Flex      | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| Container | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| Grid      | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| Spacer    | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |

## Phase 4 — Form And Selection Primitives

| Component   | Status      | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                                                          |
| ----------- | ----------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | ------------------------------------------------------------------------------ |
| Textarea    | done        | done       | done          | done    | done         | done    | covered | done         | `asChild` now fails loudly unless the host is a native `<textarea>`; targeted behavior, a11y, and determinism suites are green |
| Checkbox    | done        | done       | done          | done    | done         | done    | covered | done         | `asChild` now delegates activation through shared press semantics while preserving checkbox role and mixed-state hooks |
| Switch      | done        | done       | done          | done    | done         | done    | covered | done         | Hidden form input reflection after uncontrolled presses is now explicitly locked by behavior coverage |
| Toggle      | done        | done       | done          | done    | done         | done    | covered | done         | Pressed-state contract and `asChild` semantics locked                          |
| RadioGroup  | done        | done       | done          | done    | done         | done    | covered | done         | Context replaces cloned item injection and the file is split; live collection snapshots now drive item metadata |
| Slider      | pending     | pending    | pending       | pending | pending      | pending | covered | pending      | Validate input semantics and perf                                              |
| ToggleGroup | done        | done       | done          | done    | done         | done    | covered | done         | Context replaces item injection and the file is split; live collection snapshots now drive item metadata |
| Select      | done        | done       | done          | done    | done         | done    | covered | done         | File split plus declaration-backed metadata store remove the root item scan while preserving closed trigger text and overlay semantics |

## Phase 5 — Infrastructure Composites

| Component        | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                  |
| ---------------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | -------------------------------------- |
| FocusRing        | done    | done       | done          | done    | done         | done    | covered | done         | Focus modality and `data-focus-visible` semantics are locked; focused behavior, a11y, and determinism suites are green |
| FocusScope       | done    | done       | done          | done    | done         | done    | covered | done         | Trap/loop/restore semantics are locked; focused behavior, a11y, and determinism suites are green |
| DismissableLayer | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Lock outside-interaction rules         |
| Field            | in progress | review  | done          | done    | done         | done    | covered | review       | Context replaces injected props; FieldTextarea and a shared control adapter now consolidate the wrapper layer |

## Phase 6 — Disclosure Composites

| Component   | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                         |
| ----------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | --------------------------------------------- |
| Collapsible | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Reference for simple open-state compound APIs |
| Accordion   | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Check grouped disclosure consistency          |
| Tabs        | in progress | review  | done          | done    | review       | done    | covered | done         | Context replaces injected props and the file is split; live collection snapshots drive runtime metadata, with a narrow initial fallback scan only when uncontrolled and no default value is provided |

## Phase 7 — Overlay And Menu Composites

| Component    | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                                 |
| ------------ | ------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | ----------------------------------------------------- |
| Menu         | done    | done       | done          | done    | done         | done    | covered | done         | Split root/content/item/group/shared files and declaration-backed metadata replace injected props plus JSX tree rewriting |
| DropdownMenu | done    | done       | done          | done    | done         | done    | covered | done         | Split root/trigger/portal/content/item/group/shared files align with Menu while preserving overlay semantics |
| Dialog       | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Lock title/description semantics                      |
| AlertDialog  | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Align with Dialog while preserving stricter semantics |
| Popover      | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Verify default labelling rules                        |
| Tooltip      | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Verify delayed/open semantics stay deterministic      |

## Phase 8 — Navigation And Feedback Composites

| Component      | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                                           |
| -------------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | --------------------------------------------------------------- |
| Breadcrumb     | done    | done       | done          | done    | done         | done    | covered | done         | Passive semantics locked; root/default labelling and asChild composition are covered by focused behavior, a11y, and determinism suites |
| Pagination     | done    | done       | done          | done    | done         | done    | covered | done         | Scoped-context refactor removed tree rewriting and hidden injected props; focused behavior, a11y, and determinism suites are green |
| Menubar        | done    | done       | done          | done    | done         | done    | covered | done         | Split root/menu/content/item/group/shared files replace injected props; declaration-backed metadata plus an explicit fallback-portal sync keep nested submenu rendering deterministic |
| NavigationMenu | done    | done       | done          | done    | done         | done    | covered | done         | Root/content now use registration-backed scoped context metadata instead of element-type scanning or placeholder indexes; focused behavior, a11y, and determinism suites are green |
| Toast          | done    | done       | done          | done    | done         | done    | covered | done         | Provider/toast scoped contexts replaced tree rewriting and hidden injected props; behavior, a11y, and determinism suites are green |

## Phase 9 — Patterns

| Component     | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf | Docs/Exports | Notes                                 |
| ------------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ---- | ------------ | ------------------------------------- |
| DataTable     | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| SidebarLayout | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| TopbarLayout  | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
