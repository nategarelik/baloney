#!/usr/bin/env tsx
// ──────────────────────────────────────────────────────────────
// Ensemble Test Harness
// Runs the full ensemble (Pangram + HF Methods A/B/C + Statistical)
// against cross-model samples (54) + curated dataset samples.
// Reuses existing Pangram scores. Produces 8 JSON output files.
// ──────────────────────────────────────────────────────────────

import {
  writeFileSync,
  existsSync,
  readFileSync,
  mkdirSync,
  unlinkSync,
} from "fs";
import { resolve } from "path";
import { InferenceClient } from "@huggingface/inference";

import {
  methodA_roberta,
  methodB_embeddings,
  methodC_chatgptDetector,
  withRateLimit,
} from "./lib/hf-methods.ts";
import {
  type EnsembleSampleResult,
  computeEnsembleScore,
  getVerdict,
  analyzeLengthVsAccuracy,
  analyzePlatformProfiles,
  analyzeModelDifficulty,
  analyzeEnsembleValue,
  analyzeFeatureImportance,
  analyzeClaudeEvasion,
} from "./lib/ensemble-analyzer.ts";
import {
  buildReport,
  formatConsoleReport,
  writeOutputFiles,
} from "./lib/ensemble-report.ts";

// ──────────────────────────────────────────────
// Load .env.local
// ──────────────────────────────────────────────

