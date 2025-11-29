"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { generateQuestions, QuestionItem } from "./actions";
import { CardSwiper } from "./components/CardSwiper";
import { Results } from "./components/Results";
import { StartScreen } from "./components/StartScreen";

type AppState =
  | { phase: "start" }
  | { phase: "swipe"; prompt: string; questions: QuestionItem[] }
  | { phase: "results"; prompt: string; questions: QuestionItem[]; answers: boolean[] };

export default function Home() {
  const [state, setState] = useState<AppState>({ phase: "start" });

  const { mutate: startDecision, isPending } = useMutation({
    mutationFn: generateQuestions,
    onSuccess: (data, prompt) => {
      setState({
        phase: "swipe",
        prompt,
        questions: data.questions,
      });
    },
  });

  const handleStart = (prompt: string) => {
    startDecision(prompt);
  };

  const handleSwipeComplete = (answers: boolean[]) => {
    if (state.phase === "swipe") {
      setState({
        phase: "results",
        prompt: state.prompt,
        questions: state.questions,
        answers,
      });
    }
  };

  const handleRestart = () => {
    setState({ phase: "start" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {state.phase === "start" && (
          <StartScreen onStart={handleStart} isLoading={isPending} />
        )}

        {state.phase === "swipe" && (
          <CardSwiper
            questions={state.questions}
            onComplete={handleSwipeComplete}
          />
        )}

        {state.phase === "results" && (
          <Results
            prompt={state.prompt}
            questions={state.questions}
            answers={state.answers}
            onRestart={handleRestart}
          />
        )}
      </div>
    </main>
  );
}
