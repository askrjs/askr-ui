import { describe, it } from 'vite-plus/test';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../../../src/components/primitives/select';
import { expectDeterministicRender } from '../../determinism';

describe('Select - Determinism', () => {
  it('should render deterministic select markup', () => {
    expectDeterministicRender(() => (
      <Select defaultOpen defaultValue="askr" disabled>
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr" textValue="Askr">
              <SelectItemText>Askr</SelectItemText>
            </SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    ));
  });
});
