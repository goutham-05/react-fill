import type { FieldRegistry } from "./FieldRegistry";
import { FIELD_TYPES } from "../types/constant";
import TextField from "../FieldTypes/TextField";
import NumberField from "../FieldTypes/NumberField";
import TextAreaField from "../FieldTypes/TextAreaField";
import SelectField from "../FieldTypes/SelectField";
import MultiSelectField from "../FieldTypes/MultiSelectField";
import RadioField from "../FieldTypes/RadioField";
import CheckboxField from "../FieldTypes/CheckboxField";
import DateField from "../FieldTypes/DateField";
import TimeField from "../FieldTypes/TimeField";
import FileField from "../FieldTypes/FileField";
import SliderField from "../FieldTypes/SliderField";
import RatingField from "../FieldTypes/RatingField";
import FieldArrayComponent from "../FieldTypes/FieldArrayField";
import GroupFieldComponent from "../FieldTypes/GroupField";
import MultiFieldComponent from "../FieldTypes/MultiField";

/**
 * The complete built-in field registry — every field type the library ships.
 *
 * Importing this module pulls all built-in field components into your bundle.
 * If bundle size matters, pass a custom `fieldRegistry` to <DynamicForm> that
 * only includes the types your project uses:
 *
 * @example
 * import { DynamicForm, TextField, SelectField } from "@oqlet/react-fill";
 * <DynamicForm fieldRegistry={{ text: TextField, email: TextField, select: SelectField }} ... />
 */
export const defaultFieldRegistry: FieldRegistry = {
  [FIELD_TYPES.TEXT]:            TextField as any,
  [FIELD_TYPES.EMAIL]:           TextField as any,
  [FIELD_TYPES.NUMBER]:          NumberField as any,
  [FIELD_TYPES.TEXTAREA]:        TextAreaField as any,
  [FIELD_TYPES.SELECT]:          SelectField as any,
  [FIELD_TYPES.MULTISELECT]:     MultiSelectField as any,
  [FIELD_TYPES.RADIO]:           RadioField as any,
  [FIELD_TYPES.CHECKBOX]:        CheckboxField as any,
  [FIELD_TYPES.DATE]:            DateField as any,
  [FIELD_TYPES.TIME]:            TimeField as any,
  [FIELD_TYPES.DATETIME]:        TimeField as any,
  [FIELD_TYPES.FILE]:            FileField as any,
  [FIELD_TYPES.SLIDER]:          SliderField as any,
  [FIELD_TYPES.RATING]:          RatingField as any,
  [FIELD_TYPES.FIELD_ARRAY]:     FieldArrayComponent as any,
  [FIELD_TYPES.GROUP]:           GroupFieldComponent as any,
  [FIELD_TYPES.ADDITIONAL_EMAIL]:TextField as any,
  [FIELD_TYPES.MULTI_FIELD]:     MultiFieldComponent as any,
};
