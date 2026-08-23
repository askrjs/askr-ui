# Components

Reference for the public `@askrjs/ui` surface.

## Surface model

The package exports a curated root surface and direct component subpaths.
Use the root package for everyday imports and subpaths when you want a single
family with a narrower surface.

```ts
import { Button, Checkbox, Input } from '@askrjs/ui';
import { Dialog, Popover, Tooltip } from '@askrjs/ui';
import { Dialog } from '@askrjs/ui/dialog';
```

Type names are family-shaped rather than globally uniform. Most families use
`OwnProps`, `Props`, and `AsChildProps` naming. Some host-bound families use a
host-specific suffix when the underlying element is part of the contract.

The source tree follows the same layout: each public family owns its own folder
under `src/components/`, and shared internals stay in
`src/components/_internal/`.

## Conceptual groupings

These are documentation groupings only.

| Group                      | Families                                                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitives                 | Button, Checkbox, Input, Label, Form, Toggle, ToggleGroup, RadioGroup, Select, Slider, Switch, Table, Textarea, Progress, ProgressCircle, VisuallyHidden |
| Focus                      | FocusScope, DismissableLayer                                                                                                                             |
| Overlays                   | Dialog, AlertDialog, Popover, HoverCard, Tooltip, Dropdown, Menu                                                                                         |
| Disclosure                 | Accordion, Collapsible                                                                                                                                   |
| Status                     | Progress, ProgressCircle, Toast                                                                                                                          |
| Identity                   | Avatar                                                                                                                                                   |
| Navigation                 | Menubar                                                                                                                                                  |
| Layout and layout-adjacent | Scroll Area                                                                                                                                              |
| Virtualization             | VirtualList, VirtualTable                                                                                                                                |

## Family notes

- AlertDialog is a Dialog specialization for blocking confirmations. Its action
  and cancel parts intentionally alias the same close behavior for
  compatibility. Always render `AlertDialogOverlay` alongside
  `AlertDialogContent` inside the portal.
- `DialogOverlay` and `AlertDialogOverlay` are fully styled out of the box when
  used with `@askrjs/themes/default`: the theme supplies the backdrop token,
  blur, stacking, and fade animation. Standard usage needs no additional CSS.
- Toast is a stacked notification family. `ToastHost` owns the registry,
  `ToastViewport` renders the stack, and `Toast` registers entries rather than
  rendering standalone DOM.
- Select uses `SelectItemText` as the text slot used by `SelectItem` for
  labeling and styling.
- `DebouncedInput` wraps `Input` for search and filter surfaces that need a
  settled value callback.
- `ToastAction` closes a toast after a custom user action; `ToastClose` is the
  explicit dismiss control.
- `AlertDialogAction` and `AlertDialogCancel` intentionally alias
  `DialogClose` for confirmation-dialog compatibility.
- `VirtualList` is a fixed-height list windowing primitive with stable keys,
  anchor correction, and optional follow-bottom behavior.
- `VirtualTable` is a fixed-height table windowing primitive with a sticky
  head, stable keys, selection, and keyboard navigation.

## Overlay positioning and sizing

Anchored overlay families (`Popover`, `HoverCard`, `Tooltip`, `Dropdown`,
`Menu`, and `Select`) interpret `align="start"` and `align="end"` as logical
inline edges. The shared positioning engine reads the trigger's computed text
direction, so those alignments mirror in right-to-left layouts when the overlay
is above or below its trigger.

Viewport collision handling chooses and clamps the overlay position. Because
this package is headless, it does not shrink anchored content whose intrinsic
size is larger than the viewport. The content exposes the current padded
viewport bounds as `--ak-overlay-available-width` and
`--ak-overlay-available-height`; apply them with an appropriate wrapping and
overflow policy for application content:

```css
.app-overlay-content {
  max-width: var(--ak-overlay-available-width);
  max-height: var(--ak-overlay-available-height);
  overflow: auto;
  overflow-wrap: anywhere;
}
```

Without that consumer rule, a long unbroken URL, hash, or identifier can remain
wider than a narrow viewport. The engine still clamps its position, but position
clamping alone cannot make oversized content fit.

## Keyboard interaction

Keyboard behavior follows the semantic role of each public component and is
preserved through `asChild` composition.

