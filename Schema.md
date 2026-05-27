# FormFieldSchema Reference

This document outlines all the supported properties in the `FormFieldSchema` interface.

---

## ✅ Basic Properties

| Property       | Type      | Description                                                                    |
|----------------|-----------|--------------------------------------------------------------------------------|
| `name`         | `string`  | Unique identifier for the field                                                |
| `label`        | `string`  | Display label                                                                  |
| `type`         | `string`  | Field type — `text`, `email`, `textarea`, `select`, `checkbox`, `radio`, etc.  |
| `required`     | `boolean` | Whether field is required                                                      |
| `defaultValue` | `any`     | Initial value                                                                  |
| `placeholder`  | `string`  | Placeholder text for inputs                                                    |

---

## 🎯 Validation

| Property                 | Type                                       | Description                                 |
|--------------------------|--------------------------------------------|---------------------------------------------|
| `allowedPattern`         | `RegExp`                                   | Restricts keyboard input to matching chars  |
| `validation.pattern`     | `{ value: RegExp; message: string }`       | Regex pattern check                         |
| `validation.minLength`   | `{ value: number; message: string }`       | Minimum input length                        |
| `validation.maxLength`   | `{ value: number; message: string }`       | Maximum input length                        |
| `validation.validate`    | `(value, allValues) => boolean \| string`  | Cross-field or async validation (preferred) |
| `validation.custom`      | `(value) => boolean \| string`             | Alias for `validate` (deprecated)           |

---

## ⚙️ Dynamic Behavior

| Property        | Type      | Description                              |
|-----------------|-----------|------------------------------------------|
| `visibleWhen`   | `object`  | Conditional visibility                   |
| `preserveValue` | `boolean` | Preserve value when field is hidden      |
| `dependsOn`     | `string`  | Refresh options when this field changes  |

---

## 🎨 Styling

Per-field class names and inline styles (override theme defaults):

- `wrapperClass`, `wrapperStyle`
- `labelClass`, `labelStyle`
- `inputClass`, `inputStyle`
- `errorClass`, `errorStyle`
- `helpText`, `helpTextClass`, `helpTextStyle`

For `multiField` sub-fields, use `flex` (number) to control proportional width.

---

## 🧩 Components

- `options`: static options for `select`, `radio`, `checkbox`
- `children`: nested fields for `group` and `fieldArray`
- `render`: `(fieldProps) => ReactNode` for full control
- `overrideComponent`: swap to a custom React component for this field only
- For all fields of a type: use `theme.components` on `<DynamicForm>`

---

## 💡 Advanced

| Property                 | Type                          | Description                             |
|--------------------------|-------------------------------|-----------------------------------------|
| `apiEndpoint`            | `string`                      | GET URL to fetch options dynamically    |
| `getOptions`             | `(parentValue) => Option[]`   | Sync or async function to load options  |
| `onValueChange`          | `(value, ctx) => void`        | Fires immediately on value change       |
| `onValueChangeDebounced` | `(value, ctx) => void`        | Fires after debounce delay              |
| `inputFormatter`         | `(value: string) => string`   | Transform value on each keystroke       |
| `flex`                   | `number \| string`            | Flex weight in a `multiField` row       |

---

## 📚 Example

```ts
{
  name: "email",
  label: "Email Address",
  type: "text",
  required: true,
  placeholder: "you@example.com",
  validation: {
    pattern: {
      value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
      message: "Invalid email format"
    }
  }
}
```
