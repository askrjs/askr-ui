# Original Design Plan

## Objective

Make askr-ui a cleaner, leaner original design. This document codifies the design direction as an executable governance program.

## Design Thesis

A headless component library earns its surface area. Every exported part, every prop, every behavior primitive must justify its existence against the irreducible minimum required to correctly solve the problem. Complexity that exists because it is easy to add — not because it is necessary — is a design failure.

The original design is the smallest coherent surface that lets a competent developer build anything the library promises to support.

---

## The 10 Steps

### 1. Define the irreducible core

The core is what the library cannot remove without breaking its promise: behavioral primitives, accessibility semantics, controlled/uncontrolled state, and composition helpers. Everything else is additive. The core must be clearly bounded so all future decisions have a reference point.

**Gate**: Core components are listed in SPEC.md and ROADMAP.md. Any candidate that cannot be explained by the irreducible core definition is a pattern.

### 2. Shrink the public API

Fewer exports is better. Fewer parts per component family is better. Fewer props per part is better — unless the missing prop forces users to rebuild behavior the library should own. Every export and every prop must be justified against the irreducible core. Implementation-driven surface area is eliminated.

**Gate**: No part or prop exists purely because it is convenient to expose from the implementation. Every API decision is traceable to a user problem.

### 3. Separate core from patterns harder

Layout primitives (`Container`, `Flex`, `Grid`, `Spacer`) are structural/headless core. Pattern components (`DataTable`, `SidebarLayout`, `TopbarLayout`) are higher-level compositions. They live in separate conceptual tiers. Pattern complexity must never drive complexity into core primitives. The boundary is enforced in docs, scorecards, and design reviews.

**Gate**: SPEC.md identifies both tiers. No core component gains complexity because a pattern needs it.

### 4. Standardize one composition model

`asChild` is the one composition escape hatch. Slot-based rendering is the one internal composition mechanism. Render props, factory functions, and context-as-public-API are not part of the model. Every component family uses the same composition primitives.

**Gate**: No component family uses a composition model not present in RULES.md. All `asChild` usages are on wrapper or interactive parts only, per SPEC.md.

### 5. Reduce unnecessary part count

A component family's part count should equal the number of distinct semantic responsibilities in the ARIA pattern, plus composition surface where asChild is justified. Extra wrapper parts that exist for styling convenience or tree structure are eliminated — that work belongs to the theme.

**Gate**: Each family's part count is justified against its ARIA pattern. Parts that only wrap for styling have been removed or are documented as intentional composition surface.

### 6. Make misuse fail loudly everywhere

Subcomponents used outside their root throw. Context accessors used without a provider throw. Invalid `asChild` hosts throw. Invalid nesting throws. Silent no-ops are bugs. Fast failure is a design feature, not an oversight.

**Gate**: Every context accessor includes a guard that throws a clear, actionable error message. Tests cover misuse scenarios.

### 7. Remove legacy compatibility architecture

Scaffolding that exists to maintain compatibility with pre-1.0 behavior is removed. Hidden injected props (`__*` prefix) are used only when architecturally necessary and are always stripped before DOM merge. Tree-rewriting patterns have been replaced with scoped-context architecture.

**Gate**: No component uses tree-rewriting or hidden-prop injection except where documented and tested. SPEC.md confirms `__*` prefix is the one exception.

### 8. Make accessibility semantics shape the API

ARIA patterns define the semantic responsibilities of each part. The API shape follows from ARIA — not from implementation convenience or visual layout. If ARIA says a part needs a label, the API exposes that label as a first-class constraint, not an afterthought.

**Gate**: Every component family's part list maps directly to the roles and states in its ARIA authoring practices pattern. Accessibility is automatic — users cannot forget to wire labels for required relationships.

### 9. Optimize for conceptual compression

The library should be learnable from a small set of consistent rules. If two sibling families use different patterns for the same concept, that is a design defect. Prefer one consistent rule that covers many families over many specific rules that each cover one.

**Gate**: Cross-family consistency is reviewed at design gate. Naming, prop patterns, and composition model are consistent across all families in the same tier.

### 10. Add a permanent design review gate

No component ships to stable without clearing a design coherence gate: API surface is minimal, consistent across sibling families, and free from implementation-driven surface area. The gate is enforced in COMPONENT_HARDENING.md and is as hard as the performance and accessibility gates.

**Gate**: Gate 7 in COMPONENT_HARDENING.md global phase gates. Cannot be waived without explicit written rationale.

---

## Execute Now

This governance pass applies all 10 steps to the current 1.0 surface:

1. **SPEC.md** — adds tier separation (core vs patterns) and API minimization policy to Design Rules
2. **RULES.md** — rewritten with 10 realistic, codebase-consistent rules that fix known contradictions (Rule 5 timers/layout reads, Rule 9 styling absolutes, package name in template)
3. **COMPONENT_HARDENING.md** — adds Design Coherence Policy, gate 7, and updated Done Bar and Ready-To-Close Evidence
4. **ROADMAP.md** — adds Original Design Program section as governance anchor for future additions
5. **docs/askr-ui.md** — splits Layout row into Layout primitives and Patterns rows with explanatory text
6. **docs/components.md** — splits `## Layout components` into `## Layout primitives` and `## Pattern components`
7. **docs/README.md** — adds link to this file

---

## Verification

- `npm run build` must pass
- `npm test` must pass (including `tests/docs-contract.test.ts`)
- `npm run test:types` must pass
- Design gate (gate 7 in COMPONENT_HARDENING.md) must be green for all shipped components
