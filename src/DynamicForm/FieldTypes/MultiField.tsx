import React from "react";
import { FormFieldSchema } from "../types/FormFieldSchema";
import MemoizedFieldRenderer from "FormEngine";
import { useFormTheme, cx } from "../theme/FormTheme";

interface MultiFieldProps {
  field: FormFieldSchema;
  name: string;
  parentName?: string;
}

/**
 * Renders multiple sub-fields side-by-side in a single row.
 * Configure the row layout via field.layoutStyle / field.layoutClass.
 * Each sub-field in field.multipleField is a full FormFieldSchema.
 *
 * Flex layout is always applied (it is structural, not visual) so that
 * unstyled: true does not break the side-by-side arrangement. Only the
 * visual gap between columns is suppressed when unstyled.
 *
 * Per-sub-field width control: set `flex` on individual sub-field schemas.
 *   e.g. { name: "firstName", flex: 3 }  +  { name: "mi", flex: 1 }
 *   → 75 / 25 split.  Omit `flex` to keep the default equal distribution.
 */
const MultiFieldComponent: React.FC<MultiFieldProps> = ({ field, parentName }) => {
  const theme = useFormTheme();
  const isUnstyled = theme.unstyled;

  // Flex display is structural — always on. Gap is visual — suppressed when unstyled.
  const rowStyle: React.CSSProperties = field.layoutStyle ?? {
    display: "flex",
    alignItems: "flex-start",
    ...(isUnstyled ? {} : { gap: "1rem" })
  };

  if (!field.multipleField?.length) return null;

  return (
    <div
      className={cx(theme.groupLayoutClass, field.layoutClass)}
      style={rowStyle}
    >
      {field.multipleField.map((subField) => (
        <div
          key={subField.name}
          style={{ flex: subField.flex ?? 1, minWidth: 0 }}
        >
          <MemoizedFieldRenderer field={subField} parentName={parentName} />
        </div>
      ))}
    </div>
  );
};

export default React.memo(MultiFieldComponent);
