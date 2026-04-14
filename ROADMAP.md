# askr-ui 1.0 Support Matrix

## Policy

askr-ui is curated as a headless component library, not a milestone tracker. A component is public only when its behavior, accessibility, types, determinism, docs, and benchmarks are coherent.

## Stable

- Foundations and form controls: `Button`, `Toggle`, `Checkbox`, `VisuallyHidden`, `Separator`, `Label`, `Input`, `Textarea`, `Field`, `RadioGroup`, `Switch`
- Focus and dismissal: `FocusRing`, `FocusScope`, `DismissableLayer`
- Overlays and selection: `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `Menu`, `DropdownMenu`, `Select`
- Disclosure and content: `Collapsible`, `Accordion`, `Tabs`
- Status and identity: `Badge`, `Avatar`, `Skeleton`, `Progress`, `ProgressCircle`, `Spinner`, `Toast`
- Basic navigation and utility: `Breadcrumb`, `Pagination`, `ToggleGroup`, `Slider`, `Menubar`, `NavigationMenu`
- Layout primitives (structural/headless only): `Container`, `Flex`, `Grid`, `Spacer`
- Patterns: `DataTable`, `SidebarLayout`, `TopbarLayout`

## Internal

- Shared collection, disclosure, range, overlay, focus, JSX, and prop utilities under `src/components/_internal`
- Dependency contract verification in `scripts/check-foundations-contract.js`

## Planned

- Additional primitives only after the 1.0 contract remains stable under change

## Original Design Program

See [ORIGINAL_DESIGN_PLAN.md](../ORIGINAL_DESIGN_PLAN.md) for the full 10-step governance program.

All future additions to the public surface must:

- preserve the smaller core (pattern complexity must not drive core complexity)
- maintain tier separation between core primitives/composites and pattern components
- clear design gate 7 in COMPONENT_HARDENING.md before shipping

## Release Gate

- `npm run build`
- `npm test`
- `npm run test:types`

No public component ships without runtime behavior tests, accessibility coverage, determinism checks, compile-time type coverage, and a benchmark entry.
