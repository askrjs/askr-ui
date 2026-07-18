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
