// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SnapshotForm } from "./snapshot-form";

describe("SnapshotForm", () => {
  it("keeps pleasure and future wanting as independent accessible controls", () => {
    render(<SnapshotForm demo />);
    const wanting = screen.getByLabelText(
      "Хочу своего будущего",
    ) as HTMLInputElement;
    const pleasure = screen.getByLabelText(
      "Удовольствие сейчас",
    ) as HTMLInputElement;
    expect(wanting).not.toBe(pleasure);
    expect(wanting.value).toBe("5");
    expect(pleasure.value).toBe("5");
  });

  it("exposes sensitive metrics without diagnostic copy", () => {
    render(<SnapshotForm demo />);
    expect(screen.getByLabelText("Мысли о смерти")).toBeTruthy();
    expect(screen.getByLabelText("Желание причинить себе вред")).toBeTruthy();
    expect(screen.queryByText(/депресси|гипомани|диагноз/i)).toBeNull();
  });
});
