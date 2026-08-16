# Agent Guidance for askr-ui

This repository owns Askr's headless component primitives. Visual styling and
theme composition belong in `@askrjs/themes`.

## Repository map

- `src/components/<family>/index.ts` is the public barrel for a component
  family.
- `src/components/_internal/` contains shared implementation helpers only.
- `tests/unit/` protects exports, package structure, docs, and type contracts.
- `tests/jsdom/` covers DOM-backed internal behavior.
- `tests/browser/components/` owns public behavior, accessibility, and
  determinism coverage.
- `benches/` contains the four benchmark tiers.
- `docs/` contains the package overview, composition guidance, and standing
  regression-coverage rules.

## Component rules

1. Export components, not public hooks, factories, or render props.
2. Keep state in the family root and share it through private context.
3. Throw when a subcomponent is used outside its owning root.
4. Preserve caller markup through `asChild` where the family supports it.
5. Keep timers, layout reads, and other side effects explicit and covered.
6. Add public exports only with matching behavior, accessibility, determinism,
   type, documentation, and benchmark coverage.

## Askr North Star

Keep each component's state transition narratable from an explicit user event
or prop change through the owning root to the resulting DOM. Enforce root,
subcomponent, controlled-state, timer, and lifecycle invariants at runtime with
errors that identify the misuse and correction. Define and test every new
family's misuse, teardown, nesting, keyboard, focus, and async failure modes.
Preserve the seam between headless behavior and `@askrjs/themes` styling.
Prefer explicit composition over inferred structure, and add props, variants,
or escape hatches only for demonstrated application needs. Performance work
must not replace the narratable component-root model with hidden dependency
graphs.

Use existing neighboring families as the implementation template. Shared
behavior belongs in `_internal`; public family barrels remain the only package
entrypoints.

## Validation

Run the focused lane while iterating, then the repository gate:

```sh
npm run fmt
npm run lint
npm run typecheck
npm test
npm run build
npm run test:publint
npm run pack:check
```

Use `npm run test:unit`, `npm run test:jsdom`, or `npm run test:browser` for a
focused rerun. Run `npm run bench` when component or shared-runtime performance
may change.

Keep changes narrow, preserve public contracts unless a breaking change is
explicitly requested, and do not rewrite unrelated files.

## Optimization Gate

A benchmark number is only half of an optimization's success criterion. The
change must also preserve a causal path that a human or agent can narrate in one
sentence.

Every benchmark-driven change must include:

1. the one-sentence causal description of the optimized path;
2. the exact fallback trigger and proof that optimized and fallback paths have
   identical observable behavior and error surfaces;
3. an explicit legibility-cost statement, including `none` when no new path or
   concept is introduced; and
4. evidence that a measured bottleneck in a real application justifies the
   optimization now.

Prefer making the existing single path faster. New caches, inference,
memoization, shortcuts, fast paths, or scheduler states require an explicit
legibility decision; a speedup alone does not justify them.
