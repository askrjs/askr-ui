# Remaining Slice Queue

Generated from `src/components/index.ts`, `tests/components`, `benches/tier1`, `benches/tier2`, `benches/tier3`, and `benches/tier4`.

- Public families parsed: 31
- Queue groups: 5
- Families in queue: 15
- Queue families missing from the public surface: 0

## 1. Menu / Dropdown

- Boundary: root/shared/content/item
- Reason: collection-derived state and portal boundaries
- Families: menu, dropdown

| Family   | Public | Source | Tests                       | Bench |
| -------- | ------ | ------ | --------------------------- | ----- |
| menu     | yes    | yes    | behavior, a11y, determinism | yes   |
| dropdown | yes    | yes    | behavior, a11y, determinism | yes   |

## 2. Menubar

- Boundary: root/shared/content/menu
- Reason: menu tree with portal-heavy nested state
- Families: menubar

| Family  | Public | Source | Tests                       | Bench |
| ------- | ------ | ------ | --------------------------- | ----- |
| menubar | yes    | yes    | behavior, a11y, determinism | yes   |

## 3. Collapsible

- Boundary: root/content
- Reason: disclosure root/content path still has room to flatten
- Families: collapsible

| Family      | Public | Source | Tests                       | Bench |
| ----------- | ------ | ------ | --------------------------- | ----- |
| collapsible | yes    | yes    | behavior, a11y, determinism | yes   |

## 4. Progress / ProgressCircle

- Boundary: root/indicator
- Reason: value percentage and style-rule derivation
- Families: progress, progress-circle

| Family          | Public | Source | Tests                       | Bench |
| --------------- | ------ | ------ | --------------------------- | ----- |
| progress        | yes    | yes    | behavior, a11y, determinism | yes   |
| progress-circle | yes    | yes    | behavior, a11y, determinism | yes   |

## 5. Low-Risk Host Shells

- Boundary: host-only wrappers
- Reason: mostly prop composition and asChild passthroughs
- Families: toggle, button, form, input, textarea, label, table, scroll-area, visually-hidden

| Family          | Public | Source | Tests                       | Bench |
| --------------- | ------ | ------ | --------------------------- | ----- |
| toggle          | yes    | yes    | behavior, a11y, determinism | yes   |
| button          | yes    | yes    | behavior, a11y, determinism | yes   |
| form            | yes    | yes    | behavior                    | yes   |
| input           | yes    | yes    | behavior, a11y, determinism | yes   |
| textarea        | yes    | yes    | behavior, a11y, determinism | yes   |
| label           | yes    | yes    | behavior, a11y, determinism | yes   |
| table           | yes    | yes    | behavior, a11y, determinism | yes   |
| scroll-area     | yes    | yes    | behavior                    | yes   |
| visually-hidden | yes    | yes    | behavior, a11y, determinism | yes   |