function loadEnvFile() {
  const envPath = resolve(import.meta.dirname ?? __dirname, "../.env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile();

// ──────────────────────────────────────────────
// Paths
// ──────────────────────────────────────────────

const SCRIPTS_DIR = resolve(import.meta.dirname ?? __dirname);
const DATA_DIR = resolve(SCRIPTS_DIR, "data");
mkdirSync(DATA_DIR, { recursive: true });

const CHECKPOINT_PATH = resolve(DATA_DIR, "ensemble-checkpoint.json");
const CROSS_MODEL_SAMPLES_PATH = resolve(DATA_DIR, "cross-model-samples.json");
const CROSS_MODEL_DETECTION_PATH = resolve(
  DATA_DIR,
  "cross-model-detection.json",
);

// ──────────────────────────────────────────────
// Statistical method (inline — same as real-detectors.ts)
// ──────────────────────────────────────────────

interface TextStats {
  word_count: number;
  sentence_count: number;
  lexical_diversity: number;
  avg_sentence_length: number;
  avg_word_length: number;
}

function computeTextStats(text: string): TextStats {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text
    .replace(/!/g, ".")
    .replace(/\?/g, ".")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const uniqueWords = new Set(
    words.map((w) => w.toLowerCase().replace(/[.,!?;:"'()]/g, "")),
  );
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const lexicalDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const avgWordLength =
    wordCount > 0 ? words.reduce((sum, w) => sum + w.length, 0) / wordCount : 0;
  return {
    word_count: wordCount,
    sentence_count: sentenceCount,
    lexical_diversity: parseFloat(lexicalDiversity.toFixed(4)),
    avg_sentence_length: parseFloat(avgSentenceLength.toFixed(1)),
    avg_word_length: parseFloat(avgWordLength.toFixed(1)),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function precise(value: number, decimals = 4): number {
  return parseFloat(value.toFixed(decimals));
}

function sentenceWordCounts(text: string): number[] {
  const sentences = text
    .replace(/[!?]/g, ".")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences.map(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length,
  );
}

// AI transition phrases
const AI_TRANSITION_PHRASES = [
  "moreover",
  "furthermore",
  "additionally",
  "consequently",
  "nevertheless",
  "in conclusion",
  "it is important to note",
  "it's worth noting",
  "it is worth noting",
  "it should be noted",
  "in other words",
  "on the other hand",
  "as a result",
  "in addition",
  "for instance",
  "in summary",
  "to summarize",
  "overall",
  "ultimately",
  "essentially",
  "specifically",
  "significantly",
  "notably",
  "importantly",
  "interestingly",
  "remarkably",
  "particularly",
  "fundamentally",
];

const AI_HEDGING_PHRASES = [
  "it's important to",
  "it is important to",
  "it's worth",
  "it is worth",
  "it's crucial",
  "it is crucial",
  "it's essential",
  "it is essential",
  "there are several",
  "there are many",
  "there are various",
  "can be considered",
  "may be considered",
  "could potentially",
  "it depends on",
  "this can vary",
  "in many cases",
  "in some cases",
];

interface StatFeatures {
  burstiness: number;
  ttr: number;
  perplexity_norm: number;
  repetition: number;
  readability: number;
  sent_len_signal: number;
  word_len_signal: number;
  transition_signal: number;
  hedging_signal: number;
  comma_density_signal: number;
  expressive_signal: number;
  entropy_signal: number;
  signal: number;
}

function methodD_statistical(text: string, textStats: TextStats): StatFeatures {
  const wordCounts = sentenceWordCounts(text);
  const mean =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;
  const variance =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        wordCounts.length
      : 0;

  const burstiness = precise(Math.min(variance / 100, 1));
  const ttr = textStats.lexical_diversity;
  const perplexityNorm = precise(clamp(burstiness + (1 - ttr), 0, 1));
  const repetition = precise(clamp(1 - ttr, 0, 1));

  const sentLenSignal = precise(
    clamp((textStats.avg_sentence_length - 10) / 15, 0, 1),
  );
  const wordLenSignal = precise(
    clamp((textStats.avg_word_length - 4.0) / 3.0, 0, 1),
  );

  const avgSyllables = textStats.avg_word_length * 0.4;
  const fk = 0.39 * textStats.avg_sentence_length + 11.8 * avgSyllables - 15.59;
  const fkNorm = clamp(fk / 20, 0, 1);
  const readability =
    fkNorm > 0.45 ? precise(0.5 + fkNorm * 0.5) : precise(fkNorm * 0.6);

  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const totalWords = words.length || 1;

  let transitionCount = 0;
  for (const phrase of AI_TRANSITION_PHRASES) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) transitionCount += matches.length;
  }
  const transitionRate = transitionCount / totalWords;
  const transitionSignal = precise(clamp(transitionRate * 25, 0, 1));

  let hedgingCount = 0;
  for (const phrase of AI_HEDGING_PHRASES) {
    if (lowerText.includes(phrase)) hedgingCount++;
  }
  const hedgingSignal = precise(clamp(hedgingCount / 4, 0, 1));

  const commaCount = (text.match(/,/g) || []).length;
  const commasPerSentence =
    textStats.sentence_count > 0 ? commaCount / textStats.sentence_count : 0;
  const commaDensitySignal = precise(
    clamp((commasPerSentence - 1.0) / 3.0, 0, 1),
  );

  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const emDashCount = (text.match(/[—–-]{2,}|—/g) || []).length;
  const expressiveRate =
    (exclamationCount + questionCount + emDashCount) / totalWords;
  const expressiveSignal = precise(clamp(1 - expressiveRate * 50, 0, 1));

  // Bigram entropy
  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""));
  const bigrams: Record<string, number> = {};
  for (let i = 0; i < lowerWords.length - 1; i++) {
    const bg = lowerWords[i] + " " + lowerWords[i + 1];
    bigrams[bg] = (bigrams[bg] || 0) + 1;
  }
  const bigramTotal = Math.max(
    Object.values(bigrams).reduce((a, b) => a + b, 0),
    1,
  );
  let bigramEntropy = 0;
  for (const count of Object.values(bigrams)) {
    const p = count / bigramTotal;
    if (p > 0) bigramEntropy -= p * Math.log2(p);
  }
  const maxBigramEntropy = Math.log2(bigramTotal);
  const normalizedBigramEntropy =
    maxBigramEntropy > 0 ? bigramEntropy / maxBigramEntropy : 0.5;
  const entropySignal = precise(clamp(1 - normalizedBigramEntropy, 0, 1));

  const signal = precise(
    (1 - burstiness) * 0.18 +
      sentLenSignal * 0.14 +
      wordLenSignal * 0.1 +
      readability * 0.08 +
      (1 - ttr) * 0.05 +
      (1 - perplexityNorm) * 0.05 +
      transitionSignal * 0.12 +
      hedgingSignal * 0.08 +
      commaDensitySignal * 0.05 +
      expressiveSignal * 0.05 +
      0 * 0.04 + // paragraphRepetitionSignal — skip for per-sample
      entropySignal * 0.06,
  );

  return {
    burstiness,
    ttr,
    perplexity_norm: perplexityNorm,
    repetition,
    readability,
    sent_len_signal: sentLenSignal,
    word_len_signal: wordLenSignal,
    transition_signal: transitionSignal,
    hedging_signal: hedgingSignal,
    comma_density_signal: commaDensitySignal,
    expressive_signal: expressiveSignal,
    entropy_signal: entropySignal,
    signal,
  };
}

// ──────────────────────────────────────────────
// Load Data Sources
// ──────────────────────────────────────────────

interface CrossModelSample {
  id: string;
  model: string;
  platform: string;
  topic: string;
  text: string;
  charCount: number;
}

interface CrossModelDetection {
  id: string;
  text_preview: string;
  label: "ai" | "human";
  model: string;
  platform: string;
  pangram_score: number | null;
}

interface DatasetSample {
  id: string;
  text: string;
  label: "ai" | "human";
  category: string;
  description: string;
}

interface UnifiedSample {
  id: string;
  text: string;
  label: "ai" | "human";
  model: string;
  platform: string;
  category: string;
  pangram_score: number | null; // from existing detection data, or null
}

async function loadData(): Promise<{
  samples: UnifiedSample[];
  crossModelCount: number;
  curatedCount: number;
}> {
  const samples: UnifiedSample[] = [];

  // 1. Cross-model samples (with existing Pangram scores)
  const crossModelSamples: CrossModelSample[] = JSON.parse(
    readFileSync(CROSS_MODEL_SAMPLES_PATH, "utf-8"),
  );
  const crossModelDetections: CrossModelDetection[] = JSON.parse(
    readFileSync(CROSS_MODEL_DETECTION_PATH, "utf-8"),
  );

  // Build detection lookup
  const detectionMap = new Map<string, CrossModelDetection>();
  for (const d of crossModelDetections) {
    detectionMap.set(d.id, d);
  }

  // AI samples from cross-model generation
  for (const s of crossModelSamples) {
    const detection = detectionMap.get(s.id);
    samples.push({
      id: s.id,
      text: s.text,
      label: "ai",
      model: s.model,
      platform: s.platform,
      category: `cross-model-${s.model}-${s.platform}`,
      pangram_score: detection?.pangram_score ?? null,
    });
  }

  // Human controls from cross-model detection
  const humanDetections = crossModelDetections.filter(
    (d) => d.label === "human",
  );
  // We need the actual text for human controls — get from cross-model-validation.ts human controls
  const humanControls = getHumanControls();
  for (const h of humanControls) {
    const detection = detectionMap.get(h.id);
    samples.push({
      id: h.id,
      text: h.text,
      label: "human",
      model: "human",
      platform: "mixed",
      category: "human-control",
      pangram_score: detection?.pangram_score ?? null,
    });
  }

  const crossModelCount = samples.length;

  // 2. Curated dataset samples (no Pangram scores)
  // These are imported from datasets.ts at build time by evaluation-data.ts
  // We'll load them dynamically
  try {
    const datasetsPath = resolve(SCRIPTS_DIR, "../src/__tests__/datasets.ts");
    // Since we can't import .ts dynamically easily, we'll use a workaround:
    // Read the file and extract samples via a pattern match approach
    // Actually, since tsx handles imports, let's try a dynamic import
    // For simplicity, let's define a representative subset inline
    // (The full datasets.ts is too large to parse manually)

    // NOTE: We use a dynamic import trick via tsx
    const mod = await importDatasets();
    if (mod) {
      const allDatasetSamples: DatasetSample[] = [
        ...mod.AI_TEXT_SAMPLES,
        ...mod.HUMAN_TEXT_SAMPLES,
        ...mod.EDGE_CASE_TEXT_SAMPLES,
      ].filter((s: DatasetSample) => s.text.length >= 50);

      for (const s of allDatasetSamples) {
        // Avoid duplicates with cross-model samples
        if (samples.some((existing) => existing.id === s.id)) continue;

        samples.push({
          id: s.id,
          text: s.text,
          label: s.label,
          model: s.category.includes("chatgpt")
            ? "chatgpt"
            : s.category.includes("claude")
              ? "claude"
              : s.category.includes("gemini")
                ? "gemini"
                : s.category.includes("llama")
                  ? "llama"
                  : s.category.includes("mistral")
                    ? "mistral"
                    : s.label === "human"
                      ? "human"
                      : "mixed",
          platform: "mixed",
          category: s.category,
          pangram_score: null, // No Pangram scores for dataset samples
        });
      }
    }
  } catch (err) {
    console.warn(
      "  [WARN] Could not load datasets.ts, running with cross-model samples only:",
      err,
    );
  }

  const curatedCount = samples.length - crossModelCount;

  return { samples, crossModelCount, curatedCount };
}

async function importDatasets() {
  try {
    return await import("../src/__tests__/datasets.ts");
  } catch {
    return null;
  }
}

// Human controls (same as cross-model-validation.ts)
function getHumanControls(): Array<{ id: string; text: string }> {
  return [
    {
      id: "human-ctrl-1",
      text: `So I tried making sourdough for like the fifth time and honestly? This one actually turned out decent. Not great, mind you — the crumb is still way too dense and I think I overproofed it a bit. But the crust!! Oh man the crust was actually crispy for once. My wife said it tasted "like real bread" which I'm choosing to take as a compliment lol. The trick was using the dutch oven that's been collecting dust in our cabinet since our wedding. Who knew that thing was actually useful? Anyway if anyone has tips for getting a more open crumb I'm all ears. I've been following the King Arthur recipe but I feel like I'm missing something fundamental.`,
    },
    {
      id: "human-ctrl-2",
      text: `OK so I just spent 4 hours debugging what turned out to be a missing semicolon. FOUR HOURS. The error message was completely unhelpful — something about an unexpected token on line 847 when the actual problem was on line 12. I hate JavaScript sometimes, I really do. The worst part is I was pair programming with my colleague and neither of us caught it. We went down this whole rabbit hole thinking it was a webpack config issue. Rebuilt the entire build pipeline. Cleared every cache known to mankind. And then... semicolon. I need a drink. Actually I need a new career. Does anyone know if goat farming is profitable?`,
    },
    {
      id: "human-ctrl-3",
      text: `Hot take: the best coffee shops are the ones that look slightly sketchy from the outside. Every time I see a place with mismatched furniture, weird art on the walls, and a barista with more tattoos than me, I know the espresso is gonna be fire. Meanwhile the places with the perfectly curated Instagram aesthetic always charge $8 for a latte that tastes like hot water. Fight me on this. I've been to enough bougie places to know the correlation is real.`,
    },
    {
      id: "human-ctrl-4",
      text: `The fire started around 3 a.m. Tuesday, according to neighbors who were jolted awake by the sound of breaking glass and the acrid smell of smoke. By the time firefighters arrived — just seven minutes after the first 911 call — flames had already consumed the ground floor of the century-old Victorian. "I grabbed my kids and just ran," said Maria Torres, 34, who lived in the apartment above with her two daughters, ages 6 and 9. She stood across the street in bare feet, wrapped in a blanket a neighbor had given her, watching as firefighters wrestled a hose line through what had been her front door. The girls clung to her legs, their faces streaked with tears and soot.`,
    },
    {
      id: "human-ctrl-5",
      text: `Weird day. Woke up late because my alarm didn't go off (or maybe I turned it off in my sleep, who knows). Rushed to get ready, spilled coffee on my shirt — the good white one of course — and had to change. Made it to the bus stop just as the bus was pulling away. So I walked. 45 minutes in the rain. By the time I got to work I looked like a drowned rat and my boss just looked at me and said "rough morning?" Understatement of the century, Dave. But then! THEN! After all that, Sarah from accounting told me the presentation I've been dreading got pushed to next week. I could have cried with relief. Ended up having a pretty good day after that actually.`,
    },
    {
      id: "human-ctrl-6",
      text: `Look, I'm not going to pretend this vacuum is going to change your life or whatever. It's a vacuum. It sucks stuff up, which is... kind of the whole job description. But I will say this: after owning three different "smart" robot vacuums that mostly just got stuck under my couch and scared my cat, going back to a regular upright vacuum feels almost revolutionary. This thing actually picks up dog hair from my carpet. Like, ALL the dog hair. And I have a Golden Retriever, so that's saying something. The cord is annoyingly short though, and the attachment for upholstery is basically useless — it fell off every time I tried to use it. 4 stars because nothing in life is perfect.`,
    },
    {
      id: "human-ctrl-7",
      text: `My grandmother's kitchen smelled like cinnamon and regret. She baked constantly — not because she particularly loved baking, but because she grew up during the Depression and wasting food was, to her, a kind of sin. Overripe bananas became bread. Stale bread became bread pudding. Bread pudding that nobody ate became... well, she found a use for that too, though I never asked what. She died when I was fourteen. I remember sitting in her kitchen the day after the funeral, surrounded by casserole dishes from well-meaning neighbors, and all I could think was that none of it smelled right. None of it smelled like her. I took the cinnamon shaker from her spice rack and put it in my pocket.`,
    },
    {
      id: "human-ctrl-8",
      text: `So we migrated our entire backend from Express to Fastify last month and I want to be honest about how it went because most migration posts make everything sound smooth and ours was absolutely not. First off, middleware compatibility is a LIE. Or at least it's way more complicated than the docs suggest. We had about 40 custom Express middleware functions and roughly a third of them needed to be completely rewritten. The request/reply lifecycle in Fastify is different enough that some of our auth middleware broke in subtle ways — like, it worked in testing but silently failed to attach user context in production. That was a fun Wednesday night.`,
    },
    {
      id: "human-ctrl-9",
      text: `The relationship between urban green spaces and mental health outcomes remains poorly understood, despite growing interest in nature-based interventions. While several cross-sectional studies have reported associations between proximity to parks and reduced psychological distress (Thompson et al., 2012; White et al., 2019), the causal mechanisms underlying these associations are far from clear. Our study attempted to address this gap through a longitudinal design tracking 1,847 participants over three years, but we encountered significant methodological challenges — particularly around self-selection bias, as individuals with better mental health may simply be more likely to choose residences near green spaces.`,
    },
    {
      id: "human-ctrl-10",
      text: `The last time I saw my father, he was standing in the doorway of his apartment wearing one brown shoe and one black shoe. I didn't mention it. He wouldn't have wanted me to. He was always particular about appearances, which made the shoes more alarming than if he'd answered the door in his underwear — that might have been a choice, a deliberate casualness. The shoes were a mistake, and my father did not make mistakes. Not visible ones. "You look thin," he said, which was his way of saying hello. "You look good," I lied, which was my way of saying goodbye. Sometimes I think about those shoes.`,
    },
    {
      id: "human-ctrl-11",
      text: `Hey, so about Saturday — I'm totally in but I might be a little late. My sister's flight lands at 2 and I promised I'd pick her up from the airport because apparently Uber is "too expensive" even though she literally just spent $400 on a carry-on suitcase. Sisters, man. Anyway I should be there by 4ish? Maybe 4:30 depending on traffic. Can you save me a seat? Also do I need to bring anything? I can grab beer on the way. Let me know if there's a specific kind people want. Actually scratch that, I'll just get a variety pack from that craft brewery on 5th.`,
    },
    {
      id: "human-ctrl-12",
      text: `idk why everyone acts like cooking is so hard?? like I literally just made pasta with garlic and olive oil and some red pepper flakes and it took maybe 15 minutes and it slapped. you don't need a $200 cookbook or a kitchen full of gadgets. boil water, cook noodles, heat oil with garlic, don't burn the garlic (ok that part is important), toss it together, done. add some parmesan if you're feeling fancy. my roommate acted like I'd performed some kind of miracle. bro it's literally spaghetti aglio e olio. Italians been doing this for centuries with like 4 ingredients.`,
    },
    {
      id: "human-ctrl-13",
      text: `just watched my 6 year old try to explain minecraft to my mom and it was the most adorable disaster I've ever witnessed. "so nana you have to punch the trees" "...why would I punch a tree, sweetie?" "TO GET WOOD NANA" "but won't that hurt my hands?" and then he just stared at her for a solid 10 seconds trying to process that his grandmother doesn't understand that minecraft hands are indestructible. she eventually just nodded and said "that's nice dear" and went back to her crossword. peak family dynamics honestly.`,
    },
    {
      id: "human-ctrl-14",
      text: `In the months following the earthquake, the government's response was marked by a troubling pattern of delayed aid distribution and unclear communication with affected communities. Residents of the hardest-hit neighborhoods reported waiting upwards of three weeks for temporary shelter materials, while bureaucratic infighting between federal and local agencies stalled the release of emergency funds. "We were told help was coming," said one resident, who asked not to be identified for fear of losing her place in the housing queue. "They said it every day. After a while you stop believing it." The disconnect between official statements and ground-level reality became a defining feature of the crisis.`,
    },
    {
      id: "human-ctrl-15",
      text: `ngl the new season of that show everyone keeps recommending is... fine? like it's fine. it's not bad. the acting is good, the cinematography is beautiful, all that. but why does every prestige TV show now need to be 10 hours of someone looking sad in beautiful lighting? I miss when shows had like, plots. Things happening. Characters doing stuff instead of just... processing their trauma in real time while staring out a rain-covered window. give me a heist. give me a mystery. give me literally anything besides another hour of tastefully shot melancholy. anyway I'll probably finish it because I have no self control.`,
    },
    {
      id: "human-ctrl-16",
      text: `Ran my first 10K today and I am NOT going to pretend it was some spiritual awakening. My knees hurt. I got a blister on my left heel the size of a quarter. I walked for at least two of the kilometers and I'm not ashamed to admit it. But I did it. 1:12:34 which is absolutely nothing to brag about but you know what? A year ago I couldn't run for 5 minutes without wanting to die so I'm counting this as a massive W. My friend who runs marathons said "great start!" which felt slightly patronizing but whatever, she's right. It is a great start.`,
    },
    {
      id: "human-ctrl-17",
      text: `bought a "vintage" dresser from facebook marketplace for $80 and when I got it home I realized one of the drawers doesn't actually open, there's a mysterious stain on the top that might be paint or might be something I don't want to think about, and the previous owner's cat apparently sharpened its claws on the left side extensively. my boyfriend looked at it and said "this is what you drove 45 minutes for?" yes. yes it is. because underneath all that it's solid wood and has beautiful hardware and once I sand it down and refinish it, it's going to look incredible. probably. hopefully. I've watched a lot of youtube videos about furniture restoration so I'm basically an expert now.`,
    },
    {
      id: "human-ctrl-18",
      text: `The peer review process for our most recent paper was, to put it charitably, an exercise in patience. Reviewer 2 — and it's always Reviewer 2 — took issue with our sample size (n=340), called our methodology "questionable at best," and suggested we essentially redo the entire study with a completely different analytical framework. Meanwhile, Reviewer 1 praised the exact methodology that Reviewer 2 criticized. The editor's summary helpfully noted that "the reviewers disagree on several points" which is perhaps the understatement of the academic year. We're on revision 3 now and I'm starting to think Reviewer 2 might just be a very committed troll.`,
    },
    {
      id: "human-ctrl-19",
      text: `Real talk: I've been a nurse for 11 years and the burnout is real y'all. Not the kind you read about in articles — the actual, bone-deep exhaustion of caring for people day after day while the system actively works against you. Short staffed again today. Two nurses called out, no replacements available, so instead of 4 patients I had 7. Try giving quality care to 7 sick people simultaneously while also charting everything, managing meds, coordinating with doctors, and somehow remembering to eat lunch. But I love my patients. I genuinely do. That's what makes it so hard — knowing they deserve better than what this system allows me to give them.`,
    },
    {
      id: "human-ctrl-20",
      text: `My dog ate my airpods today. Not the case — the actual airpods. Both of them. I found the case under the couch, empty, with little teeth marks on it, and Biscuit sitting there wagging his tail like he'd accomplished something great. The vet says they should "pass naturally" which is a delightful phrase I never wanted to hear in relation to $250 worth of electronics. So now I get to monitor my dog's... output... for the next few days. The things we do for love. My wife is not sympathetic. She said I shouldn't have left them on the coffee table. She has a point but I'm not going to admit that to her.`,
    },
  ];
}

// ──────────────────────────────────────────────
// Checkpointing
// ──────────────────────────────────────────────

interface Checkpoint {
  completedIds: string[];
  results: EnsembleSampleResult[];
}

function loadCheckpoint(): Checkpoint | null {
  if (!existsSync(CHECKPOINT_PATH)) return null;
  try {
    const data = JSON.parse(readFileSync(CHECKPOINT_PATH, "utf-8"));
    console.log(
      `  Resuming from checkpoint: ${data.completedIds?.length ?? 0} samples completed`,
    );
    return data;
  } catch {
    return null;
  }
}

function saveCheckpoint(checkpoint: Checkpoint): void {
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
}

function deleteCheckpoint(): void {
  if (existsSync(CHECKPOINT_PATH)) {
    unlinkSync(CHECKPOINT_PATH);
  }
}

// ──────────────────────────────────────────────
// Main Pipeline
// ──────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  Baloney Ensemble Test Harness                          ║");
  console.log("║  Pangram + RoBERTa + ChatGPT-Det + Embeddings + Stats  ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // Check HuggingFace API key
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfKey) {
    console.error("HUGGINGFACE_API_KEY not set in .env.local!");
    process.exit(1);
  }
  console.log("  HuggingFace API Key: ✓");

  const hf = new InferenceClient(hfKey);

  // Load data
  console.log("\n━━━ Loading data sources ━━━\n");
  const { samples, crossModelCount, curatedCount } = await loadData();
  console.log(`  Cross-model samples: ${crossModelCount}`);
  console.log(`  Curated dataset samples: ${curatedCount}`);
  console.log(`  Total: ${samples.length}`);

  // Load checkpoint
  const checkpoint = loadCheckpoint();
  const completedIds = new Set(checkpoint?.completedIds ?? []);
  const results: EnsembleSampleResult[] = checkpoint?.results ?? [];

  // Filter to remaining samples
  const remaining = samples.filter((s) => !completedIds.has(s.id));
  console.log(`  Remaining: ${remaining.length}\n`);

  // Process each sample
  console.log("━━━ Running ensemble pipeline ━━━\n");
  const startTime = Date.now();

  for (let i = 0; i < remaining.length; i++) {
    const sample = remaining[i];
    const progress = `[${completedIds.size + i + 1}/${samples.length}]`;
    console.log(
      `${progress} ${sample.id.slice(0, 8)}... ${sample.model}/${sample.platform} (${sample.text.length} chars)`,
    );

    const apiCalls: EnsembleSampleResult["api_calls"] = [];

    // Method A: RoBERTa
    const robertaResult = await withRateLimit(
      () => methodA_roberta(hf, sample.text),
      "RoBERTa",
    );
    if (robertaResult) {
      apiCalls.push({
        method: "roberta",
        success: robertaResult.score !== null,
        latency_ms: robertaResult.latencyMs,
        error: robertaResult.error,
      });
    }

    // Method C: ChatGPT Detector
    const chatgptResult = await withRateLimit(
      () => methodC_chatgptDetector(hf, sample.text),
      "ChatGPT-Det",
    );
    if (chatgptResult) {
      apiCalls.push({
        method: "chatgpt_det",
        success: chatgptResult.score !== null,
        latency_ms: chatgptResult.latencyMs,
        error: chatgptResult.error,
      });
    }

    // Method B: Embeddings (most API calls — rate limit carefully)
    const embeddingsResult = await withRateLimit(
      () => methodB_embeddings(hf, sample.text),
      "Embeddings",
    );
    if (embeddingsResult) {
      apiCalls.push({
        method: "embeddings",
        success: embeddingsResult.score !== null,
        latency_ms: embeddingsResult.latencyMs,
        error: embeddingsResult.error,
      });
    }

    // Method D: Statistical (local, no API)
    const textStats = computeTextStats(sample.text);
    const statResult = methodD_statistical(sample.text, textStats);
    apiCalls.push({
      method: "statistical",
      success: true,
      latency_ms: 0,
    });

    // Build scores
    const scores = {
      pangram: sample.pangram_score,
      roberta: robertaResult?.score ?? null,
      embeddings: embeddingsResult?.score ?? null,
      chatgpt_det: chatgptResult?.score ?? null,
      statistical: statResult.signal,
    };

    // Compute ensemble
    const ensemble = computeEnsembleScore(scores);

    // Build feature map (all 12 statistical features)
    const features: Record<string, number> = {
      burstiness: statResult.burstiness,
      ttr: statResult.ttr,
      perplexity_norm: statResult.perplexity_norm,
      repetition: statResult.repetition,
      readability: statResult.readability,
      sent_len_signal: statResult.sent_len_signal,
      word_len_signal: statResult.word_len_signal,
      transition_signal: statResult.transition_signal,
      hedging_signal: statResult.hedging_signal,
      comma_density_signal: statResult.comma_density_signal,
      expressive_signal: statResult.expressive_signal,
      entropy_signal: statResult.entropy_signal,
    };

    const result: EnsembleSampleResult = {
      id: sample.id,
      text_preview: sample.text.slice(0, 100),
      text_length: sample.text.length,
      label: sample.label,
      model: sample.model,
      platform: sample.platform,
      category: sample.category,
      scores,
      features,
      ensemble_score: ensemble.finalScore,
      pangram_only_score: sample.pangram_score,
      ensemble_verdict: getVerdict(ensemble.finalScore),
      pangram_verdict:
        sample.pangram_score !== null ? getVerdict(sample.pangram_score) : null,
      api_calls: apiCalls,
    };

    results.push(result);
    completedIds.add(sample.id);

    // Log scores
    const scoreStr = [
      `P:${scores.pangram?.toFixed(2) ?? "null"}`,
      `R:${scores.roberta?.toFixed(2) ?? "null"}`,
      `C:${scores.chatgpt_det?.toFixed(2) ?? "null"}`,
      `E:${scores.embeddings?.toFixed(2) ?? "null"}`,
      `S:${scores.statistical.toFixed(2)}`,
      `→ ${ensemble.finalScore.toFixed(3)}`,
    ].join(" ");
    console.log(`  ${scoreStr} [${result.ensemble_verdict}]`);

    // Checkpoint every 10 samples
    if (completedIds.size % 10 === 0) {
      saveCheckpoint({ completedIds: [...completedIds], results });
      console.log(`  [checkpoint saved: ${completedIds.size} samples]`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✓ All ${results.length} samples processed in ${elapsed}s\n`);

  // ── Run analyses ──
  console.log("━━━ Running analyses ━━━\n");

  const lengthAnalysis = analyzeLengthVsAccuracy(results);
  console.log("  ✓ Text length vs accuracy");

  const platformProfiles = analyzePlatformProfiles(results);
  console.log("  ✓ Platform profiles");

  const modelDifficulty = analyzeModelDifficulty(results);
  console.log("  ✓ Model difficulty ranking");

  const ensembleValue = analyzeEnsembleValue(results);
  console.log("  ✓ Ensemble value proposition");

  const featureImportance = analyzeFeatureImportance(results);
  console.log("  ✓ Feature importance");

  const claudeEvasion = analyzeClaudeEvasion(results);
  console.log("  ✓ Claude evasion analysis");

  // ── Build report ──
  const report = buildReport(
    results,
    {
      lengthAnalysis,
      platformProfiles,
      modelDifficulty,
      ensembleValue,
      featureImportance,
      claudeEvasion,
    },
    crossModelCount,
    curatedCount,
  );

  // ── Console output ──
  console.log(formatConsoleReport(report));

  // ── Write JSON files ──
  writeOutputFiles(DATA_DIR, results, report);

  // ── Clean up checkpoint ──
  deleteCheckpoint();
  console.log("\n✓ Checkpoint cleaned up");
  console.log(`✓ All output files written to ${DATA_DIR}/`);
}

main().catch((err) => {
  console.error("Ensemble test harness failed:", err);
  process.exit(1);
});
