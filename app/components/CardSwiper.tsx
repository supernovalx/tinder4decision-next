"use client";

import { useState, useRef, useMemo } from "react";
import TinderCard from "react-tinder-card";
import { QuestionItem } from "../actions";

interface CardSwiperProps {
  questions: QuestionItem[];
  onComplete: (answers: boolean[]) => void;
}

type Direction = "left" | "right" | "up" | "down";

interface CardRef {
  swipe: (dir?: Direction) => Promise<void>;
  restoreCard: () => Promise<void>;
}

export function CardSwiper({ questions, onComplete }: CardSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(questions.length - 1);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [lastDirection, setLastDirection] = useState<Direction | null>(null);

  const currentIndexRef = useRef(currentIndex);
  const cardRefs = useRef<(CardRef | null)[]>([]);

  const childRefs = useMemo(
    () =>
      Array(questions.length)
        .fill(0)
        .map(() => ({ current: null as CardRef | null })),
    [questions.length]
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canSwipe = currentIndex >= 0;

  const swiped = (direction: Direction, index: number) => {
    setLastDirection(direction);
    const answer = direction === "right";
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    updateCurrentIndex(index - 1);

    if (index === 0) {
      // All questions answered, wait a moment then show results
      setTimeout(() => {
        onComplete(newAnswers);
      }, 300);
    }
  };

  const outOfFrame = (idx: number) => {
    if (currentIndexRef.current >= idx && cardRefs.current[idx]) {
      cardRefs.current[idx]?.restoreCard();
    }
  };

  const swipe = async (dir: Direction) => {
    if (canSwipe && childRefs[currentIndex]?.current) {
      await childRefs[currentIndex].current?.swipe(dir);
    }
  };

  const progress = questions.length - currentIndex - 1;
  const progressPercent = (progress / questions.length) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/60">
            <span>
              Question {progress + 1} of {questions.length}
            </span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        {/* Card Stack */}
        <div className="relative h-[400px] w-full">
          {questions.map((questionItem, index) => (
            <TinderCard
              ref={(el) => {
                childRefs[index].current = el;
                cardRefs.current[index] = el;
              }}
              key={index}
              onSwipe={(dir) => swiped(dir as Direction, index)}
              onCardLeftScreen={() => outOfFrame(index)}
              preventSwipe={["up", "down"]}
              className="absolute inset-0"
            >
              <div
                className="flex h-full w-full cursor-grab select-none flex-col items-center justify-center rounded-3xl border border-white/20 p-8 shadow-2xl active:cursor-grabbing"
                style={{ background: questionItem.background }}
              >
                <span className="mb-4 text-5xl">{questionItem.emoji}</span>
                <p
                  className="text-center text-2xl font-medium leading-relaxed"
                  style={{ color: questionItem.foreground }}
                >
                  {questionItem.question}
                </p>
              </div>
            </TinderCard>
          ))}

          {/* Empty state */}
          {currentIndex < 0 && (
            <div className="flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <div className="text-4xl">🎉</div>
                <p className="text-white/60">All done! Analyzing...</p>
              </div>
            </div>
          )}
        </div>
        {/* Swipe Indicators */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => swipe("left")}
            disabled={!canSwipe}
            className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-500/50 bg-rose-500/10 text-rose-400 transition-all hover:border-rose-500 hover:bg-rose-500/20 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-sm text-white/40">or swipe the card</p>
          </div>

          <button
            onClick={() => swipe("right")}
            disabled={!canSwipe}
            className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 transition-all hover:border-emerald-500 hover:bg-emerald-500/20 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
        {/* Direction Labels
        <div className="flex justify-between px-4 text-sm">
          <span className="text-rose-400">← No</span>
          <span className="text-emerald-400">Yes →</span>
        </div> */}
        {/* Last swipe feedback */}
        {lastDirection && (
          <div className="text-center">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                lastDirection === "right"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {lastDirection === "right" ? "✓ Yes" : "✗ No"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
