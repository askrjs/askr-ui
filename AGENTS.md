# Agent Guidance for askr-ui

This repository owns Askr's headless component primitives. Visual styling and
theme composition belong in `@askrjs/themes`.

## Repository map

- `src/components/<family>/index.ts` is the public barrel for a component
  family.
- `src/components/_internal/` contains shared implementation helpers only.
- `tests/unit/` covers focused runtime, SSR, and type-level behavior.
- `tests/integrity/` protects exports, package structure, docs, source layout,
  benchmark coverage, and test-suite conventions.
- `tests/jsdom/` covers DOM-backed internal behavior.
- `tests/browser/components/` owns public behavior, accessibility, and
  determinism coverage. These run on native `@playwright/test`
  (`playwright.config.ts`): each `<name>.spec.ts` runs in Node and drives the
  page, while the component tree it mounts lives in the mirrored
  `tests/browser/scenarios/<same path>.tsx` module, loaded lazily by
  `tests/browser/harness.ts`.
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

## Jev Review Aid

Jev is TypeSafe's System One model: it returns typed judgments from a supplied
state and questions. It is not a chat or code-generation model. Use it to
prioritize component-review hypotheses; a Jev answer is not evidence that a bug
exists or that a component is correct.

Call the HTTP API with `POST https://api.typesafe.ai/v1/systemone`, model
`jev-latest`, and a JSON body containing `state` and named `questions`. Keep
`TYPESAFE_API_KEY` in the environment and send it only as a Bearer token; never
print, commit, or include the key in the state. A focused component-review
request can look like this; replace the placeholders with the exact contract
and evidence being reviewed:

```json
{
  "model": "jev-latest",
  "state": {
    "component": "Popover",
    "contract": "<expected trigger, dismissal, and focus behavior>",
    "source_excerpt": "<relevant implementation or diff>",
    "tests_and_observations": "<relevant regressions and observed behavior>",
    "benchmark_evidence": "<measurement, or state that none is available>"
  },
  "questions": {
    "disposition": {
      "type": "choice",
      "instructions": "Which review disposition is best supported by the supplied evidence?",
      "criteria": {
        "fix": "A concrete contract, interaction, accessibility, or correctness defect is evidenced.",
        "optimize": "A measured hot path has a plausible safe improvement.",
        "golden": "No actionable issue is supported by the supplied evidence."
      }
    }
  }
}
```

Save the request as `jev-request.json` and run:

```sh
curl --fail-with-body https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer ${TYPESAFE_API_KEY:?set TYPESAFE_API_KEY}" \
  -H 'Content-Type: application/json' \
  --data @jev-request.json
```

Use the question type that fits the decision: `choice` for a bounded
disposition, `score` for an ordered rubric, and `noul` for one yes/no
judgment. For a component walk, give Jev a compact, structured state with the
component name, public behavior/accessibility contract, relevant source or diff
excerpt, observed behavior, existing regression tests, and benchmark evidence
(or say when it is absent). Ask narrow, component-specific questions. A useful
disposition `choice` can distinguish `fix` (a contract or behavior defect),
`optimize` (a measured hot path with a plausible safe improvement), and
`golden` (no actionable issue supported by the supplied evidence). Do not use
`golden` to claim exhaustive correctness. Batch independent questions over the
same state in one request; split questions when one answer is needed to form the
next state or candidate set.

Inspect the returned answer, probabilities, and confidence, then independently
verify every actionable lead in the implementation and the relevant browser,
accessibility, type, or benchmark tests. Treat low confidence as a reason to
inspect the evidence or narrow the question, not as a severity measure. If the
API or credentials are unavailable, say Jev was not run; do not imply otherwise.
See TypeSafe's [coding-agent guidance](https://docs.typesafe.ai/introduction/coding-agents),
[HTTP API reference](https://docs.typesafe.ai/api), [question types](https://docs.typesafe.ai/primitives),
and [confidence guide](https://docs.typesafe.ai/confidence).

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

`npm run test:browser` runs the Playwright suite against a Vite harness
(`vite.harness.config.ts`). Locally each run starts its own harness on a free
port, so runs in parallel worktrees stay isolated. `ASKR_TEST_PORT=<port>` pins
the port. To reuse a harness you already started from this checkout
(`npx vp dev --config vite.harness.config.ts`, port 4318), set
`PW_REUSE_SERVER=1`; the run fails fast if the server on that port serves a
different checkout. CI always starts a fresh harness on port 4318.

Keep changes narrow, preserve public contracts unless a breaking change is
explicitly requested, and do not rewrite unrelated files.

## Changelog

Any change to the `version` field in `package.json`, whether a release,
prerelease, or patch bump, must include a matching `## <version>` section in
`CHANGELOG.md` in the same commit or pull request. Date the section and list
breaking changes (with migration notes), deprecations, additions, and fixes.
Move entries from `Unreleased` into the new version section rather than leaving
them there. Do not publish or tag a version whose changelog section is missing.
Check with `npm run changelog:check` (the first step of `npm run check`, which
`prepublishOnly` and the publish workflow run), which fails when `CHANGELOG.md`
has no non-empty section for the current version.

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
