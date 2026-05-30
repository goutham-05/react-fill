# ReactFill

[Website](https://www.reactfill.com/) | [GitHub](https://github.com/goutham-05/react-fill) | [npm](https://www.npmjs.com/package/@oqlet/react-fill)

A schema-driven dynamic form builder for React. Pass a JSON array, get a fully functional form — no boilerplate, no repetition, works with any CSS framework.

Built on [React Hook Form](https://react-hook-form.com/) — battle-tested form state, zero re-render overhead.

---

## Features

- **Schema-driven** — define your entire form as a plain JSON array
- **CSS-framework agnostic** — works with Tailwind, Bootstrap, MUI, plain CSS, or no CSS at all
- **18 field types** — text, email, number, textarea, select, multiselect, radio, checkbox, date, time, datetime, file, slider, rating, fieldArray, group, multiField
- **Async / dependent options** — `getOptions`, `apiEndpoint`, and `dependsOn` for dynamic select / radio / checkbox
- **Repeatable field arrays** — add/remove rows with nested field groups
- **Conditional fields** — show/hide, conditionally require, or conditionally disable fields with AND/OR logic and 6 operators
- **Input formatters** — phone masks, SSN formatting, any per-keystroke transformation
- **Grid layout** — `columns`, `colSpan`, and `fullWidth` for 1/2/3 column grids
- **Multi-field rows** — render sub-fields side-by-side in a single row
- **Grouped fields** — semantic `<fieldset>`/`<legend>` with nested schema
- **Programmatic control** — `formRef` exposes the full React Hook Form API
- **Multi-step wizard** — built-in stepper with per-step validation
- **Custom rendering** — `render` prop or `overrideComponent` for full UI control
- **Tree-shakable** — pass a custom `fieldRegistry` to ship only the field types your project uses
- **Accessible** — `aria-required`, `aria-invalid`, `aria-describedby`, required asterisk with `aria-hidden`, WCAG AA color contrast
- **TypeScript-first** — fully typed schema with JSDoc on every prop

---

## Installation

```bash
npm install @oqlet/react-fill
# peer dependencies (if not already installed)
npm install react react-dom react-hook-form
```

> **Compatibility** — tested with React 17–19 and `react-hook-form` 7.45+. The peer dependency range is `^7.0.0`; versions before 7.45 are not actively tested and may lack APIs used internally (`useController`, `useFieldArray`).
>
> **Changelog** — see [CHANGELOG.md](./CHANGELOG.md) for a full history of additions and fixes.

---

## Quick Start

```tsx
import { DynamicForm, type FormFieldSchema } from "@oqlet/react-fill";

const schema: FormFieldSchema[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    validation: {
      pattern: {
        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        message: "Invalid email format"
      }
    }
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    required: true,
    validation: { minLength: { value: 10, message: "Too short" } }
  }
];

export default function App() {
  return (
    <DynamicForm
      schema={schema}
      onSubmit={(data) => console.log(data)}
      showReset
    />
  );
}
```

---

## Supported Field Types

| `type`            | Renders                                          |
|-------------------|--------------------------------------------------|
| `text`            | `<input type="text">`                            |
| `email`           | `<input type="email">`                           |
| `number`          | `<input type="number">` with min/max/step        |
| `textarea`        | `<textarea>` with optional word count            |
| `select`          | `<select>` — static, async, or dependent options |
| `radio`           | Radio group — static, async, or dependent        |
| `checkbox`        | Single checkbox or async checkbox group          |
| `date`            | `<input type="date">` with min/max               |
| `file`            | Styled file picker with accept/multiple          |
| `slider`          | `<input type="range">` with live value           |
| `rating`          | Interactive star rating (configurable count)     |
| `fieldArray`      | Repeatable row group with add/remove             |
| `group`           | `<fieldset>` wrapping `children[]`               |
| `multiField`      | Flex row of `multipleField[]` fields             |
| `multiselect`     | Searchable multi-select with chips               |
| `time`            | `<input type="time">` with min/max               |
| `datetime`        | `<input type="datetime-local">` with min/max     |
| `additionalEmail` | Alias for `type: "email"`                        |

---

## DynamicForm Props

| Prop                 | Type                                           | Default       | Description                                                                        |
|----------------------|------------------------------------------------|---------------|------------------------------------------------------------------------------------|
| `schema`             | `FormFieldSchema[]`                            | required      | Field definitions                                                                  |
| `onSubmit`           | `(values) => void`                             | required      | Called with validated form values                                                  |
| `defaultValues`      | `Record<string, any>`                          | —             | Initial field values                                                               |
| `mode`               | RHF validation mode                            | `"onSubmit"`  | When validation triggers (`"onChange"`, `"onBlur"`, etc.)                          |
| `formRef`            | `React.Ref<DynamicFormHandle>`                 | —             | Exposes `{ form: UseFormReturn }` for programmatic control                         |
| `theme`              | `FormTheme`                                    | `{}`          | Global class names, inline style defaults, and component overrides for all fields  |
| `columns`            | `number`                                       | `2` (desktop) | Grid column count                                                                  |
| `gap`                | `string`                                       | —             | CSS grid gap override                                                              |
| `maxWidth`           | `number \| string`                             | —             | Form max-width                                                                     |
| `formStyle`          | `CSSProperties`                                | —             | Inline styles merged onto `<form>`                                                 |
| `formClassName`      | `string`                                       | —             | Class name on `<form>`                                                             |
| `submitLabel`        | `string`                                       | `"Submit"`    | Submit button text                                                                 |
| `resetLabel`         | `string`                                       | `"Reset"`     | Reset button text                                                                  |
| `hideSubmitButton`   | `boolean`                                      | `false`       | Hide the submit button entirely                                                    |
| `showReset`          | `boolean`                                      | `false`       | Show a reset button                                                                |
| `onReset`            | `() => void`                                   | —             | Called after form reset                                                            |
| `extraActions`       | `ExtraAction[]`                                | —             | Additional buttons in the action row                                               |
| `children`           | `ReactNode`                                    | —             | Content rendered before the schema fields                                          |
| `renderSubmitButton` | (props: SubmitButtonRenderProps) => ReactNode  | —             | Replace the submit button with a custom component                                  |
| `renderResetButton`  | (props: ResetButtonRenderProps) => ReactNode   | —             | Replace the reset button with a custom component                                   |
| `submitButtonIcon`   | `ReactNode`                                    | —             | Icon rendered left of the built-in submit button label                             |
| `resetButtonIcon`    | `ReactNode`                                    | —             | Icon rendered left of the built-in reset button label                              |
| `fieldRegistry`      | `FieldRegistry`                                | all built-ins | Map of field type → component; pass a subset to tree-shake unused field types      |
| `formLabel`          | `string`                                       | —             | `aria-label` on the `<form>` element — recommended when multiple forms are on page |
| `showErrorSummary`   | `boolean`                                      | `false`       | Show a validation error banner above the submit button after a failed submit       |
| `errorSummaryTitle`  | `string`                                       | —             | Banner heading text (default: `"Please fix the following errors:"`)                |
| `errorSummaryClass`  | `string`                                       | —             | Class name on the error summary container                                          |

---

## FormFieldSchema Props

```ts
type FormFieldSchema = {
  // Core
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  defaultValue?: any;
  helpText?: string;
  inputMode?: HTMLInputElement["inputMode"];

  // Layout
  colSpan?: number;     // span N columns in the grid
  fullWidth?: boolean;  // span all columns

  // Validation
  validation?: {
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?:   { value: RegExp; message: string };
    validate?:  (value: any, allValues: any) => string | boolean | undefined;
    custom?:    (value: any, allValues: any) => string | boolean | undefined; // deprecated alias for validate
  };

  // Error messages
  errorText?: string;                       // static override (always shown when set)
  getErrorMessage?: (error: FieldError) => string; // dynamic override

  // Options (select / radio / checkbox)
  options?: Array<{ label: string; value: string | number }>;

  // Async / dependent options (select / radio / checkbox)
  getOptions?: (parentValue: any) => Option[] | Promise<Option[]>;
  apiEndpoint?: string;   // GET url; ?{dependsOn}={value} appended automatically
  dependsOn?: string | string[];  // field name(s) whose value(s) are passed to getOptions / apiEndpoint

  // Date field
  min?: string;           // "YYYY-MM-DD"
  max?: string;           // "YYYY-MM-DD"

  // Number / Slider field
  // min / max shared with date; step applies to number and slider
  step?: number;

  // File field
  accept?: string;        // e.g. "image/*" or ".pdf,.docx"
  multiple?: boolean;

  // Slider field
  showSliderValue?: boolean;

  // Rating field
  starCount?: number;     // default: 5

  // Field array (repeater)
  addButtonLabel?: string;
  removeButtonLabel?: string;
  children?: FormFieldSchema[];  // also used for group field

  // Conditional visibility / required / disabled — all share the same ConditionConfig shape
  visibleWhen?: {
    logic?: "AND" | "OR";   // default: "AND"
    conditions: Array<{
      field: string;
      operator: "equals" | "notEquals" | "in" | "notIn" | "exists" | "notExists";
      value?: any;
    }>;
  };
  requiredWhen?: {          // mark field required when condition(s) are met
    logic?: "AND" | "OR";
    conditions: Array<{ field: string; operator?: string; value?: any }>;
  };
  disabledWhen?: {          // disable field when condition(s) are met
    logic?: "AND" | "OR";
    conditions: Array<{ field: string; operator?: string; value?: any }>;
  };
  preserveValue?: boolean; // don't clear value when field is hidden

  // Value transformation
  inputFormatter?: (value: string) => string;

  // Multi-field row
  multipleField?: FormFieldSchema[];

  // Group field
  children?: FormFieldSchema[];

  // Custom rendering
  render?: (props: RenderProps) => ReactNode;
  overrideComponent?: React.ComponentType<any>;
  overrideComponentProps?: Record<string, any>;

  // Per-field CSS (overrides theme defaults)
  wrapperClass?: string;   wrapperStyle?: CSSProperties;
  labelClass?: string;     labelStyle?: CSSProperties;
  inputClass?: string;     inputStyle?: CSSProperties;
  errorClass?: string;     errorStyle?: CSSProperties;
  helpTextClass?: string;  helpTextStyle?: CSSProperties;
  layoutClass?: string;    layoutStyle?: CSSProperties; // group children container
};
```

---

## CSS Framework Agnostic — FormTheme

`FormTheme` gives you three independent controls, all applied from one place:

- **Class name slots** — wire your CSS framework's class names to every structural element
- **Inline style defaults** — set `inputStyle`, `labelStyle`, etc. once at the theme level instead of repeating them on every field schema
- **Component registry** — swap out built-in field renderers for your own components by field type

Pass it as the `theme` prop on `DynamicForm` and every field inherits it automatically.

Set `unstyled: true` to strip all library-default inline styles so your CSS framework owns everything. Theme-level `*Style` props still apply — they are consumer intent, not library defaults.

### Tailwind CSS

```tsx
const tailwindTheme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-4",
  labelClass: "block text-sm font-medium text-gray-700 mb-1",
  inputClass: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
  inputErrorClass: "border-red-500 focus:ring-red-500",
  errorClass: "mt-1 text-xs text-red-600",
  helpTextClass: "mt-1 text-xs text-gray-500",
  requiredMarkClass: "text-red-500 ml-0.5",
  submitButtonClass: "px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700",
  resetButtonClass: "px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-200",
};

<DynamicForm schema={schema} onSubmit={handleSubmit} theme={tailwindTheme} />
```

### Bootstrap 5

```tsx
const bootstrapTheme: FormTheme = {
  unstyled: true,
  wrapperClass: "mb-3",
  labelClass: "form-label",
  inputClass: "form-control",
  inputErrorClass: "is-invalid",
  errorClass: "invalid-feedback d-block",
  helpTextClass: "form-text",
  selectClass: "form-select",
  radioGroupClass: "d-flex flex-column gap-1",
  optionWrapperClass: "form-check",
  checkboxGroupClass: "form-check",
  requiredMarkClass: "text-danger",
  submitButtonClass: "btn btn-primary",
  resetButtonClass: "btn btn-secondary",
};

<DynamicForm schema={schema} onSubmit={handleSubmit} theme={bootstrapTheme} />
```

### FormTheme slots

| Slot                 | Applied to                                    |
|----------------------|-----------------------------------------------|
| `wrapperClass`       | Field wrapper `<div>`                         |
| `labelClass`         | `<label>` / `<legend>`                        |
| `inputClass`         | `<input>`, `<textarea>`, `<select>`           |
| `inputErrorClass`    | Added to input when the field has an error    |
| `errorClass`         | Error message `<span>`                        |
| `helpTextClass`      | Help text `<span>`                            |
| `requiredMarkClass`  | Required asterisk `<span>`                    |
| `radioGroupClass`    | Radio options container                       |
| `checkboxGroupClass` | Checkbox wrapper                              |
| `optionWrapperClass` | Individual radio/checkbox wrapper             |
| `groupLayoutClass`   | `group` children container                    |
| `submitButtonClass`  | Submit button                                 |
| `resetButtonClass`   | Reset button                                  |
| `extraButtonClass`   | Extra action buttons                          |
| `wizardClass`        | FormWizard outer wrapper                      |
| `stepperClass`       | Step indicator row                            |
| `navigationClass`    | Prev/Next navigation row                      |
| `unstyled`           | `true` — strips all default inline styles     |

### Theme-level inline styles

Set design-system tokens once at the theme level — every field inherits them without per-field repetition.

**Priority order (lowest → highest):** library defaults → theme styles → per-field styles

| Style prop       | Applies to                                 |
|------------------|--------------------------------------------|
| `inputStyle`     | Every `<input>`, `<textarea>`, `<select>`  |
| `labelStyle`     | Every field label                          |
| `wrapperStyle`   | Every field's outer wrapper `<div>`        |
| `errorStyle`     | Every error message element                |
| `helpTextStyle`  | Every help text element                    |

```tsx
// Apply a design system's input spec once — all fields inherit it
<DynamicForm
  theme={{
    inputStyle: {
      borderWidth: "1.5px",
      borderColor: "#6B748E",
      borderRadius: "8px",
      height: "48px",
      padding: "12px 16px",
    },
    labelStyle: { fontWeight: 600, fontSize: "16px", color: "#000" },
  }}
  schema={schema}
  onSubmit={handleSubmit}
/>
```

A per-field `inputStyle` is merged on top, so individual fields can still override specific properties.

### Component registry — theme.components

Replace any built-in field renderer with your own component, keyed by field type. The theme-level registry applies to every field of that type — no per-field `overrideComponent` boilerplate required.

```tsx
// Swap every `date` field for a custom date picker and every `select`
// for react-select, without touching individual field schemas:
<DynamicForm
  theme={{
    components: {
      date:   MyDatePickerField,
      select: MyReactSelectField,
    }
  }}
  schema={schema}
  onSubmit={handleSubmit}
/>
```

Your component receives the same props as any built-in renderer: `{ field, name, error, register }`.

Priority: `field.overrideComponent` > `theme.components[type]` > built-in renderer.

---

## Tree-shaking — fieldRegistry

By default `<DynamicForm>` ships all 18 built-in field types. If you only use a subset, pass a custom `fieldRegistry` and your bundler will drop the rest.

```tsx
import {
  DynamicForm,
  TextField,
  SelectField,
  CheckboxField,
  type FieldRegistry,
} from "@oqlet/react-fill";

const registry: FieldRegistry = {
  text:     TextField,
  email:    TextField,  // reuse — same component
  select:   SelectField,
  checkbox: CheckboxField,
};

<DynamicForm
  fieldRegistry={registry}
  schema={schema}
  onSubmit={handleSubmit}
/>
```

The same `fieldRegistry` prop is available on `<FormWizard>`.

Available named exports for individual field components:

| Export             | Field types it covers                |
|--------------------|--------------------------------------|
| `TextField`        | `text`, `email`, `additionalEmail`   |
| `NumberField`      | `number`                             |
| `TextAreaField`    | `textarea`                           |
| `SelectField`      | `select`                             |
| `RadioField`       | `radio`                              |
| `CheckboxField`    | `checkbox`                           |
| `DateField`        | `date`                               |
| `FileField`        | `file`                               |
| `SliderField`      | `slider`                             |
| `RatingField`      | `rating`                             |
| `FieldArrayField`  | `fieldArray`                         |
| `GroupField`       | `group`                              |
| `MultiField`       | `multiField`                         |
| `MultiSelectField` | `multiselect`                        |
| `TimeField`        | `time`, `datetime`                   |

`defaultFieldRegistry` (all 18 types) and `FieldRegistryContext` are also exported for advanced use cases such as wrapping `FieldRenderer` directly.

---

## Conditional Fields — visibleWhen

Show or hide fields based on other field values. Supports AND/OR logic with 6 operators.

```tsx
const schema: FormFieldSchema[] = [
  {
    name: "hasDiscount",
    label: "Do you have a discount code?",
    type: "checkbox"
  },
  {
    name: "discountCode",
    label: "Discount Code",
    type: "text",
    visibleWhen: {
      conditions: [{ field: "hasDiscount", operator: "equals", value: true }]
    }
  }
];
```

### OR logic — show when any condition matches

```tsx
{
  name: "proField",
  label: "Pro Feature",
  type: "text",
  visibleWhen: {
    logic: "OR",
    conditions: [
      { field: "plan", operator: "equals", value: "pro" },
      { field: "plan", operator: "equals", value: "enterprise" }
    ]
  }
}
```

### Operators

| Operator     | Matches when                              |
|--------------|-------------------------------------------|
| `equals`     | `currentValue === value`                  |
| `notEquals`  | `currentValue !== value`                  |
| `in`         | `value.includes(currentValue)`            |
| `notIn`      | `!value.includes(currentValue)`           |
| `exists`     | field is not empty / null / undefined     |
| `notExists`  | field is empty / null / undefined         |

When a hidden field disappears, its value is cleared automatically (set to `defaultValue ?? ""`). Set `preserveValue: true` to keep the value.

### requiredWhen — make a field conditionally required

```tsx
{
  name: "billingName",
  label: "Billing Name",
  type: "text",
  requiredWhen: {
    conditions: [{ field: "plan", operator: "equals", value: "paid" }]
  }
}
```

The required asterisk appears and submission is blocked only when the condition is met. Works with AND/OR logic and all 6 operators, same as `visibleWhen`.

### disabledWhen — disable a field conditionally

```tsx
{
  name: "notes",
  label: "Notes",
  type: "text",
  disabledWhen: {
    conditions: [{ field: "locked", operator: "equals", value: true }]
  }
}
```

`disabled: true` (static) and `disabledWhen` combine with OR — the field stays disabled if either is true.

---

## Input Formatter

Transform the field value on every keystroke — phone numbers, SSNs, currency, anything.

```tsx
{
  name: "phone",
  label: "Phone",
  type: "text",
  placeholder: "(555) 000-0000",
  inputFormatter: (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
}
```

The formatted string is what React Hook Form stores and what `onSubmit` receives.

---

## Multi-Field Row

Render multiple fields side-by-side inside a single schema entry using `type: "multiField"` and a `multipleField` array.

```tsx
{
  name: "nameRow",
  label: "",
  type: "multiField",
  multipleField: [
    { name: "firstName", label: "First Name", type: "text", required: true },
    { name: "lastName",  label: "Last Name",  type: "text", required: true }
  ]
}
```

Each sub-field gets equal width by default (`flex: 1`). Use the `flex` prop on any sub-field to control proportional width:

```tsx
{
  name: "cityStateZip",
  type: "multiField",
  multipleField: [
    { name: "city",  label: "City",     type: "text",   flex: 3 },  // 3/5 of the row
    { name: "state", label: "State",    type: "select", flex: 1 },  // 1/5
    { name: "zip",   label: "ZIP Code", type: "text",   flex: 1 },  // 1/5
  ]
}
```

---

## Grid Layout — colSpan / fullWidth

`DynamicForm` uses a 2-column grid by default (1 column on mobile). Control how each field spans columns:

```tsx
const schema: FormFieldSchema[] = [
  { name: "firstName", label: "First Name", type: "text" },         // 1 column
  { name: "lastName",  label: "Last Name",  type: "text" },         // 1 column
  { name: "bio",       label: "Bio",        type: "textarea",
    fullWidth: true },                                               // spans both columns
  { name: "address",   label: "Address",    type: "text",
    colSpan: 2 },                                                    // explicit span 2
];
```

Control the grid at the form level:

```tsx
<DynamicForm schema={schema} onSubmit={fn} columns={3} gap="1rem 2rem" maxWidth={960} />
```

---

## Programmatic Control — formRef

Access the full React Hook Form API via `formRef` to set values, trigger validation, watch values, or reset the form from outside the component.

```tsx
import { useRef } from "react";
import { DynamicForm, type DynamicFormHandle } from "@oqlet/react-fill";

function MyPage() {
  const formRef = useRef<DynamicFormHandle>(null);

  const prefill = () => {
    formRef.current?.form.setValue("email", "user@example.com");
  };

  const validate = async () => {
    const valid = await formRef.current?.form.trigger();
    if (valid) console.log(formRef.current?.form.getValues());
  };

  return (
    <>
      <DynamicForm schema={schema} onSubmit={fn} formRef={formRef} />
      <button onClick={prefill}>Prefill</button>
      <button onClick={validate}>Validate</button>
    </>
  );
}
```

`DynamicFormHandle` exposes `form: UseFormReturn` — the complete RHF instance including `setValue`, `getValues`, `trigger`, `reset`, `watch`, `formState`, and more.

---

## Default Values

Pre-fill fields on mount using the `defaultValues` prop:

```tsx
<DynamicForm
  schema={schema}
  onSubmit={fn}
  defaultValues={{
    firstName: "Jane",
    role: "admin",
    notifications: true
  }}
/>
```

---

## Validation

Each field accepts a `validation` object:

```tsx
{
  name: "username",
  label: "Username",
  type: "text",
  required: true,
  validation: {
    minLength: { value: 3,   message: "At least 3 characters" },
    maxLength: { value: 20,  message: "At most 20 characters" },
    pattern:   { value: /^[a-z0-9_]+$/, message: "Lowercase letters, numbers, underscores only" },
    validate:  (value, allValues) => {
      if (value === allValues.email) return "Username cannot match your email";
    }
  }
}
```

Auto-generated error messages are used when no `message` is provided (e.g. `"Username is required"`, `"Username must be at least 3 characters"`).

Override error messages entirely:

```tsx
// Static: always shown when there is an error
{ errorText: "This field has an error." }

// Dynamic: full control over the message
{ getErrorMessage: (err) => err.type === "pattern" ? "Use a valid format" : "Required" }
```

---

## Custom Rendering

### render prop — full control

```tsx
{
  name: "rating",
  label: "Rating",
  type: "text",
  render: ({ name, register }) => (
    <StarRating {...register(name, { required: true })} />
  )
}
```

### overrideComponent — reusable component

```tsx
{
  name: "avatar",
  label: "Avatar",
  type: "text",
  overrideComponent: AvatarUploader,
  overrideComponentProps: { maxSizeMb: 2, accept: "image/*" }
}
```

Your component receives `{ field, name, error, register, ...overrideComponentProps }`.

---

## Grouped Fields

Renders as `<fieldset>` / `<legend>` for proper accessibility:

```tsx
{
  name: "address",
  label: "Address",
  type: "group",
  children: [
    { name: "street", label: "Street",  type: "text" },
    { name: "city",   label: "City",    type: "text" },
    { name: "zip",    label: "ZIP Code",type: "text" }
  ]
}
```

---

## Multi-Step Wizard

```tsx
import { FormWizard } from "@oqlet/react-fill";

const steps = [
  {
    title: "Personal Info",
    fields: [
      { name: "firstName", label: "First Name", type: "text", required: true },
      { name: "lastName",  label: "Last Name",  type: "text", required: true }
    ]
  },
  {
    title: "Contact",
    fields: [
      { name: "email", label: "Email", type: "email", required: true }
    ]
  },
  {
    title: "Preferences",
    fields: [
      { name: "newsletter", label: "Subscribe to newsletter", type: "checkbox" }
    ]
  }
];

export default function Wizard() {
  return (
    <FormWizard
      steps={steps}
      onSubmit={(data) => console.log(data)}
      showProgress
    />
  );
}
```

Each step is validated before advancing. `showProgress` renders a step indicator bar.

`FormWizard` is structural-only — it adds no background, shadow, padding, or border-radius. Wrap it in your own container or pass `wizardStyle` to apply visual chrome.

Key `FormWizard` props:

| Prop               | Type               | Description                                                  |
|--------------------|--------------------|------------------------------------------------------------- |
| `steps`            | `WizardStep[]`     | Array of `{ title, description, fields }` step definitions   |
| `onSubmit`         | `(values) => void` | Called with all field values when the last step is submitted |
| `theme`            | `FormTheme`        | Same theme object as `DynamicForm`                           |
| `fieldRegistry`    | `FieldRegistry`    | Custom field registry for tree-shaking                       |
| `formLabel`        | `string`           | `aria-label` on the inner `<form>` element                   |
| `showProgress`     | `boolean`          | Show the step indicator bar (default: `true`)                |
| `wizardStyle`      | `CSSProperties`    | Inline styles on the outer wrapper                           |
| `navigationStyle`  | `CSSProperties`    | Inline styles on the Prev/Next button row                    |
| `renderNavigation` | function           | Replace the built-in Prev/Next buttons entirely              |
| `renderProgress`   | function           | Render custom progress text below the step dots              |

---

## New Field Types

### Date

```tsx
{ name: "dob", label: "Date of Birth", type: "date", required: true, max: "2024-12-31" }
```

### File

```tsx
{ name: "avatar", label: "Profile Picture", type: "file", accept: "image/*" }
{ name: "docs",   label: "Attachments",     type: "file", accept: ".pdf,.docx", multiple: true }
```

### Slider

```tsx
{ name: "volume", label: "Volume", type: "slider", min: 0, max: 100, step: 1, defaultValue: 50 }
```

### Rating

```tsx
{ name: "score", label: "Rating", type: "rating", starCount: 5, required: true }
```

Clicking an already-selected star deselects it (value → 0).

### Field Array (repeater)

Renders a group of fields that users can add/remove as rows:

```tsx
{
  name: "contacts",
  label: "Emergency Contacts",
  type: "fieldArray",
  addButtonLabel: "+ Add contact",
  removeButtonLabel: "Remove",
  children: [
    { name: "name",  label: "Name",  type: "text",   required: true },
    { name: "phone", label: "Phone", type: "text" },
    { name: "rel",   label: "Relationship", type: "select", options: [
      { label: "Spouse", value: "spouse" },
      { label: "Friend", value: "friend" },
    ]},
  ]
}
```

Submitted data is an array: `contacts: [{ name: "...", phone: "...", rel: "..." }]`.

---

## Async / Dependent Options

`select`, `radio`, and `checkbox` fields all support dynamic options loaded from a function or an API endpoint.

### getOptions — async function

```tsx
{
  name: "framework",
  label: "Framework",
  type: "select",
  getOptions: async () => {
    const res = await fetch("/api/frameworks");
    return res.json(); // [{ label: "React", value: "react" }, ...]
  }
}
```

`getOptions` may be sync or async. While the promise is pending, the field shows a loading indicator and is disabled.

### dependsOn — dependent dropdowns

Re-calls `getOptions` (or re-fetches `apiEndpoint`) whenever the watched field's value changes:

```tsx
const schema: FormFieldSchema[] = [
  {
    name: "country",
    label: "Country",
    type: "select",
    options: [
      { label: "United States", value: "us" },
      { label: "Canada", value: "ca" },
    ]
  },
  {
    name: "state",
    label: "State / Province",
    type: "select",
    dependsOn: "country",
    getOptions: async (country) => {
      const res = await fetch(`/api/states?country=${country}`);
      return res.json();
    }
  }
];
```

### apiEndpoint — REST shorthand

When `apiEndpoint` is set, the library fetches it via GET. If `dependsOn` is also set, the parent field's value is appended as a query param automatically:

```tsx
{
  name: "state",
  label: "State",
  type: "select",
  dependsOn: "country",
  apiEndpoint: "/api/states"
  // fetches: GET /api/states?country=us
}
```

Expected response: a flat JSON array — `[{ label: string; value: string }]`.

### Async radio and checkbox

The same three props work identically for `radio` and `checkbox` fields:

```tsx
{
  name: "plan",
  label: "Plan",
  type: "radio",
  getOptions: () => fetch("/api/plans").then(r => r.json())
}
```

---

## Grid Layout

Control the column count at the form level and each field's span:

```tsx
<DynamicForm schema={schema} onSubmit={fn} columns={3} />
```

| Prop        | Type      | Default | Description                           |
|-------------|-----------|---------|---------------------------------------|
| `columns`   | `number`  | `2`     | Grid column count (1, 2, or 3)        |
| `colSpan`   | `number`  | —       | How many columns this field spans     |
| `fullWidth` | `boolean` | `false` | Span all columns regardless of count  |

```tsx
const schema: FormFieldSchema[] = [
  { name: "first", label: "First Name", type: "text" },    // 1 col
  { name: "last",  label: "Last Name",  type: "text" },    // 1 col
  { name: "email", label: "Email",      type: "email", fullWidth: true }, // all cols
  { name: "bio",   label: "Bio",        type: "textarea", colSpan: 2 },  // 2 cols
];
```

---

## Contributing

Issues and pull requests are welcome. Please open an issue first for significant changes so we can discuss the approach.

```bash
git clone https://github.com/goutham-05/react-fill
cd react-fill
npm install
npm test        # vitest — 114 tests
npm run build   # tsup — ESM + CJS + .d.ts + .d.cts
```

---

## License

MIT © [Goutham Posannapeta](https://github.com/goutham-05)
