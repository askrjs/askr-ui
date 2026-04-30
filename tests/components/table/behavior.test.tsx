import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../src/components/primitives/table';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Table - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders semantic table elements by default', async () => {
    container = mount(
      <Table aria-label="Users">
        <TableCaption>Users</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>alice@example.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell colSpan={2}>2 users</TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    );
    await flushUpdates();

    expect(container.querySelector('table')?.getAttribute('data-slot')).toBe(
      'table'
    );
    expect(container.querySelector('caption')?.textContent).toBe('Users');
    expect(container.querySelector('thead')).not.toBeNull();
    expect(container.querySelector('tbody')).not.toBeNull();
    expect(container.querySelector('tfoot')).not.toBeNull();
    expect(container.querySelectorAll('th').length).toBe(2);
    expect(container.querySelectorAll('td').length).toBe(3);
  });

  it('supports asChild composition on the root and cells', async () => {
    container = mount(
      <Table asChild aria-label="Users">
        <table>
          <TableBody asChild>
            <tbody>
              <TableRow asChild>
                <tr>
                  <TableCell asChild>
                    <td>Alice</td>
                  </TableCell>
                </tr>
              </TableRow>
            </tbody>
          </TableBody>
        </table>
      </Table>
    );
    await flushUpdates();

    const table = container.querySelector('table');
    const row = container.querySelector('tr');
    const cell = container.querySelector('td');

    expect(table?.getAttribute('data-slot')).toBe('table');
    expect(row?.getAttribute('data-slot')).toBe('table-row');
    expect(cell?.getAttribute('data-slot')).toBe('table-cell');
    expect(cell?.textContent).toBe('Alice');
  });

  it('preserves caption and header data attributes for theming', async () => {
    container = mount(
      <Table aria-label="Users">
        <TableCaption>Users</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell scope="col">Name</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>
    );
    await flushUpdates();

    expect(
      container.querySelector('caption')?.getAttribute('data-table-caption')
    ).toBe('true');
    expect(
      container.querySelector('thead')?.getAttribute('data-table-head')
    ).toBe('true');
    expect(
      container.querySelector('th')?.getAttribute('data-table-header-cell')
    ).toBe('true');
  });
});
