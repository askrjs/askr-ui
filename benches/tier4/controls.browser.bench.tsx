import { state } from '@askrjs/askr';
import { For } from '@askrjs/askr/control';
import { bench, describe } from 'vite-plus/test';
import {
  Button,
  Checkbox,
  Input,
  Switch,
  Textarea,
  Toggle,
} from '../../src/components';
import {
  flushBrowserBenchUpdates,
  createTier4BenchOptions,
  runBrowserBench,
} from './browser-bench';

const benchCount = 1000;
const indices = Array.from({ length: benchCount }, (_, index) => index);
const ignoreEvent = () => {};
const tier4BenchOptions = createTier4BenchOptions();
// These control cases need a wider sampling window to smooth out host-merging
// and dispatch noise without changing the benchmark semantics.
const noisyControlBenchOptions = createTier4BenchOptions({
  time: 3000,
  warmupTime: 750,
  warmupIterations: 30,
});
// Checkbox and toggle interaction paths still show long-tail variance, so
// they get a longer sampling window than the other short control benches.
const checkboxToggleNoiseBenchOptions = createTier4BenchOptions({
  time: 6000,
  warmupTime: 1500,
  warmupIterations: 60,
});
// Native checkbox dispatch still shows long-tail outliers, so it gets a
// longer window than the rest of the control interaction benches.
const checkboxDispatchNoiseBenchOptions = createTier4BenchOptions({
  time: 12000,
  warmupTime: 3000,
  warmupIterations: 120,
});
const inputDispatchNoiseBenchOptions = createTier4BenchOptions({
  time: 6000,
  warmupTime: 1500,
  warmupIterations: 60,
});

function renderButtons(asChild: boolean) {
  return (
    <For each={indices} by={(index) => index}>
      {(index) =>
        asChild ? (
          <Button asChild onPress={ignoreEvent}>
            <span>Button {index}</span>
          </Button>
        ) : (
          <Button onPress={ignoreEvent}>Button {index}</Button>
        )
      }
    </For>
  );
}

function renderInputs(asChild: boolean) {
  return (
    <For each={indices} by={(index) => index}>
      {(index) =>
        asChild ? (
          <Input asChild onInput={ignoreEvent}>
            <input
              aria-label={`Input ${index}`}
              defaultValue={`Input ${index}`}
            />
          </Input>
        ) : (
          <Input
            aria-label={`Input ${index}`}
            defaultValue={`Input ${index}`}
            onInput={ignoreEvent}
          />
        )
      }
    </For>
  );
}

function renderTextareas(asChild: boolean) {
  return (
    <For each={indices} by={(index) => index}>
      {(index) =>
        asChild ? (
          <Textarea asChild onInput={ignoreEvent}>
            <textarea
              aria-label={`Textarea ${index}`}
              defaultValue={`Textarea ${index}`}
            />
          </Textarea>
        ) : (
          <Textarea
            aria-label={`Textarea ${index}`}
            defaultValue={`Textarea ${index}`}
            onInput={ignoreEvent}
          />
        )
      }
    </For>
  );
}

function renderCheckboxes(asChild: boolean, checked: boolean) {
  return (
    <For each={indices} by={(index) => index}>
      {(index) =>
        asChild ? (
          <Checkbox asChild checked={checked} onCheckedChange={ignoreEvent}>
            <div>Checkbox {index}</div>
          </Checkbox>
        ) : (
          <Checkbox
            aria-label={`Checkbox ${index}`}
            checked={checked}
            onCheckedChange={ignoreEvent}
          />
        )
      }
    </For>
  );
}

function ButtonUpdateFixture() {
  const pressed = state(false);

  return (
    <div>
      {indices.map((index) => (
        <Toggle
          key={index}
          pressed={pressed()}
          onPress={() => pressed.set(!pressed())}
        >
          Toggle {index}
        </Toggle>
      ))}
    </div>
  );
}

