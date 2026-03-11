import { afterEach, describe, expect, it } from 'vitest';
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
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Status and utility components - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('renders badge and skeleton headless markers', () => {
    container = mount(
      <div>
        <Badge>Beta</Badge>
        <Skeleton>Loading</Skeleton>
      </div>
    );

    expect(container.querySelector('[data-badge="true"]')?.textContent).toBe(
      'Beta'
    );
    expect(
      container
        .querySelector('[data-skeleton="true"]')
        ?.getAttribute('aria-hidden')
    ).toBe('true');
  });

  it('keeps avatar fallback visible until the image loads', async () => {
    container = mount(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    expect(
      container.querySelector('[data-avatar-fallback="true"]')?.textContent
    ).toBe('JD');

    const image = container.querySelector('img')!;
    image.dispatchEvent(new Event('load'));
    await flushUpdates();

    expect(container.querySelector('[data-avatar-fallback="true"]')).toBeNull();
  });

  it('exposes progress metadata for linear and circular indicators', () => {
    container = mount(
      <div>
        <Progress value={40} max={80}>
          <ProgressIndicator />
        </Progress>
        <ProgressCircle value={30} max={60}>
          <ProgressCircleIndicator />
        </ProgressCircle>
        <Spinner label="Syncing" />
      </div>
    );

    const [linear, circular, spinner] = container.querySelectorAll(
      '[role="progressbar"]'
    );

    expect(linear?.getAttribute('aria-valuenow')).toBe('40');
    expect(
      container
        .querySelector('[data-progress-indicator="true"]')
        ?.getAttribute('data-percentage')
    ).toBe('50');
    expect(circular?.getAttribute('aria-valuenow')).toBe('30');
    expect(spinner?.getAttribute('aria-valuetext')).toBe('Syncing');
  });

  it('marks the breadcrumb current page and decorative separator correctly', () => {
    container = mount(
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
    );

    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe(
      'Overview'
    );
    expect(
      container.querySelector('[data-breadcrumb-separator="true"]')
    ).not.toBeNull();
  });

  it('renders ellipses and advances the current pagination page', async () => {
    container = mount(<Pagination count={10} defaultPage={5} />);

    expect(
      container.querySelectorAll('[data-pagination-ellipsis="true"]').length
    ).toBe(2);

    let current = container.querySelector(
      '[aria-current="page"]'
    ) as HTMLButtonElement;
    expect(current.textContent).toBe('5');

    const next = container.querySelector(
      '[aria-label="Next page"]'
    ) as HTMLButtonElement;
    next.click();
    await flushUpdates();

    current = container.querySelector(
      '[aria-current="page"]'
    ) as HTMLButtonElement;
    expect(current.textContent).toBe('6');
  });
});
