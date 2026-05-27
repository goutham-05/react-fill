import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import DynamicForm from "../DynamicForm/DynamicForm";
import type { FormFieldSchema } from "../DynamicForm/types/FormFieldSchema";
import { FIELD_TYPES } from "../DynamicForm/types/constant";

// ─── requiredWhen ─────────────────────────────────────────────────────────────

describe("DynamicForm — requiredWhen", () => {
  const schema: FormFieldSchema[] = [
    {
      name: "plan",
      label: "Plan",
      type: FIELD_TYPES.SELECT,
      options: [
        { label: "Free",  value: "free" },
        { label: "Paid",  value: "paid" },
      ],
    },
    {
      name: "billingName",
      label: "Billing Name",
      type: FIELD_TYPES.TEXT,
      requiredWhen: {
        conditions: [{ field: "plan", operator: "equals", value: "paid" }],
      },
    },
  ];

  it("does not require the field when condition is false", async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    // Plan defaults to empty, so billingName is not required
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it("shows required asterisk when condition becomes true", async () => {
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "paid");
    await waitFor(() => expect(screen.getByText("*")).toBeInTheDocument());
  });

  it("blocks submission when conditionally required field is empty", async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "paid");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  it("allows submission when conditionally required field has a value", async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} mode="onChange" />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "paid");
    await userEvent.type(screen.getByLabelText(/billing name/i), "Alice Corp");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ billingName: "Alice Corp" }),
        expect.anything()
      )
    );
  });

  it("reverts required state when condition becomes false again", async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    const combo = screen.getByRole("combobox");
    await userEvent.selectOptions(combo, "paid");
    await waitFor(() => expect(screen.getByText("*")).toBeInTheDocument());
    await userEvent.selectOptions(combo, "free");
    await waitFor(() => expect(screen.queryByText("*")).not.toBeInTheDocument());
    // Now submission should work without filling billingName
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});

// ─── disabledWhen ─────────────────────────────────────────────────────────────

describe("DynamicForm — disabledWhen", () => {
  const schema: FormFieldSchema[] = [
    {
      name: "locked",
      label: "Lock fields",
      type: FIELD_TYPES.CHECKBOX,
    },
    {
      name: "notes",
      label: "Notes",
      type: FIELD_TYPES.TEXT,
      disabledWhen: {
        conditions: [{ field: "locked", operator: "equals", value: true }],
      },
    },
  ];

  it("field is enabled when condition is false", () => {
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/notes/i)).not.toBeDisabled();
  });

  it("disables the field when condition becomes true", async () => {
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(screen.getByLabelText(/notes/i)).toBeDisabled());
  });

  it("re-enables when condition reverts to false", async () => {
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    await waitFor(() => expect(screen.getByLabelText(/notes/i)).toBeDisabled());
    await userEvent.click(checkbox);
    await waitFor(() => expect(screen.getByLabelText(/notes/i)).not.toBeDisabled());
  });

  it("combines with disabled: true — stays disabled even when condition is false", () => {
    const staticSchema: FormFieldSchema[] = [
      { name: "locked", label: "Lock", type: FIELD_TYPES.CHECKBOX },
      {
        name: "readonlyField",
        label: "Readonly",
        type: FIELD_TYPES.TEXT,
        disabled: true,
        disabledWhen: {
          conditions: [{ field: "locked", operator: "equals", value: true }],
        },
      },
    ];
    render(<DynamicForm schema={staticSchema} onSubmit={vi.fn()} />);
    // disabled: true means always disabled regardless of condition
    expect(screen.getByLabelText(/readonly/i)).toBeDisabled();
  });
});

// ─── requiredWhen + disabledWhen together ────────────────────────────────────

