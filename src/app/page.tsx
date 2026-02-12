"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress, UserProgress } from "@/lib/storage";
import { calculateScore, getSkillLevel, getNextLevel } from "@/lib/scoring";
import { tips } from "@/lib/tips-data";

export default function Home() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const score = progress ? calculateScore(progress) : null;
  const level = score ? getSkillLevel(score.total) : null;
  const nextLevel = score ? getNextLevel(score.total) : null;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-amber-500 via-orange-500 to-red-500 p-8 text-white shadow-xl sm:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative">
          <h1 className="mb-3 text-3xl font-extrabold sm:text-4xl">
            מאמן הרצאות
          </h1>
          <p className="mb-6 max-w-lg text-lg text-white/90">
            הדרך שלך לאולם הפרו. תרגלו, למדו טכניקות, ועקבו אחרי ההתקדמות שלכם עד שתגיעו לרמה הגבוהה ביותר.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/practice"
              className="animate-pulse-glow rounded-full bg-white px-6 py-3 font-bold text-orange-600 shadow-lg transition-transform hover:scale-105"
            >
              התחילו תרגול
            </Link>
            <Link
              href="/tips"
              className="rounded-full border-2 border-white/40 px-6 py-3 font-bold text-white transition-colors hover:bg-white/10"
            >
              טיפים וטכניקות
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="🎯"
          label="תרגולים"
          value={progress?.sessions.length ?? 0}
          suffix=""
        />
        <StatCard
          icon="⏱️"
          label="זמן תרגול"
          value={Math.round((progress?.totalPracticeTime ?? 0) / 60)}
          suffix="דקות"
        />
        <StatCard
          icon="🔥"
          label="רצף ימים"
          value={progress?.streak ?? 0}
          suffix=""
        />
        <StatCard
          icon="📈"
          label="ציון כולל"
          value={score?.total ?? 0}
          suffix="/100"
        />
      </section>

      {/* Level Progress */}
      {level && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            הרמה שלך
          </h2>
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-bl ${level.color} text-2xl font-bold text-white shadow-lg`}>
              {score!.total}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold bg-gradient-to-l ${level.color} bg-clip-text text-transparent`}>
                  {level.name}
                </span>
                {nextLevel && (
                  <span className="text-sm text-gray-400">
                    ← {nextLevel.name}
                  </span>
                )}
              </div>
              {nextLevel && (
                <>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full bg-gradient-to-l ${nextLevel.color} transition-all duration-700`}
                      style={{
                        width: `${Math.min(
                          100,
                          ((score!.total - level.range[0]) /
                            (nextLevel.range[0] - level.range[0])) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    עוד {nextLevel.range[0] - score!.total} נקודות לרמת {nextLevel.name}
                  </p>
                </>
              )}
              {!nextLevel && (
                <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                  הגעתם לאולם הפרו! כל הכבוד!
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          מה עושים עכשיו?
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard
            href="/practice"
            icon="🎤"
            title="תרגלו הרצאה"
            description="הפעילו טיימר, תרגלו ודרגו את עצמכם"
          />
          <ActionCard
            href="/tips"
            icon="💡"
            title="למדו טכניקות"
            description={`${tips.length} טיפים מעשיים לשיפור ההרצאות`}
          />
          <ActionCard
            href="/progress"
            icon="📊"
            title="צפו בהתקדמות"
            description="ניתוח מפורט של הביצועים שלכם"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: string;
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
        {suffix && <span className="mr-1 text-sm text-gray-400">{suffix}</span>}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:hover:border-amber-600"
    >
      <div className="mb-3 text-3xl transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-1 font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </Link>
  );
}
