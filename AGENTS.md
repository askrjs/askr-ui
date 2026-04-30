# Agent & Copilot Guidance for askr-ui

This document guides AI agents and automated systems on working with askr-ui's codebase. It complements the human-facing [CONTRIBUTING.md](CONTRIBUTING.md) and the technical rules in [RULES.md](RULES.md), [SPEC.md](SPEC.md), and [COMPONENT_HARDENING.md](COMPONENT_HARDENING.md).

---

## Core Principles

### 1. Coherence Over Feature Velocity

askr-ui is a **curated** library, not a feature factory. Every public component must pass the `SPEC.md` contract:

- OK runtime behavior tests (deterministic, no flake)
- OK accessibility semantics coverage (axe, ARIA)
- OK compile-time types (no `any`)
- OK determinism checks (ID stability, rerender consistency)
- OK benchmark entry (performance tracking)
- OK documentation with examples

**If a component fails that bar, it does not ship.**

### 2. Components Only

askr-ui exports **components** (`function MyComponent() {}`), never hooks, factories, or render props.

- NO Do not add `useMyComponent()` hooks
- NO Do not add `createMyComponent()` factories
- NO Do not suggest component-render-prop patterns
- OK Build with context + subcomponents + composition

```tsx
// GOOD
<Dialog>
  <DialogTrigger asChild>
    <button>Open</button>
  </DialogTrigger>
  <DialogContent>Content</DialogContent>
</Dialog>;

// NO
const state = useDialog();
<MyComponent render={() => {}} />;
```

### 3. Determinism Is Non-Negotiable

Every test must pass **with fake timers** (`vi.useFakeTimers()`). Every ID must be stable. Rerenders must not drift.

- Do not Never add `Math.random()` outside strict ID scope
- Do not Never rely on `Date.now()` for logic (timer tests only)
- OK Use the shared `useId()` from `src/components/_internal/id.ts`
- OK Run all tests deterministically; leave determinism tests in place

Example test pattern:

```tsx
it('deterministic behavior under fake timers', () => {
  vi.useFakeTimers();
  mount(<YourComponent />);
  vi.advanceTimersByTime(100);
  // assert behavior
  vi.useRealTimers();
});
```

### 4. Rules Are Constraints, Not Guidelines

The rules in [RULES.md](RULES.md) are **non-negotiable**:

1. **Components Only** - no hooks, factories, render props
2. **Root Owns State** - one root component per family, state via context
3. **Context Is Internal** - misuse throws immediately, no silent no-ops
4. **Slot-Based Composition** - `asChild` mandatory on wrappers, no forced DOM
5. **Side Effects Only When Justified** - every timer/layout-read/async must be commented and tested

When you encounter a use case that breaks these rules, **escalate**, do not work around.

---

## Implementation Workflow

### Step 1: Understand the Task

Read the existing component category (e.g., overlays, disclosure, form controls) to understand composition patterns.

- Check similar components: `Dialog`, `Popover`, `Tooltip` (overlays); `Collapsible`, `Accordion` (disclosure)
- Review shared internal utilities in `src/components/_internal/`
- Identify which family this component belongs to and what context/utilities it should reuse

### Step 2: Verify Design Against SPEC

Before writing code:

- Does the component fit the supported surface in `SPEC.md`"
- Does it map to an existing tier (Core or Pattern)"
- Does it pass the cross-family consistency check" (naming, props, composition model)
- Are there any conflicting design rules"

If the task conflicts with `SPEC.md` or `RULES.md`, **stop and escalate**.

### Step 3: Use the Component Template

Start from the standard template. Every component must follow this structure:

```tsx
// src/components/composites/my-component/my-component.tsx
import { Slot } from '@askrjs/askr/foundations';
import { mergeProps } from '@askrjs/askr/foundations';
import type { MyComponentProps } from './my-component.types';

export function MyComponent(props: MyComponentProps): JSX.Element {
  const { asChild, children, ...rest } = props;
  const finalProps = mergeProps(rest, {
    // core handlers and attributes
  });

  if (asChild) {
    return <Slot {...finalProps}>{children}</Slot>;
  }

  return <div {...finalProps}>{children}</div>;
}
```

### Step 4: Build With Context

If your component needs state:

1. Create a private context object in a `.shared.ts` file
2. Place state in the root component only
3. Export private context accessors for subcomponents
4. Throw immediately if context is accessed outside scope

Example (`src/components/composites/my-component/my-component.shared.ts`):

```tsx
import { createContext } from '@askrjs/askr/jsx-runtime';

export interface MyComponentContext {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const myComponentContext = createContext<MyComponentContext | null>(
  null
);

export function readMyComponentContext() {
  const ctx = useContext(myComponentContext);
  if (!ctx) {
    throw new Error('MyComponent subcomponent used outside MyComponent');
  }
  return ctx;
}
```

### Step 5: Add Tests Immediately

Do **not** skip testing. Tests are part of the component.

**Test layers**

- **Node**: `tests/public-api.test.ts`, `tests/docs-contract.test.ts`, and `tests/types/**`
- **Jsdom**: DOM-backed helpers and internal contract checks like `tests/components/icon/**`, `tests/components/consistency-reset/**`, and `tests/components/data-table/state.test.tsx`
- **Browser**: public component `behavior`, `a11y`, and `determinism` suites, plus browser coverage for `data-table`

Browser suites run with a shared zero-noise console policy. Public flows must stay silent across `warn`, `error`, `log`, `info`, and `debug`.

If a browser test intentionally expects console output, use the local allowance helper in `tests/browser-console.ts` and keep the exception scoped to that test. Do not add ad hoc console spies around browser suites.

Use `tests/warnings.ts` only for targeted node/jsdom warning assertions that are outside the browser public-flow gate.

**Behavior tests** (`tests/components/my-component/behavior.test.tsx`):

- Mount and verify core state transitions
- Test keyboard interaction (if applicable)
- Test prop handling (controlled/uncontrolled)
- Test `asChild` behavior if supported

**Accessibility tests** (`tests/components/my-component/a11y.test.tsx`):

- Run `axe` on rendered component
- Verify ARIA attributes and semantics

**Determinism tests** (`tests/components/my-component/determinism.test.tsx`):

- Run with fake timers and verify stable IDs
- Verify rerenders don't drift markup

Example:

```tsx
import { describe, it, expect, afterEach, vi } from 'vite-plus/test';
import { mount, unmount } from '../../test-utils';
import { MyComponent } from '../../../src/components/my-component';

describe('MyComponent - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('opens and closes on trigger click', () => {
    container = mount(
      <MyComponent>
        <MyComponentTrigger>Open</MyComponentTrigger>
        <MyComponentContent>Content</MyComponentContent>
      </MyComponent>
    );

    const trigger = container.querySelector('[data-my-trigger]');
    expect(container.querySelector('[data-my-content]')).toBeNull();

    trigger".click();
    expect(container.querySelector('[data-my-content]')).not.toBeNull();
  });
});
```

### Step 6: Run the Quality Gate

After every change, run:

```bash
npm run fmt
npm run lint
npm run test:unit
npm run test:component
npm test
npm run bench
```

For release gating, run `npm run quality` so build, tests, and benchmarks are exercised together. If `bench` fails, stabilize the benchmark entry or investigate regressions.

### Step 7: Add Benchmark Entry

Create a benchmark file in `benches/components/my-component.bench.tsx`:

```tsx
import { bench, describe } from 'vite-plus/test';
import { MyComponent } from '../../src/components/my-component';

describe('MyComponent benches', () => {
  bench('create my-component', () => {
    <MyComponent>
      <MyComponentTrigger>Open</MyComponentTrigger>
    </MyComponent>;
  });
});
```

