import type { FieldConfig } from "./types";

// Convert a single FieldConfig to a schema object literal string
function fieldToObject(f: FieldConfig, indent = 2): string {
  const sp = " ".repeat(indent);
  const lines: string[] = [];

  const s = (k: string, v: string) => `${sp}  ${k}: "${v}",`;
  const b = (k: string, v: boolean) => `${sp}  ${k}: ${v},`;
  const n = (k: string, v: number) => `${sp}  ${k}: ${v},`;

  lines.push(s("name", f.name));
  lines.push(s("label", f.label));
  lines.push(s("type", f.type));
  if (f.required) lines.push(b("required", true));
  if (f.disabled) lines.push(b("disabled", true));
  if (f.placeholder) lines.push(s("placeholder", f.placeholder));
  if (f.helpText) lines.push(s("helpText", f.helpText));
  if (f.tooltip) lines.push(s("tooltip", f.tooltip));
  if (f.fullWidth) lines.push(b("fullWidth", true));
  if (f.colSpan != null && !f.fullWidth) lines.push(n("colSpan", f.colSpan));
  if (f.min != null) lines.push(n("min", f.min));
  if (f.max != null) lines.push(n("max", f.max));
  if (f.step != null) lines.push(n("step", f.step));
  if (f.rows != null) lines.push(n("rows", f.rows));
  if (f.showWordCount) lines.push(b("showWordCount", true));
  if (f.accept) lines.push(s("accept", f.accept));
  if (f.multiple) lines.push(b("multiple", true));
  if (f.starCount != null) lines.push(n("starCount", f.starCount));
  if (f.addButtonLabel) lines.push(s("addButtonLabel", f.addButtonLabel));
  if (f.removeButtonLabel) lines.push(s("removeButtonLabel", f.removeButtonLabel));

  if (f.options && f.options.length > 0) {
    const opts = f.options
      .map((o) => `${sp}    { label: "${o.label}", value: "${o.value}" },`)
      .join("\n");
    lines.push(`${sp}  options: [\n${opts}\n${sp}  ],`);
  }
  if (f.apiEndpoint) lines.push(s("apiEndpoint", f.apiEndpoint));
  if (f.dependsOn) lines.push(s("dependsOn", f.dependsOn));

  if (f.subFields && f.subFields.length > 0) {
    const itemSp = `${sp}    `;
    const kvSp = `${sp}      `;
    const subItems = f.subFields.map((sf) => {
      const sfLines: string[] = [
        `${kvSp}name: "${sf.name}",`,
        `${kvSp}label: "${sf.label}",`,
        `${kvSp}type: "${sf.type}",`,
      ];
      if (sf.required) sfLines.push(`${kvSp}required: true,`);
      if (sf.placeholder) sfLines.push(`${kvSp}placeholder: "${sf.placeholder}",`);
      if (sf.flex != null && sf.flex !== 1) sfLines.push(`${kvSp}flex: ${sf.flex},`);
      if (sf.options && sf.options.length > 0) {
        const opts = sf.options
          .map((o) => `${kvSp}  { label: "${o.label}", value: "${o.value}" },`)
          .join("\n");
        sfLines.push(`${kvSp}options: [\n${opts}\n${kvSp}],`);
      }
      return `${itemSp}{\n${sfLines.join("\n")}\n${itemSp}}`;
    }).join(",\n");
    lines.push(`${sp}  multipleField: [\n${subItems},\n${sp}  ],`);
  }

  if (f.validation && Object.keys(f.validation).length > 0) {
    const vSp = `${sp}    `;
    const vLines: string[] = [];
    const { minLength, minLengthMessage, maxLength, maxLengthMessage, pattern, patternMessage } = f.validation;
    if (minLength != null) {
      vLines.push(`${vSp}minLength: { value: ${minLength}, message: "${minLengthMessage ?? `Minimum ${minLength} characters`}" },`);
    }
    if (maxLength != null) {
      vLines.push(`${vSp}maxLength: { value: ${maxLength}, message: "${maxLengthMessage ?? `Maximum ${maxLength} characters`}" },`);
    }
    if (pattern) {
      vLines.push(`${vSp}pattern: { value: /${pattern}/, message: "${patternMessage ?? "Invalid format"}" },`);
    }
    if (vLines.length > 0) {
      lines.push(`${sp}  validation: {\n${vLines.join("\n")}\n${sp}  },`);
    }
  }

  if (f.condition) {
    const val =
      typeof f.condition.value === "boolean"
        ? String(f.condition.value)
        : `"${f.condition.value}"`;
    lines.push(
      `${sp}  visibleWhen: {\n${sp}    conditions: [{ field: "${f.condition.field}", operator: "${f.condition.operator}", value: ${val} }],\n${sp}  },`
    );
  }

  return `${sp}{\n${lines.join("\n")}\n${sp}}`;
}

