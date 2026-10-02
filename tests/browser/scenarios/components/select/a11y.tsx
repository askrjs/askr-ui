import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../../../../../src/components/select';
import { mount } from '../../_mount';

export function openSelect(root: HTMLElement): void {
  mount(
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
    </Select>,
    root
  );
}
