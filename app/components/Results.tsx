"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { analyzeDecision, QuestionItem } from "../actions";

interface ResultsProps {
  prompt: string;
  questions: QuestionItem[];
  answers: boolean[];
  onRestart: () => void;
}

// Circular progress component with animation
function CircularProgress({
  value,
  size = 180,
  strokeWidth = 12,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const getGradientColors = () => {
    if (value >= 70) return { start: "#10b981", end: "#34d399" }; // emerald
    if (value >= 40) return { start: "#f59e0b", end: "#fbbf24" }; // amber
    return { start: "#ef4444", end: "#f87171" }; // rose
  };

  const colors = getGradientColors();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-5xl font-bold tabular-nums ${
            value >= 70
              ? "text-emerald-400"
              : value >= 40
              ? "text-amber-400"
              : "text-rose-400"
          }`}
        >
          {animatedValue}
        </span>
        <span className="text-sm text-white/50">confidence</span>
      </div>
    </div>
  );
}

// Animated reveal wrapper
function RevealOnMount({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Results({
  prompt,
  questions,
  answers,
  onRestart,
}: ResultsProps) {
  const {
    mutate: analyze,
    data,
    isPending,
    error,
  } = useMutation({
    mutationFn: () => analyzeDecision(prompt, questions, answers),
  });

  useEffect(() => {
    analyze();
  }, [analyze]);

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-8 text-center">
          {/* Animated orbs */}
          <div className="relative mx-auto h-40 w-40">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 blur-xl" />
            <div className="absolute inset-4 animate-pulse rounded-full bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40 blur-lg" style={{ animationDelay: "150ms" }} />
            <div className="absolute inset-8 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm">
              <div className="relative">
                <svg
                  className="h-16 w-16 animate-spin text-violet-400"
                  style={{ animationDuration: "3s" }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    className="opacity-80"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🔮</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent">
              Analyzing your responses...
            </h2>
            <p className="text-white/50">
              Our AI is carefully considering your answers to provide the best recommendation
            </p>
          </div>

          {/* Loading dots */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-6 text-center">
          <div className="relative mx-auto h-28 w-28">
            <div className="absolute inset-0 animate-pulse rounded-full bg-rose-500/20 blur-xl" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 backdrop-blur-sm">
              <svg
                className="h-12 w-12 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-white/50">
              {error instanceof Error ? error.message : "Failed to analyze your responses"}
            </p>
          </div>
          <button
            onClick={() => analyze()}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-medium text-white transition-all hover:bg-white/20 hover:scale-105"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const yesCount = answers.filter(Boolean).length;
  const noCount = answers.filter((a) => !a).length;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-8 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Hero Section - Confidence + Verdict */}
        <RevealOnMount delay={100}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur-xl">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/20 blur-3xl" />

            <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
              {/* Circular Gauge */}
              <div className="shrink-0">
                <CircularProgress value={data.confidence} />
              </div>

              {/* Verdict */}
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    AI Recommendation
                  </div>
                  <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-2xl font-bold leading-tight text-transparent sm:text-3xl">
                    {data.recommendation}
                  </h1>
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-emerald-400">{yesCount} Yes</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1.5">
                    <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm font-medium text-rose-400">{noCount} No</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnMount>

        {/* Reasoning Card */}
        <RevealOnMount delay={400}>
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.07]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                  <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Why This Recommendation?</h3>
              </div>

              <p className="leading-relaxed text-white/70">{data.reasoning}</p>
            </div>
          </div>
        </RevealOnMount>

        {/* Answers Breakdown */}
        <RevealOnMount delay={600}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <button
              className="group flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
              onClick={(e) => {
                const details = e.currentTarget.nextElementSibling;
                if (details) {
                  details.classList.toggle("hidden");
                  e.currentTarget.querySelector("svg")?.classList.toggle("rotate-180");
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <svg className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Your Answers</h3>
                  <p className="text-sm text-white/50">{questions.length} questions answered</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-white/40 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="border-t border-white/10 p-4">
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        answers[i]
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {answers[i] ? "✓" : "✗"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{q.emoji}</span>
                        <span className="text-sm text-white/70 group-hover/item:text-white/90">
                          {q.question}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        answers[i]
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {answers[i] ? "Yes" : "No"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealOnMount>

        {/* Action Buttons */}
        <RevealOnMount delay={800}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onRestart}
              className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 p-px font-medium text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:shadow-rose-500/30"
            >
              <span className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-4 transition-all group-hover:from-rose-600 group-hover:to-orange-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Make Another Decision
              </span>
            </button>

            <button
              onClick={() => {
                const text = `Decision: ${prompt}\n\nRecommendation: ${data.recommendation}\n\nConfidence: ${data.confidence}%\n\nReasoning: ${data.reasoning}`;
                navigator.clipboard.writeText(text);
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
        </RevealOnMount>

        {/* Footer branding */}
        <RevealOnMount delay={1000}>
          <div className="flex items-center justify-center gap-2 pt-4 text-sm text-white/30">
            <span>Powered by</span>
            <span className="font-semibold text-white/50">Decidr</span>
            <span className="text-lg">✨</span>
          </div>
        </RevealOnMount>
      </div>
    </div>
  );
}
