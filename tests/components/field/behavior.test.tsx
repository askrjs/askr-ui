import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  Field,
  FieldCheckbox,
  FieldDescription,
  FieldError,
  FieldInput,
  FieldLegend,
  FieldLabel,
  FieldRadioGroup,
  FieldRow,
  FieldSelectTrigger,
  FieldSwitch,
  FieldTextarea,
  Fieldset,
} from '../../../src/components/composites/field/field';
import { RadioGroupItem } from '../../../src/components/primitives/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectValue,
} from '../../../src/components/primitives/select';
import { mount, unmount } from '../../test-utils';

describe('Field - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('wires field metadata onto its control', () => {
    container = mount(
      <Field id="email" invalid required>
        <FieldLabel>Email</FieldLabel>
        <FieldInput />
        <FieldDescription>Used for login</FieldDescription>
        <FieldError>Required</FieldError>
      </Field>
    );

    const input = container.querySelector('input');
    const label = container.querySelector('label');

    expect(label?.textContent).toBe('Email');
    expect(input?.getAttribute('id')).toBe('email-control');
    expect(input?.getAttribute('aria-describedby')).toBe(
      'email-description email-error'
    );
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-required')).toBe('true');
  });

  it('wires textarea metadata through the field API', () => {
    container = mount(
      <Field id="bio" invalid required>
        <FieldLabel>Bio</FieldLabel>
        <FieldTextarea />
        <FieldDescription>Tell people about your role.</FieldDescription>
        <FieldError>Bio is required</FieldError>
      </Field>
    );

    const textarea = container.querySelector('textarea');

    expect(textarea?.getAttribute('id')).toBe('bio-control');
    expect(textarea?.getAttribute('aria-describedby')).toBe(
      'bio-description bio-error'
    );
    expect(textarea?.getAttribute('aria-invalid')).toBe('true');
    expect(textarea?.getAttribute('aria-required')).toBe('true');
  });

  it('wires nested field parts through context without explicit fieldId plumbing', () => {
    container = mount(
      <Field id="alerts">
        <div>
          <FieldLabel>Incident alerts</FieldLabel>
          <FieldDescription>
            Receive critical service incident notifications.
          </FieldDescription>
        </div>
        <FieldSwitch checked />
      </Field>
    );

    const label = container.querySelector('[data-slot="field-label"]');
    const description = container.querySelector(
      '[data-slot="field-description"]'
    );
    const switchButton = container.querySelector('[data-slot="field-switch"]');

    expect(label?.getAttribute('for')).toBe('alerts-control');
    expect(description?.getAttribute('id')).toBe('alerts-description');
    expect(switchButton?.getAttribute('aria-describedby')).toBe(
      'alerts-description'
    );
  });

  it('inherits disabled semantics from fieldset for custom and native controls', () => {
    container = mount(
      <Fieldset disabled>
        <Field id="email">
          <FieldLabel>Email</FieldLabel>
          <FieldInput />
        </Field>
        <Field id="alerts">
          <FieldRow>
            <span>Incident alerts</span>
            <FieldSwitch checked />
          </FieldRow>
        </Field>
      </Fieldset>
    );

    const input = container.querySelector('[data-slot="field-input"]') as HTMLInputElement | null;
    const switchButton = container.querySelector('[data-slot="field-switch"]');

    expect(input?.disabled).toBe(true);
    expect(input?.getAttribute('data-disabled')).toBe('true');
    expect(switchButton?.getAttribute('aria-disabled')).toBe('true');
    expect(switchButton?.getAttribute('data-disabled')).toBe('true');
  });

  it('throws when a field subcomponent is rendered without a field', () => {
    expect(() => mount(<FieldLabel>Orphan</FieldLabel>)).toThrow(
      'Field subcomponents require a shared fieldId when used with the current runtime'
    );
  });

  it('renders semantic field grouping primitives', () => {
    container = mount(
      <Fieldset disabled>
        <FieldLegend>Notifications</FieldLegend>
        <FieldRow>
          <span>Email alerts</span>
          <input type="checkbox" />
        </FieldRow>
      </Fieldset>
    );

    const fieldset = container.querySelector('fieldset');
    const legend = container.querySelector('legend');
    const row = container.querySelector('label');

    expect(fieldset?.getAttribute('data-slot')).toBe('fieldset');
    expect(fieldset?.hasAttribute('disabled')).toBe(true);
    expect(legend?.textContent).toBe('Notifications');
    expect(row?.getAttribute('data-slot')).toBe('field-row');
  });

  it('wires choice controls through the field API', () => {
    container = mount(
      <Fieldset>
        <Field id="terms" required>
          <FieldRow>
            <span>Accept terms</span>
            <FieldCheckbox checked />
          </FieldRow>
        </Field>
        <Field id="alerts">
          <FieldRow>
            <span>Incident alerts</span>
            <FieldSwitch checked />
          </FieldRow>
        </Field>
        <Field id="size" invalid>
          <FieldLabel>Size</FieldLabel>
          <FieldRadioGroup value="m">
            <RadioGroupItem value="s">Small</RadioGroupItem>
            <RadioGroupItem value="m">Medium</RadioGroupItem>
          </FieldRadioGroup>
          <FieldError>Pick a size</FieldError>
        </Field>
      </Fieldset>
    );

    const checkbox = container.querySelector('input[type="checkbox"]');
    const switchButton = container.querySelector('[data-slot="field-switch"]');
    const radioGroup = container.querySelector(
      '[data-slot="field-radio-group"]'
    );

    expect(checkbox?.getAttribute('id')).toBe('terms-control');
    expect(checkbox?.getAttribute('aria-required')).toBe('true');
    expect(switchButton?.getAttribute('id')).toBe('alerts-control');
    expect(radioGroup?.getAttribute('aria-invalid')).toBe('true');
    expect(radioGroup?.getAttribute('aria-describedby')).toBe(
      'size-description size-error'
    );
  });

  it('wires FieldSelectTrigger metadata from Field context', () => {
    container = mount(
      <Field id="framework" invalid required>
        <FieldLabel>Framework</FieldLabel>
        <Select defaultValue="askr">
          <FieldSelectTrigger>
            <SelectValue placeholder="Choose one" />
          </FieldSelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectItem value="askr">Askr</SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
            </SelectContent>
          </SelectPortal>
        </Select>
        <FieldDescription>Choose your framework</FieldDescription>
        <FieldError>Required</FieldError>
      </Field>
    );

    const trigger = container.querySelector(
      '[data-slot="field-select-trigger"]'
    );

    expect(trigger?.getAttribute('id')).toBe('framework-control');
    expect(trigger?.getAttribute('aria-invalid')).toBe('true');
    expect(trigger?.getAttribute('aria-required')).toBe('true');
    expect(trigger?.getAttribute('aria-describedby')).toBe(
      'framework-description framework-error'
    );
  });

  it('inherits disabled semantics for FieldSelectTrigger from disabled fieldset', () => {
    container = mount(
      <Fieldset disabled>
        <Field id="framework">
          <FieldLabel>Framework</FieldLabel>
          <Select defaultValue="askr">
            <FieldSelectTrigger>
              <SelectValue placeholder="Choose one" />
            </FieldSelectTrigger>
            <SelectPortal>
              <SelectContent>
                <SelectItem value="askr">Askr</SelectItem>
              </SelectContent>
            </SelectPortal>
          </Select>
        </Field>
      </Fieldset>
    );

    const trigger = container.querySelector(
      '[data-slot="field-select-trigger"]'
    ) as HTMLButtonElement | null;

    expect(trigger?.disabled).toBe(true);
    expect(trigger?.getAttribute('aria-disabled')).toBe('true');
    expect(trigger?.getAttribute('data-disabled')).toBe('true');
  });
});
