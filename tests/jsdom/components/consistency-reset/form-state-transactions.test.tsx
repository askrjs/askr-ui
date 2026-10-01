import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { flush, mount, type RenderResult } from '@askrjs/askr/testing';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../src/components/radio-group';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../../../src/components/slider';
import {
  Progress,
  ProgressIndicator,
} from '../../../../src/components/progress';
import {
  ProgressCircle,
  ProgressCircleIndicator,
} from '../../../../src/components/progress-circle';
import { Checkbox } from '../../../../src/components/checkbox';
import { Switch } from '../../../../src/components/switch';

const views: RenderResult[] = [];
function render(component: () => unknown) {
  const view = mount(() => <>{component()}</>);
  views.push(view);
  return view;
}
async function settle() {
  for (let i = 0; i < 6; i += 1) {
    await Promise.resolve();
    flush();
  }
}
function rejectInsertion(container: HTMLElement, update: () => void) {
  const failure = new Error('forced structural commit failure');
  const insertion = vi
    .spyOn(container, 'insertBefore')
    .mockImplementation(() => {
      throw failure;
    });
  try {
    update();
    expect(() => flush()).toThrow(failure);
  } finally {
    insertion.mockRestore();
  }
}
function pointer(target: EventTarget, type: string, clientX: number) {
  target.dispatchEvent(
    new MouseEvent(type, {
      clientX,
      clientY: 5,
      bubbles: true,
      cancelable: true,
    })
  );
}
afterEach(async () => {
  for (const view of views.splice(0)) view.unmount();
  await settle();
  vi.restoreAllMocks();
});

