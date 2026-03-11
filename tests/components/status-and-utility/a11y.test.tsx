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
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../../../src/components/breadcrumb';
import { Pagination } from '../../../src/components/pagination';
import { Progress, ProgressIndicator } from '../../../src/components/progress';
import {
  ProgressCircle,
  ProgressCircleIndicator,
} from '../../../src/components/progress-circle';
import { Skeleton } from '../../../src/components/skeleton';
import { Spinner } from '../../../src/components/spinner';
import { expectNoAxeViolations } from '../../accessibility';

describe('Status and utility components - Accessibility', () => {
  it('has no status and utility accessibility regressions', async () => {
    await expectNoAxeViolations(
      <div>
        <Badge>Beta</Badge>
        <Skeleton />
        <Avatar>
          <AvatarImage src="/avatar.png" alt="Jane Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Progress aria-label="Upload progress" value={25} max={100}>
          <ProgressIndicator />
        </Progress>
        <ProgressCircle aria-label="Sync progress" value={50} max={100}>
          <ProgressCircleIndicator />
        </ProgressCircle>
        <Spinner label="Syncing" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbCurrent>Overview</BreadcrumbCurrent>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Pagination count={10} defaultPage={3} />
      </div>
    );
  });
});
