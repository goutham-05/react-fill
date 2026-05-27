import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import DynamicForm from "../DynamicForm/DynamicForm";
import type { FormFieldSchema } from "../DynamicForm/types/FormFieldSchema";
import { FIELD_TYPES } from "../DynamicForm/types/constant";

// ─── Date field ───────────────────────────────────────────────────────────────

describe("DynamicForm — date field", () => {
  it("renders a date input", () => {
    render(
      <DynamicForm
        schema={[{ name: "dob", label: "Date of Birth", type: FIELD_TYPES.DATE }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/date of birth/i)).toHaveAttribute("type", "date");
  });

  it("applies min and max attributes", () => {
    render(
      <DynamicForm
        schema={[{
          name: "dob", label: "DOB", type: FIELD_TYPES.DATE,
          min: "2000-01-01", max: "2024-12-31"
        }]}
        onSubmit={vi.fn()}
      />
    );
    const input = screen.getByLabelText(/dob/i);
    expect(input).toHaveAttribute("min", "2000-01-01");
    expect(input).toHaveAttribute("max", "2024-12-31");
  });

  it("submits the selected date value", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "dob", label: "DOB", type: FIELD_TYPES.DATE }]}
        onSubmit={onSubmit}
      />
    );
    fireEvent.change(screen.getByLabelText(/dob/i), { target: { value: "2024-06-15" } });
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ dob: "2024-06-15" }),
        expect.anything()
      )
    );
  });

  it("blocks submission when required date is empty", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "dob", label: "DOB", type: FIELD_TYPES.DATE, required: true }]}
        onSubmit={onSubmit}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });
});

// ─── File field ───────────────────────────────────────────────────────────────

describe("DynamicForm — file field", () => {
  it("renders a Choose file button and 'No file chosen' label", () => {
    render(
      <DynamicForm
        schema={[{ name: "avatar", label: "Avatar", type: FIELD_TYPES.FILE }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /choose file/i })).toBeInTheDocument();
    expect(screen.getByText(/no file chosen/i)).toBeInTheDocument();
  });

  it("applies accept attribute to the underlying file input", () => {
    const { container } = render(
      <DynamicForm
        schema={[{ name: "doc", label: "Document", type: FIELD_TYPES.FILE, accept: ".pdf,.docx" }]}
        onSubmit={vi.fn()}
      />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute("accept", ".pdf,.docx");
  });

  it("applies multiple attribute to the underlying file input", () => {
    const { container } = render(
      <DynamicForm
        schema={[{ name: "docs", label: "Documents", type: FIELD_TYPES.FILE, multiple: true }]}
        onSubmit={vi.fn()}
      />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute("multiple");
  });

  it("renders the field label", () => {
    render(
      <DynamicForm
        schema={[{ name: "avatar", label: "Profile Picture", type: FIELD_TYPES.FILE }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText("Profile Picture")).toBeInTheDocument();
  });
});

// ─── Slider field ─────────────────────────────────────────────────────────────

describe("DynamicForm — slider field", () => {
  it("renders a range input", () => {
    render(
      <DynamicForm
        schema={[{ name: "vol", label: "Volume", type: FIELD_TYPES.SLIDER }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("applies min, max, and step attributes", () => {
    render(
      <DynamicForm
        schema={[{ name: "vol", label: "Volume", type: FIELD_TYPES.SLIDER, min: 10, max: 90, step: 5 }]}
        onSubmit={vi.fn()}
      />
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "10");
    expect(slider).toHaveAttribute("max", "90");
    expect(slider).toHaveAttribute("step", "5");
  });

  it("uses defaultValue as the initial slider position", () => {
    render(
      <DynamicForm
        schema={[{ name: "vol", label: "Volume", type: FIELD_TYPES.SLIDER, min: 0, max: 100, defaultValue: 60 }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole("slider")).toHaveValue("60");
  });

  it("submits the numeric value after moving the slider", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "vol", label: "Volume", type: FIELD_TYPES.SLIDER, min: 0, max: 100 }]}
        onSubmit={onSubmit}
      />
    );
    fireEvent.change(screen.getByRole("slider"), { target: { value: "75" } });
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ vol: 75 }),
        expect.anything()
      )
    );
  });

  it("displays min and max labels below the track", () => {
    render(
      <DynamicForm
        schema={[{ name: "vol", label: "Volume", type: FIELD_TYPES.SLIDER, min: 5, max: 95, defaultValue: 50 }]}
        onSubmit={vi.fn()}
      />
    );
    // min and max boundary labels rendered below the track
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
  });
});

// ─── Rating field ─────────────────────────────────────────────────────────────

describe("DynamicForm — rating field", () => {
  it("renders the correct number of star buttons", () => {
    render(
      <DynamicForm
        schema={[{ name: "score", label: "Score", type: FIELD_TYPES.RATING, starCount: 5 }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("respects a custom starCount", () => {
    render(
      <DynamicForm
        schema={[{ name: "score", label: "Score", type: FIELD_TYPES.RATING, starCount: 10 }]}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getAllByRole("radio")).toHaveLength(10);
  });

  it("clicking a star submits the correct numeric value", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "score", label: "Score", type: FIELD_TYPES.RATING, starCount: 5 }]}
        onSubmit={onSubmit}
      />
    );
    await userEvent.click(screen.getByRole("radio", { name: "3 stars" }));
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ score: 3 }),
        expect.anything()
      )
    );
  });

  it("clicking the active star a second time deselects it (toggle-off)", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "score", label: "Score", type: FIELD_TYPES.RATING, starCount: 5 }]}
        onSubmit={onSubmit}
      />
    );
    const star3 = screen.getByRole("radio", { name: "3 stars" });
    await userEvent.click(star3);
    await userEvent.click(star3); // deselect
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ score: 0 }),
        expect.anything()
      )
    );
  });

  it("required rating blocks submission when no star is selected", async () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        schema={[{ name: "score", label: "Score", type: FIELD_TYPES.RATING, starCount: 5, required: true }]}
        onSubmit={onSubmit}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });
});

