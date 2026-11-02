import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
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
  registerBench(
    'SSR render select tree',
    () => {
      renderToStringSync(() => (
        <Select
          {...{
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
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Select benches - grouped tree', () => {
  registerBench(
    'SSR render grouped select tree',
    () => {
      renderToStringSync(() => (
        <Select
          {...{
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
          }}
        />
      ));
    },
    { throws: true }
  );
});
