# Regression Coverage Matrix

This ledger turns recent component regressions into standing coverage rules.
Every public component family should have browser coverage for behavior,
accessibility, and deterministic markup unless the missing axis is documented
here.

## Package baseline

| Surface                         | Coverage expectation                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Public exports and type surface | `tests/unit/public-api.test.ts`, export-map checks, and type tests.                                                         |
| Component behavior              | Browser `behavior.test.tsx` files exercise public component usage and state transitions.                                    |
| Accessibility                   | Browser `a11y.test.tsx` files validate semantics and automated axe coverage where meaningful.                               |
| Determinism                     | Browser `determinism.test.tsx` files cover stable markup and no timer scheduling during render.                             |
| Runtime-sensitive internals     | jsdom tests cover package-level portal/reset behavior without reaching into private component internals from browser tests. |
| Performance-sensitive families  | Tiered benches cover public family hot paths after behavior is already protected.                                           |

## Regression classes

| Class                                 | Required durable coverage                                                                                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stale event/context snapshots         | Repeated user interactions after rerender must assert current DOM state and callback payloads, especially controlled/uncontrolled components.                                                                      |
| Timer and microtask sensitivity       | Fake-timer tests must not rely on `setTimeout(0)` helpers; behavior tests should use deterministic flush helpers or fake timers.                                                                                   |
| Render-time state writes              | Ref callbacks and virtualized mount paths must defer state writes; behavior tests should assert no render-time state errors.                                                                                       |
| Controlled/uncontrolled normalization | Single and multiple value APIs must assert callback payloads, DOM state, and controlled non-mutation behavior.                                                                                                     |
| Async media/status transitions        | Load and error paths must assert fallback/presence state after real browser events.                                                                                                                                |
| Portal and focus cleanup              | Overlays, toasts, dialogs, menus, and popovers must assert dismissal, focus restoration, and teardown.                                                                                                             |
| Export/version drift                  | Root exports, ESM subpath exports, and type tests must fail before a downstream package consumes a broken surface. CJS runtime loading is not part of the current release gate because `@askrjs/askr` is ESM-only. |

## Current focused follow-ups

- Slider, toast, avatar, virtual list, virtual table, and toggle group regressions
  are covered by the current browser suites.
- `form` and `scroll-area` intentionally have behavior-only browser coverage
  today; add a11y and determinism tests before broadening their behavior
  surface.
- New component families must add behavior, a11y, determinism, public API, and
  benchmark coverage before release unless this ledger records a narrower
  contract.

Release validation for this matrix is:

```bash
npm run lint
npm run build
npm run test:checks
npm run test:unit
npm run test:jsdom
npm run test:browser
```
