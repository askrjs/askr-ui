import { describe, expect, it } from 'vite-plus/test';
import {
  isKeyboardModality,
  markKeyboardModality,
  markPointerModality,
} from '../../../src/components/_internal/focus/modality';

describe('input modality tracking', () => {
  it('should default to keyboard modality', () => {
    markKeyboardModality();
    expect(isKeyboardModality()).toBe(true);
  });

  it('should switch to pointer modality and back', () => {
    markPointerModality();
    expect(isKeyboardModality()).toBe(false);

    markKeyboardModality();
    expect(isKeyboardModality()).toBe(true);
  });
});
