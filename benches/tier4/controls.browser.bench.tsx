import { state } from '@askrjs/askr';
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

function renderButtons(asChild: boolean) {
  return indices.map((index) =>
    asChild ? (
      <Button asChild key={index} onPress={ignoreEvent}>
        <span>Button {index}</span>
      </Button>
    ) : (
      <Button key={index} onPress={ignoreEvent}>
        Button {index}
      </Button>
    )
  );
}

function renderInputs(asChild: boolean) {
  return indices.map((index) =>
    asChild ? (
      <Input asChild key={index} onInput={ignoreEvent}>
        <input aria-label={`Input ${index}`} defaultValue={`Input ${index}`} />
      </Input>
    ) : (
      <Input
        key={index}
        aria-label={`Input ${index}`}
        defaultValue={`Input ${index}`}
        onInput={ignoreEvent}
      />
    )
  );
}

function renderTextareas(asChild: boolean) {
  return indices.map((index) =>
    asChild ? (
      <Textarea asChild key={index} onInput={ignoreEvent}>
        <textarea
          aria-label={`Textarea ${index}`}
          defaultValue={`Textarea ${index}`}
        />
      </Textarea>
    ) : (
      <Textarea
        key={index}
        aria-label={`Textarea ${index}`}
        defaultValue={`Textarea ${index}`}
        onInput={ignoreEvent}
      />
    )
  );
}

function renderCheckboxes(asChild: boolean, checked: boolean) {
  return indices.map((index) =>
    asChild ? (
      <Checkbox
        asChild
        key={index}
        checked={checked}
        onCheckedChange={ignoreEvent}
      >
        <div>Checkbox {index}</div>
      </Checkbox>
    ) : (
      <Checkbox
        key={index}
        aria-label={`Checkbox ${index}`}
        checked={checked}
        onCheckedChange={ignoreEvent}
      />
    )
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

describe('Button benches', () => {
  bench(
    'mount 1k native buttons',
    () => {
      return runBrowserBench(<div>{renderButtons(false)}</div>, () => {});
    },
    tier4BenchOptions
  );

  bench(
    'mount 1k asChild buttons',
    () => {
      return runBrowserBench(<div>{renderButtons(true)}</div>, () => {});
    },
    tier4BenchOptions
  );

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
    tier4BenchOptions
  );

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
    tier4BenchOptions
  );
});

describe('Input benches', () => {
  bench(
    'mount 1k native inputs',
    () => {
      return runBrowserBench(<div>{renderInputs(false)}</div>, () => {});
    },
    tier4BenchOptions
  );

  bench(
    'mount 1k asChild inputs',
    () => {
      return runBrowserBench(<div>{renderInputs(true)}</div>, () => {});
    },
    tier4BenchOptions
  );

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
    tier4BenchOptions
  );
});

describe('Textarea benches', () => {
  bench(
    'mount 1k native textareas',
    () => {
      return runBrowserBench(<div>{renderTextareas(false)}</div>, () => {});
    },
    tier4BenchOptions
  );

  bench(
    'mount 1k asChild textareas',
    () => {
      return runBrowserBench(<div>{renderTextareas(true)}</div>, () => {});
    },
    tier4BenchOptions
  );

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

describe('Checkbox benches', () => {
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

  bench(
    'mount 1k asChild checkboxes',
    () => {
      return runBrowserBench(
        <div>{renderCheckboxes(true, false)}</div>,
        () => {}
      );
    },
    tier4BenchOptions
  );

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
    tier4BenchOptions
  );

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
    tier4BenchOptions
  );

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
    tier4BenchOptions
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
    tier4BenchOptions
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
    tier4BenchOptions
  );
});