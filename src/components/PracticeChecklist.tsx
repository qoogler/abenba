"use client";

import { useState } from "react";

const checklistItems = [
  { id: "opening", label: "פתחתי עם פתיחה חזקה (סיפור / שאלה / נתון)" },
  { id: "structure", label: "שמרתי על מבנה ברור — 3 נקודות מרכזיות" },
  { id: "pace", label: "דיברתי בקצב מתאים — לא מהר מדי" },
  { id: "filler", label: "צמצמתי מילות מילוי (אממ, כאילו, בעצם)" },
  { id: "eye-contact", label: "שמרתי על קשר עין עם הקהל" },
  { id: "body", label: "השתמשתי בשפת גוף פתוחה ותנועות מכוונות" },
  { id: "voice", label: "שיניתי טון וקצב — לא מונוטוני" },
  { id: "engagement", label: "שאלתי שאלות או שיתפתי את הקהל" },
  { id: "closing", label: "סיימתי עם סיכום וקריאה לפעולה" },
  { id: "time", label: "עמדתי בזמן שהוקצב" },
];

interface PracticeChecklistProps {
  onChecklistChange: (checklist: Record<string, boolean>) => void;
}

export default function PracticeChecklist({ onChecklistChange }: PracticeChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    const updated = { ...checked, [id]: !checked[id] };
    setChecked(updated);
    onChecklistChange(updated);
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const percentage = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          רשימת בדיקה
        </h3>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {completedCount}/{checklistItems.length} ({percentage}%)
        </span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="space-y-2">
        {checklistItems.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => toggle(item.id)}
              className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
            />
            <span
              className={`text-sm ${
                checked[item.id]
                  ? "text-gray-400 line-through dark:text-gray-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
