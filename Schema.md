# 📘 FormFieldSchema Reference

This document outlines all the supported properties in the `FormFieldSchema` interface.

---

## ✅ Basic Properties

| Property       | Type                      | Description |
|----------------|---------------------------|-------------|
| `name`         | `string`                  | Unique identifier for the field |
| `label`        | `string`                  | Display label |
| `type`         | `string`                  | One of: `text`, `email`, `textarea`, `select`, `checkbox`, `radio`, `group` |
| `required`     | `boolean`                 | Whether field is required |
| `defaultValue` | `any`                     | Initial value |
| `placeholder`  | `string`                  | Placeholder text for inputs |

---

## 🎯 Validation

| Property        | Type                            | Description |
|-----------------|----------------------------------|-------------|
| `allowedPattern`| `RegExp`                         | Restricts keyboard input |
| `validation`    | `object`                         | Custom validation logic |
| - `pattern`     | `{ value: RegExp, message: string }` | Pattern check |
| - `minLength`   | `{ value: number, message: string }` | Minimum input length |
| - `maxLength`   | `{ value: number, message: string }` | Maximum input length |
| - `custom`      | `(value: any) => boolean \| string` | Custom validation function |

---

## ⚙️ Dynamic Behavior

| Property         | Type        | Description |
|------------------|-------------|-------------|
| `visibleWhen`    | `object`    | Conditional visibility |
| `preserveValue`  | `boolean`   | Preserve value when hidden |
| `dependsOn`      | `string`    | Refresh logic when this field changes |

---

## 🎨 Styling

Supports class names and inline styles.

- `wrapperClass`, `wrapperStyle`
- `labelClass`, `labelStyle`
- `inputClass`, `inputStyle`
- `errorClass`, `errorStyle`
- `helpText`, `helpTextClass`, `helpTextStyle`

---

## 🧩 Components

- `options`: for `select`, `radio`, `checkbox`
- `children`: for `group`
- `render`: `(fieldProps) => ReactNode` for full control
- `overrideComponent`: use a custom React component

---

## 💡 Advanced

| Property             | Type       | Description |
|----------------------|------------|-------------|
| `apiEndpoint`        | `string`   | To fetch options dynamically |
| `getOptions`         | `(parentValue) => [] \| Promise` | Useful for dynamic dropdowns |
| `onValueChange`      | Function   | Fires immediately on value change |
| `onValueChangeDebounced` | Function | Fires after delay |
| `metaData`           | `object`   | Arbitrary data (e.g., `buttonText`) |

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