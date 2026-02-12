export interface PracticeSession {
  id: string;
  date: string;
  duration: number; // seconds
  targetDuration: number; // seconds
  wordsPerMinute: number;
  fillerWordCount: number;
  selfRating: number; // 1-5
  notes: string;
  checklist: Record<string, boolean>;
}

export interface UserProgress {
  sessions: PracticeSession[];
  completedTips: string[];
  totalPracticeTime: number; // seconds
  streak: number;
  lastPracticeDate: string;
}

const STORAGE_KEY = "presentation-coach-progress";

export function getProgress(): UserProgress {
  if (typeof window === "undefined") {
    return defaultProgress();
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultProgress();
    return JSON.parse(data);
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function addSession(session: PracticeSession): UserProgress {
  const progress = getProgress();
  progress.sessions.push(session);
  progress.totalPracticeTime += session.duration;

  const today = new Date().toISOString().split("T")[0];
  const lastDate = progress.lastPracticeDate;
  if (lastDate) {
    const diff = daysDiff(lastDate, today);
    if (diff === 1) {
      progress.streak += 1;
    } else if (diff > 1) {
      progress.streak = 1;
    }
  } else {
    progress.streak = 1;
  }
  progress.lastPracticeDate = today;

  saveProgress(progress);
  return progress;
}

export function toggleTipCompleted(tipId: string): UserProgress {
  const progress = getProgress();
  const index = progress.completedTips.indexOf(tipId);
  if (index === -1) {
    progress.completedTips.push(tipId);
  } else {
    progress.completedTips.splice(index, 1);
  }
  saveProgress(progress);
  return progress;
}

function defaultProgress(): UserProgress {
  return {
    sessions: [],
    completedTips: [],
    totalPracticeTime: 0,
    streak: 0,
    lastPracticeDate: "",
  };
}

function daysDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}
