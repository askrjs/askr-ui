import { describe, it } from 'vite-plus/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectPortal,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../../src/components/primitives/select';
import { expectNoAxeViolations } from '../../accessibility';

describe('Select - Accessibility', () => {
  it('should have no automated axe violations given open select', async () => {
    await expectNoAxeViolations(
      <Select defaultOpen defaultValue="askr">
        <SelectTrigger aria-label="Framework">
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent aria-label="Framework options">
            <SelectGroup>
              <div>
                <SelectLabel>Frameworks</SelectLabel>
              </div>
              <SelectItem value="askr">Askr</SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectPortal>
      </Select>
    );
  });
});
