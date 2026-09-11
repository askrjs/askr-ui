import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../../../src/components/table';
import { flushUpdates, mount } from '../../_mount';

export async function semanticElements(root: HTMLElement): Promise<void> {
  mount(
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
    </Table>,
    root
  );
  await flushUpdates();
}

export async function asChildComposition(root: HTMLElement): Promise<void> {
  mount(
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
    </Table>,
    root
  );
  await flushUpdates();
}

export async function themingDataAttributes(root: HTMLElement): Promise<void> {
  mount(
    <Table aria-label="Users">
      <TableCaption>Users</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell scope="col">Name</TableHeaderCell>
        </TableRow>
      </TableHead>
    </Table>,
    root
  );
  await flushUpdates();
}
