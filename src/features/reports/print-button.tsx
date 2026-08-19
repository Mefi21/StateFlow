"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="print-hint">
      Печать → Save as PDF
    </button>
  );
}
