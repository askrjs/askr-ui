# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/askrjs/askr-ui/compare/v0.2.3...HEAD
[0.2.3]: https://github.com/askrjs/askr-ui/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/askrjs/askr-ui/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/askrjs/askr-ui/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/askrjs/askr-ui/compare/v0.0.33...v0.2.0
