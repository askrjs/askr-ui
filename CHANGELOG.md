# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-09-29

Upgrade `@askrjs/askr` to 0.4 at the same time; `@askrjs/ui` 0.4 does not
work with `@askrjs/askr` 0.3, and `@askrjs/ui` 0.3 does not work with
`@askrjs/askr` 0.4. There are no component, prop, or export changes, and no
deprecations.

### Changed

- **Breaking:** the `@askrjs/askr` peer range (and the `@askrjs/vite` dev
  dependency) moves to `>=0.4.0 <0.5.0`. `OverlayHost` and the toast viewport
  import `For` from `@askrjs/askr/control`, its only import path in
  `@askrjs/askr` 0.4 (#131).
  Migration: upgrade `@askrjs/askr` to 0.4 together with this package and
  follow its 0.4.0 changelog.
- **Breaking (types):** the published declarations import `JSX` from
  `@askrjs/askr/jsx-runtime` instead of reading a global `JSX` namespace, which
  `@askrjs/askr` 0.4 no longer declares (#132). Component return types and
  every prop type built on `JSX.IntrinsicElements[...]` (for example
  `InputInputProps` and the native `div`/`button` props of each part) now
  resolve to Askr's intrinsic element types. Under 0.3 they depended on
  whatever global `JSX` the consuming project had: another framework's
  global JSX types, or a `Cannot find namespace 'JSX'` error (or `any` props
  with `skipLibCheck`) when there was none.
  Migration: remove any global `JSX` shim you declared for `@askrjs/ui` types.
  Props that were loosely typed before are now checked against Askr's
  intrinsic types, so fix any attribute names or value types this reports.
  Import `type JSX` from `@askrjs/askr/jsx-runtime` in your own code.

### Fixed

- Native-branch `ref`s are typed by element: a part that renders a `<button>`,
  `<input>`, `<div>`, and so on passes its `ref` as that element's ref type
  when not using `asChild`, so it typechecks under the element-specific
  intrinsic refs of `@askrjs/askr` 0.4 (#132). Runtime ref behavior is
  unchanged, except for `SliderTrack`; see Known issues.

### Known issues

- `SliderTrack` without `asChild` replaces its internal track ref with the
  caller's `ref`, so pointer input on the track no longer changes the slider
  value. Keyboard input on `SliderThumb` still works (#136).

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
