"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { analyzeDecision } from "../actions";

interface ResultsProps {
  prompt: string;
  questions: string[];
  answers: boolean[];
  onRestart: () => void;
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
          <div className="space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <svg
                className="h-10 w-10 animate-spin text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Analyzing your responses...
            </h2>
            <p className="text-white/60">
              Our AI is carefully considering your answers
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-6 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20">
            <svg
              className="h-10 w-10 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-white/60">
            {error instanceof Error ? error.message : "Failed to analyze your responses"}
          </p>
          <button
            onClick={() => analyze()}
            className="rounded-full bg-white/10 px-6 py-3 font-medium text-white transition-all hover:bg-white/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const confidenceColor =
    data.confidence >= 70
      ? "text-emerald-400"
      : data.confidence >= 40
      ? "text-amber-400"
      : "text-rose-400";

  const confidenceBg =
    data.confidence >= 70
      ? "from-emerald-500"
      : data.confidence >= 40
      ? "from-amber-500"
      : "from-rose-500";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <svg
              className="h-8 w-8 text-violet-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Your Analysis</h2>
        </div>

        {/* Confidence Score */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Confidence Score</span>
            <span className={`text-3xl font-bold ${confidenceColor}`}>
              {data.confidence}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${confidenceBg} to-transparent transition-all duration-1000`}
              style={{ width: `${data.confidence}%` }}
            />
          </div>
        </div>

        {/* Recommendation */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6 backdrop-blur-sm">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white/80">
            <svg
              className="h-5 w-5 text-violet-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Recommendation
          </h3>
          <p className="text-lg font-medium leading-relaxed text-white">
            {data.recommendation}
          </p>
        </div>

        {/* Reasoning */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white/80">
            <svg
              className="h-5 w-5 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Reasoning
          </h3>
          <p className="leading-relaxed text-white/70">{data.reasoning}</p>
        </div>

        {/* Your Answers Summary */}
        <details className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <summary className="cursor-pointer list-none p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">
                Your Answers ({answers.filter(Boolean).length} Yes,{" "}
                {answers.filter((a) => !a).length} No)
              </span>
              <svg
                className="h-5 w-5 text-white/40 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </summary>
          <div className="space-y-2 border-t border-white/10 p-4">
            {questions.map((q, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    answers[i]
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {answers[i] ? "Yes" : "No"}
                </span>
                <span className="text-white/60">{q}</span>
              </div>
            ))}
          </div>
        </details>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-medium text-white transition-all hover:bg-white/10"
        >
          Make Another Decision
        </button>
      </div>
    </div>
  );
}

