# Composition

Patterns for building application components from `askr-ui` primitives.

## Principle

Composition should stay in application code. Keep the primitives small,
headless, and focused on behavior; build larger experiences by combining them.

## What good composition looks like

- Root components own state and coordination
- Parts expose clear roles such as trigger, content, label, and item
- `asChild` is used when a part should preserve caller markup
- Visual styling stays outside the primitive layer
- Complex interactions are expressed by combining primitives, not by adding
  prop branches

## Common patterns

### Dialog pattern

```tsx
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from '@askrjs/ui';

<Dialog>
  <DialogTrigger>Open dialog</DialogTrigger>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent>Confirm action</DialogContent>
  </DialogPortal>
</Dialog>;
```

The same portal structure applies to `AlertDialog`; use
`AlertDialogOverlay` next to `AlertDialogContent`. With
`@askrjs/themes/default`, both overlay variants already include the backdrop,
blur, stacking, and animation treatment.

#### Backdrop customization

Customize the shared theme contract rather than passing a competing class to
the overlay:

```css
/* Correct: all Dialog and AlertDialog overlays stay consistent. */
:root {
  --ak-color-backdrop: rgb(8 12 20 / 18%);
  --ak-z-modal-backdrop: 1040;
}
```

```tsx
// Incorrect: bypasses the shipped backdrop, blur, and stacking treatment.
<AlertDialogOverlay className="opaque-dialog-overlay" />
```

### Form control pattern

```tsx
import { Checkbox, Input, Label } from '@askrjs/ui';

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
<Checkbox>Subscribe to updates</Checkbox>;
```

### Controlled state pattern

```tsx
import { state } from '@askrjs/askr';
import { Toggle } from '@askrjs/ui';

const pressed = state(false);

<Toggle pressed={pressed()} onPress={() => pressed.set(!pressed())}>
  Mute
</Toggle>;
```

### Virtualization pattern

```tsx
import {
  VirtualList,
  VirtualTable,
} from '@askrjs/ui';
import { VirtualList as VirtualListSubpath } from '@askrjs/ui/virtual-list';
import { VirtualTable as VirtualTableSubpath } from '@askrjs/ui/virtual-table';

const columns = [
  {
    id: 'name',
    header: 'Name',
    cellComponent: ({ row }) => row.name,
  },
];

<VirtualList
  items={[{ id: '1', name: 'Ada' }]}
  rowHeight={32}
  getKey={(item) => item.id}
  rowComponent={({ item }) => item.name}
/>

<VirtualTable
  aria-label="People"
  rows={[{ id: '1', name: 'Ada' }]}
  rowHeight={32}
  headerHeight={32}
  getKey={(row) => row.id}
  columns={columns}
  viewport="lg"
/>
```

`VirtualTable` needs an accessible name and a bounded viewport so its grid and
windowing contracts remain meaningful. Its row-navigation keys operate when the
grid itself is focused; interactive controls rendered by a cell component keep
their native behavior.

Use the direct subpaths when you want a narrower family import surface; use
the root export when you are already importing other askr-ui primitives in the
same module.

## See also

- [askr-ui](./askr-ui.md)
- [Components](./components.md)
