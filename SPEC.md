# askr-ui 1.0 Contract

## Overview

askr-ui is a curated headless component library. It ships behavior, ARIA semantics, controlled and uncontrolled state handling, focus management, and composition helpers without imposing styling.

## Public Contract

Public components must be coherent across:

- runtime behavior
- accessibility semantics
- compile-time types
- deterministic rerender and ID behavior
- documentation and examples
- benchmark coverage

If a component fails that bar, it does not ship as public API.

## Supported Public Surface

- Foundations and form controls: `Button`, `Toggle`, `Checkbox`, `VisuallyHidden`, `Separator`, `Label`, `Input`, `Textarea`, `Field`, `RadioGroup`, `Switch`
- Focus and dismissal: `FocusRing`, `FocusScope`, `DismissableLayer`
- Overlays and selection: `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `Menu`, `DropdownMenu`, `Select`
- Disclosure and content: `Collapsible`, `Accordion`, `Tabs`
- Status and identity: `Badge`, `Avatar`, `Skeleton`, `Progress`, `ProgressCircle`, `Spinner`, `Toast`
- Basic navigation and utility: `Breadcrumb`, `Pagination`, `ToggleGroup`, `Slider`, `Menubar`, `NavigationMenu`
- Layout primitives (structural/headless only - no colors, borders, or theme tokens): `Container`, `Flex`, `Grid`, `Spacer`
- Patterns: `DataTable`, `SidebarLayout`, `TopbarLayout`

Responsive theme contract:

- Layout primitives emit semantic `data-*` attributes for theming, including `data-collapse-below`, `data-columns`, `data-min-item-width`, `data-gap`, `data-sidebar-position`, and `data-sidebar-width`.
- Official themes interpret `data-collapse-below` using the canonical breakpoint names `sm`, `md`, `lg`, and `xl`.
- Responsive styling remains theme-owned and mobile first: narrow screens are the base, larger layouts layer on with additive media queries.

## Component Tiers

The public surface has two tiers. **Core** is what the library cannot remove without breaking its promise. **Patterns** are higher-level compositions built on core. The distinction is enforced in docs, scorecards, and design reviews.

- **Core**: all primitives and composites listed under Supported Public Surface except Patterns. Core components must remain minimal, composable, and free from pattern-driven complexity.
- **Patterns**: `DataTable`, `SidebarLayout`, `TopbarLayout`. Patterns combine core primitives into opinionated compositions for common scenarios. Pattern complexity must not drive complexity into core.

## Design Rules

- Components are headless by default.
- Public state props are standardized:
  - disclosure and overlay roots use `open`, `defaultOpen`, `onOpenChange`
  - value roots use `value`, `defaultValue`, `onValueChange`
  - boolean roots use `checked`, `defaultChecked`, `onCheckedChange`
- `asChild` is allowed only on wrapper-style or interactive composition parts.
- `Input` and `Textarea` preserve native form semantics when composed: `asChild` is allowed only with matching native `<input>` and `<textarea>` hosts.
- `*Portal` parts stay public only when they perform tested, intentional portal-slot behavior.
- Hidden injected props and JSX tree-rewriting are not allowed in component architecture.
- Shared internal helpers are preferred over component-specific state or ID patterns.
- API surface must remain minimal: fewer parts and props are better unless the missing surface forces users to rebuild behavior the library owns. Implementation-driven surface area is not added.
- Cross-family consistency is required: sibling families use the same naming conventions, prop patterns, and composition model. Inconsistency is a design defect, not a style preference.

## Runtime Contract

askr-ui depends on `@askrjs/ui/foundations` exposing the verified behavior-helper
contract used in CI:

- `createCollection`
- `createLayer`
- `Presence`
- `pressable`
- `focusable`
- `dismissable`
- `rovingFocus`
- `mergeProps`
- `composeRefs`
- `Ref`
- `Orientation`
- `controllableState`

askr-ui also consumes structural primitives from `@askrjs/askr/foundations`:

- `Slot`
- `Presence`
- `JSXElement`

Dependency drift is guarded by a dedicated verification script.

## Release Gate

Every public release must pass:

- `npm run build`
- `npm test`
- `npm run test:types`

## Migration Note

`1.0.0` finalizes the library as a stable public baseline:

- milestone-era docs and deferred API language are removed
- `Menubar` and `NavigationMenu` join the supported root and subpath API
- portal parts are documented against the supported portal-slot contract used by the runtime

