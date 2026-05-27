# Changelog

All notable changes to `@oqlet/react-fill` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] — 2025-05-28

### Fixed
- `TextField` `inputFormatter` now calls `controllerField.onChange(value)` directly instead of constructing a synthetic event, fixing edge cases where formatted values were not reflected in `getValues()` immediately.

### Changed
- Bundle rebuilt after fix; no API changes.

---

## [1.0.0] — 2025-05-27

### Added

**18 built-in field types**
- `text`, `email`, `number`, `textarea` — core text inputs
- `select`, `multiselect` — single and multi-value dropdowns
- `radio`, `checkbox` — option groups
- `date`, `time`, `datetime` — date/time pickers
- `file` — file upload with `accept` / `multiple`
- `slider` — range input with `min` / `max` / `step`
- `rating` — star rating with configurable `starCount`
- `fieldArray` — dynamic repeating field groups (`useFieldArray`)
- `group` — fieldset grouping for related fields
- `multiField` — inline multi-column row with per-column `flex` sizing
- `additionalEmail` — semantic alias for a second email input

**Conditional logic** (`ConditionConfig`)
- `visibleWhen` — show/hide a field based on other field values
- `requiredWhen` — dynamically require a field
- `disabledWhen` — dynamically disable a field
- All three support `{ logic: "AND" | "OR", conditions: [...] }` for compound rules
- Operators: `"eq"` `"neq"` `"gt"` `"gte"` `"lt"` `"lte"` `"includes"` `"notIncludes"`

**TypeScript**
- `DynamicForm<TValues>` generic — `onSubmit` receives fully typed form data
- Strict `FormFieldSchema` type exported for schema authoring

**Theme system**
- `theme` prop accepts a `FormTheme` object for global class/style overrides
- `unstyled: true` strips all default styles — bring your own CSS or Tailwind
- Per-field class/style overrides win over theme-level overrides
- `theme.components` swaps built-in renderers per field type

**Error handling**
- `showErrorSummary` / `errorSummaryTitle` / `errorSummaryClass` — accessible error summary banner
- `showErrorOnBlur` — defer validation display until field is touched
- `resolveErrorMessage` util maps `FieldError` to human-readable strings

**DX**
- `onValueChange` / `onValueChangeDebounced` (with `debounceMs`) callbacks per field
- `inputFormatter` — format input values in-flight (e.g. phone masking)
- `allowedPattern` — block keystrokes that don't match a regex
- `inputMode` — mobile keyboard hint
- `helpText` with `helpTextAlignment` (`"underLabel"` | `"underInput"`)
- `tooltip` — renders a `❓` next to the label
- `icon` — arbitrary React node next to the label
- `readOnly`, `disabled`, `fullWidth`, `colSpan`
- `asyncOptions` / `apiEndpoint` / `dependsOn` for async option loading

**Form-level**
- `columns` — CSS grid column count
- `mode` — RHF validation mode (`"onBlur"` | `"onChange"` | `"onSubmit"` | `"all"`)
- `showReset` / `resetLabel` — optional reset button
- `submitLabel` / `hideSubmitButton`
- `defaultValues` override at form level

**`FormWizard`** — multi-step form wrapper
- Accepts `steps: { title, schema }[]`
- Built-in stepper UI, per-step validation, `onSubmit` on final step
- Fully themeable via the same `FormTheme`

### Infrastructure
- ESM + CJS dual build via `tsup`; `~16 kB` gzipped
- 114 tests (Vitest + React Testing Library)
- Storybook stories for every field type and feature
- Interactive docs website with playground, live preview, and theme editor
