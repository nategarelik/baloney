import { SYSTEM_PROMPT } from "./prompts.ts";
import type { PromptTemplate } from "./prompts.ts";

export interface GeneratedSample {
  id: string;
  model: "gemini" | "chatgpt" | "claude";
  platform: "x" | "linkedin" | "facebook";
  topic: string;
  prompt: string;
  text: string;
  charCount: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Individual model generators
// ---------------------------------------------------------------------------

export async function generateGemini(prompt: PromptTemplate): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_KEY environment variable is not set");
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  SYSTEM_PROMPT +
                  "\n\n" +
                  prompt.platformInstruction +
                  "\n\n" +
                  prompt.prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Gemini API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function generateChatGPT(prompt: PromptTemplate): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: prompt.platformInstruction + "\n\n" + prompt.prompt,
        },
      ],
      temperature: 0.9,
      max_completion_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `ChatGPT API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateClaude(prompt: PromptTemplate): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt.platformInstruction + "\n\n" + prompt.prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Claude API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data.content[0].text;
}

// ---------------------------------------------------------------------------
// Unified generate with retries
// ---------------------------------------------------------------------------

export async function generate(
  model: "gemini" | "chatgpt" | "claude",
  prompt: PromptTemplate,
  retries = 3,
): Promise<GeneratedSample | null> {
  const generatorFn =
    model === "gemini"
      ? generateGemini
      : model === "chatgpt"
        ? generateChatGPT
        : generateClaude;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const text = await generatorFn(prompt);

      if (text.length < 300) {
        console.warn(
          `Attempt ${attempt + 1}/${retries}: generated text too short (${text.length} chars) for model=${model}, retrying...`,
        );
        continue;
      }

      const sample: GeneratedSample = {
        id: crypto.randomUUID(),
        model,
        platform: prompt.platform,
        topic: prompt.topic,
        prompt: prompt.prompt,
        text,
        charCount: text.length,
        timestamp: new Date().toISOString(),
      };

      return sample;
    } catch (error) {
      const backoffMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      console.error(
        `Attempt ${attempt + 1}/${retries} failed for model=${model}: ${error instanceof Error ? error.message : error}. Retrying in ${backoffMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  console.error(
    `All ${retries} retries exhausted for model=${model}, topic="${prompt.topic}"`,
  );
  return null;
}

// ---------------------------------------------------------------------------
// Batch generator with concurrency control and rate limiting
// ---------------------------------------------------------------------------

export async function generateBatch(
  model: "gemini" | "chatgpt" | "claude",
  prompts: PromptTemplate[],
  concurrency: number = 3,
  delayMs: number = 1000,
): Promise<GeneratedSample[]> {
  const results: GeneratedSample[] = [];
  const total = prompts.length;
  let completed = 0;

  // Process prompts in chunks of `concurrency`
  for (let i = 0; i < total; i += concurrency) {
    const chunk = prompts.slice(i, i + concurrency);

    const chunkResults = await Promise.all(
      chunk.map((prompt) => generate(model, prompt)),
    );

    for (const result of chunkResults) {
      if (result !== null) {
        results.push(result);
      }
      completed++;
      console.log(`Generated ${completed}/${total} for ${model}`);
    }

    // Add delay between chunks for rate limiting (skip after the last chunk)
    if (i + concurrency < total) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// API key availability check
// ---------------------------------------------------------------------------

export function checkApiKeys(): {
  gemini: boolean;
  chatgpt: boolean;
  claude: boolean;
} {
  return {
    gemini: !!process.env.GOOGLE_AI_KEY,
    chatgpt: !!process.env.OPENAI_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY,
  };
}
