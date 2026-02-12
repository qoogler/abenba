"use client";

import { useEffect, useState } from "react";
import ScoreCard from "@/components/ScoreCard";
import { getProgress, UserProgress } from "@/lib/storage";
import { calculateScore, ScoreBreakdown } from "@/lib/scoring";
import { skillLevels } from "@/lib/tips-data";

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [score, setScore] = useState<ScoreBreakdown | null>(null);

  useEffect(() => {
    const p = getProgress();
    setProgress(p);
    setScore(calculateScore(p));
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
        התקדמות
      </h1>

      {score && <ScoreCard score={score} />}

      {/* Skill Levels Roadmap */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          מפת הדרך לאולם הפרו
        </h2>
        <div className="space-y-3">
          {skillLevels.map((level) => {
            const isCurrentLevel =
              score && score.total >= level.range[0] && score.total <= level.range[1];
            const isPassed = score && score.total > level.range[1];
            return (
              <div
                key={level.name}
                className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
                  isCurrentLevel
                    ? "border-2 border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/20"
                    : isPassed
                    ? "bg-green-50/50 dark:bg-green-900/10"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-bl ${level.color} text-lg font-bold text-white`}
                >
                  {isPassed ? "✓" : level.range[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {level.name}
                    </span>
                    {isCurrentLevel && (
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                        אתם כאן
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {level.description} · {level.range[0]}-{level.range[1]} נקודות
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practice History */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          היסטוריית תרגולים
        </h2>
        {progress && progress.sessions.length > 0 ? (
          <div className="space-y-3">
            {[...progress.sessions].reverse().map((session) => {
              const checklistCount = Object.values(session.checklist).filter(Boolean).length;
              const checklistTotal = Object.keys(session.checklist).length;
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg dark:bg-amber-900/30">
                    🎤
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDuration(session.duration)}
                      </span>
                      <span className="text-sm text-gray-400">
                        מתוך {formatDuration(session.targetDuration)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(session.date)}
                      {checklistTotal > 0 && (
                        <span className="mr-2">
                          · צ׳קליסט: {checklistCount}/{checklistTotal}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < session.selfRating
                            ? "text-amber-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 p-8 text-center dark:bg-gray-800">
            <div className="mb-3 text-4xl">🎯</div>
            <p className="mb-1 font-medium text-gray-900 dark:text-white">
              עוד אין תרגולים
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              התחילו לתרגל כדי לראות את ההתקדמות שלכם כאן
            </p>
            <a
              href="/practice"
              className="mt-4 inline-block rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              תרגול ראשון
            </a>
          </div>
        )}
      </div>

      {/* Tips for improvement */}
      {score && score.total < 86 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
          <h2 className="mb-3 text-lg font-bold text-amber-800 dark:text-amber-300">
            איך להגיע לאולם הפרו?
          </h2>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
            {score.practiceFrequency < 20 && (
              <li>● תרגלו עוד הרצאות — צריך לפחות 10 תרגולים לניקוד מלא</li>
            )}
            {score.sessionQuality < 20 && (
              <li>● שפרו את איכות התרגולים — שאפו לדירוג עצמי של 4+ כוכבים</li>
            )}
            {score.tipsProgress < 20 && (
              <li>● למדו ויישמו את הטיפים — סמנו טיפים שהשלמתם</li>
            )}
            {score.consistency < 20 && (
              <li>● שמרו על רצף — תרגלו כל יום כדי לבנות רצף של 7+ ימים</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
