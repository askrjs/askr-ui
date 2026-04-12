import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../src/components/composites/tabs';
import { TABS_A11Y_CONTRACT } from '../../../src/components/composites/tabs/tabs.a11y';
import { flushUpdates, mount, unmount } from '../../test-utils';

function getButtonByText(
  container: HTMLElement,
  text: string
): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) => element.textContent?.trim() === text
  );

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Unable to find button with text "${text}"`);
  }

  return button;
}

describe('Tabs - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should support automatic and manual activation', async () => {
    container = mount(
      <div>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview panel</TabsContent>
          <TabsContent value="settings">Settings panel</TabsContent>
        </Tabs>
        <Tabs defaultValue="overview" activationMode="manual">
          <TabsList>
            <TabsTrigger value="overview">Overview manual</TabsTrigger>
            <TabsTrigger value="settings">Settings manual</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview manual panel</TabsContent>
          <TabsContent value="settings">Settings manual panel</TabsContent>
        </Tabs>
      </div>
    );

    const settingsButton = getButtonByText(container, 'Settings');
    settingsButton.click();
    await flushUpdates();
    expect(
      container.querySelector(`[role="${TABS_A11Y_CONTRACT.PANEL_ROLE}"]`)
        ?.textContent
    ).toContain('Settings panel');

    const settingsManualButton = getButtonByText(container, 'Settings manual');
    settingsManualButton.focus();
    await flushUpdates();
    expect(
      Array.from(
        container.querySelectorAll(`[role="${TABS_A11Y_CONTRACT.PANEL_ROLE}"]`)
      ).some((panel) => panel.textContent?.includes('Settings manual panel'))
    ).toBe(false);

    settingsManualButton.click();
    await flushUpdates();
    expect(
      Array.from(
        container.querySelectorAll(`[role="${TABS_A11Y_CONTRACT.PANEL_ROLE}"]`)
      ).some((panel) => panel.textContent?.includes('Settings manual panel'))
    ).toBe(true);
  });

  it('supports nested trigger and content composition through context', async () => {
    container = mount(
      <Tabs defaultValue="overview">
        <TabsList>
          <div>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </div>
          <div>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </div>
        </TabsList>
        <section>
          <TabsContent value="overview">Overview panel</TabsContent>
        </section>
        <section>
          <TabsContent value="settings">Settings panel</TabsContent>
        </section>
      </Tabs>
    );

    const settingsButton = getButtonByText(container, 'Settings');

    settingsButton.click();
    await flushUpdates();

    expect(
      container.querySelector(`[role="${TABS_A11Y_CONTRACT.PANEL_ROLE}"]`)
        ?.textContent
    ).toContain('Settings panel');
  });

  it('selects the first enabled tab when uncontrolled and no default value is provided', async () => {
    container = mount(
      <Tabs>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="settings">Settings panel</TabsContent>
      </Tabs>
    );

    await flushUpdates();

    expect(
      container.querySelector(`[role="${TABS_A11Y_CONTRACT.PANEL_ROLE}"]`)
        ?.textContent
    ).toContain('Overview panel');
    expect(getButtonByText(container, 'Overview').getAttribute('aria-selected')).toBe(
      'true'
    );
  });
});
