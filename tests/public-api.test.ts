import { describe, expect, it } from 'vitest';
import * as askrUi from '../src';

describe('Public API', () => {
  it('exposes the v0.1 public component surface from the root entrypoint', () => {
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
  });

  it('does not expose deferred collapsible exports from the root entrypoint', () => {
    expect('Collapsible' in askrUi).toBe(false);
    expect('CollapsibleTrigger' in askrUi).toBe(false);
    expect('CollapsibleContent' in askrUi).toBe(false);
    expect('COLLAPSIBLE_A11Y_CONTRACT' in askrUi).toBe(false);
  });
});