describe('form primitives committed state', () => {
  it('should select an empty string radio value when arrow navigation reaches it', async () => {
    const changes: string[] = [];
    const view = render(() => (
      <RadioGroup
        name="choice"
        defaultValue="a"
        onValueChange={(value) => changes.push(value)}
      >
        <RadioGroupItem value="a">A</RadioGroupItem>
        <RadioGroupItem value="">Empty</RadioGroupItem>
      </RadioGroup>
    ));
    await settle();
    const first =
      view.container.querySelectorAll<HTMLButtonElement>('[role="radio"]')[0]!;
    first.focus();
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      })
    );
    await settle();
    const radios = view.container.querySelectorAll('[role="radio"]');
    expect(document.activeElement).toBe(radios[1]);
    expect(changes).toEqual(['']);
    expect(
      Array.from(radios, (radio) => radio.getAttribute('aria-checked'))
    ).toEqual(['false', 'true']);
    expect(
      view.container.querySelector<HTMLInputElement>('input[name="choice"]')!
        .value
    ).toBe('');
  });

  it('should suppress value changes when a slider becomes disabled during a drag', async () => {
    let disabled!: ReturnType<typeof state<boolean>>;
    const changes: number[] = [];
    const view = render(() => {
      disabled = state(false);
      return (
        <Slider
          disabled={disabled()}
          defaultValue={20}
          onValueChange={(value) => changes.push(value)}
        >
          <SliderTrack>
            <SliderRange />
            <SliderThumb aria-label="Value" />
          </SliderTrack>
        </Slider>
      );
    });
    await settle();
    const track = () =>
      view.container.querySelector<HTMLElement>('[data-slider-track]')!;
    const rectangle = {
      left: 0,
      right: 100,
      top: 0,
      bottom: 10,
      width: 100,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
    vi.spyOn(track(), 'getBoundingClientRect').mockReturnValue(rectangle);
    pointer(track(), 'pointerdown', 20);
    await settle();
    disabled.set(true);
    await settle();
    vi.spyOn(track(), 'getBoundingClientRect').mockReturnValue(rectangle);
    pointer(window, 'pointermove', 80);
    await settle();
    expect(changes).toEqual([]);
    expect(
      view.container
        .querySelector('[role="slider"]')!
        .getAttribute('aria-valuenow')
    ).toBe('20');
    expect(
      view.container
        .querySelector('[role="slider"]')!
        .getAttribute('aria-disabled')
    ).toBe('true');
    pointer(window, 'pointerup', 80);
  });

  it('should end a slider drag when its pointer sequence is cancelled', async () => {
    const changes: number[] = [];
    const view = render(() => (
      <Slider defaultValue={20} onValueChange={(value) => changes.push(value)}>
        <SliderTrack>
          <SliderThumb aria-label="Value" />
        </SliderTrack>
      </Slider>
    ));
    await settle();
    const track = view.container.querySelector<HTMLElement>(
      '[data-slider-track]'
    )!;
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
    pointer(track, 'pointerdown', 20);
    pointer(window, 'pointercancel', 20);
    pointer(window, 'pointermove', 80);
    await settle();
    expect(changes).toEqual([]);
    expect(
      view.container
        .querySelector('[role="slider"]')!
        .getAttribute('aria-valuenow')
    ).toBe('20');
    pointer(track, 'pointerdown', 60);
    await settle();
    expect(changes).toEqual([60]);
    pointer(window, 'pointerup', 60);
  });

  it('should retain committed slider keyboard inputs after a structural commit failure', async () => {
    let rejected!: ReturnType<typeof state<boolean>>;
    const changes: string[] = [];
    const view = render(() => {
      rejected = state(false);
      const isRejected = rejected();
      return [
        <Slider
          disabled={isRejected}
          defaultValue={20}
          onValueChange={(value) =>
            changes.push(`${isRejected ? 'discarded' : 'committed'}:${value}`)
          }
        >
          <SliderTrack>
            <SliderThumb aria-label="Value" />
          </SliderTrack>
        </Slider>,
        isRejected ? <i>Insert failure</i> : null,
      ];
    });
    await settle();
    const before = view.container.innerHTML;
    rejectInsertion(view.container, () => rejected.set(true));
    expect(view.container.innerHTML).toBe(before);
    // Keep the state update rejected during the interaction as well.
    const insertion = vi
      .spyOn(view.container, 'insertBefore')
      .mockImplementation(() => {
        throw new Error('forced structural commit failure');
      });
    const thumb = view.container.querySelector<HTMLElement>('[role="slider"]')!;
    thumb.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      })
    );
    insertion.mockRestore();
    expect(changes).toEqual(['committed:21']);
    rejected.set(false);
    await settle();
    expect(
      view.container
        .querySelector('[role="slider"]')!
        .getAttribute('aria-valuenow')
    ).toBe('21');
  });

  it.each([
    ['linear', Progress, ProgressIndicator],
    ['circular', ProgressCircle, ProgressCircleIndicator],
  ] as const)(
    'should retain committed %s progress CSS after a structural commit failure',
    async (_name, Root, Indicator) => {
      let rejected!: ReturnType<typeof state<boolean>>;
      const view = render(() => {
        rejected = state(false);
        const isRejected = rejected();
        return [
          <Root id="transaction-progress" value={isRejected ? 80 : 20}>
            <Indicator />
          </Root>,
          isRejected ? <i>Insert failure</i> : null,
        ];
      });
      await settle();
      const beforeHTML = view.container.innerHTML;
      const beforeCSS = document.head.textContent;
      rejectInsertion(view.container, () => rejected.set(true));
      expect(view.container.innerHTML).toBe(beforeHTML);
      expect(document.head.textContent).toBe(beforeCSS);
      rejected.set(false);
      await settle();
      rejected.set(true);
      await settle();
      expect(
        view.container
          .querySelector('[role="progressbar"]')!
          .getAttribute('aria-valuenow')
      ).toBe('80');
      expect(document.head.textContent).toContain(
        '--ak-progress-percentage: 80%'
      );
    }
  );

  it('should replace progress CSS identities and clean their committed rules on unmount', async () => {
    let id!: ReturnType<typeof state<string>>;
    const view = render(() => {
      id = state('old-identity');
      return (
        <Progress id={id()} value={25}>
          <ProgressIndicator />
        </Progress>
      );
    });
    await settle();
    expect(document.head.textContent).toContain('progress-old-identity');
    id.set('new-identity');
    await settle();
    expect(document.head.textContent).not.toContain('progress-old-identity');
    expect(document.head.textContent).toContain('progress-new-identity');
    view.unmount();
    views.splice(views.indexOf(view), 1);
    await settle();
    expect(document.head.textContent).not.toContain('progress-new-identity');
  });

  it('should reset an externally associated uncontrolled native checkbox', async () => {
    const changes: boolean[] = [];
    const view = render(() => (
      <div>
        <form id="external-checkbox-form" />
        <Checkbox
          attr:form="external-checkbox-form"
          defaultChecked={false}
          onCheckedChange={(value) => changes.push(value)}
        />
      </div>
    ));
    await settle();
    const checkbox = view.container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]'
    )!;
    checkbox.click();
    await settle();
    expect(checkbox.checked).toBe(true);
    expect(checkbox.form).toBe(view.container.querySelector('form'));
    view.container.querySelector<HTMLFormElement>('form')!.reset();
    await settle();
    expect(changes).toEqual([true, false]);
    expect(checkbox.checked).toBe(false);
    expect(checkbox.getAttribute('data-state')).toBe('unchecked');
  });

  it('should ignore an ancestor form reset when a native checkbox belongs to another form', async () => {
    const changes: boolean[] = [];
    const view = render(() => (
      <div>
        <form id="owner-checkbox-form" />
        <form id="ancestor-checkbox-form">
          <Checkbox
            attr:form="owner-checkbox-form"
            onCheckedChange={(value) => changes.push(value)}
          />
        </form>
      </div>
    ));
    await settle();
    const checkbox = view.container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]'
    )!;
    checkbox.click();
    await settle();
    view.container
      .querySelector<HTMLFormElement>('#ancestor-checkbox-form')!
      .reset();
    await settle();
    expect(changes).toEqual([true]);
    expect(checkbox.checked).toBe(true);
    view.container
      .querySelector<HTMLFormElement>('#owner-checkbox-form')!
      .reset();
    await settle();
    expect(changes).toEqual([true, false]);
    expect(checkbox.checked).toBe(false);
  });

  it('should reset an uncontrolled switch to its committed default after a structural commit failure', async () => {
    let rejected!: ReturnType<typeof state<boolean>>;
    const changes: string[] = [];
    const view = render(() => {
      rejected = state(false);
      const isRejected = rejected();
      return [
        <form>
          <Switch
            defaultChecked={isRejected}
            onCheckedChange={(value) =>
              changes.push(`${isRejected ? 'discarded' : 'committed'}:${value}`)
            }
          >
            Switch
          </Switch>
        </form>,
        isRejected ? <i>Insert failure</i> : null,
      ];
    });
    await settle();
    view.container.querySelector<HTMLButtonElement>('[role="switch"]')!.click();
    await settle();
    expect(
      view.container
        .querySelector('[role="switch"]')!
        .getAttribute('aria-checked')
    ).toBe('true');
    rejectInsertion(view.container, () => rejected.set(true));
    view.container.querySelector<HTMLFormElement>('form')!.reset();
    await Promise.resolve();
    expect(changes).toEqual(['committed:true', 'committed:false']);
    rejected.set(false);
    await settle();
    expect(
      view.container
        .querySelector('[role="switch"]')!
        .getAttribute('aria-checked')
    ).toBe('false');
  });
});