---

## Code Review Checklist for Agents

When completing a task, verify:

- [ ] All code follows the component template and shared patterns
- [ ] No hooks, factories, or render props introduced
- [ ] Context is private; misuse throws immediately
- [ ] `asChild` pattern is implemented on composition parts
- [ ] All side effects (timers, layout reads, async) are commented at call site
- [ ] All tests run under fake timers and pass determinism checks
- [ ] No `data-` attributes are implementation detail (avoid internal details)
- [ ] Benchmarks are added and `npm run bench` passes
- [ ] `npm run fmt`, `npm run lint`, `npm test` all pass
- [ ] Types are complete; no `any` in public API
- [ ] Cross-family naming and patterns match existing components

---

## Patterns to Follow

### Controlled & Uncontrolled State

```tsx
// Use controllableState from foundations
const [value, setValue] = controllableState(
  props.value,
  props.defaultValue "" initialValue,
  props.onValueChange
);
```

### Slot-Based Composition

```tsx
// Always support asChild on interactive parts
export function MyTrigger(props: MyTriggerProps) {
  const { asChild, children, ...rest } = props;
  const finalProps = mergeProps(rest, { onClick: handleClick });

  if (asChild) {
    return <Slot {...finalProps}>{children}</Slot>;
  }

  return <button {...finalProps}>{children}</button>;
}
```

### Focus Management

```tsx
// Use FocusRing and FocusScope from public API
<FocusScope trapped loop>
  <button>First</button>
  <button>Second</button>
</FocusScope>
```

### Event Handler Scheduling

```tsx
// Comment every timer/layout read with justification
onKeyDown={(e) => {
  if (e.key === 'Enter') {
    // Delay to allow DOM update before read
    setTimeout(() => {
      const height = contentRef.current".getBoundingClientRect().height;
      // ...
    }, 0);
  }
}}
```

---

## When to Escalate

**Stop and escalate** if:

- The task requires violating a rule in [RULES.md](RULES.md)
- The component doesn't fit the tiers in [SPEC.md](SPEC.md)
- Cross-family consistency would require changing existing public API
- Tests cannot be made deterministic under fake timers
- The component would push complexity into core that should stay in patterns
- You're unclear on component boundaries or ownership

---

## Documentation Expectations

Every public component must have:

1. **JSDoc** on the component and all public props
2. **Usage example** in the component module or docs
3. **Composition pattern** documented (roots, triggers, content)
4. **Accessibility note** (if applicable)
5. **State handling** (controlled/uncontrolled, if applicable)

Example:

````tsx
/**
 * A disclosure component that hides/shows content.
 *
 * @example
 * ```tsx
 * <Collapsible>
 *   <CollapsibleTrigger>Toggle</CollapsibleTrigger>
 *   <CollapsibleContent>Hidden content</CollapsibleContent>
 * </Collapsible>
 * ```
 */
export function Collapsible(props: CollapsibleProps): JSX.Element {
  // ...
}
````

---

## Performance & Stability Expectations

- No components should benchmark slower than similar family members
- IDs must be stable across rerenders (use `useId()`)
- No memory leaks on mount/unmount
- No infinite loop potential in controlled state
- All event handlers must be deterministic under fake timers

---

## Reference Resources

- [RULES.md](RULES.md) - Non-negotiable component rules
- [SPEC.md](SPEC.md) - Public contract and design rules
- [COMPONENT_HARDENING.md](COMPONENT_HARDENING.md) - Design review gates
- [ROADMAP.md](ROADMAP.md) - Tier structure and release gates
- [`src/components/_internal/`](src/components/_internal/) - Shared utilities
- Existing components for reference patterns (e.g., `Dialog`, `Collapsible`, `Select`)

---

## Questions"

If your task is unclear or conflicts with these guidelines, **ask for clarification** rather than proceeding with assumptions. askr-ui's quality bar depends on intentionality.
