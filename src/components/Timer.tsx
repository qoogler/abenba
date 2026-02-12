"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TimerProps {
  targetMinutes: number;
  isRunning: boolean;
  onTimeUpdate: (seconds: number) => void;
  onFinish: () => void;
}

export default function Timer({
  targetMinutes,
  isRunning,
  onTimeUpdate,
  onFinish,
}: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetSeconds = targetMinutes * 60;
  const progress = Math.min((seconds / targetSeconds) * 100, 100);

  const getTimeColor = useCallback(() => {
    const ratio = seconds / targetSeconds;
    if (ratio < 0.75) return "text-green-500";
    if (ratio < 0.9) return "text-amber-500";
    if (ratio <= 1) return "text-orange-500";
    return "text-red-500";
  }, [seconds, targetSeconds]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          onTimeUpdate(next);
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onTimeUpdate]);

  useEffect(() => {
    if (seconds >= targetSeconds && isRunning) {
      onFinish();
    }
  }, [seconds, targetSeconds, isRunning, onFinish]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-52 w-52 items-center justify-center">
        <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            className={`transition-all duration-1000 ${getTimeColor()}`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="text-center">
          <div className={`text-4xl font-bold tabular-nums ${getTimeColor()}`}>
            {formatTime(seconds)}
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            מתוך {formatTime(targetSeconds)}
          </div>
        </div>
      </div>
      {seconds > targetSeconds && (
        <div className="animate-pulse rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
          חריגה מהזמן! +{formatTime(seconds - targetSeconds)}
        </div>
      )}
    </div>
  );
}
