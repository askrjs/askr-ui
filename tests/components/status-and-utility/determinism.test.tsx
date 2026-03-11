import { describe, it } from 'vitest';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../src/components/avatar';
import { Badge } from '../../../src/components/badge';
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbList,
} from '../../../src/components/breadcrumb';
import { Pagination } from '../../../src/components/pagination';
import { Progress, ProgressIndicator } from '../../../src/components/progress';
import {
  ProgressCircle,
  ProgressCircleIndicator,
} from '../../../src/components/progress-circle';
import { Skeleton } from '../../../src/components/skeleton';
import { Spinner } from '../../../src/components/spinner';
import { expectDeterministicRender } from '../../determinism';

describe('Status and utility components - Determinism', () => {
  it('renders deterministic status and utility markup', () => {
    expectDeterministicRender(() => <Badge>Beta</Badge>);
    expectDeterministicRender(() => <Skeleton />);
    expectDeterministicRender(() => (
      <Avatar>
        <AvatarImage src="/avatar.png" alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    ));
    expectDeterministicRender(() => (
      <Progress value={25}>
        <ProgressIndicator />
      </Progress>
    ));
    expectDeterministicRender(() => (
      <ProgressCircle value={60}>
        <ProgressCircleIndicator />
      </ProgressCircle>
    ));
    expectDeterministicRender(() => <Spinner label="Syncing" />);
    expectDeterministicRender(() => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbCurrent>Overview</BreadcrumbCurrent>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ));
    expectDeterministicRender(() => <Pagination count={7} defaultPage={3} />);
  });
});
