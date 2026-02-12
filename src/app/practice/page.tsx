"use client";

import { useState, useCallback } from "react";
import Timer from "@/components/Timer";
import PracticeChecklist from "@/components/PracticeChecklist";
import { addSession, PracticeSession } from "@/lib/storage";

type Phase = "setup" | "practicing" | "review" | "saved";

export default function PracticePage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [targetMinutes, setTargetMinutes] = useState(5);
  const [topic, setTopic] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [selfRating, setSelfRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [fillerCount, setFillerCount] = useState(0);

  const handleTimeUpdate = useCallback((seconds: number) => {
    setElapsedSeconds(seconds);
  }, []);

  const handleTimerFinish = useCallback(() => {
    // Timer reached target — don't auto-stop, let user decide
  }, []);

  const startPractice = () => {
    setPhase("practicing");
    setIsTimerRunning(true);
  };

  const stopPractice = () => {
    setIsTimerRunning(false);
    setPhase("review");
  };

  const pauseResume = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const savePractice = () => {
    const session: PracticeSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: elapsedSeconds,
      targetDuration: targetMinutes * 60,
      wordsPerMinute: 0,
      fillerWordCount: fillerCount,
      selfRating,
      notes,
      checklist,
    };
    addSession(session);
    setPhase("saved");
  };

  const resetPractice = () => {
    setPhase("setup");
    setElapsedSeconds(0);
    setChecklist({});
    setSelfRating(3);
    setNotes("");
    setFillerCount(0);
    setTopic("");
    setIsTimerRunning(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
        תרגול הרצאה
      </h1>

      {/* Setup Phase */}
      {phase === "setup" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              הגדרת תרגול
            </h2>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                נושא ההרצאה (אופציונלי)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="למשל: הצגת פרויקט לצוות"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                זמן יעד (דקות)
              </label>
              <div className="flex flex-wrap gap-2">
                {[3, 5, 10, 15, 20, 30].map((min) => (
                  <button
                    key={min}
                    onClick={() => setTargetMinutes(min)}
                    className={`rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                      targetMinutes === min
                        ? "bg-gradient-to-l from-amber-500 to-orange-500 text-white shadow-lg"
                        : "border border-gray-300 bg-white text-gray-700 hover:border-amber-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {min} דק׳
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
              <h3 className="mb-2 text-sm font-bold text-amber-800 dark:text-amber-300">
                טיפ לפני שמתחילים
              </h3>
              <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
                <li>● עמדו כאילו אתם על הבמה — לא יושבים</li>
                <li>● דברו בקול רם כאילו יש קהל</li>
                <li>● נסו לא להסתכל על פתקים</li>
                <li>● הקליטו את עצמכם אם אפשר</li>
              </ul>
            </div>

            <button
              onClick={startPractice}
              className="mt-6 w-full rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              התחילו תרגול
            </button>
          </div>
        </div>
      )}

      {/* Practicing Phase */}
      {phase === "practicing" && (
        <div className="space-y-6">
          {topic && (
            <div className="text-center text-lg text-gray-600 dark:text-gray-400">
              נושא: <span className="font-bold text-gray-900 dark:text-white">{topic}</span>
            </div>
          )}

          <div className="flex justify-center">
            <Timer
              targetMinutes={targetMinutes}
              isRunning={isTimerRunning}
              onTimeUpdate={handleTimeUpdate}
              onFinish={handleTimerFinish}
            />
          </div>

          {/* Filler word counter */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">מילות מילוי:</span>
            <button
              onClick={() => setFillerCount((c) => Math.max(0, c - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              -
            </button>
            <span className="min-w-[3ch] text-center text-2xl font-bold text-gray-900 dark:text-white">
              {fillerCount}
            </span>
            <button
              onClick={() => setFillerCount((c) => c + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              +
            </button>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={pauseResume}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {isTimerRunning ? "השהה" : "המשך"}
            </button>
            <button
              onClick={stopPractice}
              className="rounded-xl bg-gradient-to-l from-red-500 to-red-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              סיום תרגול
            </button>
          </div>
        </div>
      )}

      {/* Review Phase */}
      {phase === "review" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              סיכום תרגול
            </h2>
            <div className="mb-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                </div>
                <div className="text-sm text-gray-500">זמן תרגול</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {targetMinutes}:00
                </div>
                <div className="text-sm text-gray-500">זמן יעד</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {fillerCount}
                </div>
                <div className="text-sm text-gray-500">מילות מילוי</div>
              </div>
            </div>

            {/* Self rating */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                איך הייתה ההרצאה?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelfRating(star)}
                    className={`text-3xl transition-transform hover:scale-110 ${
                      star <= selfRating ? "text-amber-400" : "text-gray-300 dark:text-gray-600"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="mt-1 text-center text-sm text-gray-500">
                {["", "צריך שיפור", "בסדר", "טוב", "טוב מאוד", "מעולה"][selfRating]}
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                הערות ותובנות
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="מה הלך טוב? מה אפשר לשפר?"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <PracticeChecklist onChecklistChange={setChecklist} />

          <div className="flex gap-3">
            <button
              onClick={savePractice}
              className="flex-1 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              שמור תרגול
            </button>
            <button
              onClick={resetPractice}
              className="rounded-xl border border-gray-300 px-6 py-4 font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Saved Phase */}
      {phase === "saved" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-900/20">
          <div className="mb-4 text-5xl">🎉</div>
          <h2 className="mb-2 text-2xl font-bold text-green-800 dark:text-green-300">
            תרגול נשמר בהצלחה!
          </h2>
          <p className="mb-6 text-green-700 dark:text-green-400">
            כל תרגול מקרב אתכם לאולם הפרו. המשיכו ככה!
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={resetPractice}
              className="rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              תרגול נוסף
            </button>
            <a
              href="/progress"
              className="rounded-xl border border-gray-300 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              צפו בהתקדמות
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
