"use client";

import { useEffect, useRef } from "react";

interface AudioMeterProps {
  analyser: AnalyserNode | null;
  isSpeaking: boolean;
  silenceDuration: number; // seconds of current silence
  speakingRatio: number; // 0-1, ratio of time spent speaking
  avgVolume: number; // 0-100
}

export default function AudioMeter({
  analyser,
  isSpeaking,
  silenceDuration,
  speakingRatio,
  avgVolume,
}: AudioMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        const hue = 35 + (dataArray[i] / 255) * 15; // amber range
        const saturation = 80;
        const lightness = 45 + (dataArray[i] / 255) * 15;
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
        if (x > width) break;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [analyser]);

  const getVolumeLabel = () => {
    if (avgVolume < 15) return { text: "נמוך מדי", color: "text-red-500" };
    if (avgVolume < 30) return { text: "שקט", color: "text-amber-500" };
    if (avgVolume < 70) return { text: "טוב", color: "text-green-500" };
    if (avgVolume < 85) return { text: "חזק", color: "text-amber-500" };
    return { text: "חזק מדי", color: "text-red-500" };
  };

  const volumeLabel = getVolumeLabel();

  return (
    <div className="space-y-3">
      {/* Frequency visualizer */}
      <div className="overflow-hidden rounded-xl bg-gray-900/5 dark:bg-gray-800">
        <canvas
          ref={canvasRef}
          width={300}
          height={60}
          className="h-[60px] w-full"
        />
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-3 gap-2">
        {/* Speaking status */}
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-800">
          <div className={`mb-1 h-3 w-3 rounded-full mx-auto transition-colors ${
            isSpeaking ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-300 dark:bg-gray-600"
          }`} />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {isSpeaking ? "מדבר/ת" : "שקט"}
          </span>
        </div>

        {/* Volume */}
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-800">
          <div className={`text-sm font-bold ${volumeLabel.color}`}>
            {Math.round(avgVolume)}%
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {volumeLabel.text}
          </span>
        </div>

        {/* Speaking ratio */}
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-800">
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {Math.round(speakingRatio * 100)}%
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            זמן דיבור
          </span>
        </div>
      </div>

      {/* Silence warning */}
      {silenceDuration > 5 && (
        <div className="animate-pulse rounded-lg bg-amber-100 px-3 py-2 text-center text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          שקט ארוך — {Math.round(silenceDuration)} שניות. הכל בסדר?
        </div>
      )}

      {/* Good pause feedback */}
      {silenceDuration >= 2 && silenceDuration <= 5 && (
        <div className="rounded-lg bg-green-100 px-3 py-2 text-center text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
          הפסקה טובה — שקט דרמטי עוזר!
        </div>
      )}
    </div>
  );
}
