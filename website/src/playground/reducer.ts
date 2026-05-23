import { arrayMove } from "@dnd-kit/sortable";
import { createDefaultField, uid } from "./defaults";
import type { BuilderAction, BuilderState, HistorySlice } from "./types";

const MAX_HISTORY = 50;

export const initialState: BuilderState = {
  fields: [],
  selectedId: null,
  columns: 1,
  past: [],
  future: [],
};

/** Snapshot the undoable slice before a mutating action. */
function pushHistory(state: BuilderState): Pick<BuilderState, "past" | "future"> {
  const slice: HistorySlice = { fields: state.fields, columns: state.columns };
  return {
    past: [...state.past.slice(-MAX_HISTORY + 1), slice],
    future: [],
  };
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "ADD_FIELD": {
      const newField = createDefaultField(action.fieldType, state.fields.length);
      const idx = action.atIndex ?? state.fields.length;
      const fields = [...state.fields];
      fields.splice(idx, 0, newField);
      return { ...state, ...pushHistory(state), fields, selectedId: newField.id };
    }

    case "REMOVE_FIELD":
      return {
        ...state,
        ...pushHistory(state),
        fields: state.fields.filter((f) => f.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };

    case "UPDATE_FIELD":
      return {
        ...state,
        ...pushHistory(state),
        fields: state.fields.map((f) =>
          f.id === action.id ? { ...f, ...action.changes } : f
        ),
      };

    case "REORDER":
      return {
        ...state,
        ...pushHistory(state),
        fields: arrayMove(state.fields, action.oldIndex, action.newIndex),
      };

    case "DUPLICATE": {
      const field = state.fields.find((f) => f.id === action.id);
      if (!field) return state;
      const duplicate = {
        ...field,
        id: uid(),
        name: field.name + "_copy",
        options: field.options?.map((o) => ({ ...o, id: uid() })),
      };
      const idx = state.fields.findIndex((f) => f.id === action.id);
      const fields = [...state.fields];
      fields.splice(idx + 1, 0, duplicate);
      return { ...state, ...pushHistory(state), fields, selectedId: duplicate.id };
    }

    case "SELECT":
      return { ...state, selectedId: action.id };

    case "SET_COLUMNS":
      return { ...state, ...pushHistory(state), columns: action.columns };

    case "LOAD_TEMPLATE": {
      const fields = action.fields.map((f) => ({ ...f, id: uid() }));
      return { ...state, ...pushHistory(state), fields, selectedId: null };
    }

    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      const currentSlice: HistorySlice = { fields: state.fields, columns: state.columns };
      return {
        ...state,
        fields: previous.fields,
        columns: previous.columns,
        past: newPast,
        future: [currentSlice, ...state.future],
        selectedId: null,
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const currentSlice: HistorySlice = { fields: state.fields, columns: state.columns };
      return {
        ...state,
        fields: next.fields,
        columns: next.columns,
        past: [...state.past, currentSlice],
        future: newFuture,
        selectedId: null,
      };
    }

    case "CLEAR":
      return { ...initialState };

    default:
      return state;
  }
}