describe("DynamicForm — requiredWhen AND disabledWhen together", () => {
  it("can apply both to the same field independently", async () => {
    const schema: FormFieldSchema[] = [
      {
        name: "mode",
        label: "Mode",
        type: FIELD_TYPES.SELECT,
        options: [
          { label: "Read",  value: "read" },
          { label: "Write", value: "write" },
        ],
      },
      {
        name: "content",
        label: "Content",
        type: FIELD_TYPES.TEXT,
        requiredWhen: {
          conditions: [{ field: "mode", operator: "equals", value: "write" }],
        },
        disabledWhen: {
          conditions: [{ field: "mode", operator: "equals", value: "read" }],
        },
      },
    ];
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    const combo = screen.getByRole("combobox");

    await userEvent.selectOptions(combo, "read");
    await waitFor(() => expect(screen.getByLabelText(/content/i)).toBeDisabled());

    await userEvent.selectOptions(combo, "write");
    await waitFor(() => {
      expect(screen.getByLabelText(/content/i)).not.toBeDisabled();
      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });
});

// ─── multiselect field ────────────────────────────────────────────────────────

describe("DynamicForm — multiselect field", () => {
  const schema: FormFieldSchema[] = [
    {
      name: "tags",
      label: "Tags",
      type: FIELD_TYPES.MULTISELECT,
      options: [
        { label: "React",      value: "react" },
        { label: "TypeScript", value: "ts" },
        { label: "Node",       value: "node" },
      ],
    },
  ];

  it("renders a combobox trigger", () => {
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: /tags/i })).toBeInTheDocument();
  });

  it("opens dropdown on click and shows options", async () => {
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("combobox", { name: /tags/i }));
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());
    expect(screen.getByRole("option", { name: /react/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /typescript/i })).toBeInTheDocument();
  });

  it("selects an option when its checkbox is clicked", async () => {
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("combobox", { name: /tags/i }));
    const checkbox = await screen.findByRole("checkbox", { name: /react/i });
    await userEvent.click(checkbox);
    // Chip should appear
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: /tags/i })).toHaveTextContent("React")
    );
  });

  it("submits selected values as an array", async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("combobox", { name: /tags/i }));
    await userEvent.click(await screen.findByRole("checkbox", { name: /react/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /typescript/i }));
    // Close by pressing Escape
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ tags: expect.arrayContaining(["react", "ts"]) }),
        expect.anything()
      )
    );
  });

  it("deselects an option when clicked again", async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("combobox", { name: /tags/i }));
    const cb = await screen.findByRole("checkbox", { name: /react/i });
    await userEvent.click(cb);    // select
    await userEvent.click(cb);    // deselect
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ tags: [] }),
        expect.anything()
      )
    );
  });

  it("filters options via the search input", async () => {
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("combobox", { name: /tags/i }));
    const search = await screen.findByPlaceholderText(/search/i);
    await userEvent.type(search, "type");
    await waitFor(() => {
      expect(screen.queryByRole("option", { name: /react/i })).not.toBeInTheDocument();
      expect(screen.getByRole("option", { name: /typescript/i })).toBeInTheDocument();
    });
  });

  it("clears all selections via 'Clear all'", async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={schema} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("combobox", { name: /tags/i }));
    await userEvent.click(await screen.findByRole("checkbox", { name: /react/i }));
    const clearBtn = await screen.findByRole("button", { name: /clear all/i });
    await userEvent.click(clearBtn);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ tags: [] }),
        expect.anything()
      )
    );
  });

  it("blocks submission when required and empty", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "tags", label: "Tags", type: FIELD_TYPES.MULTISELECT, required: true,
          options: [{ label: "A", value: "a" }] }]}
        onSubmit={onSubmit}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  it("loads options from getOptions asynchronously", async () => {
    const getOptions = vi.fn(() =>
      Promise.resolve([
        { label: "Alpha", value: "alpha" },
        { label: "Beta",  value: "beta" },
      ])
    );
    render(
      <DynamicForm
        schema={[{ name: "items", label: "Items", type: FIELD_TYPES.MULTISELECT, getOptions }]}
        onSubmit={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("combobox", { name: /items/i }));
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /alpha/i })).toBeInTheDocument()
    );
    expect(getOptions).toHaveBeenCalledWith(undefined);
  });
});

// ─── time field ───────────────────────────────────────────────────────────────

