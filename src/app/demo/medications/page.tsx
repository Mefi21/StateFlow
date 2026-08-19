import { MedicationsView } from "@/features/medications/medications-view";
export default function DemoMedicationsPage() {
  return (
    <MedicationsView
      demo
      initialItems={[
        {
          id: "demo-med",
          name: "Synthetic medication",
          genericName: "Demo-only record",
          unit: "мг",
          dose: 50,
          schedule: "утром",
          startDate: "2026-05-18",
        },
      ]}
    />
  );
}