| Surface                             | Keyboard contract                                                                                                                                                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pressable controls                  | `Enter` activates on keydown, `Space` activates on keyup, disabled controls do not activate, and caller cancellation still suppresses the component's default action.                                                       |
| Roving composites                   | Arrow keys move the single active tab stop and skip disabled items. `Tab` leaves the composite or dismisses an open popup and continues to the next page control.                                                           |
| Menu, Dropdown, Menubar, and Select | Printable keys perform case-insensitive prefix matching against `textValue` (or rendered text), skip disabled items, wrap to the next match, and cycle when the same character is repeated. The buffer resets after 500 ms. |
| Select                              | Typeahead works while either the closed trigger or open listbox has focus. Closed-trigger matches update the value; open-listbox matches move focus.                                                                        |
| Accordion                           | Every enabled trigger remains in the page Tab sequence. Orientation arrows and Home/End provide optional direct navigation.                                                                                                 |
| RadioGroup                          | Arrows skip disabled radios and move focus and selection.                                                                                                                                                                   |
| ToggleGroup                         | Arrows move focus only; Enter or Space activates the focused toggle.                                                                                                                                                        |
| ScrollArea                          | Its enabled scrollbar uses arrows for 40 CSS-pixel steps, PageUp/PageDown for one viewport, and Home/End for the boundaries.                                                                                                |

Spaces typed after a typeahead prefix can match multiword values; a standalone
`Space` remains an activation key. Typeahead only moves focus or selection. A
visible text field that filters options is a separate Combobox capability, not
Select behavior.

Native buttons and direct `asChild` buttons retain browser activation and form
submit/reset behavior. Non-native `asChild` hosts receive button-role
Enter/Space behavior. Component defaults run only when neither an ancestor nor
the caller canceled the event; activation remains exactly once in either path.
Menu-item links preserve native Enter navigation, while Space maps to one click.

HoverCard is a non-modal interactive preview. Pointer opening does not move
focus. Tab can enter its content from the trigger, Escape restores the trigger,
and leaving its final control continues after the trigger.

### Standalone navigation menus

`Menu` is also the supported accessible primitive for an always-visible list
of navigation choices; it does not require a popover or trigger. Compose links
through `MenuItem asChild` so native navigation is preserved while arrow keys,
Home/End, and typeahead remain available without consumer event wiring.

```tsx
<Menu>
  <MenuContent aria-label="Choose a workspace">
    <MenuItem asChild textValue="Acme production">
      <a href="/workspaces/acme">
        <MenuItemIcon aria-hidden="true">
          <BuildingIcon />
        </MenuItemIcon>
        <MenuItemLabel>Acme</MenuItemLabel>
        <MenuItemDescription>Production workspace</MenuItemDescription>
      </a>
    </MenuItem>
  </MenuContent>
</Menu>
```

The default theme styles the content surface, item dividers, leading icon,
primary label, description, and hover/focus states. Use `textValue` whenever
structured children do not provide the intended typeahead phrase directly.

## Dynamic descendants

Dynamic descendants are a supported composition contract for
context-coordinated group families. Their parts may be written directly,
nested in caller markup, returned from an array `.map()`, or rendered with
Askr's `<For>`.

| Family         | Dynamic descendant contract                                 |
| -------------- | ----------------------------------------------------------- |
| `accordion`    | `AccordionItem` and its parts retain Accordion context.     |
| `dropdown`     | `DropdownItem` retains Dropdown and content context.        |
| `menu`         | `MenuItem` retains Menu and content context.                |
| `menubar`      | Menus, content, submenus, and items retain Menubar context. |
| `radio-group`  | `RadioGroupItem` retains RadioGroup context.                |
| `select`       | Select groups, labels, and items retain Select context.     |
| `slider`       | Track, range, and thumb parts retain Slider context.        |
| `toggle-group` | `ToggleGroupItem` retains ToggleGroup context.              |

Use stable `key` props for array-mapped children and a stable `by` selector for
`<For>`. Dynamically reordered `MenubarMenu` children should also provide a
stable, unique `value`; it preserves each menu's trigger, content, and portal
identity as its position changes. Duplicate sibling values are rejected.

## Virtualization

```ts
import { VirtualList, VirtualTable } from '@askrjs/ui';
import { VirtualList as VirtualListSubpath } from '@askrjs/ui/virtual-list';
import { VirtualTable as VirtualTableSubpath } from '@askrjs/ui/virtual-table';
```

`VirtualList` keeps list rendering headless while the caller supplies the row
component. `VirtualTable` renders native table elements with interactive grid
semantics while the caller supplies column metadata and cell renderers. Give a
virtual table an accessible name and a bounded viewport. Keyboard row selection
is handled only while the grid itself has focus; links, buttons, and form
controls rendered inside cells retain their native click, focus, and keyboard
behavior.

## See also

- [askr-ui](./askr-ui.md)
- [Composition](./composition.md)
