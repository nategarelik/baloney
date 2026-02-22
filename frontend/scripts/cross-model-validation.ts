#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Cross-Model Validation Pipeline
// Generates AI text from Gemini, GPT-4.1-mini, and Claude Haiku,
// then runs Pangram detection on all samples + human controls.
// ---------------------------------------------------------------------------

import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { resolve } from "path";

import { getPromptsForModel } from "./lib/prompts.ts";
import { generate, checkApiKeys } from "./lib/generators.ts";
import type { GeneratedSample } from "./lib/generators.ts";

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------

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
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile();

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const DATA_DIR = resolve(import.meta.dirname ?? __dirname, "data");
mkdirSync(DATA_DIR, { recursive: true });

const SAMPLES_PATH = resolve(DATA_DIR, "cross-model-samples.json");
const DETECTION_PATH = resolve(DATA_DIR, "cross-model-detection.json");
const REPORT_PATH = resolve(DATA_DIR, "cross-model-report.json");

// ---------------------------------------------------------------------------
// Configuration: 12 per model (4 per platform) = 36 AI + 50 human = 86 total
// ---------------------------------------------------------------------------

const SAMPLES_PER_MODEL = 12;
const MODELS: Array<"gemini" | "chatgpt" | "claude"> = ["gemini", "chatgpt", "claude"];

// Rate limits per model
const RATE_DELAYS: Record<string, number> = {
  gemini: 4500,   // 15 RPM free tier
  chatgpt: 1200,  // Conservative
  claude: 2000,   // Conservative
};

// ---------------------------------------------------------------------------
// Pangram detection (inline — avoids importing the full pangram-detector)
// ---------------------------------------------------------------------------

interface PangramDetection {
  id: string;
  text_preview: string;
  label: "ai" | "human";
  model: string;
  platform: string;
  pangram_score: number | null;
  pangram_fraction_ai_assisted: number | null;
  pangram_fraction_human: number | null;
  pangram_classification: string | null;
  pangram_headline: string | null;
  pangram_prediction: string | null;
  pangram_windows: Array<{
    text: string;
    label: string;
    ai_assistance_score: number;
    confidence: string;
  }>;
  pangram_avg_window_confidence: number | null;
  pangram_max_window_ai_score: number | null;
  detected_at: string;
  error?: string;
}

