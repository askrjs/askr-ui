# Components

Reference for the public `@askrjs/ui` component surface.

The package exports are flat: use the root import for common cases, and use
the direct component paths when you want a narrower surface.

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

## Categories

- Primitives: core controls such as buttons, inputs, selects, and toggles
- Focus: focus management and dismissal helpers
- Overlays: dialogs, popovers, menus, and tooltips
- Disclosure: accordion and collapsible
- Status: progress and toasts
- Identity: avatar and related identity primitives
- Tables: semantic table primitives
- Navigation: menubar and navigation menu

## See also

- [askr-ui](./askr-ui.md)
- [Composition](./composition.md)
