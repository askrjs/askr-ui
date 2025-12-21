import { describe, it, expect } from 'vitest';
import { VisuallyHidden } from '../../src/foundations/visually-hidden';

describe('VisuallyHidden', () => {
  it('should render children and apply visually-hidden styles', () => {
    const el = VisuallyHidden({ children: 'secret' });
    expect(el.textContent).toBe('secret');
    expect(el.style.position).toBe('absolute');
    expect(el.style.clip).toContain('rect');
  });
});