async function detectWithPangram(text: string): Promise<{
  score: number;
  classification: string;
  headline: string;
  prediction: string;
  fraction_ai_assisted: number;
  fraction_human: number;
  windows: Array<{
    text: string;
    label: string;
    ai_assistance_score: number;
    confidence: string;
  }>;
} | null> {
  const apiKey = process.env.PANGRAM_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://text.api.pangram.com/v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ text: text.slice(0, 5000) }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("  [RATE LIMIT] Pangram 429 — waiting 30s...");
        await new Promise((r) => setTimeout(r, 30000));
        return null;
      }
      const errText = await response.text().catch(() => "");
      console.error(`  [PANGRAM ERROR] ${response.status}: ${errText.slice(0, 200)}`);
      return null;
    }

    const data = await response.json();
    return {
      score: data.fraction_ai ?? 0,
      classification: data.classification ?? "unknown",
      headline: data.headline ?? "",
      prediction: data.prediction ?? "",
      fraction_ai_assisted: data.fraction_ai_assisted ?? 0,
      fraction_human: data.fraction_human ?? 0,
      windows: (data.windows ?? []).map((w: Record<string, unknown>) => ({
        text: (w.text as string) ?? "",
        label: (w.label as string) ?? "",
        ai_assistance_score: (w.ai_assistance_score as number) ?? 0,
        confidence: (w.confidence as string) ?? "Low",
      })),
    };
  } catch (err) {
    console.error(`  [PANGRAM ERROR] ${err instanceof Error ? err.message : err}`);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Human control samples (subset — same as validation-pipeline.ts)
// ---------------------------------------------------------------------------

function getHumanControls(): Array<{ id: string; text: string }> {
  return [
    { id: "human-ctrl-1", text: `So I tried making sourdough for like the fifth time and honestly? This one actually turned out decent. Not great, mind you — the crumb is still way too dense and I think I overproofed it a bit. But the crust!! Oh man the crust was actually crispy for once. My wife said it tasted "like real bread" which I'm choosing to take as a compliment lol. The trick was using the dutch oven that's been collecting dust in our cabinet since our wedding. Who knew that thing was actually useful? Anyway if anyone has tips for getting a more open crumb I'm all ears. I've been following the King Arthur recipe but I feel like I'm missing something fundamental.` },
    { id: "human-ctrl-2", text: `OK so I just spent 4 hours debugging what turned out to be a missing semicolon. FOUR HOURS. The error message was completely unhelpful — something about an unexpected token on line 847 when the actual problem was on line 12. I hate JavaScript sometimes, I really do. The worst part is I was pair programming with my colleague and neither of us caught it. We went down this whole rabbit hole thinking it was a webpack config issue. Rebuilt the entire build pipeline. Cleared every cache known to mankind. And then... semicolon. I need a drink. Actually I need a new career. Does anyone know if goat farming is profitable?` },
    { id: "human-ctrl-3", text: `Hot take: the best coffee shops are the ones that look slightly sketchy from the outside. Every time I see a place with mismatched furniture, weird art on the walls, and a barista with more tattoos than me, I know the espresso is gonna be fire. Meanwhile the places with the perfectly curated Instagram aesthetic always charge $8 for a latte that tastes like hot water. Fight me on this. I've been to enough bougie places to know the correlation is real.` },
    { id: "human-ctrl-4", text: `The fire started around 3 a.m. Tuesday, according to neighbors who were jolted awake by the sound of breaking glass and the acrid smell of smoke. By the time firefighters arrived — just seven minutes after the first 911 call — flames had already consumed the ground floor of the century-old Victorian. "I grabbed my kids and just ran," said Maria Torres, 34, who lived in the apartment above with her two daughters, ages 6 and 9. She stood across the street in bare feet, wrapped in a blanket a neighbor had given her, watching as firefighters wrestled a hose line through what had been her front door. The girls clung to her legs, their faces streaked with tears and soot.` },
    { id: "human-ctrl-5", text: `Weird day. Woke up late because my alarm didn't go off (or maybe I turned it off in my sleep, who knows). Rushed to get ready, spilled coffee on my shirt — the good white one of course — and had to change. Made it to the bus stop just as the bus was pulling away. So I walked. 45 minutes in the rain. By the time I got to work I looked like a drowned rat and my boss just looked at me and said "rough morning?" Understatement of the century, Dave. But then! THEN! After all that, Sarah from accounting told me the presentation I've been dreading got pushed to next week. I could have cried with relief. Ended up having a pretty good day after that actually.` },
    { id: "human-ctrl-6", text: `Look, I'm not going to pretend this vacuum is going to change your life or whatever. It's a vacuum. It sucks stuff up, which is... kind of the whole job description. But I will say this: after owning three different "smart" robot vacuums that mostly just got stuck under my couch and scared my cat, going back to a regular upright vacuum feels almost revolutionary. This thing actually picks up dog hair from my carpet. Like, ALL the dog hair. And I have a Golden Retriever, so that's saying something. The cord is annoyingly short though, and the attachment for upholstery is basically useless — it fell off every time I tried to use it. 4 stars because nothing in life is perfect.` },
    { id: "human-ctrl-7", text: `My grandmother's kitchen smelled like cinnamon and regret. She baked constantly — not because she particularly loved baking, but because she grew up during the Depression and wasting food was, to her, a kind of sin. Overripe bananas became bread. Stale bread became bread pudding. Bread pudding that nobody ate became... well, she found a use for that too, though I never asked what. She died when I was fourteen. I remember sitting in her kitchen the day after the funeral, surrounded by casserole dishes from well-meaning neighbors, and all I could think was that none of it smelled right. None of it smelled like her. I took the cinnamon shaker from her spice rack and put it in my pocket.` },
    { id: "human-ctrl-8", text: `So we migrated our entire backend from Express to Fastify last month and I want to be honest about how it went because most migration posts make everything sound smooth and ours was absolutely not. First off, middleware compatibility is a LIE. Or at least it's way more complicated than the docs suggest. We had about 40 custom Express middleware functions and roughly a third of them needed to be completely rewritten. The request/reply lifecycle in Fastify is different enough that some of our auth middleware broke in subtle ways — like, it worked in testing but silently failed to attach user context in production. That was a fun Wednesday night.` },
    { id: "human-ctrl-9", text: `The relationship between urban green spaces and mental health outcomes remains poorly understood, despite growing interest in nature-based interventions. While several cross-sectional studies have reported associations between proximity to parks and reduced psychological distress (Thompson et al., 2012; White et al., 2019), the causal mechanisms underlying these associations are far from clear. Our study attempted to address this gap through a longitudinal design tracking 1,847 participants over three years, but we encountered significant methodological challenges — particularly around self-selection bias, as individuals with better mental health may simply be more likely to choose residences near green spaces.` },
    { id: "human-ctrl-10", text: `The last time I saw my father, he was standing in the doorway of his apartment wearing one brown shoe and one black shoe. I didn't mention it. He wouldn't have wanted me to. He was always particular about appearances, which made the shoes more alarming than if he'd answered the door in his underwear — that might have been a choice, a deliberate casualness. The shoes were a mistake, and my father did not make mistakes. Not visible ones. "You look thin," he said, which was his way of saying hello. "You look good," I lied, which was my way of saying goodbye. Sometimes I think about those shoes.` },
    { id: "human-ctrl-11", text: `Hey, so about Saturday — I'm totally in but I might be a little late. My sister's flight lands at 2 and I promised I'd pick her up from the airport because apparently Uber is "too expensive" even though she literally just spent $400 on a carry-on suitcase. Sisters, man. Anyway I should be there by 4ish? Maybe 4:30 depending on traffic. Can you save me a seat? Also do I need to bring anything? I can grab beer on the way. Let me know if there's a specific kind people want. Actually scratch that, I'll just get a variety pack from that craft brewery on 5th.` },
    { id: "human-ctrl-12", text: `idk why everyone acts like cooking is so hard?? like I literally just made pasta with garlic and olive oil and some red pepper flakes and it took maybe 15 minutes and it slapped. you don't need a $200 cookbook or a kitchen full of gadgets. boil water, cook noodles, heat oil with garlic, don't burn the garlic (ok that part is important), toss it together, done. add some parmesan if you're feeling fancy. my roommate acted like I'd performed some kind of miracle. bro it's literally spaghetti aglio e olio. Italians been doing this for centuries with like 4 ingredients.` },
    { id: "human-ctrl-13", text: `just watched my 6 year old try to explain minecraft to my mom and it was the most adorable disaster I've ever witnessed. "so nana you have to punch the trees" "...why would I punch a tree, sweetie?" "TO GET WOOD NANA" "but won't that hurt my hands?" and then he just stared at her for a solid 10 seconds trying to process that his grandmother doesn't understand that minecraft hands are indestructible. she eventually just nodded and said "that's nice dear" and went back to her crossword. peak family dynamics honestly.` },
    { id: "human-ctrl-14", text: `In the months following the earthquake, the government's response was marked by a troubling pattern of delayed aid distribution and unclear communication with affected communities. Residents of the hardest-hit neighborhoods reported waiting upwards of three weeks for temporary shelter materials, while bureaucratic infighting between federal and local agencies stalled the release of emergency funds. "We were told help was coming," said one resident, who asked not to be identified for fear of losing her place in the housing queue. "They said it every day. After a while you stop believing it." The disconnect between official statements and ground-level reality became a defining feature of the crisis.` },
    { id: "human-ctrl-15", text: `ngl the new season of that show everyone keeps recommending is... fine? like it's fine. it's not bad. the acting is good, the cinematography is beautiful, all that. but why does every prestige TV show now need to be 10 hours of someone looking sad in beautiful lighting? I miss when shows had like, plots. Things happening. Characters doing stuff instead of just... processing their trauma in real time while staring out a rain-covered window. give me a heist. give me a mystery. give me literally anything besides another hour of tastefully shot melancholy. anyway I'll probably finish it because I have no self control.` },
    { id: "human-ctrl-16", text: `Ran my first 10K today and I am NOT going to pretend it was some spiritual awakening. My knees hurt. I got a blister on my left heel the size of a quarter. I walked for at least two of the kilometers and I'm not ashamed to admit it. But I did it. 1:12:34 which is absolutely nothing to brag about but you know what? A year ago I couldn't run for 5 minutes without wanting to die so I'm counting this as a massive W. My friend who runs marathons said "great start!" which felt slightly patronizing but whatever, she's right. It is a great start.` },
    { id: "human-ctrl-17", text: `bought a "vintage" dresser from facebook marketplace for $80 and when I got it home I realized one of the drawers doesn't actually open, there's a mysterious stain on the top that might be paint or might be something I don't want to think about, and the previous owner's cat apparently sharpened its claws on the left side extensively. my boyfriend looked at it and said "this is what you drove 45 minutes for?" yes. yes it is. because underneath all that it's solid wood and has beautiful hardware and once I sand it down and refinish it, it's going to look incredible. probably. hopefully. I've watched a lot of youtube videos about furniture restoration so I'm basically an expert now.` },
    { id: "human-ctrl-18", text: `The peer review process for our most recent paper was, to put it charitably, an exercise in patience. Reviewer 2 — and it's always Reviewer 2 — took issue with our sample size (n=340), called our methodology "questionable at best," and suggested we essentially redo the entire study with a completely different analytical framework. Meanwhile, Reviewer 1 praised the exact methodology that Reviewer 2 criticized. The editor's summary helpfully noted that "the reviewers disagree on several points" which is perhaps the understatement of the academic year. We're on revision 3 now and I'm starting to think Reviewer 2 might just be a very committed troll.` },
    { id: "human-ctrl-19", text: `Real talk: I've been a nurse for 11 years and the burnout is real y'all. Not the kind you read about in articles — the actual, bone-deep exhaustion of caring for people day after day while the system actively works against you. Short staffed again today. Two nurses called out, no replacements available, so instead of 4 patients I had 7. Try giving quality care to 7 sick people simultaneously while also charting everything, managing meds, coordinating with doctors, and somehow remembering to eat lunch. But I love my patients. I genuinely do. That's what makes it so hard — knowing they deserve better than what this system allows me to give them.` },
    { id: "human-ctrl-20", text: `My dog ate my airpods today. Not the case — the actual airpods. Both of them. I found the case under the couch, empty, with little teeth marks on it, and Biscuit sitting there wagging his tail like he'd accomplished something great. The vet says they should "pass naturally" which is a delightful phrase I never wanted to hear in relation to $250 worth of electronics. So now I get to monitor my dog's... output... for the next few days. The things we do for love. My wife is not sympathetic. She said I shouldn't have left them on the coffee table. She has a point but I'm not going to admit that to her.` },
  ];
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Baloney Cross-Model Validation Pipeline        ║");
  console.log("║  Gemini 2.5 Flash + GPT-4.1-mini + Claude Haiku ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Check keys
  const keys = checkApiKeys();
  console.log("API Keys:");
  console.log(`  Gemini:  ${keys.gemini ? "✓" : "✗"}`);
  console.log(`  ChatGPT: ${keys.chatgpt ? "✓" : "✗"}`);
  console.log(`  Claude:  ${keys.claude ? "✓" : "✗"}`);
  console.log(`  Pangram: ${process.env.PANGRAM_API_KEY ? "✓" : "✗"}\n`);

  const availableModels = MODELS.filter((m) => {
    if (m === "gemini") return keys.gemini;
    if (m === "chatgpt") return keys.chatgpt;
    if (m === "claude") return keys.claude;
    return false;
  });

  if (availableModels.length === 0) {
    console.error("No API keys available! Set GOOGLE_AI_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY");
    process.exit(1);
  }

  // ── Stage 1: Generate AI samples ──────────────────────────
  console.log(`\n━━━ STAGE 1: Generate ${SAMPLES_PER_MODEL} samples per model ━━━\n`);

  const allSamples: GeneratedSample[] = [];

  for (const model of availableModels) {
    console.log(`\n▸ Generating ${SAMPLES_PER_MODEL} samples from ${model}...`);
    const prompts = getPromptsForModel(SAMPLES_PER_MODEL);
    let generated = 0;

    for (const prompt of prompts) {
      const sample = await generate(model, prompt);
      if (sample) {
        allSamples.push(sample);
        generated++;
        console.log(`  [${generated}/${SAMPLES_PER_MODEL}] ${model}/${prompt.platform}/${prompt.topic} — ${sample.charCount} chars`);
      } else {
        console.warn(`  [SKIP] ${model}/${prompt.platform}/${prompt.topic} — generation failed`);
      }

      // Rate limit delay
      await new Promise((r) => setTimeout(r, RATE_DELAYS[model] ?? 2000));
    }

    console.log(`  ✓ ${model}: ${generated}/${SAMPLES_PER_MODEL} samples generated`);
  }

  // Save generated samples
  writeFileSync(SAMPLES_PATH, JSON.stringify(allSamples, null, 2));
  console.log(`\n✓ Saved ${allSamples.length} AI samples to ${SAMPLES_PATH}`);

  // ── Stage 2: Pangram detection on all samples ─────────────
  console.log(`\n━━━ STAGE 2: Pangram Detection ━━━\n`);

  const detections: PangramDetection[] = [];
  const humanControls = getHumanControls();

  // Detect AI samples
  console.log(`▸ Detecting ${allSamples.length} AI samples...`);
  for (let i = 0; i < allSamples.length; i++) {
    const s = allSamples[i];
    console.log(`  [${i + 1}/${allSamples.length}] ${s.model}/${s.platform} — ${s.charCount} chars`);

    const result = await detectWithPangram(s.text);
    detections.push({
      id: s.id,
      text_preview: s.text.slice(0, 100),
      label: "ai",
      model: s.model,
      platform: s.platform,
      pangram_score: result?.score ?? null,
      pangram_fraction_ai_assisted: result?.fraction_ai_assisted ?? null,
      pangram_fraction_human: result?.fraction_human ?? null,
      pangram_classification: result?.classification ?? null,
      pangram_headline: result?.headline ?? null,
      pangram_prediction: result?.prediction ?? null,
      pangram_windows: result?.windows ?? [],
      pangram_avg_window_confidence: result
        ? result.windows.length > 0
          ? result.windows.reduce((s, w) => s + w.ai_assistance_score, 0) / result.windows.length
          : null
        : null,
      pangram_max_window_ai_score: result
        ? Math.max(...result.windows.map((w) => w.ai_assistance_score), 0)
        : null,
      detected_at: new Date().toISOString(),
      error: result ? undefined : "Pangram API unavailable",
    });

    // Pangram rate limit: be conservative
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Detect human controls
  console.log(`\n▸ Detecting ${humanControls.length} human controls...`);
  for (let i = 0; i < humanControls.length; i++) {
    const h = humanControls[i];
    console.log(`  [${i + 1}/${humanControls.length}] ${h.id}`);

    const result = await detectWithPangram(h.text);
    detections.push({
      id: h.id,
      text_preview: h.text.slice(0, 100),
      label: "human",
      model: "human",
      platform: "mixed",
      pangram_score: result?.score ?? null,
      pangram_fraction_ai_assisted: result?.fraction_ai_assisted ?? null,
      pangram_fraction_human: result?.fraction_human ?? null,
      pangram_classification: result?.classification ?? null,
      pangram_headline: result?.headline ?? null,
      pangram_prediction: result?.prediction ?? null,
      pangram_windows: result?.windows ?? [],
      pangram_avg_window_confidence: result
        ? result.windows.length > 0
          ? result.windows.reduce((s, w) => s + w.ai_assistance_score, 0) / result.windows.length
          : null
        : null,
      pangram_max_window_ai_score: result
        ? Math.max(...result.windows.map((w) => w.ai_assistance_score), 0)
        : null,
      detected_at: new Date().toISOString(),
      error: result ? undefined : "Pangram API unavailable",
    });

    await new Promise((r) => setTimeout(r, 1500));
  }

  writeFileSync(DETECTION_PATH, JSON.stringify(detections, null, 2));
  console.log(`\n✓ Saved ${detections.length} detection results to ${DETECTION_PATH}`);

  // ── Stage 3: Compute cross-model report ───────────────────
  console.log(`\n━━━ STAGE 3: Cross-Model Analysis ━━━\n`);

  const successfulDetections = detections.filter((d) => d.pangram_score !== null);
  const aiDetections = successfulDetections.filter((d) => d.label === "ai");
  const humanDetections = successfulDetections.filter((d) => d.label === "human");

  // Per-model metrics
  const perModel: Record<string, {
    total: number;
    detected_ai: number;
    detected_human: number;
    avg_score: number;
    detection_rate: number;
    scores: number[];
  }> = {};

  for (const d of aiDetections) {
    if (!perModel[d.model]) {
      perModel[d.model] = { total: 0, detected_ai: 0, detected_human: 0, avg_score: 0, detection_rate: 0, scores: [] };
    }
    perModel[d.model].total++;
    perModel[d.model].scores.push(d.pangram_score!);
    if (d.pangram_score! >= 0.5) perModel[d.model].detected_ai++;
    else perModel[d.model].detected_human++;
  }

  for (const [model, data] of Object.entries(perModel)) {
    data.avg_score = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    data.detection_rate = data.detected_ai / data.total;
  }

  // Human FP rate
  const humanTP = humanDetections.filter((d) => d.pangram_score! < 0.5).length;
  const humanFP = humanDetections.filter((d) => d.pangram_score! >= 0.5).length;

  // Confusion matrix (overall)
  const tp = aiDetections.filter((d) => d.pangram_score! >= 0.5).length;
  const fn = aiDetections.filter((d) => d.pangram_score! < 0.5).length;
  const fp = humanFP;
  const tn = humanTP;
  const accuracy = (tp + tn) / (tp + fp + fn + tn);
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
  const fpr = fp / (fp + tn) || 0;

  const report = {
    generated_at: new Date().toISOString(),
    pipeline_version: "cross-model-v1",
    models_tested: Object.keys(perModel),
    total_samples: successfulDetections.length,
    ai_samples: aiDetections.length,
    human_samples: humanDetections.length,
    per_model: Object.entries(perModel).map(([model, data]) => ({
      model,
      n: data.total,
      detection_rate: parseFloat((data.detection_rate * 100).toFixed(1)),
      avg_pangram_score: parseFloat(data.avg_score.toFixed(4)),
      detected_as_ai: data.detected_ai,
      detected_as_human: data.detected_human,
    })),
    human_controls: {
      total: humanDetections.length,
      correctly_identified: humanTP,
      false_positives: humanFP,
      false_positive_rate: parseFloat((fpr * 100).toFixed(1)),
    },
    overall_metrics: {
      accuracy: parseFloat((accuracy * 100).toFixed(1)),
      precision: parseFloat((precision * 100).toFixed(1)),
      recall: parseFloat((recall * 100).toFixed(1)),
      f1_score: parseFloat((f1 * 100).toFixed(1)),
      false_positive_rate: parseFloat((fpr * 100).toFixed(1)),
      specificity: parseFloat(((1 - fpr) * 100).toFixed(1)),
    },
    confusion_matrix: { tp, fp, fn, tn },
    per_platform: (() => {
      const platforms: Record<string, { total: number; detected: number; scores: number[] }> = {};
      for (const d of aiDetections) {
        if (!platforms[d.platform]) platforms[d.platform] = { total: 0, detected: 0, scores: [] };
        platforms[d.platform].total++;
        platforms[d.platform].scores.push(d.pangram_score!);
        if (d.pangram_score! >= 0.5) platforms[d.platform].detected++;
      }
      return Object.entries(platforms).map(([platform, data]) => ({
        platform,
        n: data.total,
        detection_rate: parseFloat((data.detected / data.total * 100).toFixed(1)),
        avg_score: parseFloat((data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(4)),
      }));
    })(),
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  // ── Print summary ─────────────────────────────────────────
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║            CROSS-MODEL VALIDATION RESULTS        ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  console.log(`Total samples: ${report.total_samples} (${report.ai_samples} AI + ${report.human_samples} human)\n`);

  console.log("Per-Model Detection Rates:");
  for (const m of report.per_model) {
    const bar = "█".repeat(Math.round(m.detection_rate / 2.5));
    console.log(`  ${m.model.padEnd(10)} ${bar} ${m.detection_rate}% (${m.detected_as_ai}/${m.n}) avg_score=${m.avg_pangram_score}`);
  }

  console.log(`\nHuman Controls:`);
  console.log(`  Correctly identified: ${report.human_controls.correctly_identified}/${report.human_controls.total}`);
  console.log(`  False positive rate:  ${report.human_controls.false_positive_rate}%`);

  console.log(`\nOverall Metrics:`);
  console.log(`  Accuracy:   ${report.overall_metrics.accuracy}%`);
  console.log(`  Precision:  ${report.overall_metrics.precision}%`);
  console.log(`  Recall:     ${report.overall_metrics.recall}%`);
  console.log(`  F1 Score:   ${report.overall_metrics.f1_score}%`);
  console.log(`  FPR:        ${report.overall_metrics.false_positive_rate}%`);

  console.log(`\nPer-Platform:`);
  for (const p of report.per_platform) {
    console.log(`  ${p.platform.padEnd(10)} ${p.detection_rate}% (${p.n} samples) avg=${p.avg_score}`);
  }

  console.log(`\nConfusion Matrix:`);
  console.log(`                Predicted AI    Predicted Human`);
  console.log(`  Actual AI       ${String(tp).padStart(3)} (TP)        ${String(fn).padStart(3)} (FN)`);
  console.log(`  Actual Human    ${String(fp).padStart(3)} (FP)        ${String(tn).padStart(3)} (TN)`);

  console.log(`\n✓ Report saved to ${REPORT_PATH}`);
  console.log(`✓ All data saved to ${DATA_DIR}/`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
