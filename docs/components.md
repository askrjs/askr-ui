# Components

Reference for the public `@askrjs/ui` component surface.

The package exports are flat: use the root import for common cases, and use
the direct component paths when you want a narrower surface.

Type names are intentionally family-shaped rather than globally uniform. Most
components expose `OwnProps` for component-owned options, `Props` for the
public component type, and `AsChildProps` for polymorphic variants. A few
families use a host-specific suffix when the underlying element is part of the
contract.

The source tree follows the same idea: each public component owns its own
folder under `src/components/`, and shared internals stay in
`src/components/_internal/`.

Use the direct component paths for grouped imports:

```ts
import { Button, Checkbox, Input } from '@askrjs/ui';
import { Dialog, Popover, Tooltip } from '@askrjs/ui';
```

Use the component subpaths when you want one component at a time:

```ts
import { Button } from '@askrjs/ui/button';
import { Dialog } from '@askrjs/ui/dialog';
```

## Conceptual Groupings

These are documentation groupings only. They are not source folders.

- Primitives: core controls such as buttons, inputs, selects, and toggles
- Focus: focus management and dismissal helpers
- Overlays: dialogs, popovers, menus, and tooltips
- Disclosure: accordion and collapsible
- Status: progress and toasts
- Identity: avatar and related identity primitives
- Tables: semantic table primitives
- Navigation: menubar and navigation menu

Family notes:

- AlertDialog is a Dialog specialization for blocking confirmations. Its action and cancel parts intentionally alias the same close behavior for compatibility.
- Toast is a stacked notification family. `ToastProvider` owns the registry, `ToastViewport` renders the stack, and `Toast` registers entries rather than rendering standalone DOM.

Special-case helpers:

- `SelectItemText` marks the text slot used by `SelectItem` for labeling and styling.
- `DebouncedInput` wraps `Input` for search and filter surfaces that need a settled value callback.
- `ToastAction` closes a toast after a custom user action; `ToastClose` is the explicit dismiss control.
- `AlertDialogAction` and `AlertDialogCancel` intentionally alias `DialogClose` for compatibility with the confirmation-dialog naming.

## See also

- [askr-ui](./askr-ui.md)
- [Composition](./composition.md)
