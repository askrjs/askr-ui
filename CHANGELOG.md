# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `npm run pack:check` reads both `npm pack --json` shapes, the array printed
  by npm 11 and earlier and the object keyed by package name printed by npm 12,
  and fails with a clear message on any other output instead of
  `Cannot read properties of undefined (reading 'files')`. A test now covers
  both shapes (#129).
- `SliderTrack` without `asChild` registers its internal track ref again, so
  pressing the track and dragging the thumb change the value (#136). This was
  the known issue listed for 0.4.0: since #132 the native branch replaced the
  composed ref with only the caller's `ref`.
- `SliderThumb`, `SliderTrack`, and `SliderRange` update `aria-valuenow` and
  `data-percentage` when the value changes (#136). `Slider` passed the same
  mutated context object to its parts on every render, so they were not
  re-rendered and kept the initial value. The hidden input and
  `--ak-slider-percentage` were not affected.
- `DebouncedInput` creates its debounced emitter once per mount instead of on
  every render. Before, each re-render (for example a controlled `value`
  updated from `onInput`) started a new debounce timer without cancelling the
  previous one, so a settled value could be emitted once per render, or early,
  and pending calls used the `onDebouncedInput` and `debounceMs` from an older
  render. Now a pending value is emitted once to the latest
  `onDebouncedInput`, is re-timed when `debounceMs` changes (or emitted at once
  when it drops to `0`), is dropped when `onDebouncedInput` is removed, and is
  cancelled on unmount (#126).

## [0.4.0] - 2026-09-28

Upgrade `@askrjs/askr` to 0.4 at the same time. `@askrjs/ui` 0.3 does not work
with `@askrjs/askr` 0.4: it imports `For` from the `@askrjs/askr` root, which
0.4 no longer exports, and its declarations need the global `JSX` namespace
that 0.4 removed. There are no component, prop, or export changes, and no
deprecations.

### Changed

- **Breaking:** the `@askrjs/askr` peer range (and the `@askrjs/askr` and
  `@askrjs/vite` dev dependencies) moves to `>=0.4.0 <0.5.0`. `OverlayHost`
  and the toast components import `For` from `@askrjs/askr/control`, its only
  import path in `@askrjs/askr` 0.4 (#131).
  Migration: upgrade `@askrjs/askr` to 0.4 together with this package and
  follow its 0.4.0 changelog.
- **Breaking (types):** the published declarations import `JSX` from
  `@askrjs/askr/jsx-runtime` instead of reading the global `JSX` namespace
  (#132). `@askrjs/askr` 0.3 declared that global; 0.4 scopes its JSX types to
  the `jsxImportSource` runtime modules, so 0.3 declarations fail against it
  with `Cannot find namespace 'JSX'`. Component return types and every prop
  type built on `JSX.IntrinsicElements[...]` now resolve through
  `@askrjs/askr/jsx-runtime`, so they follow `@askrjs/askr` 0.4's intrinsic
  element types (for example, element-specific `ref` types).
  Migration: none beyond upgrading `@askrjs/askr`. Any new type errors in your
  own props come from `@askrjs/askr` 0.4's intrinsic typing changes; see its
  changelog. In your own code, import `type JSX` from
  `@askrjs/askr/jsx-runtime` instead of using the global.

### Known issues

- `SliderTrack` without `asChild` loses its internal track ref, whether or not
  you pass a `ref` (#136). Pressing on the track and dragging the thumb no
  longer change the value. Keyboard input still works, and
  `SliderTrack asChild` avoids the problem. It comes from #132, which passes
  each native element's `ref` explicitly so it typechecks against
  `@askrjs/askr` 0.4's element-specific refs; every other component's runtime
  ref behavior is unchanged.

## [0.3.0] - 2026-09-11

### Changed

- Move the `@askrjs/askr` peer range and the `@askrjs/vite` dependency to
  `>=0.3.0 <0.4.0` for the coordinated 0.3.0 release. No component API changes.

## [0.2.4] - 2026-08-28

### Added

- Add opt-in variable row heights to `VirtualList` while preserving the fixed
  row path and keyed scroll anchoring.

### Fixed

- Let nested portalled overlays own focus without escaping their parent modal,
  and restore focus to their persistent trigger on close.
- Restore dialog and select focus across triggerless and resized overlay
  transitions.
- Move composite focus when a current Dropdown or Select item becomes disabled
  during a prop-only rerender.
- Mount shared overlay portals through an explicit application `OverlayHost` so
  content escapes transformed and overflow-clipped product surfaces.

## [0.2.3] - 2026-08-25

### Fixed

- Harden shared focus, overlay, menu, dialog, form, virtualization, and
  composite component lifecycles and accessibility behavior.
- Add regression coverage for RTL composites and virtualized component
  behavior.

## [0.2.2] - 2026-08-23

### Added

- Mark the actual final dataset row rendered by `VirtualTable` with
  `data-terminal-row="true"` so virtualized themes can distinguish it from the
  moving end of the mounted window.
- Document complete Dialog and AlertDialog overlay composition and theme
  ownership contracts.

### Fixed

- Harden `VirtualTable` sizing, native scrolling, row measurement, dataset
  replacement, accessibility metadata, and terminal-row behavior.
- Complete Dialog and AlertDialog overlay defaults while preserving explicit
  consumer overrides.

### Security

- Refresh the transitive Nano ID lockfile resolution to address the current
  audit advisory.

### Changed

- Refresh eligible AskrJS and development-tool dependency ranges with
  `askr update`.

## [0.2.1] - 2026-08-22

### Fixed

- Remove component-authored inline layout styles while preserving virtual-list
  and virtual-table behavior across CSP, SSR, and dynamic stylesheet lifecycles.
- Correct AlertDialog and menubar accessibility semantics.

## [0.2.0] - 2026-08-16

### Changed

- Establish the coordinated AskrJS 0.2 compatibility baseline and peer ranges.

[Unreleased]: https://github.com/askrjs/askr-ui/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/askrjs/askr-ui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/askrjs/askr-ui/compare/v0.2.4...v0.3.0
[0.2.4]: https://github.com/askrjs/askr-ui/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/askrjs/askr-ui/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/askrjs/askr-ui/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/askrjs/askr-ui/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/askrjs/askr-ui/compare/v0.0.33...v0.2.0
