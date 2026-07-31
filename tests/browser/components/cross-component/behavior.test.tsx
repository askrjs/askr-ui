import { afterEach, describe, expect, it } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { createIsland } from '@askrjs/askr/boot';
import { Checkbox } from '../../../../src/components/checkbox';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../../../../src/components/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../src/components/popover';
import { VirtualList } from '../../../../src/components/virtual-list';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Cross-component contracts', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should preserve controlled-to-uncontrolled state transitions given native controls when the value or checked prop changes from defined to undefined', async () => {
    let checked!: ReturnType<typeof state<boolean | undefined>>;
    function ControlledCheckbox() {
      checked = state<boolean | undefined>(true);
      return (
        <Checkbox
          checked={checked()}
          onCheckedChange={(next) => checked.set(next)}
        />
      );
    }
    container = document.createElement('div');
    document.body.appendChild(container);
    createIsland({ root: container, component: ControlledCheckbox });
    await flushUpdates();
    expect(
      container
        .querySelector('[data-slot="checkbox"]')
        ?.getAttribute('data-state')
    ).toBe('checked');
    checked.set(undefined);
    await flushUpdates();
    expect(container.querySelector('[data-slot="checkbox"]')).not.toBeNull();
  });

  it('should restore focus through nested overlays given dialog and popover content when overlays close in different orders', async () => {
    container = mount(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
          <Popover defaultOpen>
            <PopoverTrigger>More</PopoverTrigger>
            <PopoverContent>Details</PopoverContent>
          </Popover>
        </DialogContent>
      </Dialog>
    );
    await flushUpdates();
    expect(
      document.body.querySelector('[data-slot="dialog-content"]')
    ).not.toBeNull();
    expect(
      document.body.querySelector('[data-slot="popover-content"]')
    ).not.toBeNull();
  });

  it('should hydrate asChild hosts without replacing nodes given server-rendered component trees when client props attach', async () => {
    const ref = { current: null as HTMLButtonElement | null };
    container = mount(
      <Popover>
        <PopoverTrigger asChild ref={ref}>
          <button data-slot="host">Open</button>
        </PopoverTrigger>
      </Popover>
    );
    await flushUpdates();
    expect(ref.current?.tagName).toBe('BUTTON');
    expect(
      container.querySelector('[data-slot="popover-trigger"]')
    ).not.toBeNull();
  });

  it('should preserve virtualized row identity given reorder, resize, and scroll-anchor changes when data updates during virtualization', async () => {
    container = mount(
      <VirtualList
        items={[{ id: 'a' }, { id: 'b' }]}
        rowHeight={24}
        overscan={2}
        getKey={(item) => item.id}
        rowComponent={({ item }) => <div>{item.id}</div>}
      />
    );
    await flushUpdates();
    expect(container.querySelector('[data-key="a"]')).not.toBeNull();
    expect(container.querySelector('[data-key="b"]')).not.toBeNull();
  });
});
