# UI 0.5.0 migration

The root and all 34 direct family entrypoints remain supported. Component functions, prop types, `asChild` branches, virtualization contracts, package version, and peer ranges are unchanged by the named API cut.

Accessibility assertion metadata becomes private. Remove imports of the following 53 names from `@askrjs/ui` and the listed owner path. There is no replacement metadata export or testing subpath. Assert documented roles, ARIA/data attributes, keyboard interactions, focus, and native form values directly; keep application-specific expected metadata in your tests.

| Retired name                      | Owning family path             |
| --------------------------------- | ------------------------------ |
| `ACCORDION_A11Y_CONTRACT`         | `@askrjs/ui/accordion`         |
| `AccordionA11yContract`           | `@askrjs/ui/accordion`         |
| `ALERT_DIALOG_A11Y_CONTRACT`      | `@askrjs/ui/alert-dialog`      |
| `AlertDialogA11yContract`         | `@askrjs/ui/alert-dialog`      |
| `AVATAR_A11Y_CONTRACT`            | `@askrjs/ui/avatar`            |
| `AvatarA11yContract`              | `@askrjs/ui/avatar`            |
| `BUTTON_A11Y_CONTRACT`            | `@askrjs/ui/button`            |
| `ButtonA11yContract`              | `@askrjs/ui/button`            |
| `CHECKBOX_A11Y_CONTRACT`          | `@askrjs/ui/checkbox`          |
| `CheckboxA11yContract`            | `@askrjs/ui/checkbox`          |
| `COLLAPSIBLE_A11Y_CONTRACT`       | `@askrjs/ui/collapsible`       |
| `DIALOG_A11Y_CONTRACT`            | `@askrjs/ui/dialog`            |
| `DialogA11yContract`              | `@askrjs/ui/dialog`            |
| `DISMISSABLE_LAYER_A11Y_CONTRACT` | `@askrjs/ui/dismissable-layer` |
| `DismissableLayerA11yContract`    | `@askrjs/ui/dismissable-layer` |
| `DROPDOWN_A11Y_CONTRACT`          | `@askrjs/ui/dropdown`          |
| `DropdownA11yContract`            | `@askrjs/ui/dropdown`          |
| `FOCUS_SCOPE_A11Y_CONTRACT`       | `@askrjs/ui/focus-scope`       |
| `FocusScopeA11yContract`          | `@askrjs/ui/focus-scope`       |
| `INPUT_A11Y_CONTRACT`             | `@askrjs/ui/input`             |
| `InputA11yContract`               | `@askrjs/ui/input`             |
| `LABEL_A11Y_CONTRACT`             | `@askrjs/ui/label`             |
| `LabelA11yContract`               | `@askrjs/ui/label`             |
| `MENU_A11Y_CONTRACT`              | `@askrjs/ui/menu`              |
| `MenuA11yContract`                | `@askrjs/ui/menu`              |
| `MENUBAR_A11Y_CONTRACT`           | `@askrjs/ui/menubar`           |
| `MenubarA11yContract`             | `@askrjs/ui/menubar`           |
| `POPOVER_A11Y_CONTRACT`           | `@askrjs/ui/popover`           |
| `PopoverA11yContract`             | `@askrjs/ui/popover`           |
| `PROGRESS_A11Y_CONTRACT`          | `@askrjs/ui/progress`          |
| `PROGRESS_CIRCLE_A11Y_CONTRACT`   | `@askrjs/ui/progress-circle`   |
| `ProgressA11yContract`            | `@askrjs/ui/progress`          |
| `ProgressCircleA11yContract`      | `@askrjs/ui/progress-circle`   |
| `RADIO_GROUP_A11Y_CONTRACT`       | `@askrjs/ui/radio-group`       |
| `RadioGroupA11yContract`          | `@askrjs/ui/radio-group`       |
| `SELECT_A11Y_CONTRACT`            | `@askrjs/ui/select`            |
| `SelectA11yContract`              | `@askrjs/ui/select`            |
| `SLIDER_A11Y_CONTRACT`            | `@askrjs/ui/slider`            |
| `SliderA11yContract`              | `@askrjs/ui/slider`            |
| `SWITCH_A11Y_CONTRACT`            | `@askrjs/ui/switch`            |
| `SwitchA11yContract`              | `@askrjs/ui/switch`            |
| `TEXTAREA_A11Y_CONTRACT`          | `@askrjs/ui/textarea`          |
| `TextareaA11yContract`            | `@askrjs/ui/textarea`          |
| `TOAST_A11Y_CONTRACT`             | `@askrjs/ui/toast`             |
| `ToastA11yContract`               | `@askrjs/ui/toast`             |
| `TOGGLE_A11Y_CONTRACT`            | `@askrjs/ui/toggle`            |
| `TOGGLE_GROUP_A11Y_CONTRACT`      | `@askrjs/ui/toggle-group`      |
| `ToggleA11yContract`              | `@askrjs/ui/toggle`            |
| `ToggleGroupA11yContract`         | `@askrjs/ui/toggle-group`      |
| `TOOLTIP_A11Y_CONTRACT`           | `@askrjs/ui/tooltip`           |
| `TooltipA11yContract`             | `@askrjs/ui/tooltip`           |
| `VISUALLY_HIDDEN_A11Y_CONTRACT`   | `@askrjs/ui/visually-hidden`   |
| `VisuallyHiddenA11yContract`      | `@askrjs/ui/visually-hidden`   |

```ts
import { Checkbox } from '@askrjs/ui/checkbox';
// In an application browser test:
await expect(checkbox).toHaveAttribute('data-state', 'checked');
await expect(checkbox).toBeChecked();
```

Select now repairs focus when the focused option disappears from an open dynamic collection. It focuses the next enabled mounted option at or after the prior position, otherwise the last preceding enabled option. When none remain, it focuses the owned content if explicitly focusable, otherwise its FocusScope host. This changes focus only: selected value and change callbacks remain untouched. Closing or unmounting the owner and intentional focus elsewhere cancel the repair. Stable keys remain required for dynamic descendants.

Controlled-to-uncontrolled transitions retain the existing internal default/current value; they do not copy the last controlled prop into internal state. An owner that declines a controlled change request retains the controlled value.

Themes family reexports follow the rebuilt UI surface. The coordinated release must rebuild and qualify the packed Themes artifact against the candidate UI; source-only star reexports do not prove a clean installed surface.

The [complete API review](./0.5.0-public-api.md) includes all 970 before/after name/path decisions.

## CommonJS loading and module identity

UI keeps `require` support on Node 24 and later. Both `import` and `require`
conditions now resolve to the same canonical ESM `.js` files and `.d.ts`
declarations. The legacy `main` field also names the ESM root. The old duplicate
`.cjs` builds failed when requiring the ESM-only Core peer; native Node 24
`require(esm)` loads the shared graph correctly, without a bridge or a second
Core runtime. Import and require return identical component functions.

Use ESM `import { Button } from '@askrjs/ui/button'` or synchronous
`const { Button } = require('@askrjs/ui/button')` on the supported Node version.
TypeScript NodeNext consumers can use `.mts` or `.cts` respectively; both resolve
the same declarations. Deep imports of old `.cjs`/`.d.cts` build files are private
and unsupported. All 36 keys remain; this repairs package conditions separately
from the 106 retired named exports above.