// ─── Field array ──────────────────────────────────────────────────────────────

describe("DynamicForm — fieldArray", () => {
  const arraySchema: FormFieldSchema[] = [{
    name: "contacts",
    label: "Contacts",
    type: FIELD_TYPES.FIELD_ARRAY,
    addButtonLabel: "Add contact",
    removeButtonLabel: "Remove",
    children: [
      { name: "name", label: "Name", type: FIELD_TYPES.TEXT },
      { name: "email", label: "Email", type: FIELD_TYPES.EMAIL },
    ]
  }];

  it("renders the add button with custom label", () => {
    render(<DynamicForm schema={arraySchema} onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add contact/i })).toBeInTheDocument();
  });

  it("starts with no rows", () => {
    render(<DynamicForm schema={arraySchema} onSubmit={vi.fn()} />);
    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
  });

  it("adds a row with child fields when add button is clicked", async () => {
    render(<DynamicForm schema={arraySchema} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /add contact/i }));
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
  });

  it("removes a row when the remove button is clicked", async () => {
    render(<DynamicForm schema={arraySchema} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /add contact/i }));
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /remove row 1/i }));
    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
  });

  it("can add multiple rows independently", async () => {
    render(<DynamicForm schema={arraySchema} onSubmit={vi.fn()} />);
    const addBtn = screen.getByRole("button", { name: /add contact/i });
    await userEvent.click(addBtn);
    await userEvent.click(addBtn);
    expect(screen.getAllByLabelText(/^name$/i)).toHaveLength(2);
  });

  it("submits typed values from array rows", async () => {
    const onSubmit = vi.fn();
    render(<DynamicForm schema={arraySchema} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: /add contact/i }));
    await userEvent.type(screen.getByLabelText(/^name$/i), "Alice");
    await userEvent.type(screen.getByLabelText(/^email$/i), "alice@example.com");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          contacts: [{ name: "Alice", email: "alice@example.com" }]
        }),
        expect.anything()
      )
    );
  });
});

