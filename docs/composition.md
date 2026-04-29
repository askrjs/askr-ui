# Composition

Patterns for composing `askr-ui` primitives into application components.

## Principle

Askr UI is composed, not configured. Keep behavior in primitives and combine
them in application code instead of expanding component props.

## Example

```tsx
import {
  Button,
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from '@askrjs/ui';
import { SaveIcon } from '@askrjs/lucide';

<Dialog>
  <DialogTrigger>
    <Button>
      <SaveIcon size={14} aria-hidden="true" /> Save changes
    </Button>
  </DialogTrigger>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent>Confirm action</DialogContent>
  </DialogPortal>
</Dialog>;
```

## See also

- [askr-ui](./askr-ui.md)
- [Foundations](./foundations.md)
- [Components](./components.md)
