"use client";

import { ScoreBreakdown } from "@/lib/scoring";
import { getSkillLevel, getNextLevel } from "@/lib/scoring";

interface ScoreCardProps {
  score: ScoreBreakdown;
}

const labels: Record<string, string> = {
  practiceFrequency: "תדירות תרגול",
  sessionQuality: "איכות תרגולים",
  tipsProgress: "טיפים שנלמדו",
  consistency: "רצף ימים",
};

export default function ScoreCard({ score }: ScoreCardProps) {
  const level = getSkillLevel(score.total);
  const nextLevel = getNextLevel(score.total);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-6 text-center">
        <div className="mb-2 text-5xl font-bold">
          <span className={`bg-gradient-to-l ${level.color} bg-clip-text text-transparent`}>
            {score.total}
          </span>
          <span className="text-lg text-gray-400">/100</span>
        </div>
        <div className={`text-lg font-bold bg-gradient-to-l ${level.color} bg-clip-text text-transparent`}>
          {level.name}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{level.description}</div>
      </div>

      {nextLevel && (
        <div className="mb-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">התקדמות לרמה הבאה</span>
            <span className="font-bold text-gray-900 dark:text-white">{nextLevel.name}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full rounded-full bg-gradient-to-l ${nextLevel.color} transition-all duration-500`}
              style={{
                width: `${Math.min(
                  100,
                  ((score.total - level.range[0]) /
                    (nextLevel.range[0] - level.range[0])) *
                    100
                )}%`,
              }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            עוד {nextLevel.range[0] - score.total} נקודות
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(["practiceFrequency", "sessionQuality", "tipsProgress", "consistency"] as const).map(
          (key) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{labels[key]}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {score[key]}/25
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${(score[key] / 25) * 100}%` }}
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
