import React, { createRef } from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import DynamicForm from "../DynamicForm/DynamicForm";
import type { DynamicFormHandle } from "../DynamicForm/DynamicForm";
import type { FormFieldSchema } from "../DynamicForm/types/FormFieldSchema";
import { FIELD_TYPES } from "../DynamicForm/types/constant";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function textField(overrides?: Partial<FormFieldSchema>): FormFieldSchema {
  return { name: "username", label: "Username", type: FIELD_TYPES.TEXT, ...overrides };
}

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("DynamicForm — rendering", () => {
  it("renders a text field from schema", () => {
    render(<DynamicForm schema={[textField()]} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  it("renders submit button by default", () => {
    render(<DynamicForm schema={[]} onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("hides submit button when hideSubmitButton is true", () => {
    render(<DynamicForm schema={[]} onSubmit={vi.fn()} hideSubmitButton />);
    expect(screen.queryByRole("button", { name: /submit/i })).not.toBeInTheDocument();
  });

  it("renders reset button when showReset is true", () => {
    render(<DynamicForm schema={[]} onSubmit={vi.fn()} showReset />);
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("renders custom submitLabel", () => {
    render(<DynamicForm schema={[]} onSubmit={vi.fn()} submitLabel="Save" />);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("renders required asterisk for required fields", () => {
    render(<DynamicForm schema={[textField({ required: true })]} onSubmit={vi.fn()} />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders helpText below the label", () => {
    render(<DynamicForm schema={[textField({ helpText: "Your username" })]} onSubmit={vi.fn()} />);
    expect(screen.getByText("Your username")).toBeInTheDocument();
  });
});

// ─── defaultValues ────────────────────────────────────────────────────────────

describe("DynamicForm — defaultValues", () => {
  it("pre-fills text field with defaultValues prop", () => {
    render(
      <DynamicForm
        schema={[textField()]}
        onSubmit={vi.fn()}
        defaultValues={{ username: "johndoe" }}
      />
    );
    expect(screen.getByLabelText(/username/i)).toHaveValue("johndoe");
  });
});

// ─── Submission ───────────────────────────────────────────────────────────────

describe("DynamicForm — submission", () => {
  it("calls onSubmit with typed values", async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={[textField()]} onSubmit={onSubmit} mode="onChange" />);

    await userEvent.type(screen.getByLabelText(/username/i), "alice");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ username: "alice" }),
        expect.anything()
      );
    });
  });

  it("does not call onSubmit when required field is empty", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[textField({ required: true })]}
        onSubmit={onSubmit}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  it("shows required error message after submit attempt", async () => {
    render(
      <DynamicForm
        schema={[textField({ required: true })]}
        onSubmit={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/required/i)
    );
  });
});

// ─── Reset ────────────────────────────────────────────────────────────────────

describe("DynamicForm — reset", () => {
  it("clears values when reset button is clicked", async () => {
    render(
      <DynamicForm
        schema={[textField()]}
        onSubmit={vi.fn()}
        showReset
        defaultValues={{ username: "preset" }}
      />
    );
    const input = screen.getByLabelText(/username/i);
    await userEvent.clear(input);
    await userEvent.type(input, "changed");
    await userEvent.click(screen.getByRole("button", { name: /reset/i }));
    await waitFor(() => expect(input).toHaveValue("preset"));
  });

  it("calls onReset callback when reset is clicked", async () => {
    const onReset = vi.fn();
    render(
      <DynamicForm schema={[]} onSubmit={vi.fn()} showReset onReset={onReset} />
    );
    await userEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onReset).toHaveBeenCalled();
  });
});

// ─── formRef ──────────────────────────────────────────────────────────────────

describe("DynamicForm — formRef", () => {
  it("exposes RHF methods via formRef", () => {
    const ref = createRef<DynamicFormHandle>();
    render(
      <DynamicForm
        schema={[textField()]}
        onSubmit={vi.fn()}
        formRef={ref}
      />
    );
    expect(ref.current?.form).toBeDefined();
    expect(typeof ref.current?.form.setValue).toBe("function");
    expect(typeof ref.current?.form.getValues).toBe("function");
  });

  it("allows programmatic setValue via formRef", async () => {
    const ref = createRef<DynamicFormHandle>();
    render(
      <DynamicForm
        schema={[textField()]}
        onSubmit={vi.fn()}
        formRef={ref}
      />
    );
    ref.current?.form.setValue("username", "set-programmatically");
    await waitFor(() =>
      expect(screen.getByLabelText(/username/i)).toHaveValue("set-programmatically")
    );
  });
});

// ─── Field types rendering ────────────────────────────────────────────────────

describe("DynamicForm — field types", () => {
  it("renders select field", () => {
    render(
      <DynamicForm
        schema={[{
          name: "country", label: "Country", type: FIELD_TYPES.SELECT,
          options: [{ label: "USA", value: "us" }, { label: "UK", value: "uk" }]
        }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("USA")).toBeInTheDocument();
  });

  it("renders textarea field", () => {
    render(
      <DynamicForm
        schema={[{ name: "bio", label: "Bio", type: FIELD_TYPES.TEXTAREA }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("renders radio group with options", () => {
    render(
      <DynamicForm
        schema={[{
          name: "plan", label: "Plan", type: FIELD_TYPES.RADIO,
          options: [{ label: "Free", value: "free" }, { label: "Pro", value: "pro" }]
        }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole("radio", { name: "Free" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Pro" })).toBeInTheDocument();
  });

  it("renders checkbox", () => {
    render(
      <DynamicForm
        schema={[{ name: "agree", label: "Agree", type: FIELD_TYPES.CHECKBOX }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders number field", () => {
    render(
      <DynamicForm
        schema={[{ name: "age", label: "Age", type: FIELD_TYPES.NUMBER }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/age/i)).toHaveAttribute("type", "number");
  });

  it("renders group field with children using fieldset/legend", () => {
    render(
      <DynamicForm
        schema={[{
          name: "address", label: "Address", type: FIELD_TYPES.GROUP,
          children: [{ name: "city", label: "City", type: FIELD_TYPES.TEXT }]
        }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole("group", { name: /address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  });

  it("renders additionalEmail as an email input", () => {
    render(
      <DynamicForm
        schema={[{ name: "extra", label: "Extra Email", type: FIELD_TYPES.ADDITIONAL_EMAIL }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/extra email/i)).toHaveAttribute("type", "email");
  });
});

// ─── visibleWhen ──────────────────────────────────────────────────────────────

describe("DynamicForm — visibleWhen", () => {
  const conditionalSchema: FormFieldSchema[] = [
    { name: "showExtra", label: "Show Extra", type: FIELD_TYPES.CHECKBOX },
    {
      name: "extra",
      label: "Extra Field",
      type: FIELD_TYPES.TEXT,
      visibleWhen: {
        conditions: [{ field: "showExtra", value: true, operator: "equals" }]
      }
    }
  ];

  it("hides field when condition is not met on mount", () => {
    render(<DynamicForm schema={conditionalSchema} onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText(/extra field/i)).not.toBeInTheDocument();
  });

  it("shows field when condition becomes true", async () => {
    render(<DynamicForm schema={conditionalSchema} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("checkbox"));
    await waitFor(() =>
      expect(screen.getByLabelText(/extra field/i)).toBeInTheDocument()
    );
  });

  it("hides field again when condition reverts to false", async () => {
    render(<DynamicForm schema={conditionalSchema} onSubmit={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    await waitFor(() => expect(screen.getByLabelText(/extra field/i)).toBeInTheDocument());
    await userEvent.click(checkbox);
    await waitFor(() =>
      expect(screen.queryByLabelText(/extra field/i)).not.toBeInTheDocument()
    );
  });

  it("clears hidden field value when it disappears", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm schema={conditionalSchema} onSubmit={onSubmit} mode="onChange" />
    );
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    const extraInput = await screen.findByLabelText(/extra field/i);
    await userEvent.type(extraInput, "temp value");
    await userEvent.click(checkbox); // hide the field
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ extra: "" }),
        expect.anything()
      )
    );
  });

  it("supports OR logic: shows field when any condition is met", async () => {
    const schema: FormFieldSchema[] = [
      { name: "a", label: "A", type: FIELD_TYPES.CHECKBOX },
      { name: "b", label: "B", type: FIELD_TYPES.CHECKBOX },
      {
        name: "target",
        label: "Target",
        type: FIELD_TYPES.TEXT,
        visibleWhen: {
          logic: "OR",
          conditions: [
            { field: "a", value: true, operator: "equals" },
            { field: "b", value: true, operator: "equals" }
          ]
        }
      }
    ];
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText(/target/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("B"));
    await waitFor(() =>
      expect(screen.getByLabelText(/target/i)).toBeInTheDocument()
    );
  });
});

// ─── inputFormatter ───────────────────────────────────────────────────────────

describe("DynamicForm — inputFormatter", () => {
  it("formats phone number as user types", async () => {
    const phoneFormatter = (v: string) => {
      const d = v.replace(/\D/g, "");
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
      return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
    };
    render(
      <DynamicForm
        schema={[{ name: "phone", label: "Phone", type: FIELD_TYPES.TEXT, inputFormatter: phoneFormatter }]}
        onSubmit={vi.fn()}
      />
    );
    const input = screen.getByLabelText(/phone/i);
    await userEvent.type(input, "1234567890");
    await waitFor(() => expect(input).toHaveValue("123-456-7890"));
  });

  it("submits the formatted value, not the raw value", async () => {
    const onSubmit = vi.fn();
    const upper = (v: string) => v.toUpperCase();
    render(
      <DynamicForm
        schema={[{ name: "code", label: "Code", type: FIELD_TYPES.TEXT, inputFormatter: upper }]}
        onSubmit={onSubmit}
        mode="onChange"
      />
    );
    await userEvent.type(screen.getByLabelText(/code/i), "abc");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ code: "ABC" }),
        expect.anything()
      )
    );
  });
});

// ─── Custom rendering ─────────────────────────────────────────────────────────

describe("DynamicForm — custom rendering", () => {
  it("uses render prop when provided", () => {
    render(
      <DynamicForm
        schema={[{
          name: "custom",
          label: "Custom",
          type: FIELD_TYPES.TEXT,
          render: () => <div data-testid="custom-render">Custom Content</div>
        }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByTestId("custom-render")).toBeInTheDocument();
  });

  it("uses overrideComponent when provided", () => {
    const MyComp = () => <div data-testid="override-comp">Override</div>;
    render(
      <DynamicForm
        schema={[{
          name: "ov",
          label: "Override",
          type: FIELD_TYPES.TEXT,
          overrideComponent: MyComp
        }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByTestId("override-comp")).toBeInTheDocument();
  });
});

// ─── multiField ───────────────────────────────────────────────────────────────

describe("DynamicForm — multiField", () => {
  it("renders sub-fields side-by-side", () => {
    render(
      <DynamicForm
        schema={[{
          name: "nameRow",
          label: "Name Row",
          type: FIELD_TYPES.MULTI_FIELD,
          multipleField: [
            { name: "first", label: "First Name", type: FIELD_TYPES.TEXT },
            { name: "last", label: "Last Name", type: FIELD_TYPES.TEXT }
          ]
        }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  });
});

// ─── FormTheme ────────────────────────────────────────────────────────────────

describe("DynamicForm — FormTheme", () => {
  it("applies inputClass from theme to the input element", () => {
    render(
      <DynamicForm
        schema={[textField()]}
        onSubmit={vi.fn()}
        theme={{ inputClass: "my-input" }}
      />
    );
    expect(screen.getByLabelText(/username/i)).toHaveClass("my-input");
  });

  it("applies inputErrorClass when field has error", async () => {
    render(
      <DynamicForm
        schema={[textField({ required: true })]}
        onSubmit={vi.fn()}
        theme={{ inputErrorClass: "has-error" }}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByLabelText(/username/i)).toHaveClass("has-error")
    );
  });

  it("strips inline styles in unstyled mode", () => {
    render(
      <DynamicForm
        schema={[textField()]}
        onSubmit={vi.fn()}
        theme={{ unstyled: true }}
      />
    );
    // In unstyled mode the input should have no inline style attribute
    const input = screen.getByLabelText(/username/i);
    expect(input.getAttribute("style")).toBeFalsy();
  });
});
