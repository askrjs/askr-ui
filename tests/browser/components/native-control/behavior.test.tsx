import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Button } from '../../../../src/components/button';
import { Menu, MenuContent, MenuItem } from '../../../../src/components/menu';
import {
  Select,
  SelectTrigger,
  SelectValue,
} from '../../../../src/components/select';
import { Toggle } from '../../../../src/components/toggle';
import { mount, unmount } from '../../test-utils';

describe('Native control styling', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
    document.documentElement.style.removeProperty('font-size');
    document.body.style.removeProperty('font-family');
  });

  it('should mark representative native button fallbacks without inline styles', () => {
    container = mount(
      <div>
        <Button data-testid="button">Button</Button>
        <Menu>
          <MenuContent>
            <MenuItem data-testid="menu-item">Menu item</MenuItem>
          </MenuContent>
        </Menu>
        <Select defaultValue="askr">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
        <Toggle data-testid="toggle">Toggle</Toggle>
      </div>
    );

    for (const testId of ['button', 'menu-item', 'select-trigger', 'toggle']) {
      const control = container.querySelector<HTMLElement>(
        `[data-testid="${testId}"]`
      )!;
      expect(control.dataset.askrNativeControl, testId).toBe('true');
      expect(control.getAttribute('style'), testId).toBeNull();
    }
  });

  it('should preserve caller font overrides and leave asChild typography untouched', () => {
    container = mount(
      <div>
        <Button data-testid="override" style={{ fontSize: '21px' }}>
          Override
        </Button>
        <Button asChild>
          <a data-testid="as-child" href="/docs" style={{ fontSize: '19px' }}>
            Docs
          </a>
        </Button>
      </div>
    );

    const override = container.querySelector<HTMLElement>(
      '[data-testid="override"]'
    )!;
    const asChild = container.querySelector<HTMLElement>(
      '[data-testid="as-child"]'
    )!;
    expect(getComputedStyle(override).fontSize).toBe('21px');
    expect(getComputedStyle(asChild).fontSize).toBe('19px');
    expect(asChild.style.font).toBe('');
  });
});
