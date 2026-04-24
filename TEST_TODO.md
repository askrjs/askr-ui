# askr-ui Testing Split TODO

Goal: split the test suite into three layers without losing the current coverage bar.

## Test Layers

- [x] Node tests: pure contracts, docs contract, public API surface, and type tests.
- [x] jsdom tests: DOM-backed helpers and internal contract checks that do not need a real browser.
- [x] Browser tests: public component behavior, accessibility, portal behavior, and determinism in Vitest Browser Mode + Playwright.

## Config And Scripts

- [x] Add a shared Vitest config base so the environment-specific configs reuse the same plugins and JSX setup.
- [x] Add `vitest.node.config.ts` for node-only tests.
- [x] Add `vitest.jsdom.config.ts` for DOM-backed unit tests.
- [x] Add `vitest.browser.config.ts` for browser-mode component tests.
- [x] Update `package.json` with `test:unit`, `test:component`, and an umbrella `test` script.
- [x] Keep `verify:foundations` first in the umbrella test flow.

## Dependencies And CI

- [x] Add `playwright` as a dev dependency.
- [x] Update `.github/workflows/ci.yml` to install the browser binaries needed by Playwright.
- [x] Keep CI running the same umbrella test gate as local development.

## Test Ownership

- [x] Keep `tests/public-api.test.ts`, `tests/docs-contract.test.ts`, and `tests/types/**` in the node layer.
- [x] Keep `tests/components/icon/**`, `tests/components/consistency-reset/**`, and `tests/components/data-table/state.test.tsx` in the jsdom layer.
- [x] Move all public component `behavior`, `a11y`, and `determinism` suites to the browser layer.
- [x] Add browser coverage for `data-table` with behavior, a11y, and determinism tests.

## Documentation

- [x] Update `CONTRIBUTING.md` with the new test-layer split so contributors know where to add new coverage.
- [x] Update `AGENTS.md` with the same guidance for future agents.

## Verification

- [ ] Run node tests.
- [ ] Run jsdom tests.
- [ ] Run browser tests in headless Chromium.
- [ ] Run the full umbrella `npm test` flow.
