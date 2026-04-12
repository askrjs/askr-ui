# Component Hardening Scorecard

This file tracks the component-by-component hardening program.

## Done Bar

A component is ready to close when all of the following are true:

- API and naming are coherent with the rest of the library.
- Slot and styling hooks are intentional, minimal, and documented by tests.
- Accessibility semantics are automatic and misuse fails loudly.
- Internal architecture keeps state ownership clear and avoids needless brittleness.
- Behavior, accessibility, and determinism tests reflect the current contract.
- Performance coverage is present for hot paths or explicitly tracked as a gap.
- Docs and exports stay aligned with the public surface.

## Workflow

1. Standardize
2. Test
3. Optimize
4. Ready to commit

## Status Legend

- `pending`: not started
- `in progress`: active component pass
- `done`: pass complete
- `blocked`: waiting on a dependency or follow-up decision

## Phase 1 — Reference Primitives

| Component | Status      | API/Naming | Slots/Styling | A11y   | Architecture | Tests | Perf    | Docs/Exports | Notes                                                               |
| --------- | ----------- | ---------- | ------------- | ------ | ------------ | ----- | ------- | ------------ | ------------------------------------------------------------------- |
| Button    | done        | done       | done          | done   | done         | done  | covered | done         | Interaction contract and `asChild` behavior locked                  |
| Label     | done        | done       | done          | done   | done         | done  | covered | done         | Native label contract and `asChild` merge path locked               |
| Input     | in progress | review     | done          | review | review       | done  | covered | done         | Shared field-control question: keep `asChild` open to native hosts? |
| Separator | done        | done       | done          | done   | done         | done  | covered | done         | Semantic vs decorative separator contract locked                    |

## Phase 2 — Presentational Primitives

| Component      | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                        |
| -------------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | -------------------------------------------- |
| Badge          | done    | done       | done          | done    | done         | done    | covered | done         | Passive variant hooks and asChild contract locked |
| Spinner        | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Verify loading semantics stay minimal        |
| Skeleton       | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Check slot contract and deterministic markup |
| Avatar         | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Validate fallback and image composition      |
| Progress       | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Verify value semantics and output hooks      |
| ProgressCircle | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Verify value semantics and output hooks      |
| VisuallyHidden | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Keep behavior invisible and deterministic    |

## Phase 3 — Layout Primitives

| Component | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf | Docs/Exports | Notes                                 |
| --------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ---- | ------------ | ------------------------------------- |
| Center    | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| Container | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| Inline    | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| Grid      | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| Spacer    | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| Stack     | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |

## Phase 4 — Form And Selection Primitives

| Component   | Status      | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                                                          |
| ----------- | ----------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | ------------------------------------------------------------------------------ |
| Textarea    | in progress | review     | done          | review  | review       | done    | covered | done         | Shares Input's field-control `asChild` question                                |
| Checkbox    | in progress | done       | done          | done    | review       | done    | covered | done         | Controlled and uncontrolled parity now matches Switch; `asChild` still uses bespoke interaction wiring |
| Switch      | in progress | done       | done          | done    | review       | done    | covered | done         | Uncontrolled rendering after press still needs deeper follow-up                |
| Toggle      | done        | done       | done          | done    | done         | done    | covered | done         | Pressed-state contract and `asChild` semantics locked                          |
| RadioGroup  | done        | done       | done          | done    | done         | done    | covered | done         | Context replaces cloned item injection and the file is split; live collection snapshots now drive item metadata |
| Slider      | pending     | pending    | pending       | pending | pending      | pending | covered | pending      | Validate input semantics and perf                                              |
| ToggleGroup | done        | done       | done          | done    | done         | done    | covered | done         | Context replaces item injection and the file is split; live collection snapshots now drive item metadata |
| Select      | in progress | review     | done          | done    | review       | done    | covered | review       | Context replaces injected props and group rewriting; item metadata still uses collection scanning |

## Phase 5 — Infrastructure Composites

| Component        | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                  |
| ---------------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | -------------------------------------- |
| FocusRing        | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Lock focus-visible contract            |
| FocusScope       | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Lock trap and restore semantics        |
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
| Menu         | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Shared menu helper pressure point                     |
| DropdownMenu | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Align with Menu without duplicating drift             |
| Dialog       | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Lock title/description semantics                      |
| AlertDialog  | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Align with Dialog while preserving stricter semantics |
| Popover      | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Verify default labelling rules                        |
| Tooltip      | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Verify delayed/open semantics stay deterministic      |

## Phase 8 — Navigation And Feedback Composites

| Component      | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf    | Docs/Exports | Notes                                                           |
| -------------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ------- | ------------ | --------------------------------------------------------------- |
| Breadcrumb     | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Keep semantics passive and minimal                              |
| Pagination     | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Verify navigation semantics and naming                          |
| Menubar        | pending | pending    | pending       | pending | pending      | pending | covered | pending      | High-risk architecture pass; portal-child a11y regression fixed |
| NavigationMenu | pending | pending    | pending       | pending | pending      | pending | covered | pending      | High-risk architecture pass                                     |
| Toast          | pending | pending    | pending       | pending | pending      | pending | covered | pending      | Verify announcement and portal behavior                         |

## Phase 9 — Patterns

| Component     | Status  | API/Naming | Slots/Styling | A11y    | Architecture | Tests   | Perf | Docs/Exports | Notes                                 |
| ------------- | ------- | ---------- | ------------- | ------- | ------------ | ------- | ---- | ------------ | ------------------------------------- |
| DataTable     | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| SidebarLayout | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
| TopbarLayout  | pending | pending    | pending       | pending | pending      | pending | gap  | pending      | Add or justify missing bench coverage |
