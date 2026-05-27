import { createContext, useContext } from "react";
import type { FC } from "react";
import type { FieldComponentProps } from "../theme/FormTheme";

/** Extended props passed through the registry dispatch (parentName used by multiField). */
export interface RegistryComponentProps extends FieldComponentProps {
  parentName?: string;
}

/**
 * Map of field type → component. Only the types present in the registry
 * are available at runtime; unknown types render nothing.
 *
 * Use this to build a minimal DynamicForm that only ships the field types
 * your project actually uses:
 *
 * @example
 * import { DynamicForm, TextField, SelectField } from "@oqlet/react-fill";
 *
 * const MyForm = () => (
 *   <DynamicForm
 *     fieldRegistry={{ text: TextField, email: TextField, select: SelectField }}
 *     schema={...}
 *     onSubmit={...}
 *   />
 * );
 */
export type FieldRegistry = Partial<Record<string, FC<RegistryComponentProps>>>;

export const FieldRegistryContext = createContext<FieldRegistry>({});

export function useFieldRegistry(): FieldRegistry {
  return useContext(FieldRegistryContext);
}
