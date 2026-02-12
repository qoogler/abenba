import { UserProgress } from "./storage";
import { tips, skillLevels } from "./tips-data";

export interface ScoreBreakdown {
  practiceFrequency: number; // 0-25
  sessionQuality: number; // 0-25
  tipsProgress: number; // 0-25
  consistency: number; // 0-25
  total: number; // 0-100
}

export function calculateScore(progress: UserProgress): ScoreBreakdown {
  const practiceFrequency = calcPracticeFrequency(progress);
  const sessionQuality = calcSessionQuality(progress);
  const tipsProgress = calcTipsProgress(progress);
  const consistency = calcConsistency(progress);

  const total = practiceFrequency + sessionQuality + tipsProgress + consistency;

  return { practiceFrequency, sessionQuality, tipsProgress, consistency, total };
}

function calcPracticeFrequency(progress: UserProgress): number {
  const count = progress.sessions.length;
  // 10+ sessions = full score
  return Math.min(25, Math.round((count / 10) * 25));
}

function calcSessionQuality(progress: UserProgress): number {
  if (progress.sessions.length === 0) return 0;
  const avgRating =
    progress.sessions.reduce((sum, s) => sum + s.selfRating, 0) /
    progress.sessions.length;
  // avg rating of 4+ = full score
  return Math.min(25, Math.round((avgRating / 4) * 25));
}

function calcTipsProgress(progress: UserProgress): number {
  const total = tips.length;
  const completed = progress.completedTips.length;
  return Math.min(25, Math.round((completed / total) * 25));
}

function calcConsistency(progress: UserProgress): number {
  // streak of 7+ = full score
  return Math.min(25, Math.round((progress.streak / 7) * 25));
}

export function getSkillLevel(score: number) {
  for (const level of [...skillLevels].reverse()) {
    if (score >= level.range[0]) {
      return level;
    }
  }
  return skillLevels[0];
}

export function getNextLevel(score: number) {
  const currentLevel = getSkillLevel(score);
  const currentIndex = skillLevels.findIndex((l) => l.name === currentLevel.name);
  if (currentIndex < skillLevels.length - 1) {
    return skillLevels[currentIndex + 1];
  }
  return null;
}
