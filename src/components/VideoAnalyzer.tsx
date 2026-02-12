"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import AudioMeter from "./AudioMeter";

export interface VideoAnalysisStats {
  avgVolume: number;
  speakingRatio: number;
  totalSilenceEvents: number; // silences > 5s
  goodPauses: number; // silences 2-5s
  peakVolume: number;
  recordingUrl: string | null;
}

interface VideoAnalyzerProps {
  isSessionActive: boolean;
  onStatsUpdate: (stats: VideoAnalysisStats) => void;
}

const SILENCE_THRESHOLD = 12; // audio level below this = silence
const ANALYSIS_INTERVAL = 100; // ms

export default function VideoAnalyzer({
  isSessionActive,
  onStatsUpdate,
}: VideoAnalyzerProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Audio analysis state
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceDuration, setSilenceDuration] = useState(0);
  const [speakingRatio, setSpeakingRatio] = useState(0);
  const [avgVolume, setAvgVolume] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analysisRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tracking refs
  const speakingFramesRef = useRef(0);
  const totalFramesRef = useRef(0);
  const silenceStartRef = useRef<number | null>(null);
  const totalSilenceEventsRef = useRef(0);
  const goodPausesRef = useRef(0);
  const volumeSumRef = useRef(0);
  const volumeCountRef = useRef(0);
  const peakVolumeRef = useRef(0);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Set up audio analysis
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      // Set up recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: getSupportedMimeType(),
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: getSupportedMimeType() });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
      };

      setIsEnabled(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setHasPermission(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (analysisRef.current) {
      clearInterval(analysisRef.current);
      analysisRef.current = null;
    }
    setAnalyser(null);
    setIsEnabled(false);
    setIsSpeaking(false);
    setSilenceDuration(0);
  }, []);

  // Start/stop recording with session
  useEffect(() => {
    if (!isEnabled || !mediaRecorderRef.current) return;

    if (isSessionActive) {
      // Reset tracking
      speakingFramesRef.current = 0;
      totalFramesRef.current = 0;
      silenceStartRef.current = null;
      totalSilenceEventsRef.current = 0;
      goodPausesRef.current = 0;
      volumeSumRef.current = 0;
      volumeCountRef.current = 0;
      peakVolumeRef.current = 0;
      chunksRef.current = [];
      setRecordingUrl(null);

      if (mediaRecorderRef.current.state === "inactive") {
        mediaRecorderRef.current.start(1000); // collect data every 1s
      }
    } else {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();

        // Send final stats
        const ratio =
          totalFramesRef.current > 0
            ? speakingFramesRef.current / totalFramesRef.current
            : 0;
        const avg =
          volumeCountRef.current > 0
            ? volumeSumRef.current / volumeCountRef.current
            : 0;

        onStatsUpdate({
          avgVolume: avg,
          speakingRatio: ratio,
          totalSilenceEvents: totalSilenceEventsRef.current,
          goodPauses: goodPausesRef.current,
          peakVolume: peakVolumeRef.current,
          recordingUrl: null, // will be set after onstop fires
        });
      }
    }
  }, [isSessionActive, isEnabled, onStatsUpdate]);

  // Real-time audio analysis
  useEffect(() => {
    if (!analyser || !isSessionActive) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    analysisRef.current = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate current volume (average of frequency data)
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const currentVolume = (sum / dataArray.length / 255) * 100;

      totalFramesRef.current += 1;
      volumeSumRef.current += currentVolume;
      volumeCountRef.current += 1;

      if (currentVolume > peakVolumeRef.current) {
        peakVolumeRef.current = currentVolume;
      }

      const speaking = currentVolume > SILENCE_THRESHOLD;
      setIsSpeaking(speaking);

      if (speaking) {
        speakingFramesRef.current += 1;

        // Check if we're ending a silence period
        if (silenceStartRef.current !== null) {
          const silLen = (Date.now() - silenceStartRef.current) / 1000;
          if (silLen >= 2 && silLen <= 5) {
            goodPausesRef.current += 1;
          } else if (silLen > 5) {
            totalSilenceEventsRef.current += 1;
          }
          silenceStartRef.current = null;
          setSilenceDuration(0);
        }
      } else {
        // Track silence
        if (silenceStartRef.current === null) {
          silenceStartRef.current = Date.now();
        }
        const silLen = (Date.now() - silenceStartRef.current) / 1000;
        setSilenceDuration(silLen);
      }

      // Update displayed stats
      const ratio =
        totalFramesRef.current > 0
          ? speakingFramesRef.current / totalFramesRef.current
          : 0;
      setSpeakingRatio(ratio);
      setAvgVolume(currentVolume);
    }, ANALYSIS_INTERVAL);

    return () => {
      if (analysisRef.current) {
        clearInterval(analysisRef.current);
        analysisRef.current = null;
      }
    };
  }, [analyser, isSessionActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isEnabled) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
          ניתוח וידאו בזמן אמת
        </h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          הפעילו את המצלמה כדי לקבל משוב חי על עוצמת הקול, קצב הדיבור, הפסקות, ולהקליט את התרגול לצפייה חוזרת.
        </p>

        {hasPermission === false && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            הגישה למצלמה נדחתה. אנא אפשרו גישה למצלמה ולמיקרופון בהגדרות הדפדפן.
          </div>
        )}

        <button
          onClick={startCamera}
          className="w-full rounded-xl bg-gradient-to-l from-blue-500 to-indigo-600 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          הפעלת מצלמה ומיקרופון
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${
              isSessionActive ? "bg-red-500 animate-pulse" : "bg-green-500"
            }`} />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {isSessionActive ? "מקליט..." : "מצלמה פעילה"}
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMirrored(!isMirrored)}
              className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              title="הפוך תמונה"
            >
              {isMirrored ? "↔️" : "🔄"}
            </button>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {showAnalysis ? "הסתר ניתוח" : "הצג ניתוח"}
            </button>
            <button
              onClick={stopCamera}
              className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              כבה
            </button>
          </div>
        </div>

        {/* Video feed */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-auto w-full ${isMirrored ? "scale-x-[-1]" : ""}`}
          />

          {/* Live overlay indicators */}
          {isSessionActive && (
            <>
              {/* Recording indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                REC
              </div>

              {/* Volume indicator bar on the side */}
              <div className="absolute bottom-3 left-3 top-3 w-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className={`absolute bottom-0 w-full rounded-full transition-all duration-100 ${
                    avgVolume < 15
                      ? "bg-red-400"
                      : avgVolume < 70
                      ? "bg-green-400"
                      : "bg-amber-400"
                  }`}
                  style={{ height: `${Math.min(100, avgVolume)}%` }}
                />
              </div>

              {/* Speaking status overlay */}
              <div className={`absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm transition-all ${
                isSpeaking
                  ? "bg-green-500/80 text-white"
                  : "bg-gray-800/60 text-gray-300"
              }`}>
                {isSpeaking ? "🗣️ מדבר/ת" : "🤫 שקט"}
              </div>
            </>
          )}
        </div>

        {/* Audio analysis panel */}
        {showAnalysis && isSessionActive && (
          <div className="border-t border-gray-100 p-4 dark:border-gray-800">
            <AudioMeter
              analyser={analyser}
              isSpeaking={isSpeaking}
              silenceDuration={silenceDuration}
              speakingRatio={speakingRatio}
              avgVolume={avgVolume}
            />
          </div>
        )}
      </div>

      {/* Recording playback */}
      {recordingUrl && !isSessionActive && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
            צפו בתרגול
          </h3>
          <video
            src={recordingUrl}
            controls
            className={`w-full rounded-xl ${isMirrored ? "scale-x-[-1]" : ""}`}
          />
          <div className="mt-3 flex gap-2">
            <a
              href={recordingUrl}
              download={`practice-${new Date().toISOString().slice(0, 10)}.webm`}
              className="flex-1 rounded-lg bg-gray-100 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              הורדה
            </a>
            <button
              onClick={() => {
                URL.revokeObjectURL(recordingUrl);
                setRecordingUrl(null);
              }}
              className="rounded-lg px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              מחק
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "video/webm";
}
