import { describe, expect, it } from 'vite-plus/test';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { RadioGroup, RadioGroupItem } from '../../src/components/radio-group';

function IdenticalServerComposites() {
  return (
    <div>
      <RadioGroup defaultValue="same">
        <RadioGroupItem value="same">Same</RadioGroupItem>
      </RadioGroup>
      <RadioGroup defaultValue="same">
        <RadioGroupItem value="same">Same</RadioGroupItem>
      </RadioGroup>
    </div>
  );
}

describe('Composite generated identity', () => {
  it('should render identical SSR siblings with unique and repeatable ids', () => {
    const first = renderToStringSync(IdenticalServerComposites);
    const second = renderToStringSync(IdenticalServerComposites);
    const ids = Array.from(
      first.matchAll(/\sid="([^"]+)"/g),
      (match) => match[1]
    );

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(second).toBe(first);
  });
});