function SwitchUpdateFixture() {
  const checked = state(false);

  return (
    <div>
      {indices.map((index) => (
        <Switch key={index} checked={checked()} onCheckedChange={checked.set}>
          Switch {index}
        </Switch>
      ))}
    </div>
  );
}

// Keep each benchmark in its own describe so the summary prints absolute
// measurements instead of invalid cross-bench ratios.
describe('Button native mount bench', () => {
  bench(
    'mount 1k native buttons',
    () => {
      return runBrowserBench(<div>{renderButtons(false)}</div>, () => {});
    },
    tier4BenchOptions
  );
});

describe('Button asChild mount bench', () => {
  bench(
    'mount 1k asChild buttons',
    () => {
      return runBrowserBench(<div>{renderButtons(true)}</div>, () => {});
    },
    noisyControlBenchOptions
  );
});

describe('Button native dispatch bench', () => {
  bench(
    'dispatch 1k clicks on native buttons',
    async () => {
      await runBrowserBench(
        <div>{renderButtons(false)}</div>,
        async (container) => {
          const buttons = Array.from(container.querySelectorAll('button'));

          for (const button of buttons) {
            (button as HTMLButtonElement).click();
          }

          await flushBrowserBenchUpdates();
        }
      );
    },
    noisyControlBenchOptions
  );
});

describe('Button asChild dispatch bench', () => {
  bench(
    'dispatch 1k clicks on asChild buttons',
    async () => {
      await runBrowserBench(
        <div>{renderButtons(true)}</div>,
        async (container) => {
          const buttons = Array.from(
            container.querySelectorAll('[data-slot="button"]')
          );

          for (const button of buttons) {
            (button as HTMLElement).click();
          }

          await flushBrowserBenchUpdates();
        }
      );
    },
    noisyControlBenchOptions
  );
});

describe('Input native mount bench', () => {
  bench(
    'mount 1k native inputs',
    () => {
      return runBrowserBench(<div>{renderInputs(false)}</div>, () => {});
    },
    tier4BenchOptions
  );
});

describe('Input asChild mount bench', () => {
  bench(
    'mount 1k asChild inputs',
    () => {
      return runBrowserBench(<div>{renderInputs(true)}</div>, () => {});
    },
    tier4BenchOptions
  );
});

describe('Input native dispatch bench', () => {
  bench(
    'dispatch 1k change events on native inputs',
    async () => {
      await runBrowserBench(
        <div>{renderInputs(false)}</div>,
        async (container) => {
          const inputs = Array.from(
            container.querySelectorAll('input[data-slot="input"]')
          );

          inputs.forEach((input, index) => {
            const element = input as HTMLInputElement;
            element.value = `Updated ${index}`;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          });

          await flushBrowserBenchUpdates();
        }
      );
    },
    tier4BenchOptions
  );
});

describe('Input asChild dispatch bench', () => {
  bench(
    'dispatch 1k change events on asChild inputs',
    async () => {
      await runBrowserBench(
        <div>{renderInputs(true)}</div>,
        async (container) => {
          const inputs = Array.from(
            container.querySelectorAll('input[data-slot="input"]')
          );

          inputs.forEach((input, index) => {
            const element = input as HTMLInputElement;
            element.value = `Updated ${index}`;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          });

          await flushBrowserBenchUpdates();
        }
      );
    },
    inputDispatchNoiseBenchOptions
  );
});

describe('Textarea native mount bench', () => {
  bench(
    'mount 1k native textareas',
    () => {
      return runBrowserBench(<div>{renderTextareas(false)}</div>, () => {});
    },
    tier4BenchOptions
  );
});

describe('Textarea asChild mount bench', () => {
  bench(
    'mount 1k asChild textareas',
    () => {
      return runBrowserBench(<div>{renderTextareas(true)}</div>, () => {});
    },
    noisyControlBenchOptions
  );
});

