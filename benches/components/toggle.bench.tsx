import { bench } from 'vitest';
import { render } from '@testing-library/react';
import { Toggle } from '../src/components/toggle';

bench('Toggle creation (native button)', () => {
  render(<Toggle>Toggle</Toggle>);
});

bench('Toggle creation (with pressed state)', () => {
  render(<Toggle pressed={true}>Pressed</Toggle>);
});

bench('Toggle creation (disabled)', () => {
  render(<Toggle disabled>Disabled</Toggle>);
});

bench('Toggle creation (asChild)', () => {
  render(
    <Toggle asChild>
      <span>Custom</span>
    </Toggle>
  );
});

bench('Toggle press interaction', () => {
  const { container } = render(<Toggle onPress={() => {}}>Toggle</Toggle>);
  const button = container.querySelector('button')!;
  button.click();
});
