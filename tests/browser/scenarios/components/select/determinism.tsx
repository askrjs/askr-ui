import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../../../../../src/components/select';
import { deterministicRender } from '../../_mount';

export function selectMarkup() {
  return {
    renders: () => [
      deterministicRender('open disabled select', () => (
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
      )),
    ],
  };
}