// ─── Async options ────────────────────────────────────────────────────────────

describe("DynamicForm — async options", () => {
  it("select: renders options after getOptions resolves", async () => {
    const getOptions = vi.fn(() =>
      Promise.resolve([
        { label: "Option A", value: "a" },
        { label: "Option B", value: "b" },
      ])
    );
    render(
      <DynamicForm
        schema={[{ name: "pick", label: "Pick one", type: FIELD_TYPES.SELECT, getOptions }]}
        onSubmit={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Option A" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Option B" })).toBeInTheDocument();
    });
    expect(getOptions).toHaveBeenCalledWith(undefined);
  });

  it("radio: renders options after getOptions resolves", async () => {
    const getOptions = vi.fn(() =>
      Promise.resolve([
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ])
    );
    render(
      <DynamicForm
        schema={[{ name: "ans", label: "Answer", type: FIELD_TYPES.RADIO, getOptions }]}
        onSubmit={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "Yes" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "No" })).toBeInTheDocument();
    });
  });

  it("checkbox: renders options after getOptions resolves", async () => {
    const getOptions = vi.fn(() =>
      Promise.resolve([
        { label: "Frontend", value: "fe" },
        { label: "Backend", value: "be" },
      ])
    );
    render(
      <DynamicForm
        schema={[{ name: "skills", label: "Skills", type: FIELD_TYPES.CHECKBOX, getOptions }]}
        onSubmit={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByRole("checkbox", { name: /frontend/i })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /backend/i })).toBeInTheDocument();
    });
  });

  it("dependent select: calls getOptions with parent value and re-fetches on change", async () => {
    const getOptions = vi.fn((country: string) =>
      Promise.resolve(
        country === "us"
          ? [{ label: "California", value: "ca" }]
          : [{ label: "Ontario", value: "on" }]
      )
    );
    render(
      <DynamicForm
        schema={[
          {
            name: "country",
            label: "Country",
            type: FIELD_TYPES.SELECT,
            options: [
              { label: "US", value: "us" },
              { label: "Canada", value: "canada" },
            ],
          },
          { name: "state", label: "State", type: FIELD_TYPES.SELECT, dependsOn: "country", getOptions },
        ]}
        onSubmit={vi.fn()}
      />
    );

    await userEvent.selectOptions(screen.getAllByRole("combobox")[0], "us");
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "California" })).toBeInTheDocument()
    );

    await userEvent.selectOptions(screen.getAllByRole("combobox")[0], "canada");
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Ontario" })).toBeInTheDocument()
    );

    expect(getOptions).toHaveBeenCalledWith("us");
    expect(getOptions).toHaveBeenCalledWith("canada");
  });

  it("select: shows error message when getOptions rejects", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const getOptions = vi.fn(() => Promise.reject(new Error("Network error")));
    render(
      <DynamicForm
        schema={[{ name: "pick", label: "Pick", type: FIELD_TYPES.SELECT, getOptions }]}
        onSubmit={vi.fn()}
      />
    );
    await waitFor(() =>
      expect(screen.getByText("Failed to load options.")).toBeInTheDocument()
    );
    consoleError.mockRestore();
  });

  it("radio: shows error message when getOptions rejects", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const getOptions = vi.fn(() => Promise.reject(new Error("fail")));
    render(
      <DynamicForm
        schema={[{ name: "ans", label: "Answer", type: FIELD_TYPES.RADIO, getOptions }]}
        onSubmit={vi.fn()}
      />
    );
    await waitFor(() =>
      expect(screen.getByText("Failed to load options.")).toBeInTheDocument()
    );
    consoleError.mockRestore();
  });
});
