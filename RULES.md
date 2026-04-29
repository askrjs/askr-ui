# askr-ui Component Rules

These are the required implementation rules for `askr-ui` components. New components should start from the template below and keep the public API component-first.

## 1. Components Only

- Export **components**
- Do not export hooks
- Do not export factories
- Do not expose render-prop APIs

```ts
// GOOD
export function Dialog() {}
export function DialogTrigger() {}

// BAD
useDialog()
createDialog()
<Dialog>{(state) => ...}</Dialog>
```

---

## 2. Root Owns State

- Exactly **one root component** owns all state
- State is exposed internally via context
- Subcomponents must never create their own state

```tsx
<Dialog>
  {' '}
  // owns state
  <DialogTrigger /> // reads state
  <DialogContent /> // reads state
</Dialog>
```

---

## 3. Context Is Internal

- Context objects are **private**
- Context accessors are **private**
- Misuse throws immediately

```ts
// internal only
readDialogContext();
```

No silent no-ops.

---

## 4. Slot-Based Composition

- Subcomponents render via `<Slot />`
- `asChild` / slot behavior is mandatory
- No forced DOM elements

```tsx
<DialogTrigger asChild>
  <button />
</DialogTrigger>
```

---

## 5. Side Effects Only When Justified and Tested

- Event handlers are scheduler-safe by default
- Timers (`setTimeout`, `setInterval`), layout reads (`getBoundingClientRect`), and async operations are allowed only when necessary for correct behavior
- Every such usage must be commented at the call site and covered by a determinism test

```tsx
// GOOD - timer is necessary for auto-dismiss; covered by determinism test
const id = setTimeout(() => dismiss(toastId), duration);

// BAD - timer used to defer state without documented justification
setTimeout(() => setOpen(false), 0);
```

---

## 6. Accessibility Is Automatic

- ARIA attributes are applied internally
- Users cannot forget to wire labels
- Broken ARIA is a bug

---

## 7. Controlled + Uncontrolled Always

- Every stateful root supports:
  - `open`
  - `defaultOpen`
  - `onOpenChange`

- Behavior is identical in both modes

---

## 8. Presence Is Explicit

- Mount only when active
- Unmount deterministically
- No animation coupling

---

## 9. Headless by Default; Structural Layout Allowed

- No color classes, theme tokens, or visual CSS variables
- No inline styles driven by visual design decisions
- Structural layout behavior (e.g., flex display, flex-direction) is allowed in layout-primitive components when it is the headless semantic, not visual styling
- All theme-driven styling remains the consumer's responsibility

```tsx
// GOOD - structural behavior owned by layout primitive
<div style={{ display: 'flex', flexDirection: direction }} />

// BAD - visual styling injected by the component
<div style={{ backgroundColor: 'blue', borderRadius: '4px' }} />
```

---

## 10. Fail Fast

- Invalid nesting throws
- Missing root throws
- Incorrect usage is loud

---

# askr-ui Component Template (Copy-Paste)

```tsx
// component.tsx

import { createContext, readContext } from '@askrjs/askr';
import { Slot } from '../slot';

/* ---------------------------------------------
 * Context (PRIVATE)
 * ------------------------------------------- */

interface ExampleState {
  open: () => boolean;
  setOpen(next: boolean): void;
}

const ExampleContext = createContext<ExampleState>();

function readExampleContext(): ExampleState {
  const ctx = readContext(ExampleContext);
  if (!ctx) {
    throw new Error('Example components must be used within <Example>');
  }
  return ctx;
}

/* ---------------------------------------------
 * Root
 * ------------------------------------------- */

export interface ExampleProps {
  open": boolean;
  defaultOpen": boolean;
  onOpenChange": (open: boolean) => void;
  children": unknown;
}

export function Example(props: ExampleProps) {
  const [open, setOpen] = createControllableState(
    props.open,
    props.defaultOpen "" false,
    props.onOpenChange
  );

  const state: ExampleState = {
    open,
    setOpen,
  };

  return (
    <ExampleContext.Provider value={state}>
      {props.children}
    </ExampleContext.Provider>
  );
}

/* ---------------------------------------------
 * Subcomponents
 * ------------------------------------------- */

export interface ExampleTriggerProps {
  asChild": boolean;
  children": unknown;
}

export function ExampleTrigger(props: ExampleTriggerProps) {
  const example = readExampleContext();

  return (
    <Slot
      {...props}
      onClick={() => example.setOpen(true)}
      aria-expanded={example.open()}
    />
  );
}

export function ExampleContent(props) {
  const example = readExampleContext();

  if (!example.open()) return null;

  return <Slot {...props} role="dialog" />;
}
```

---

## Mandatory Checklist Before Merge

Every component PR must answer **yes** to all:

- [ ] Root owns all state
- [ ] Subcomponents are stateless
- [ ] No `use*` APIs
- [ ] Context is private
- [ ] Slot-based
- [ ] ARIA wired
- [ ] Controlled + uncontrolled
- [ ] Deterministic mount/unmount
- [ ] Fails loudly on misuse

---

## Why this works

This template:

- Scales from **Button -> Dialog -> DataGrid**
- Is AI-friendly (Copilot will follow it)
- Prevents accidental React-isms
- Makes askr-ui _feel like a real UI library_

If you want next:

- Turn this into a **lint rule**
- Define **v1 component cut-line**
- Apply this template to `Dialog` fully