describe("DynamicForm — time field", () => {
  it("renders an input with type='time'", () => {
    render(
      <DynamicForm
        schema={[{ name: "startTime", label: "Start Time", type: FIELD_TYPES.TIME }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/start time/i)).toHaveAttribute("type", "time");
  });

  it("applies min and max attributes", () => {
    render(
      <DynamicForm
        schema={[{
          name: "t", label: "Time", type: FIELD_TYPES.TIME,
          min: "08:00", max: "18:00"
        }]}
        onSubmit={vi.fn()}
      />
    );
    const input = screen.getByLabelText(/time/i);
    expect(input).toHaveAttribute("min", "08:00");
    expect(input).toHaveAttribute("max", "18:00");
  });

  it("submits the selected time value", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "wakeUp", label: "Wake Up", type: FIELD_TYPES.TIME }]}
        onSubmit={onSubmit}
      />
    );
    fireEvent.change(screen.getByLabelText(/wake up/i), { target: { value: "07:30" } });
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ wakeUp: "07:30" }),
        expect.anything()
      )
    );
  });

  it("blocks submission when required time is empty", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "t", label: "Time", type: FIELD_TYPES.TIME, required: true }]}
        onSubmit={onSubmit}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });
});

// ─── datetime field ───────────────────────────────────────────────────────────

describe("DynamicForm — datetime field", () => {
  it("renders an input with type='datetime-local'", () => {
    render(
      <DynamicForm
        schema={[{ name: "apptAt", label: "Appointment", type: FIELD_TYPES.DATETIME }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/appointment/i)).toHaveAttribute("type", "datetime-local");
  });

  it("submits the selected datetime value", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "meeting", label: "Meeting", type: FIELD_TYPES.DATETIME }]}
        onSubmit={onSubmit}
      />
    );
    fireEvent.change(screen.getByLabelText(/meeting/i), {
      target: { value: "2025-03-15T14:30" },
    });
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ meeting: "2025-03-15T14:30" }),
        expect.anything()
      )
    );
  });

  it("applies step attribute", () => {
    render(
      <DynamicForm
        schema={[{ name: "dt", label: "Datetime", type: FIELD_TYPES.DATETIME, step: 900 }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/datetime/i)).toHaveAttribute("step", "900");
  });
});

// ─── dependsOn: string[] ──────────────────────────────────────────────────────

describe("DynamicForm — dependsOn array", () => {
  it("calls getOptions with an object map when dependsOn is an array", async () => {
    const getOptions = vi.fn(() =>
      Promise.resolve([{ label: "Result", value: "result" }])
    );
    render(
      <DynamicForm
        schema={[
          {
            name: "region",
            label: "Region",
            type: FIELD_TYPES.SELECT,
            options: [
              { label: "US",  value: "us" },
              { label: "EU",  value: "eu" },
            ],
          },
          {
            name: "tier",
            label: "Tier",
            type: FIELD_TYPES.SELECT,
            options: [
              { label: "Free", value: "free" },
              { label: "Pro",  value: "pro"  },
            ],
          },
          {
            name: "product",
            label: "Product",
            type: FIELD_TYPES.SELECT,
            dependsOn: ["region", "tier"],
            getOptions,
          },
        ]}
        onSubmit={vi.fn()}
      />
    );

    const [regionCombo, tierCombo] = screen.getAllByRole("combobox");
    await userEvent.selectOptions(regionCombo, "us");
    await userEvent.selectOptions(tierCombo, "pro");

    await waitFor(() =>
      expect(getOptions).toHaveBeenCalledWith(
        expect.objectContaining({ region: "us", tier: "pro" })
      )
    );
  });

  it("re-fetches options when any watched field changes", async () => {
    const getOptions = vi.fn(() =>
      Promise.resolve([{ label: "X", value: "x" }])
    );
    render(
      <DynamicForm
        schema={[
          {
            name: "a",
            label: "A",
            type: FIELD_TYPES.SELECT,
            options: [{ label: "One", value: "1" }, { label: "Two", value: "2" }],
          },
          {
            name: "b",
            label: "B",
            type: FIELD_TYPES.SELECT,
            options: [{ label: "Yes", value: "y" }, { label: "No", value: "n" }],
          },
          { name: "c", label: "C", type: FIELD_TYPES.SELECT, dependsOn: ["a", "b"], getOptions },
        ]}
        onSubmit={vi.fn()}
      />
    );

    const callsBefore = getOptions.mock.calls.length;
    await userEvent.selectOptions(screen.getAllByRole("combobox")[0], "2");
    await waitFor(() =>
      expect(getOptions.mock.calls.length).toBeGreaterThan(callsBefore)
    );
  });
});

