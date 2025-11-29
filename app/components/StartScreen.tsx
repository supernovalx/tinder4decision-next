"use client";

import { useState } from "react";

interface StartScreenProps {
  onStart: (prompt: string) => void;
  isLoading: boolean;
}

export function StartScreen({ onStart, isLoading }: StartScreenProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onStart(prompt.trim());
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30" />
              <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            </div>
            <h1 className="font-sans text-4xl font-bold tracking-tight text-white">
              Decidr
            </h1>
          </div>
          <p className="text-lg text-white/60">
            Swipe your way to clarity. Let AI guide your decisions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-white/80"
            >
              What decision are you trying to make?
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Should I quit my job to start a business? I have 6 months of savings and a promising app idea..."
              className="h-40 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/10"
              disabled={isLoading}
            />
            <p className="text-xs text-white/40">
              Include any relevant context to get more personalized questions.
            </p>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 p-px font-medium text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:shadow-rose-500/30 disabled:opacity-50 disabled:shadow-none"
          >
            <span className="relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-4 transition-all group-hover:from-rose-600 group-hover:to-orange-600">
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>Generating questions...</span>
                </>
              ) : (
                <>
                  <span>Let&apos;s Decide</span>
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Instructions */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="font-medium text-white/90">How it works</h3>
          <div className="space-y-3 text-sm text-white/60">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                1
              </div>
              <p>Describe your decision and any relevant context</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                2
              </div>
              <p>
                Swipe through 10 yes/no questions —{" "}
                <span className="text-emerald-400">right for yes</span>,{" "}
                <span className="text-rose-400">left for no</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                3
              </div>
              <p>Get AI-powered analysis and a recommendation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
  );
}
