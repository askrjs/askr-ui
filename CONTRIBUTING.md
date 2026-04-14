# Contributing to askr-ui

Thank you for your interest in contributing to askr-ui. This document outlines how to contribute effectively to a curated, high-coherence component library.

---

## Our Mission

askr-ui is a **curated headless component library** focused on coherence over feature velocity. We ship behavior, ARIA semantics, controlled and uncontrolled state handling, focus management, and composition helpers without imposing styling.

**Public components must pass a quality bar:**

- ✅ runtime behavior tests (deterministic, no flakes)
- ✅ accessibility semantics (ARIA, axe coverage)
- ✅ compile-time types (no `any`, full coverage)
- ✅ deterministic behavior (stable IDs, consistent rerenders)
- ✅ documentation with examples
- ✅ benchmark entry for performance tracking

If a component doesn't meet this bar, it doesn't ship.

---

## Before You Start

### Read the Governance

1. **[RULES.md](RULES.md)** — Non-negotiable component rules (5 core constraints)
2. **[SPEC.md](SPEC.md)** — Public contract, tiers (Core vs. Pattern), and design rules
3. **[COMPONENT_HARDENING.md](COMPONENT_HARDENING.md)** — Design review gates (gate 7 is mandatory for new public components)
4. **[ROADMAP.md](ROADMAP.md)** — Component tiers and stability status

### Understand Component Families

Components are organized by purpose:

- **Foundations & Form Controls**: `Button`, `Toggle`, `Checkbox`, `Input`, `Textarea`, `Label`, `Field`, `RadioGroup`, `Switch`
- **Focus & Dismissal**: `FocusRing`, `FocusScope`, `DismissableLayer`
- **Overlays & Selection**: `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `Menu`, `DropdownMenu`, `Select`
- **Disclosure & Content**: `Collapsible`, `Accordion`, `Tabs`
- **Status & Identity**: `Badge`, `Avatar`, `Skeleton`, `Progress`, `Spinner`, `Toast`
- **Navigation & Utility**: `Breadcrumb`, `Pagination`, `ToggleGroup`, `Slider`, `Menubar`, `NavigationMenu`
- **Layout Primitives**: `Container`, `Flex`, `Grid`, `Spacer` (structural/headless only)
- **Patterns**: `DataTable`, `SidebarLayout`, `TopbarLayout` (higher-level compositions)

Study a component in your family before proposing changes.

---

## Contribution Types

### Bug Fixes

**For a deterministic bug fix:**

1. **Write a test that reproduces the bug** (should fail before your fix)
2. **Fix the bug** (minimal change)
3. **Verify the test passes** and no other tests regress
4. **Run the quality gate**: `npm run fmt && npm run lint && npm test && npm run bench`

**Example:**

```bash
# Before fix: test fails
npm test -- tests/components/my-component/behavior.test.tsx

# After fix: test passes and full suite is green
npm run fmt && npm run lint && npm test && npm run bench
```

### New Components

**New public components require design review before implementation.**

1. **Open a GitHub discussion** with:
   - Component name and purpose
   - Relation to existing components (family)
   - Proposed composition model (root + subcomponents)
   - Proposed props (state model, event handlers)
   - Use case / why it belongs in Core vs. Pattern

2. **Await design feedback** — verify alignment with:
   - [SPEC.md](SPEC.md) tiers and design rules
   - Cross-family naming and patterns
   - Whether complexity should live in patterns, not core

3. **Implement using the component template** (see [AGENTS.md](AGENTS.md))

4. **Submit PR with:**
   - Source code (component + types + exports)
   - Behavior + accessibility + determinism tests
   - Benchmark entry
   - Documentation / example usage
   - All quality gates passing

5. **Expect review against design gates** — see [COMPONENT_HARDENING.md](COMPONENT_HARDENING.md) gate 7

### Documentation Improvements

Improvements to docs, examples, or governance files are always welcome:

1. **Fork and edit** the file (e.g., `docs/`, `README.md`, `SPEC.md`, etc.)
2. **Ensure clarity and accuracy** — link to relevant code and rules
3. **Submit PR** with clear rationale for the change

### Test Coverage

askr-ui's test suite is comprehensive. If you find a gap:

1. **Write a deterministic test** that covers the gap
2. **Verify it fails** without the component logic and passes with it
3. **Submit PR** with test + brief explanation of why coverage was missing

---

## Development Workflow

### Setup

```bash
# Clone and install
git clone https://github.com/askrjs/askr-ui.git
cd askr-ui
npm install
```

### Development Loop

```bash
# Watch mode for development
npm run dev

# Run tests in watch mode (if available)
# or single run:
npm test

# Format and lint
npm run fmt
npm run lint

# Full quality gate (must pass before pushing)
npm run fmt && npm run lint && npm test && npm run bench
```

### Key Commands

- `npm run build` — Build library for distribution
- `npm run build:types` — Generate TypeScript declarations
- `npm run dev` — Watch mode (for development)
- `npm test` — Run all tests (includes foundations contract check)
- `npm run test:types` — Check type definitions
- `npm run bench` — Run benchmarks
- `npm run fmt` — Format code (prettier)
- `npm run lint` — Check formatting
- `npm run verify:foundations` — Verify `@askrjs/askr` contract

### File Structure

```
src/
  components/
    primitives/       # Minimal, reusable form controls and layout
    composites/       # Collections of primitives (Dialog, etc.)
    patterns/         # Higher-level compositions (DataTable, etc.)
    _internal/        # Shared utilities (context, helpers, types)
  index.ts            # Public exports

tests/
  components/
    my-component/
      behavior.test.tsx         # State transitions, user interaction
      a11y.test.tsx             # Accessibility (axe)
      determinism.test.tsx      # ID stability, rerender consistency