// ─── showErrorSummary ─────────────────────────────────────────────────────────

describe("DynamicForm — showErrorSummary", () => {
  const schema: FormFieldSchema[] = [
    { name: "email", label: "Email", type: FIELD_TYPES.EMAIL, required: true },
    { name: "name",  label: "Name",  type: FIELD_TYPES.TEXT,  required: true,
      validation: { minLength: { value: 3, message: "Name must be at least 3 characters" } } },
  ];

  it("does not show the error banner before first submit", () => {
    render(
      <DynamicForm schema={schema} onSubmit={vi.fn()} showErrorSummary />
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows error banner with error messages after a failed submit", async () => {
    render(
      <DynamicForm schema={schema} onSubmit={vi.fn()} showErrorSummary />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    // Find the summary banner by its default title text
    await waitFor(() =>
      expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument()
    );
    // Should also render a list of errors
    const banner = screen.getByText(/please fix the following errors/i).closest("[role='alert']");
    expect(banner?.querySelector("ul")).toBeInTheDocument();
  });

  it("uses the custom errorSummaryTitle", async () => {
    render(
      <DynamicForm
        schema={schema}
        onSubmit={vi.fn()}
        showErrorSummary
        errorSummaryTitle="Fix these issues:"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByText("Fix these issues:")).toBeInTheDocument()
    );
  });

  it("does not show banner when showErrorSummary is false", async () => {
    render(
      <DynamicForm schema={schema} onSubmit={vi.fn()} showErrorSummary={false} />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    // Individual field errors appear, but no summary banner title
    await waitFor(() =>
      expect(screen.queryByText(/please fix/i)).not.toBeInTheDocument()
    );
  });

  it("banner disappears after form passes validation on next submit", async () => {
    render(
      <DynamicForm schema={schema} onSubmit={vi.fn()} showErrorSummary mode="onChange" />
    );
    // Trigger error state
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument()
    );
    // Fill required fields
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/name/i), "Alice");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(screen.queryByText(/please fix the following errors/i)).not.toBeInTheDocument()
    );
  });

  it("applies custom errorSummaryClass to the banner container", async () => {
    render(
      <DynamicForm
        schema={schema}
        onSubmit={vi.fn()}
        showErrorSummary
        errorSummaryClass="my-error-banner"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByText(/please fix the following errors/i).closest(".my-error-banner")).toBeInTheDocument()
    );
  });
});

// ─── option.icon ──────────────────────────────────────────────────────────────

describe("DynamicForm — option.icon in radio / checkbox", () => {
  it("renders an icon node beside radio option label", () => {
    const schema: FormFieldSchema[] = [
      {
        name: "plan",
        label: "Plan",
        type: FIELD_TYPES.RADIO,
        options: [
          { label: "Free",  value: "free",  icon: <span data-testid="icon-free">💸</span>  },
          { label: "Paid",  value: "paid",  icon: <span data-testid="icon-paid">💳</span>  },
        ],
      },
    ];
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByTestId("icon-free")).toBeInTheDocument();
    expect(screen.getByTestId("icon-paid")).toBeInTheDocument();
  });

  it("renders an icon node beside checkbox group option label", () => {
    const schema: FormFieldSchema[] = [
      {
        name: "skills",
        label: "Skills",
        type: FIELD_TYPES.CHECKBOX,
        options: [
          { label: "React", value: "react", icon: <span data-testid="icon-react">⚛</span> },
          { label: "Vue",   value: "vue",   icon: <span data-testid="icon-vue">🟢</span>  },
        ],
      },
    ];
    render(<DynamicForm schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByTestId("icon-react")).toBeInTheDocument();
    expect(screen.getByTestId("icon-vue")).toBeInTheDocument();
  });
});
