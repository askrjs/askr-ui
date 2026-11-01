import { state } from '@askrjs/askr';
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

export function reactiveHeaderScope(root: HTMLElement) {
  let scope!: ReturnType<typeof state<'col' | 'row'>>;
  function DynamicHeader() {
    scope = state<'col' | 'row'>('col');
    return (
      <Table asChild aria-label="Users">
        <div>
          <TableHead asChild>
            <div>
              <TableRow asChild>
                <div>
                  <TableHeaderCell asChild scope={scope}>
                    <th scope={scope}>Name</th>
                  </TableHeaderCell>
                </div>
              </TableRow>
            </div>
          </TableHead>
        </div>
      </Table>
    );
  }
  mount(<DynamicHeader />, root);

  return {
    setRow: () => scope.set('row'),
  };
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

export function customAsChildHosts(root: HTMLElement) {
  const refs: Record<string, Element | null> = {};
  const saveRef = (name: string) => (node: Element | null) => {
    refs[name] = node;
  };

  mount(
    <Table asChild aria-label="Users" ref={saveRef('table-component')}>
      <div ref={saveRef('table-child')}>
        <TableCaption asChild ref={saveRef('caption-component')}>
          <p ref={saveRef('caption-child')}>Users</p>
        </TableCaption>
        <TableHead asChild ref={saveRef('head-component')}>
          <div ref={saveRef('head-child')}>
            <TableRow asChild ref={saveRef('head-row-component')}>
              <div ref={saveRef('head-row-child')}>
                <TableHeaderCell asChild ref={saveRef('header-component')}>
                  <span ref={saveRef('header-child')}>Name</span>
                </TableHeaderCell>
              </div>
            </TableRow>
          </div>
        </TableHead>
        <TableBody asChild ref={saveRef('body-component')}>
          <div ref={saveRef('body-child')}>
            <TableRow asChild ref={saveRef('body-row-component')}>
              <div ref={saveRef('body-row-child')}>
                <TableCell asChild ref={saveRef('cell-component')}>
                  <span ref={saveRef('cell-child')}>Alice</span>
                </TableCell>
              </div>
            </TableRow>
          </div>
        </TableBody>
        <TableFoot asChild ref={saveRef('foot-component')}>
          <div ref={saveRef('foot-child')}>
            <TableRow asChild ref={saveRef('foot-row-component')}>
              <div ref={saveRef('foot-row-child')}>
                <TableCell asChild ref={saveRef('foot-cell-component')}>
                  <span ref={saveRef('foot-cell-child')}>1 user</span>
                </TableCell>
              </div>
            </TableRow>
          </div>
        </TableFoot>
      </div>
    </Table>,
    root
  );

  return {
    refStatus: () =>
      Object.fromEntries(
        Object.entries(refs).map(([name, node]) => [name, node !== null])
      ),
  };
}
