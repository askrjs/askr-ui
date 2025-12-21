# TODO — askr-ui 📋

This file maps the high-level goals in `SPEC.md` and the non-negotiable `RULES.md` into prioritized, actionable work items, acceptance criteria, and sensible milestones.

---

## Quick status ✅

- `tsup` packaging and type generation: **complete**
- `TODO.md`: **created** (this file)
- Next in-progress: **Define v1 component cut & priorities** (see Roadmap)

---

## Roadmap & v1 scope (high level) 🛣️

Priority is to deliver a minimal, **deterministic**, and **accessible** core that other libs (askr-kit) can build upon.

v1 (MUST have):

1. Foundations: Slot, Presence, FocusScope, Portal, Id helpers
2. Inputs: Button, Toggle, Checkbox, TextInput
3. Overlays: Dialog, Popover, Tooltip
4. Tests: behavioral, accessibility, determinism
5. Packaging + types + CI

v2 (later):

- Advanced controls (Combobox, Slider, Select improvements)
- Data primitives (Table, VirtualList)
- Advanced orchestration (CommandPalette, Typeahead)

---

## Workstreams & tasks (detailed)

### 1) Project definitions & governance

- [ ] Define v1 cut-line and priorities (owners, acceptance criteria) ✅ _in-progress_
  - Outcome: Short list of components for v1 and owners
- [ ] Release policy (semver, changelog automation)
- [ ] CONTRIBUTING.md and PR templates aligned with `RULES.md`

### 2) Core primitives (foundations)

- [ ] Implement `Slot` (asChild semantics)
- [ ] Implement `Presence` (deterministic mount/unmount)
- [ ] Implement `FocusScope` / `FocusTrap`
- [ ] Implement `Portal` and `Id` helpers
- Acceptance: Each primitive has behavior tests and docs; failing usage throws early

### 3) Inputs & Controls (v1)

- [ ] Button (semantic roles only)
- [ ] Toggle / Switch
- [ ] Checkbox
- [ ] TextInput
- Acceptance: ARIA contract documented; keyboard + mouse tests; deterministic behavior

### 4) Overlays (v1)

- [ ] Dialog / Modal
- [ ] Popover
- [ ] Tooltip
- Acceptance: deterministic mount/unmount; accessible by default; focus management

### 5) Tests & invariants

- [ ] Behavioral tests (Vitest + jsdom)
- [ ] Accessibility tests (Axe or assertions)
- [ ] Determinism tests (repeatable outcomes)
- [ ] Add test harness utilities for common interactions

### 6) Packaging & types

- [x] `tsup` config + `d.ts` generation (done)
- [ ] Validate package `exports` and `types` fields for Node + ESM consumers
- [ ] Add smoke test for package consumers

### 7) CI / GitHub Actions

- [ ] Setup checks: `build`, `test`, `lint`, `typecheck`, `bench` (optional)
- [ ] Protect main branch with required status checks

### 8) Quality & RULES enforcement

- [ ] Add lint/test assertions to enforce `RULES.md` (e.g. no hooks, root-only state)
- [ ] Create automated rule checks or unit tests for common misuse patterns

### 9) Docs & examples

- [ ] API reference for each component (props, ARIA contract)
- [ ] Usage examples for `askr-kit` integration
- [ ] CHANGELOG and release notes

### 10) Benchmarks & performance

- [ ] Add deterministic benchmark suits using Vitest bench
- [ ] Define performance budgets for heavy primitives

---

## Pull Request & Review Checklist ✅

Every PR touching components must include:

- [ ] Tests: behavioural + accessibility
- [ ] Determinism test(s)
- [ ] Updated docs (component API + ARIA contract)
- [ ] Lint and typecheck pass
- [ ] PR description links to SPEC/RULES and mentions how the PR conforms

---

## Acceptance criteria (project level)

- All v1 components pass the PR checklist
- CI enforces tests / lint / types before merge
- Package is tree-shakable, typed, and small for typical usage
- `askr-kit` can wrap any v1 component without modifying internal behavior

---

## Next steps (short term)

1. Finalize v1 cut-line + assign owners (this is marked in the tracked todos).
2. Create skeletons for the top 3 foundation primitives and add tests.
3. Set up CI checks mirroring the PR checklist.

---

If you want, I can:

- Open issues or GitHub project cards for each todo
- Generate component scaffolds for the first core primitives
- Add CI workflow files now

---

_Last updated: 2025-12-21_
