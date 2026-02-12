"use client";

import { useEffect, useState } from "react";
import TipCard from "@/components/TipCard";
import { tips, categories, Tip } from "@/lib/tips-data";
import { getProgress, toggleTipCompleted, UserProgress } from "@/lib/storage";

type CategoryKey = Tip["category"];

export default function TipsPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey | "all">("all");
  const [activeDifficulty, setActiveDifficulty] = useState<Tip["difficulty"] | "all">("all");

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const handleToggle = (tipId: string) => {
    const updated = toggleTipCompleted(tipId);
    setProgress(updated);
  };

  const filteredTips = tips.filter((tip) => {
    if (activeCategory !== "all" && tip.category !== activeCategory) return false;
    if (activeDifficulty !== "all" && tip.difficulty !== activeDifficulty) return false;
    return true;
  });

  const completedCount = progress?.completedTips.length ?? 0;
  const totalPercent = Math.round((completedCount / tips.length) * 100);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          טיפים וטכניקות
        </h1>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {completedCount}/{tips.length} ({totalPercent}%)
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-500 transition-all duration-500"
          style={{ width: `${totalPercent}%` }}
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          הכל
        </button>
        {(Object.keys(categories) as CategoryKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeCategory === key
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {categories[key].icon} {categories[key].label}
          </button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2">
        {(
          [
            { key: "all", label: "כל הרמות" },
            { key: "beginner", label: "מתחיל" },
            { key: "intermediate", label: "בינוני" },
            { key: "advanced", label: "מתקדם" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveDifficulty(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeDifficulty === key
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tips list */}
      <div className="space-y-4">
        {filteredTips.map((tip) => (
          <TipCard
            key={tip.id}
            tip={tip}
            isCompleted={progress?.completedTips.includes(tip.id) ?? false}
            onToggleComplete={handleToggle}
          />
        ))}
        {filteredTips.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">לא נמצאו טיפים בקטגוריה זו</p>
          </div>
        )}
      </div>
    </div>
  );
}
