import { bench, describe } from 'vite-plus/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../../src/components/select';

describe('Select benches - default tree', () => {
  bench('create select tree', () => {
    Select({
      defaultOpen: true,
      defaultValue: 'askr',
      children: (
        <>
          <SelectTrigger>
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectItem value="askr">Askr</SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
            </SelectContent>
          </SelectPortal>
        </>
      ),
    });
  });
});

describe('Select benches - grouped tree', () => {
  bench('create grouped select tree', () => {
    Select({
      defaultOpen: true,
      defaultValue: 'askr',
      children: (
        <>
          <SelectTrigger>
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Frameworks</SelectLabel>
                <SelectItem value="askr">Askr</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectItem value="solid">Solid</SelectItem>
            </SelectContent>
          </SelectPortal>
        </>
      ),
    });
  });
});
