import { bench, describe } from 'vitest';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../src/components/avatar';
import { Badge } from '../../src/components/badge';
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbList,
} from '../../src/components/breadcrumb';
import { Pagination } from '../../src/components/pagination';
import { Progress, ProgressIndicator } from '../../src/components/progress';
import {
  ProgressCircle,
  ProgressCircleIndicator,
} from '../../src/components/progress-circle';
import { Skeleton } from '../../src/components/skeleton';
import { Spinner } from '../../src/components/spinner';

describe('Status and utility benches', () => {
  bench('create badge and skeleton', () => {
    Badge({ children: 'Beta' });
    Skeleton({});
  });

  bench('create avatar', () => {
    Avatar({
      children: [
        AvatarImage({ src: '/avatar.png', alt: 'Jane Doe' }),
        AvatarFallback({ children: 'JD' }),
      ],
    });
  });

  bench('create progress indicators', () => {
    Progress({
      value: 50,
      children: [ProgressIndicator({})],
    });
    ProgressCircle({
      value: 50,
      children: [ProgressCircleIndicator({})],
    });
    Spinner({ label: 'Loading' });
  });

  bench('create breadcrumb and pagination', () => {
    Breadcrumb({
      children: [
        BreadcrumbList({
          children: [
            BreadcrumbItem({
              children: [BreadcrumbCurrent({ children: 'Docs' })],
            }),
          ],
        }),
      ],
    });
    Pagination({ count: 10, defaultPage: 3 });
  });
});
