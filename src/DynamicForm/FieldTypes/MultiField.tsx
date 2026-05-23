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
 */
const MultiFieldComponent: React.FC<MultiFieldProps> = ({ field, parentName }) => {
  const theme = useFormTheme();
  const isUnstyled = theme.unstyled;

  const rowStyle: React.CSSProperties = field.layoutStyle ?? (isUnstyled ? {} : {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start"
  });

  if (!field.multipleField?.length) return null;

  return (
    <div
      className={cx(theme.groupLayoutClass, field.layoutClass)}
      style={rowStyle}
    >
      {field.multipleField.map((subField) => (
        <div key={subField.name} style={isUnstyled ? undefined : { flex: 1, minWidth: 0 }}>
          <MemoizedFieldRenderer field={subField} parentName={parentName} />
        </div>
      ))}
    </div>
  );
};

export default React.memo(MultiFieldComponent);
