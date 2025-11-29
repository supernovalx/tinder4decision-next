"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const model = openrouter("anthropic/claude-sonnet-4.5");

const questionsSchema = z.object({
  questions: z
    .array(z.string())
    .length(10)
    .describe("10 yes/no questions to help analyze the decision"),
});

const analysisSchema = z.object({
  recommendation: z
    .string()
    .describe("A clear recommendation based on the answers"),
  reasoning: z
    .string()
    .describe("Detailed explanation of why this recommendation was made"),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence level in the recommendation (0-100)"),
});

export async function generateQuestions(prompt: string) {
  const { object } = await generateObject({
    model,
    schema: questionsSchema,
    prompt: `You are a decision-making assistant. The user needs help making a decision about:

"${prompt}"

Generate exactly 10 thoughtful yes/no questions that will help analyze this decision from different angles. The questions should:
- Be answerable with a simple yes or no
- Cover different aspects like practical concerns, emotional factors, long-term impact, risks, and opportunities
- Help uncover the user's true priorities and concerns
- Be specific to the decision context provided

Return only yes/no questions that can be answered by swiping right (yes) or left (no).`,
  });

  return object;
}

export async function analyzeDecision(
  prompt: string,
  questions: string[],
  answers: boolean[]
) {
  const qaList = questions
    .map((q, i) => `Q: ${q}\nA: ${answers[i] ? "Yes" : "No"}`)
    .join("\n\n");

  const { object } = await generateObject({
    model,
    schema: analysisSchema,
    prompt: `You are a decision-making analyst. The user asked for help with:

"${prompt}"

They answered the following questions by swiping right (yes) or left (no):

${qaList}

Based on their answers, provide:
1. A clear, actionable recommendation
2. Detailed reasoning that references their specific answers
3. A confidence score (0-100) based on how consistent and clear their answers are

Be supportive and insightful. Help them feel confident in their decision.`,
  });

  return object;
}
