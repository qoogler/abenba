"use client";

import { useState } from "react";
import { Tip } from "@/lib/tips-data";

interface TipCardProps {
  tip: Tip;
  isCompleted: boolean;
  onToggleComplete: (tipId: string) => void;
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  advanced: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const difficultyLabels = {
  beginner: "מתחיל",
  intermediate: "בינוני",
  advanced: "מתקדם",
};

export default function TipCard({ tip, isCompleted, onToggleComplete }: TipCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isCompleted
          ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      }`}
    >
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  difficultyColors[tip.difficulty]
                }`}
              >
                {difficultyLabels[tip.difficulty]}
              </span>
              {isCompleted && (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  הושלם
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {tip.title}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {tip.description}
            </p>
          </div>
          <button
            onClick={() => onToggleComplete(tip.id)}
            className={`mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              isCompleted
                ? "border-green-500 bg-green-500 text-white"
                : "border-gray-300 hover:border-amber-400 dark:border-gray-600"
            }`}
          >
            {isCompleted && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          {isExpanded ? "הסתר פרטים ▲" : "הצג פרטים ▼"}
        </button>

        {isExpanded && (
          <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800">
            {tip.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="mt-0.5 text-amber-500">●</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
