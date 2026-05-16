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

### Form control pattern

```tsx
import { Checkbox, Input, Label } from '@askrjs/ui';

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
<Checkbox>Subscribe to updates</Checkbox>;
```

### Controlled state pattern

```tsx
import { useState } from 'react';
import { Toggle } from '@askrjs/ui';

const [pressed, setPressed] = useState(false);

<Toggle pressed={pressed} onPress={() => setPressed(!pressed)}>
  Mute
</Toggle>;
```

## See also

- [askr-ui](./askr-ui.md)
- [Components](./components.md)