// ─── Public generators ────────────────────────────────────────────────────────

export function generateSchemaCode(fields: FieldConfig[]): string {
  if (fields.length === 0) {
    return [
      `import type { FormFieldSchema } from "@oqlet/react-fill";`,
      ``,
      `const schema: FormFieldSchema[] = [];`,
      ``,
    ].join("\n");
  }
  const body = fields.map((f) => fieldToObject(f)).join(",\n");
  return [
    `import type { FormFieldSchema } from "@oqlet/react-fill";`,
    ``,
    `const schema: FormFieldSchema[] = [`,
    `${body},`,
    `];`,
    ``,
  ].join("\n");
}

export function generateUsageCode(fields: FieldConfig[], columns = 1): string {
  const schemaBody =
    fields.length === 0
      ? "[]"
      : `[\n${fields.map((f) => fieldToObject(f)).join(",\n")},\n]`;

  const columnsLine = columns > 1 ? `\n      columns={${columns}}` : "";

  return [
    `import { DynamicForm } from "@oqlet/react-fill";`,
    `import type { FormFieldSchema } from "@oqlet/react-fill";`,
    ``,
    `const schema: FormFieldSchema[] = ${schemaBody};`,
    ``,
    `export default function MyForm() {`,
    `  return (`,
    `    <DynamicForm`,
    `      schema={schema}${columnsLine}`,
    `      onSubmit={(data) => console.log(data)}`,
    `      showReset`,
    `    />`,
    `  );`,
    `}`,
    ``,
  ].join("\n");
}

// Produce a shareable JSON representation of the schema
export function generateJsonCode(fields: FieldConfig[]): string {
  const schema = toFormSchema(fields).map((f: any) => {
    // RegExp can't be JSON-serialized — convert pattern to string
    if (f.validation?.pattern?.value instanceof RegExp) {
      return {
        ...f,
        validation: {
          ...f.validation,
          pattern: {
            ...f.validation.pattern,
            value: f.validation.pattern.value.source,
          },
        },
      };
    }
    return f;
  });
  return JSON.stringify(schema, null, 2);
}

// Strip internal IDs to produce a clean FormFieldSchema[]
export function toFormSchema(fields: FieldConfig[]) {
  return fields
    .filter((f) => f.name.trim() !== "")
    .map(({ id: _id, condition, options, validation, subFields, children, ...rest }) => ({
      ...rest,
      ...(options ? { options: options.map(({ id: _oid, ...o }) => o) } : {}),
      ...(subFields && subFields.length > 0
        ? {
            multipleField: subFields.map(({ id: _sid, options: sfOptions, ...sf }) => ({
              ...sf,
              ...(sfOptions && sfOptions.length > 0
                ? { options: sfOptions.map(({ id: _oid, ...o }) => o) }
                : {}),
            })),
          }
        : {}),
      ...(children && children.length > 0
        ? { children: toFormSchema(children as FieldConfig[]) }
        : {}),
      ...(validation && Object.keys(validation).length > 0
        ? {
            validation: {
              ...(validation.minLength != null
                ? { minLength: { value: validation.minLength, message: validation.minLengthMessage ?? `Minimum ${validation.minLength} characters` } }
                : {}),
              ...(validation.maxLength != null
                ? { maxLength: { value: validation.maxLength, message: validation.maxLengthMessage ?? `Maximum ${validation.maxLength} characters` } }
                : {}),
              ...(validation.pattern
                ? { pattern: { value: new RegExp(validation.pattern), message: validation.patternMessage ?? "Invalid format" } }
                : {}),
            },
          }
        : {}),
      ...(condition
        ? {
            visibleWhen: {
              conditions: [
                {
                  field: condition.field,
                  operator: condition.operator,
                  value: condition.value,
                },
              ],
            },
          }
        : {}),
    }));
}
