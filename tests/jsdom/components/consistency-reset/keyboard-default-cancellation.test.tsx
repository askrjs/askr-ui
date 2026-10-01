import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { flush, mount, type RenderResult } from '@askrjs/askr/testing';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../src/components/radio-group';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../src/components/toggle-group';
import {
  Slider,
  SliderThumb,
  SliderTrack,
} from '../../../../src/components/slider';
import { mergeComponentProps } from '../../../../src/components/_internal/component-props';

const views: RenderResult[] = [];
async function settle() {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
    flush();
  }
}
afterEach(async () => {
  for (const view of views.splice(0)) view.unmount();
  await settle();
});

describe('ancestor cancellation of keyboard defaults', () => {
  it('should preserve caller attributes and absent values while composing handlers before defaults', () => {
    const calls: string[] = [];
    const behavior = vi.fn(() => calls.push('default'));
    const merged = mergeComponentProps(
      {
        id: 'caller',
        title: undefined,
        onKeyDown: (event: KeyboardEvent) => {
          calls.push('caller');
          event.preventDefault();
        },
      },
      { id: 'generated', title: 'fallback', role: 'group', onKeyDown: behavior }
    );
    expect(merged.id).toBe('caller');
    expect(merged.title).toBe('fallback');
    expect(merged.role).toBe('group');
    merged.onKeyDown(
      new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true })
    );
    expect(calls).toEqual(['caller']);
    expect(behavior).not.toHaveBeenCalled();
  });

  for (const source of ['none', 'ancestor', 'caller']) {
    it.each(['track', 'thumb'] as const)(
      'should preserve slider %s pointer defaults with cancellation from ' +
        source,
      async (part) => {
        const onPointerDown =
          source === 'caller'
            ? (event: PointerEvent) => event.preventDefault()
            : undefined;
        const view = mount(() => (
          <Slider defaultValue={20}>
            <SliderTrack
              onPointerDown={part === 'track' ? onPointerDown : undefined}
            >
              <SliderThumb
                onPointerDown={part === 'thumb' ? onPointerDown : undefined}
                aria-label="Value"
              />
            </SliderTrack>
          </Slider>
        ));
        views.push(view);
        await settle();
        const track = view.container.querySelector<HTMLElement>(
          '[data-slider-track]'
        )!;
        const thumb =
          view.container.querySelector<HTMLElement>('[role="slider"]')!;
        vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
          left: 0,
          right: 100,
          top: 0,
          bottom: 10,
          width: 100,
          height: 10,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });
        if (source === 'ancestor')
          view.container.addEventListener(
            'pointerdown',
            (event) => event.preventDefault(),
            { capture: true }
          );
        (part === 'track' ? track : thumb).dispatchEvent(
          new MouseEvent('pointerdown', {
            clientX: 80,
            clientY: 5,
            bubbles: true,
            cancelable: true,
          })
        );
        window.dispatchEvent(
          new MouseEvent('pointermove', {
            clientX: 80,
            clientY: 5,
            bubbles: true,
          })
        );
        await settle();
        expect(thumb.getAttribute('aria-valuenow')).toBe(
          source === 'none' ? '80' : '20'
        );
        window.dispatchEvent(new MouseEvent('pointerup'));
      }
    );
  }

  for (const source of ['none', 'ancestor', 'caller']) {
    const cancel = source !== 'none';
    it.each(['radio', 'toggle', 'slider'] as const)(
      'should preserve %s defaults with cancellation from ' + source,
      async (family) => {
        const changes: unknown[] = [];
        const onKeyDown =
          source === 'caller'
            ? (event: KeyboardEvent) => event.preventDefault()
            : undefined;
        const view = mount(() =>
          family === 'radio' ? (
            <RadioGroup
              onKeyDown={onKeyDown}
              defaultValue="a"
              onValueChange={(value) => changes.push(value)}
            >
              <RadioGroupItem value="a">A</RadioGroupItem>
              <RadioGroupItem value="b">B</RadioGroupItem>
            </RadioGroup>
          ) : family === 'toggle' ? (
            <ToggleGroup
              onKeyDown={onKeyDown}
              type="single"
              defaultValue="a"
              onValueChange={(value) => changes.push(value)}
            >
              <ToggleGroupItem value="a">A</ToggleGroupItem>
              <ToggleGroupItem value="b">B</ToggleGroupItem>
            </ToggleGroup>
          ) : (
            <Slider
              defaultValue={20}
              onValueChange={(value) => changes.push(value)}
            >
              <SliderTrack>
                <SliderThumb onKeyDown={onKeyDown} aria-label="Value" />
              </SliderTrack>
            </Slider>
          )
        );
        views.push(view);
        await settle();
        const selector =
          family === 'radio'
            ? '[role="radio"]'
            : family === 'toggle'
              ? '[data-slot="toggle-group-item"]'
              : '[role="slider"]';
        const items = view.container.querySelectorAll<HTMLElement>(selector);
        const first = items[0]!;
        first.focus();
        if (source === 'ancestor')
          view.container.addEventListener(
            'keydown',
            (event) => event.preventDefault(),
            { capture: true }
          );
        first.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: family === 'radio' ? 'ArrowDown' : 'ArrowRight',
            bubbles: true,
            cancelable: true,
          })
        );
        await settle();
        if (family === 'slider') {
          expect(first.getAttribute('aria-valuenow')).toBe(
            cancel ? '20' : '21'
          );
        } else {
          expect(document.activeElement).toBe(items[cancel ? 0 : 1]);
        }
        if (cancel || family === 'toggle') expect(changes).toEqual([]);
        else expect(changes).toEqual(family === 'radio' ? ['b'] : [21]);
      }
    );
  }
});
