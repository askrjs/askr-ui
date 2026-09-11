import {
  Progress,
  ProgressIndicator,
} from '../../../../../src/components/progress';
import { deterministicRender } from '../../_mount';

export function progressMarkup() {
  return {
    renders: () => [
      deterministicRender('progress with indicator', () => (
        <Progress value={25}>
          <ProgressIndicator />
        </Progress>
      )),
    ],
  };
}
