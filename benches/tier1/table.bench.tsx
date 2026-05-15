import { bench, describe } from 'vite-plus/test';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../src/components/table';

describe('Table benches', () => {
  bench('create semantic table', () => {
    Table({
      'aria-label': 'Users',
      children: [
        TableCaption({ children: 'Users' }),
        TableHead({
          children: TableRow({
            children: [
              TableHeaderCell({ children: 'Name' }),
              TableHeaderCell({ children: 'Email' }),
            ],
          }),
        }),
        TableBody({
          children: TableRow({
            children: [
              TableCell({ children: 'Alice' }),
              TableCell({ children: 'alice@example.com' }),
            ],
          }),
        }),
        TableFoot({
          children: TableRow({
            children: [TableCell({ colSpan: 2, children: '2 users' })],
          }),
        }),
      ],
    });
  });

  bench('create table with asChild hosts', () => {
    Table({
      asChild: true,
      children: (
        <table aria-label="Users">
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
      ),
    });
  });
});
