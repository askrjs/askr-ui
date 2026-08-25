import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { Menu, MenuContent, MenuItem } from '../../../../src/components/menu';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from '../../../../src/components/menubar';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../src/components/radio-group';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../src/components/toggle-group';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('RTL composite navigation', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should reverse horizontal roving focus for every composite consumer', async () => {
    container = mount(
      <div dir="rtl">
        <ToggleGroup orientation="horizontal" loop>
          <ToggleGroupItem value="toggle-a">Toggle A</ToggleGroupItem>
          <ToggleGroupItem value="toggle-b">Toggle B</ToggleGroupItem>
          <ToggleGroupItem value="toggle-c">Toggle C</ToggleGroupItem>
        </ToggleGroup>
        <RadioGroup orientation="horizontal" loop defaultValue="radio-a">
          <RadioGroupItem value="radio-a">Radio A</RadioGroupItem>
          <RadioGroupItem value="radio-b">Radio B</RadioGroupItem>
          <RadioGroupItem value="radio-c">Radio C</RadioGroupItem>
        </RadioGroup>
        <Menu orientation="horizontal" loop>
          <MenuContent>
            <MenuItem>Menu A</MenuItem>
            <MenuItem>Menu B</MenuItem>
            <MenuItem>Menu C</MenuItem>
          </MenuContent>
        </Menu>
        <Menubar loop>
          <MenubarMenu value="menubar-a">
            <MenubarTrigger>Menubar A</MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu value="menubar-b">
            <MenubarTrigger>Menubar B</MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu value="menubar-c">
            <MenubarTrigger>Menubar C</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      </div>
    );
    await flushUpdates();
    await flushUpdates();

    for (const [first, expected] of [
      ['Toggle A', 'Toggle C'],
      ['Radio A', 'Radio C'],
      ['Menu A', 'Menu C'],
      ['Menubar A', 'Menubar C'],
    ] as const) {
      const target = Array.from(
        container.querySelectorAll<HTMLElement>('*')
      ).find(
        (node) => node.textContent?.trim() === first && node.tabIndex >= 0
      );
      target?.focus();
      await userEvent.keyboard('{ArrowRight}');
      await flushUpdates();
      expect(document.activeElement?.textContent?.trim()).toBe(expected);
    }
  });
});
