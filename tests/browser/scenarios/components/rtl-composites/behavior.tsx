import {
  Menu,
  MenuContent,
  MenuItem,
} from '../../../../../src/components/menu';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from '../../../../../src/components/menubar';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../../src/components/radio-group';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../../src/components/toggle-group';
import { flushUpdates, mount } from '../../_mount';

export async function horizontalRovingFocus(root: HTMLElement) {
  const container = mount(
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
    </div>,
    root
  );

  await flushUpdates();
  await flushUpdates();

  return {
    /** Focuses the first focusable node whose trimmed text matches `text`. */
    focusByText: (text: string) => {
      const target = Array.from(
        container.querySelectorAll<HTMLElement>('*')
      ).find((node) => node.textContent?.trim() === text && node.tabIndex >= 0);
      target?.focus();
    },
    flush: async () => {
      await flushUpdates();
    },
    activeText: () => document.activeElement?.textContent?.trim() ?? null,
  };
}
