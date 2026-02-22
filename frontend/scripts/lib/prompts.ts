// ---------------------------------------------------------------------------
// Prompt templates for AI-generated social media content
// 3 platforms x 15 topics = 45 total prompt combinations
// ---------------------------------------------------------------------------

export type Platform = "x" | "linkedin" | "facebook";

export interface PromptTemplate {
  id: string;
  topic: string;
  platform: Platform;
  prompt: string; // Short 1-3 sentence prompt (reverse-engineered style)
  platformInstruction: string; // Platform voice/format guidance
}

// ---------------------------------------------------------------------------
// System prompt shared by every LLM call
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT =
  "You are writing a social media post. Write ONLY the post content. Do NOT include hashtags unless specifically in the style. Do NOT mention you are an AI. Write naturally as a real person would on this platform.";

// ---------------------------------------------------------------------------
// Platform voice instructions
// ---------------------------------------------------------------------------

const PLATFORM_INSTRUCTIONS: Record<Platform, string> = {
  x: "Write as a viral X/Twitter post. Punchy sentences, hot take energy, minimal emojis. 400-800 characters total.",
  linkedin:
    "Write as a LinkedIn thought leader post. Corporate-inspirational tone, paragraph breaks, humble brag. 500-1000 characters total.",
  facebook:
    "Write as a casual Facebook post. Personal anecdote style, engagement bait, ask a question at the end. 400-800 characters total.",
};

// ---------------------------------------------------------------------------
// Topics and their casual, short prompts
// ---------------------------------------------------------------------------

interface TopicDefinition {
  key: string;
  prompt: string;
}

const TOPICS: TopicDefinition[] = [
  {
    key: "ai_tech",
    prompt: "Write something about how AI is changing everything",
  },
  {
    key: "productivity",
    prompt: "Post about morning routine productivity hacks",
  },
  {
    key: "political_takes",
    prompt: "Hot take about how politicians don't understand technology",
  },
  {
    key: "health_wellness",
    prompt:
      "Something about how walking outside is better than any supplement",
  },
  {
    key: "finance",
    prompt:
      "Write about why most people's relationship with money is broken",
  },
  {
    key: "startup_culture",
    prompt:
      "Post about how startup culture glorifies burnout and calls it passion",
  },
  {
    key: "remote_work",
    prompt:
      "Write about how going back to the office feels like a step backward",
  },
  {
    key: "climate",
    prompt:
      "Something about how individual recycling won't save the planet without corporate change",
  },
  {
    key: "social_media_commentary",
    prompt:
      "Post about how everyone performs a fake version of their life online",
  },
  {
    key: "self_improvement",
    prompt:
      "Write something about how reading more books actually changed your thinking",
  },
  {
    key: "food_trends",
    prompt:
      "Post about how every new food trend is just something your grandma already made",
  },
  {
    key: "travel",
    prompt:
      "Write about how traveling alone teaches you more than any classroom",
  },
  {
    key: "career_advice",
    prompt:
      "Post about how the best career advice you got was to stop following career advice",
  },
  {
    key: "relationships",
    prompt:
      "Write about how real friendships survive long silences without any awkwardness",
  },
  {
    key: "education",
    prompt:
      "Something about how the school system hasn't changed in a hundred years and it shows",
  },
];

// ---------------------------------------------------------------------------
// Generate all 45 prompt templates
// ---------------------------------------------------------------------------

const PLATFORMS: Platform[] = ["x", "linkedin", "facebook"];

function buildTemplates(): PromptTemplate[] {
  const templates: PromptTemplate[] = [];

  for (const topic of TOPICS) {
    for (const platform of PLATFORMS) {
      templates.push({
        id: `${topic.key}_${platform}`,
        topic: topic.key,
        platform,
        prompt: topic.prompt,
        platformInstruction: PLATFORM_INSTRUCTIONS[platform],
      });
    }
  }

  return templates;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = buildTemplates();

// ---------------------------------------------------------------------------
// Helper: return `count` prompts with even platform distribution
// ---------------------------------------------------------------------------

/**
 * Returns `count` prompts, evenly distributed across platforms.
 * Shuffles the order but ensures roughly equal platform representation.
 */
export function getPromptsForModel(count: number): PromptTemplate[] {
  // Group templates by platform
  const byPlatform: Record<Platform, PromptTemplate[]> = {
    x: [],
    linkedin: [],
    facebook: [],
  };

  // Shuffle the full list first so we draw from random positions
  const shuffled = [...PROMPT_TEMPLATES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  for (const t of shuffled) {
    byPlatform[t.platform].push(t);
  }

  const result: PromptTemplate[] = [];
  const perPlatform = Math.floor(count / PLATFORMS.length);
  const remainder = count % PLATFORMS.length;

  // Draw evenly from each platform
  for (let pi = 0; pi < PLATFORMS.length; pi++) {
    const platform = PLATFORMS[pi];
    const take = perPlatform + (pi < remainder ? 1 : 0);
    for (let i = 0; i < take && i < byPlatform[platform].length; i++) {
      result.push(byPlatform[platform][i]);
    }
  }

  // Final shuffle so platforms are interleaved, not grouped
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
