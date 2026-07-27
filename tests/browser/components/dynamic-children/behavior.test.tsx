import { For, state } from '@askrjs/askr';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../../src/components/accordion';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '../../../../src/components/dropdown';
import { Menu, MenuContent, MenuItem } from '../../../../src/components/menu';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../../../src/components/menubar';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../src/components/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../src/components/select';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../../../src/components/slider';
import { flushUpdates, mount, unmount } from '../../test-utils';

const ITEMS = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
] as const;

type DynamicMode = 'map' | 'for';

function DynamicItems<T>(props: {
  mode: DynamicMode;
  each: readonly T[];
  by: (item: T, index: number) => string | number;
  children: (item: T) => JSX.Element;
}) {
  return props.mode === 'map' ? (
    props.each.map(props.children)
  ) : (
    <For each={props.each} by={props.by}>
      {props.children}
    </For>
  );
}

function modes() {
  return ['map', 'for'] as const;
}

describe('dynamic children context contract', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should support mapped and For-rendered Accordion items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Accordion key={mode} defaultValue="one">
            <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
              {(item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionHeader>
                    <AccordionTrigger>
                      {item.label} {mode}
                    </AccordionTrigger>
                  </AccordionHeader>
                  <AccordionContent>{item.label} content</AccordionContent>
                </AccordionItem>
              )}
            </DynamicItems>
          </Accordion>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const trigger = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === `Two ${mode}`
      );
      trigger?.click();
    }
    await flushUpdates();

    for (const mode of modes()) {
      const trigger = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === `Two ${mode}`
      );
      expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    }
  });

  it('should support mapped and For-rendered RadioGroup items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <RadioGroup key={mode} defaultValue="one">
            <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
              {(item) => (
                <RadioGroupItem key={item.value} value={item.value}>
                  {item.label} {mode}
                </RadioGroupItem>
              )}
            </DynamicItems>
          </RadioGroup>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const item = Array.from(
        container.querySelectorAll('[role="radio"]')
      ).find((radio) => radio.textContent?.trim() === `Two ${mode}`);
      (item as HTMLElement | undefined)?.click();
    }
    await flushUpdates();

    for (const mode of modes()) {
      const item = Array.from(
        container.querySelectorAll('[role="radio"]')
      ).find((radio) => radio.textContent?.trim() === `Two ${mode}`);
      expect(item?.getAttribute('aria-checked')).toBe('true');
    }
  });

  it('should support mapped and For-rendered Menu items', () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Menu key={mode}>
            <MenuContent>
              <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
                {(item) => (
                  <MenuItem key={item.value}>
                    {item.label} {mode}
                  </MenuItem>
                )}
              </DynamicItems>
            </MenuContent>
          </Menu>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const items = Array.from(
        container.querySelectorAll('[role="menuitem"]')
      ).filter((item) => item.textContent?.endsWith(mode));
      expect(items).toHaveLength(2);
      expect(items.map((item) => item.getAttribute('tabindex'))).toEqual([
        '0',
        '-1',
      ]);
    }
  });

  it('should support mapped and For-rendered Dropdown items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Dropdown key={mode} defaultOpen>
            <DropdownTrigger>Open {mode}</DropdownTrigger>
            <DropdownContent forceMount>
              <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
                {(item) => (
                  <DropdownItem key={item.value}>
                    {item.label} {mode}
                  </DropdownItem>
                )}
              </DynamicItems>
            </DropdownContent>
          </Dropdown>
        ))}
      </div>
    );
    await flushUpdates();

    for (const mode of modes()) {
      const items = Array.from(
        container.querySelectorAll('[role="menuitem"]')
      ).filter((item) => item.textContent?.endsWith(mode));
      expect(items).toHaveLength(2);
      expect(items.map((item) => item.getAttribute('tabindex'))).toEqual([
        '0',
        '-1',
      ]);
    }
  });

  it('should support mapped and For-rendered Select items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Select key={mode} defaultValue="one" name={mode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent forceMount>
              <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
                {(item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    textValue={`${item.label} ${mode}`}
                  >
                    {item.label} {mode}
                  </SelectItem>
                )}
              </DynamicItems>
            </SelectContent>
          </Select>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const item = Array.from(
        container.querySelectorAll('[role="option"]')
      ).find((option) => option.textContent?.trim() === `Two ${mode}`);
      (item as HTMLElement | undefined)?.click();
    }
    await flushUpdates();

    for (const mode of modes()) {
      const input = container.querySelector(
        `input[name="${mode}"]`
      ) as HTMLInputElement;
      expect(input.value).toBe('two');
    }
  });

  it('should support mapped and For-rendered Menubar menus and items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Menubar key={mode}>
            <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
              {(menu) => (
                <MenubarMenu key={menu.value} value={menu.value}>
                  <MenubarTrigger>
                    {menu.label} {mode}
                  </MenubarTrigger>
                  <MenubarPortal>
                    <MenubarContent forceMount>
                      <DynamicItems
                        mode={mode}
                        each={ITEMS}
                        by={(item) => item.value}
                      >
                        {(item) => (
                          <MenubarItem key={item.value}>
                            {menu.label} {item.label} action {mode}
                          </MenubarItem>
                        )}
                      </DynamicItems>
                    </MenubarContent>
                  </MenubarPortal>
                </MenubarMenu>
              )}
            </DynamicItems>
          </Menubar>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const trigger = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === `Two ${mode}`
      );
      trigger?.click();
    }
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    for (const mode of modes()) {
      const triggers = Array.from(
        container.querySelectorAll('[role="menuitem"]')
      ).filter(
        (item) =>
          item.textContent?.endsWith(mode) &&
          !item.textContent.includes('action')
      );
      const actions = Array.from(
        document.body.querySelectorAll('[role="menuitem"]')
      ).filter(
        (item) =>
          item.textContent?.startsWith('Two ') &&
          item.textContent.endsWith(`action ${mode}`)
      );
      expect(triggers).toHaveLength(2);
      expect(actions).toHaveLength(2);
      expect(
        document.body.textContent?.includes(`One One action ${mode}`)
      ).toBe(false);
    }
  });

  it('should keep dynamic Menubar identities stable across reorder and removal', async () => {
    const initialMenus = [
      { value: 'alpha', label: 'Alpha' },
      { value: 'beta', label: 'Beta' },
    ];
    let setMenus:
      | ((next: Array<{ value: string; label: string }>) => void)
      | undefined;

    function DynamicMenubar() {
      const menus = state(initialMenus);
      setMenus = menus.set;

      return (
        <Menubar>
          {menus().map((menu) => (
            <MenubarMenu key={menu.value} value={menu.value}>
              <MenubarTrigger>{menu.label}</MenubarTrigger>
              <MenubarPortal>
                <MenubarContent>
                  <MenubarItem>{menu.label} action</MenubarItem>
                </MenubarContent>
              </MenubarPortal>
            </MenubarMenu>
          ))}
        </Menubar>
      );
    }

    container = mount(<DynamicMenubar />);
    await flushUpdates();

    const getTrigger = (label: string) =>
      Array.from(container?.querySelectorAll('button') ?? []).find(
        (button) => button.textContent?.trim() === label
      ) as HTMLButtonElement;
    const initialControls = {
      alpha: getTrigger('Alpha').getAttribute('aria-controls'),
      beta: getTrigger('Beta').getAttribute('aria-controls'),
    };

    expect(initialControls.alpha).not.toBe(initialControls.beta);

    getTrigger('Beta').click();
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    expect(document.body.textContent).toContain('Beta action');
    expect(document.body.textContent).not.toContain('Alpha action');

    setMenus?.([initialMenus[1]!, initialMenus[0]!]);
    await flushUpdates();
    await flushUpdates();

    expect(getTrigger('Alpha').getAttribute('aria-controls')).toBe(
      initialControls.alpha
    );
    expect(getTrigger('Beta').getAttribute('aria-controls')).toBe(
      initialControls.beta
    );
    expect(document.body.textContent).toContain('Beta action');

    setMenus?.([initialMenus[0]!]);
    await flushUpdates();
    await flushUpdates();

    expect(getTrigger('Alpha').getAttribute('aria-controls')).toBe(
      initialControls.alpha
    );
    expect(document.body.textContent).not.toContain('Beta action');

    setMenus?.(initialMenus);
    await flushUpdates();
    await flushUpdates();

    expect(getTrigger('Alpha').getAttribute('aria-controls')).toBe(
      initialControls.alpha
    );
    expect(getTrigger('Beta').getAttribute('aria-controls')).toBe(
      initialControls.beta
    );
  });

  it('should reject duplicate dynamic Menubar values', () => {
    expect(() => {
      container = mount(
        <Menubar>
          {['First', 'Second'].map((label) => (
            <MenubarMenu key={label} value="duplicate">
              <MenubarTrigger>{label}</MenubarTrigger>
            </MenubarMenu>
          ))}
        </Menubar>
      );
    }).toThrow(/MenubarMenu values must be unique/);
  });

  it('should support mapped and For-rendered Slider parts', () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Slider key={mode} defaultValue={25}>
            <DynamicItems mode={mode} each={['track']} by={(part) => part}>
              {() => (
                <SliderTrack key="track">
                  <SliderRange />
                  <SliderThumb aria-label={`${mode} value`} />
                </SliderTrack>
              )}
            </DynamicItems>
          </Slider>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const thumb = container.querySelector(`[aria-label="${mode} value"]`);
      expect(thumb?.getAttribute('aria-valuenow')).toBe('25');
    }
  });
});
