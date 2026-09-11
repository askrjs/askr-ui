import {
  ProgressCircle,
  ProgressCircleIndicator,
} from '../../../../../src/components/progress-circle';
import { deterministicRender } from '../../_mount';

export function circularProgressMarkup() {
  return {
    renders: () => [
      deterministicRender('circular progress with indicator', () => (
        <ProgressCircle value={60}>
          <ProgressCircleIndicator />
        </ProgressCircle>
      )),
    ],
  };
}