describe('Textarea native dispatch bench', () => {
  bench(
    'dispatch 1k change events on native textareas',
    async () => {
      await runBrowserBench(
        <div>{renderTextareas(false)}</div>,
        async (container) => {
          const textareas = Array.from(
            container.querySelectorAll('textarea[data-slot="textarea"]')
          );

          textareas.forEach((textarea, index) => {
            const element = textarea as HTMLTextAreaElement;
            element.value = `Updated ${index}`;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          });

          await flushBrowserBenchUpdates();
        }
      );
    },
    tier4BenchOptions
  );
});

describe('Textarea asChild dispatch bench', () => {
  bench(
    'dispatch 1k change events on asChild textareas',
    async () => {
      await runBrowserBench(
        <div>{renderTextareas(true)}</div>,
        async (container) => {
          const textareas = Array.from(
            container.querySelectorAll('textarea[data-slot="textarea"]')
          );

          textareas.forEach((textarea, index) => {
            const element = textarea as HTMLTextAreaElement;
            element.value = `Updated ${index}`;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          });

          await flushBrowserBenchUpdates();
        }
      );
    },
    tier4BenchOptions
  );
});

describe('Checkbox native mount bench', () => {
  bench(
    'mount 1k native checkboxes',
    () => {
      return runBrowserBench(
        <div>{renderCheckboxes(false, false)}</div>,
        () => {}
      );
    },
    tier4BenchOptions
  );
});

describe('Checkbox asChild mount bench', () => {
  bench(
    'mount 1k asChild checkboxes',
    () => {
      return runBrowserBench(
        <div>{renderCheckboxes(true, false)}</div>,
        () => {}
      );
    },
    checkboxToggleNoiseBenchOptions
  );
});

describe('Checkbox native dispatch bench', () => {
  bench(
    'dispatch 1k clicks on native checkboxes',
    async () => {
      await runBrowserBench(
        <div>{renderCheckboxes(false, false)}</div>,
        async (container) => {
          const checkboxes = Array.from(
            container.querySelectorAll('input[data-slot="checkbox"]')
          );

          for (const checkbox of checkboxes) {
            (checkbox as HTMLInputElement).click();
          }

          await flushBrowserBenchUpdates();
        }
      );
    },
    checkboxDispatchNoiseBenchOptions
  );
});

describe('Checkbox asChild dispatch bench', () => {
  bench(
    'dispatch 1k clicks on asChild checkboxes',
    async () => {
      await runBrowserBench(
        <div>{renderCheckboxes(true, false)}</div>,
        async (container) => {
          const checkboxes = Array.from(
            container.querySelectorAll('[data-slot="checkbox"]')
          );

          for (const checkbox of checkboxes) {
            (checkbox as HTMLElement).click();
          }

          await flushBrowserBenchUpdates();
        }
      );
    },
    checkboxToggleNoiseBenchOptions
  );
});

describe('Checkbox native update bench', () => {
  bench(
    'update 1k native checkbox checked states',
    async () => {
      await runBrowserBench(
        <div>{renderCheckboxes(false, false)}</div>,
        async (container) => {
          const firstCheckbox = container.querySelector(
            'input[data-slot="checkbox"]'
          ) as HTMLInputElement;

          firstCheckbox.click();
          await flushBrowserBenchUpdates();
        }
      );
    },
    checkboxDispatchNoiseBenchOptions
  );
});

describe('Toggle benches', () => {
  bench(
    'update 1k pressed toggle states',
    async () => {
      await runBrowserBench(<ButtonUpdateFixture />, async (container) => {
        const firstToggle = container.querySelector(
          '[data-slot="toggle"]'
        ) as HTMLElement;

        firstToggle.click();
        await flushBrowserBenchUpdates();
      });
    },
    checkboxToggleNoiseBenchOptions
  );
});

describe('Switch benches', () => {
  bench(
    'update 1k checked switch states',
    async () => {
      await runBrowserBench(<SwitchUpdateFixture />, async (container) => {
        const firstSwitch = container.querySelector(
          '[data-slot="switch"]'
        ) as HTMLElement;

        firstSwitch.click();
        await flushBrowserBenchUpdates();
      });
    },
    noisyControlBenchOptions
  );
});
