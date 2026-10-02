import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { flush, mount, type RenderResult } from '@askrjs/askr/testing';
import {
  Select,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '../../../../src/components/select';

const views: RenderResult[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const view of views.splice(0)) view.unmount();
});
function render(component: Parameters<typeof mount>[0]) {
  const view = mount(component);
  views.push(view);
  return view;
}
async function settle() {
  for (let index = 0; index < 4; index += 1) {
    await Promise.resolve();
    flush();
  }
}
function WrappedLabel() {
  return <SelectLabel>Frameworks</SelectLabel>;
}

describe('Select committed group label association', () => {
  it('should retain the committed caller label id after a rejected update', async () => {
    let changed!: ReturnType<typeof state<boolean>>;
    const view = render(() => {
      changed = state(false);
      return (
        <Select>
          <SelectGroup>
            <SelectLabel
              id={changed() ? 'discarded-frameworks' : 'committed-frameworks'}
            >
              Frameworks
            </SelectLabel>
            <div data-testid="custom-id-host">
              {changed() ? <span>New child</span> : null}
            </div>
          </SelectGroup>
        </Select>
      );
    });
    await settle();
    const group = view.container.querySelector('[role="group"]')!;
    const host = view.container.querySelector(
      '[data-testid="custom-id-host"]'
    )!;
    const failure = new Error('forced custom id structural commit failure');
    const insertion = vi.spyOn(host, 'insertBefore').mockImplementation(() => {
      throw failure;
    });
    changed.set(true);
    expect(() => flush()).toThrow(failure);
    insertion.mockRestore();
    await Promise.resolve();
    expect(group.getAttribute('aria-labelledby')).toBe('committed-frameworks');
    expect(group.querySelector('[data-select-label]')?.id).toBe(
      'committed-frameworks'
    );
    changed.set(false);
    await settle();
    changed.set(true);
    await settle();
    expect(group.getAttribute('aria-labelledby')).toBe('discarded-frameworks');
  });

  it('should follow the actual caller label id through committed updates and removal', async () => {
    let labelId!: ReturnType<typeof state<string>>;
    let shown!: ReturnType<typeof state<boolean>>;
    function CallerLabel() {
      labelId = state('caller-frameworks');
      shown = state(true);
      return shown() ? (
        <SelectLabel id={labelId()}>Frameworks</SelectLabel>
      ) : null;
    }
    const view = render(() => (
      <Select>
        <SelectGroup>
          <CallerLabel />
        </SelectGroup>
      </Select>
    ));
    await settle();
    const group = view.container.querySelector('[role="group"]')!;
    expect(group.getAttribute('aria-labelledby')).toBe('caller-frameworks');
    labelId.set('updated-frameworks');
    await settle();
    expect(group.getAttribute('aria-labelledby')).toBe('updated-frameworks');
    shown.set(false);
    await settle();
    expect(group.hasAttribute('aria-labelledby')).toBe(false);
    shown.set(true);
    await settle();
    expect(group.getAttribute('aria-labelledby')).toBe('updated-frameworks');
  });

  it('should preserve native and asChild caller refs while associating wrapped labels', async () => {
    const groupRef = { current: null as HTMLDivElement | null };
    const labelRef = { current: null as HTMLElement | null };
    function AsChildLabel() {
      return (
        <SelectLabel asChild ref={labelRef}>
          <strong>Frameworks</strong>
        </SelectLabel>
      );
    }
    const view = render(() => (
      <Select>
        <SelectGroup ref={groupRef}>
          <AsChildLabel />
          <SelectItem value="askr">Askr</SelectItem>
        </SelectGroup>
      </Select>
    ));
    await settle();
    expect(groupRef.current).toBe(
      view.container.querySelector('[role="group"]')
    );
    expect(labelRef.current?.tagName).toBe('STRONG');
    expect(groupRef.current?.getAttribute('aria-labelledby')).toBe(
      labelRef.current?.id
    );
    view.unmount();
    views.splice(views.indexOf(view), 1);
    expect(groupRef.current).toBeNull();
    expect(labelRef.current).toBeNull();
  });

  it('should restore an unlabelled group after a rejected structural update', async () => {
    let shown!: ReturnType<typeof state<boolean>>;
    const view = render(() => {
      shown = state(false);
      return (
        <Select>
          <SelectGroup>
            {shown() ? <WrappedLabel /> : null}
            <div data-testid="host">
              {shown() ? <span>New child</span> : null}
            </div>
          </SelectGroup>
        </Select>
      );
    });
    await settle();
    const group = view.container.querySelector('[role="group"]')!;
    const host = view.container.querySelector('[data-testid="host"]')!;
    const failure = new Error('forced label structural commit failure');
    const insertion = vi.spyOn(host, 'insertBefore').mockImplementation(() => {
      throw failure;
    });
    shown.set(true);
    expect(() => flush()).toThrow(failure);
    insertion.mockRestore();
    expect(group.hasAttribute('aria-labelledby')).toBe(false);
    expect(group.querySelector('[data-select-label]')).toBeNull();
    shown.set(false);
    flush();
    shown.set(true);
    await settle();
    expect(group.getAttribute('aria-labelledby')).toBe(
      group.querySelector('[data-select-label]')?.id
    );
  });

  it('should associate each nested group with only its own label', async () => {
    const view = render(() => (
      <Select>
        <SelectGroup>
          <SelectGroup>
            <WrappedLabel />
          </SelectGroup>
        </SelectGroup>
      </Select>
    ));
    await settle();
    const groups = view.container.querySelectorAll('[role="group"]');
    expect(groups[0]?.hasAttribute('aria-labelledby')).toBe(false);
    expect(groups[1]?.getAttribute('aria-labelledby')).toBe(
      groups[1]?.querySelector('[data-select-label]')?.id
    );
  });
});
