# Gap Analysis

This note compares `askr-ui` and `askr-themes` against a mature primitives
library model, with ownership split by responsibility:

- `askr-ui` owns behavior, state, accessibility, and composition
- `askr-themes` owns visual-only components, layout scaffolds, and default styling

The goal is not to clone another library component-for-component. The goal is
to make the remaining gaps explicit so we can decide whether a missing piece
belongs in `askr-ui`, `askr-themes`, or neither.

The reference model is useful here because it centers accessible, unstyled,
composition-friendly primitives, plus separate guidance for accessibility,
composition, and styling.

## Good

`askr-ui` is already strong where the core primitives model matters most:

- Form and control primitives: `Button`, `Input`, `Textarea`, `Checkbox`,
  `RadioGroup`, `Select`, `Slider`, `Switch`, `Toggle`, `ToggleGroup`, `Label`
- Disclosure and overlay behavior: `Accordion`, `Collapsible`, `Tabs`,
  `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `DropdownMenu`, `Menu`,
  `Menubar`, `NavigationMenu`
- Utility and support primitives: `FocusScope`, `DismissableLayer`, `Avatar`,
  `Progress`, `ProgressCircle`, `Table`, `VisuallyHidden`
- Composition model: `asChild` / `Slot`-style composition is already a first-class
  pattern across interactive parts, which lines up well with an open component
  architecture

`askr-themes` already reduces pressure on `askr-ui` by absorbing the visual and
layout-heavy pieces that would otherwise become headless primitives:

- Visual primitives: `Box`, `Stack`, `Inline`, `Flex`, `Grid`, `Container`,
  `Section`, `Spacer`, `Card`, `Badge`, `Skeleton`, `Spinner`
- Theme-owned wrappers: `Breadcrumb`
- Layout and shell scaffolds: `Header`, `Navbar`, `SidebarLayout`,
  `TopbarLayout`
- App-page scaffolds: `EmptyState`, `FormSection`, `SettingsSection`
- Styling bridge: `Separator` / `Divider`, plus the default theme CSS surface

That means the obvious “missing primitives” list is already partly handled
outside `askr-ui`.

## Bad

The remaining gaps are still real, but they are narrower than a flat
feature-parity checklist would suggest:

- `askr-ui` does not yet expose direct equivalents for some families such as
  `ScrollArea`, `HoverCard`, `Context Menu`, `Form`, `AccessibleIcon`, and
  `Aspect Ratio`
- Some of those are behavior-first primitives that would fit `askr-ui`
  naturally, while others are better candidates for `askr-themes` if we want a
  visual/layout wrapper instead of a new behavioral primitive
- Documentation is shallower than the mature primitives model’s public docs
  set; there are dedicated pages for composition, styling, accessibility, and
  component anatomy, while `askr-ui` is still more reference-oriented than
  guided

Practical interpretation:

- `askr-ui` should not grow visual-only wrappers just to chase parity
- `askr-themes` should keep absorbing the shell and layout patterns that help
  app teams ship faster
- New headless primitives should only land in `askr-ui` when they add behavior,
  accessibility, or composition value that themes cannot provide

## Ugly

The biggest risk is not missing a specific component. It is ownership drift:

- `askr-ui` depends on `@askrjs/askr/foundations`, so version skew can break
  types and tests even when source looks correct
- `askr-themes` already owns some of the “missing” surface area, so a naive
  checklist would overcount work in `askr-ui`
- Without an explicit boundary, future additions can end up in the wrong
  package and make the public surface harder to reason about

That suggests the real problem to solve is not only component count. It is
package discipline.

## Ownership Call

If we keep following the primitives model, the remaining work naturally splits
like this:

- `askr-ui`: any new headless behavior primitive, accessibility helper, or
  composition-aware overlay/control family
- `askr-themes`: any visual wrapper, app scaffold, shell chrome, or layout
  helper that can be expressed as styling and composition
- shared docs: the boundary rules, examples, and “when to use which package”

## Reference Matrix

| Area | askr-ui | askr-themes | Notes |
| --- | --- | --- | --- |
| Controls | Strong | Styled by themes | Matches the core primitives mental model well |
| Overlays | Strong | Styled by themes | `Dialog`, `Popover`, `Tooltip`, menus are already there |
| Disclosure | Strong | Styled by themes | `Accordion`, `Collapsible`, `Tabs` are in good shape |
| Layout / chrome | Minimal | Strong | Best owned by `askr-themes` |
| Visual primitives | Minimal | Strong | Better fit for theme package than headless UI |
| Utility extras | Mixed | Mixed | `Separator` is theme-owned; `AspectRatio` / `ScrollArea` remain open |
| Docs / guidance | Fair | Fair | Both packages would benefit from clearer ownership examples |

## Bottom Line

`askr-ui` is already closer to the primitives model on behavior than a first
pass gap list suggests. The bigger opportunity is to keep the boundary crisp:

- Headless interaction belongs in `askr-ui`
- Visual wrappers and shell composition belong in `askr-themes`
- Anything that crosses that boundary should be called out explicitly instead
  of being treated as generic “missing parity”
