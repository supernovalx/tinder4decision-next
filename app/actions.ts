"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { cookies } from "next/headers";
import { z } from "zod";

const INVITE_COOKIE_NAME = "decidr_invite_code";

export async function verifyInviteCode(
  code: string
): Promise<{ success: boolean; error?: string }> {
  const inviteCode = process.env.INVITE_CODE;

  if (!inviteCode) {
    // No invite code configured, allow access
    return { success: true };
  }

  if (code !== inviteCode) {
    return { success: false, error: "Invalid invite code" };
  }

  // Set cookie that expires in 1 year
  const cookieStore = await cookies();
  cookieStore.set(INVITE_COOKIE_NAME, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return { success: true };
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// const model = openrouter("anthropic/claude-sonnet-4.5");
const model = openrouter("google/gemini-3-flash-preview");

const questionItemSchema = z.object({
  question: z
    .string()
    .describe("A yes/no question to help analyze the decision"),
  background: z
    .string()
    .describe(
      "A CSS gradient or color for the card background (e.g., 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' or '#4F46E5')"
    ),
  foreground: z
    .string()
    .describe(
      "A hex color for the text that contrasts well with the background (e.g., '#FFFFFF' or '#1F2937')"
    ),
  emoji: z
    .string()
    .describe(
      "A single emoji that represents the theme or mood of the question"
    ),
});

export type QuestionItem = z.infer<typeof questionItemSchema>;

const createQuestionsSchema = (count: number) =>
  z.object({
    questions: z
      .array(questionItemSchema)
      .describe(
        `Exactly ${count} yes/no questions with styling to help analyze the decision`
      ),
  });

const analysisSchema = z.object({
  recommendation: z
    .string()
    .describe(
      "A short, punchy recommendation (max 8 words) - be direct and actionable"
    ),
  reasoning: z
    .string()
    .describe(
      "Markdown-formatted explanation with bullet points, bold text for key insights, and clear structure"
    ),
  confidence: z
    .number()
    .describe(
      "Confidence level in the recommendation, as a number from 0 to 100"
    ),
});

export async function generateQuestions(prompt: string, count: number = 10) {
  const { object } = await generateObject({
    model,
    schema: createQuestionsSchema(count),
    prompt: `You are a decision-making assistant. The user needs help making a decision about:

"${prompt}"

Generate exactly ${count} thoughtful yes/no questions that will help analyze this decision from different angles. For each question, also provide:
- A visually appealing CSS background (use gradients like 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' or solid colors)
- A foreground text color that contrasts well with the background for readability
- A single emoji that captures the theme or mood of the question

The questions should:
- Be answerable with a simple yes or no
- Cover different aspects like practical concerns, emotional factors, long-term impact, risks, and opportunities
- Help uncover the user's true priorities and concerns
- Be specific to the decision context provided

Make each card visually distinct with varied color schemes - use warm colors for emotional questions, cool colors for practical ones, etc. Be creative with the gradients!

Return only yes/no questions that can be answered by swiping right (yes) or left (no).`,
  });

  return object;
}

export async function analyzeDecision(
  prompt: string,
  questions: QuestionItem[],
  answers: boolean[]
) {
  const qaList = questions
    .map((q, i) => `Q: ${q.question}\nA: ${answers[i] ? "Yes" : "No"}`)
    .join("\n\n");

  const { object } = await generateObject({
    model,
    schema: analysisSchema,
    prompt: `You are a decision-making analyst. The user asked for help with:

"${prompt}"

They answered the following questions by swiping right (yes) or left (no):

${qaList}

Based on their answers, provide:
1. A **short, punchy recommendation** (max 8 words) - be direct like "Go for it!" or "Wait and reassess" or "Yes, with caution"
2. A **markdown-formatted reasoning** that:
   - Uses **bold** for key insights
   - Uses bullet points to organize thoughts
   - References specific answers they gave
   - Keeps it concise but insightful (3-5 bullet points max)
3. A confidence score (0-100) based on how consistent and clear their answers are

Be supportive and insightful. Help them feel confident in their decision.`,
  });

  return object;
}
