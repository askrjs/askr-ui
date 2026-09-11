import { Button } from '../../../../../src/components/button';
import {
  Menu,
  MenuContent,
  MenuItem,
} from '../../../../../src/components/menu';
import {
  Select,
  SelectTrigger,
  SelectValue,
} from '../../../../../src/components/select';
import { Toggle } from '../../../../../src/components/toggle';
import { mount } from '../../_mount';

interface NativeControlReport {
  nativeControl: string | null;
  style: string | null;
}

export function nativeFallbacks(root: HTMLElement) {
  const container = mount(
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
    </div>,
    root
  );

  return {
    /**
     * One entry per `data-testid`, keyed so a failing control names itself the
     * way the vitest original's `expect(actual, testId)` message did.
     */
    controls: (): Record<string, NativeControlReport> => {
      const report: Record<string, NativeControlReport> = {};
      for (const testId of [
        'button',
        'menu-item',
        'select-trigger',
        'toggle',
      ]) {
        const control = container.querySelector<HTMLElement>(
          `[data-testid="${testId}"]`
        )!;
        report[testId] = {
          nativeControl: control.dataset.askrNativeControl ?? null,
          style: control.getAttribute('style'),
        };
      }
      return report;
    },
  };
}

export function fontOverrides(root: HTMLElement) {
  const container = mount(
    <div>
      <Button data-testid="override" style={{ fontSize: '21px' }}>
        Override
      </Button>
      <Button asChild>
        <a data-testid="as-child" href="/docs" style={{ fontSize: '19px' }}>
          Docs
        </a>
      </Button>
    </div>,
    root
  );

  return {
    typography: () => {
      const override = container.querySelector<HTMLElement>(
        '[data-testid="override"]'
      )!;
      const asChild = container.querySelector<HTMLElement>(
        '[data-testid="as-child"]'
      )!;
      return {
        overrideFontSize: getComputedStyle(override).fontSize,
        asChildFontSize: getComputedStyle(asChild).fontSize,
        asChildFontShorthand: asChild.style.font,
      };
    },
  };
}