benches/
  components/
    my-component.bench.tsx      # Performance benchmarks

docs/
  askr-ui.md                    # Library overview
  components.md                 # Component catalog
  ...

RULES.md                        # Non-negotiable constraints
SPEC.md                         # Public contract
COMPONENT_HARDENING.md          # Design review gates
ROADMAP.md                      # Tier structure and planned additions
```

---

## Code Quality Standards

### Component Rules (Non-Negotiable)

From [RULES.md](RULES.md):

1. **Components Only** — export `function MyComponent() {}`, never hooks, factories, or render props
2. **Root Owns State** — one root component per family, state via private context
3. **Context Is Internal** — context misuse throws immediately, no silent no-ops
4. **Slot-Based Composition** — `asChild` / slot behavior mandatory on wrappers, no forced DOM
5. **Side Effects Only When Justified** — every timer, layout read, or async must be commented and tested

### Type Safety

- All public props must have explicit types
- No `any` in public API
- Use `type` exports for JSX props pattern
- Consider defensive prop narrowing

Example:

```tsx
interface MyComponentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  asChild?: boolean;
  children: React.ReactNode;
}

export function MyComponent(props: MyComponentProps): JSX.Element {
  // ...
}
```

### Determinism

Every test must pass **with fake timers**:

```tsx
import { vi } from 'vite-plus/test';

it('deterministic behavior', () => {
  vi.useFakeTimers();
  // ... mount, interact, assert
  vi.useRealTimers();
});
```

Rules:

- Use `useId()` for stable IDs (from `src/components/_internal/id.ts`)
- No `Math.random()` outside ID scope
- No undeclared async behavior
- Comment every `setTimeout`, `getBoundingClientRect()`, etc. with justification

### Accessibility

- Use semantic HTML (`<button>`, `<input>`, etc.) when possible
- Apply correct ARIA roles and attributes
- Test with `vitest-axe` for automated checks
- Verify keyboard navigation works

Example test:

```tsx
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

it('has no automated axe violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Testing

**Behavior tests**: State transitions, prop handling, event firing

```tsx
it('opens when trigger is clicked', () => {
  // mount, interact, assert
});
```

**Accessibility tests**: ARIA, keyboard nav, roles

```tsx
it('has no automated axe violations', async () => {
  // axe check
});
```

**Determinism tests**: ID stability, rerender consistency

```tsx
it('has deterministic markup', () => {
  vi.useFakeTimers();
  // mount, measure HTML, verify stable
});
```

---

## Submitting a PR

### Before Pushing

1. **Run the full quality gate:**

   ```bash
   npm run fmt && npm run lint && npm test && npm run bench
   ```

   All four must pass.

2. **Verify no regressions:**

   ```bash
   npm test
   ```

   Benchmark suite should not show new regressions.

3. **Check types:**
   ```bash
   npm run test:types
   ```

### PR Template

```markdown
## Description

What does this PR accomplish? Why is it needed?

## Changes

- Brief bullet list of changes

## Testing

- How was this tested?
- New tests added?
- Manual testing done?

## Checklist

- [ ] `npm run fmt` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run bench` shows no regressions
- [ ] Types are complete (`npm run test:types`)
- [ ] Component follows RULES.md and SPEC.md
- [ ] Tests are deterministic (under fake timers)
- [ ] Accessible and keyboard-navigable (if applicable)
- [ ] Documentation/example added (if public)
```

### PR Review Expectations

Your PR may be reviewed against:

- **Code quality**: Follows rules, patterns, and style
- **Test coverage**: Behavior, accessibility, determinism
- **Accessibility**: ARIA, keyboard nav, semantics
- **Performance**: Benchmarks stable or improved
- **Coherence**: Consistent with similar components

---

## Common Pitfalls

### ❌ Adding Hooks

```tsx
// WRONG
export const useMyComponent = () => {
  const [open, setOpen] = useState();
  return { open, setOpen };
};
```

✅ **Right**: Use component + context

```tsx
export function MyComponent() {
  const [open, setOpen] = useState(); // root only
  return <MyComponentContext value={...}>{children}</MyComponentContext>;
}
```

### ❌ Silent No-Ops

```tsx
// WRONG
const context = useContext(myContext);
if (!context) return null; // silent failure
```

✅ **Right**: Fail loud

```tsx
function readMyContext() {
  const context = useContext(myContext);
  if (!context) {
    throw new Error('MyComponent subcomponent used outside MyComponent');
  }
  return context;
}
```

### ❌ Unintentional Flakes

```tsx
// WRONG
it('does something', () => {
  mount(<MyComponent />);
  // no fake timers; test may flake under CI load
});
```

✅ **Right**: Use fake timers

```tsx
it('does something', () => {
  vi.useFakeTimers();
  mount(<MyComponent />);
  vi.advanceTimersByTime(100);
  // deterministic
  vi.useRealTimers();
});
```

### ❌ Implementation-Detail Tests

```tsx
// WRONG
expect(component.querySelector('[data-internal-foo]')).toExist();
```

✅ **Right**: Test behavior

```tsx
expect(component.querySelector('[role="dialog"]')).toHaveAttribute(
  'aria-hidden',
  'false'
);
```

---

## Getting Help

- **Design questions**: Open a GitHub discussion or issue
- **Technical questions**: Comment on related issues or PRs
- **Coordination**: Reach out in issues or discussions before large changes

---

## License

By contributing, you agree that your contributions will be licensed under the project's [Apache-2.0 License](LICENSE).

---

## Recognition

Contributors are recognized in release notes and the GitHub contributors list. Thank you for helping make askr-ui world-class.
