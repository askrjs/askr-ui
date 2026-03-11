import { describe, expect, it } from 'vitest';
import * as askrUi from '../src';

describe('Public API', () => {
  it('exposes the 1.0 public component surface from the root entrypoint', () => {
    expect(askrUi.FocusRing).toBeDefined();
    expect(askrUi.FocusScope).toBeDefined();
    expect(askrUi.DismissableLayer).toBeDefined();
    expect(askrUi.Dialog).toBeDefined();
    expect(askrUi.AlertDialog).toBeDefined();
    expect(askrUi.Popover).toBeDefined();
    expect(askrUi.Tooltip).toBeDefined();
    expect(askrUi.Menu).toBeDefined();
    expect(askrUi.DropdownMenu).toBeDefined();
    expect(askrUi.Select).toBeDefined();
    expect(askrUi.Collapsible).toBeDefined();
    expect(askrUi.CollapsibleTrigger).toBeDefined();
    expect(askrUi.CollapsibleContent).toBeDefined();
    expect(askrUi.COLLAPSIBLE_A11Y_CONTRACT).toBeDefined();
    expect(askrUi.Badge).toBeDefined();
    expect(askrUi.Avatar).toBeDefined();
    expect(askrUi.Skeleton).toBeDefined();
    expect(askrUi.Progress).toBeDefined();
    expect(askrUi.ProgressCircle).toBeDefined();
    expect(askrUi.Spinner).toBeDefined();
    expect(askrUi.Breadcrumb).toBeDefined();
    expect(askrUi.Pagination).toBeDefined();
    expect(askrUi.Accordion).toBeDefined();
    expect(askrUi.Tabs).toBeDefined();
    expect(askrUi.ToggleGroup).toBeDefined();
    expect(askrUi.ToastProvider).toBeDefined();
    expect(askrUi.Slider).toBeDefined();
    expect(askrUi.Menubar).toBeDefined();
    expect(askrUi.NavigationMenu).toBeDefined();
  });
});
