"use client";

export type ViewMode = "day" | "week" | "month";

interface ViewSwitcherProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const views: { mode: ViewMode; label: string }[] = [
  { mode: "day", label: "Jour" },
  { mode: "week", label: "Semaine" },
  { mode: "month", label: "Mois" },
];

export default function ViewSwitcher({ current, onChange }: ViewSwitcherProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      {views.map(({ mode, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            current === mode
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
