#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Baloney AI-Generated Text Validation Pipeline
// Run: npx tsx scripts/validation-pipeline.ts
//
// Generates AI text from 3 SOTA LLMs, runs Pangram detection,
// and outputs per-model/per-platform validation results.
// ---------------------------------------------------------------------------

import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { resolve } from "path";

import { getPromptsForModel } from "./lib/prompts.ts";
import { generateBatch, checkApiKeys } from "./lib/generators.ts";
import type { GeneratedSample } from "./lib/generators.ts";
import { batchDetect, estimateBudget } from "./lib/pangram-detector.ts";
import type { DetectionResult } from "./lib/pangram-detector.ts";
import {
  computeValidationReport,
  formatReportForConsole,
} from "./lib/results-formatter.ts";
import { generateMarkdownReport } from "./lib/report-generator.ts";

// ---------------------------------------------------------------------------
// Load .env.local (tsx doesn't auto-load like Next.js)
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
const GENERATED_PATH = resolve(DATA_DIR, "generated-samples.json");
const DETECTION_PATH = resolve(DATA_DIR, "detection-results.json");
const REPORT_PATH = resolve(DATA_DIR, "validation-report.json");
const MARKDOWN_PATH = resolve(DATA_DIR, "VALIDATION_REPORT.md");

// Ensure data directory exists
mkdirSync(DATA_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SAMPLES_PER_MODEL = 45; // 15 topics x 3 platforms = max unique prompts
const PANGRAM_SAMPLES_PER_MODEL = 45; // All samples per model scanned
const HUMAN_CONTROL_COUNT = 50;
const MIN_CHAR_LENGTH = 300;

// Rate limiting per model (ms between batches)
const RATE_LIMITS: Record<string, { concurrency: number; delayMs: number }> = {
  gemini: { concurrency: 1, delayMs: 4200 }, // 15 RPM free tier → ~14.3 RPM safe
  chatgpt: { concurrency: 5, delayMs: 1000 }, // 60+ RPM
  claude: { concurrency: 3, delayMs: 2000 }, // Conservative
};

// ---------------------------------------------------------------------------
// Human control samples (from datasets.ts, inlined to avoid Next.js imports)
// ---------------------------------------------------------------------------

interface HumanSample {
  id: string;
  text: string;
  label: "human";
}

function getHumanControlSamples(): HumanSample[] {
  // Try to import from datasets.ts — fall back to hardcoded if path issues
  const datasetsPath = resolve(
    import.meta.dirname ?? __dirname,
    "../src/__tests__/datasets.ts",
  );

  // Since datasets.ts uses export const, we'll read and extract samples
  // For robustness, we use a curated subset of long human texts
  const hardcodedHumanSamples: HumanSample[] = [
    {
      id: "human-ctrl-1",
      label: "human",
      text: `So I tried making sourdough for like the fifth time and honestly? This one actually turned out decent. Not great, mind you — the crumb is still way too dense and I think I overproofed it a bit. But the crust!! Oh man the crust was actually crispy for once. My wife said it tasted "like real bread" which I'm choosing to take as a compliment lol. The trick was using the dutch oven that's been collecting dust in our cabinet since our wedding. Who knew that thing was actually useful? Anyway if anyone has tips for getting a more open crumb I'm all ears. I've been following the King Arthur recipe but I feel like I'm missing something fundamental.`,
    },
    {
      id: "human-ctrl-2",
      label: "human",
      text: `OK so I just spent 4 hours debugging what turned out to be a missing semicolon. FOUR HOURS. The error message was completely unhelpful — something about an unexpected token on line 847 when the actual problem was on line 12. I hate JavaScript sometimes, I really do. The worst part is I was pair programming with my colleague and neither of us caught it. We went down this whole rabbit hole thinking it was a webpack config issue. Rebuilt the entire build pipeline. Cleared every cache known to mankind. And then... semicolon. I need a drink. Actually I need a new career. Does anyone know if goat farming is profitable?`,
    },
    {
      id: "human-ctrl-3",
      label: "human",
      text: `Hot take: the best coffee shops are the ones that look slightly sketchy from the outside. Every time I see a place with mismatched furniture, weird art on the walls, and a barista with more tattoos than me, I know the espresso is gonna be fire. Meanwhile the places with the perfectly curated Instagram aesthetic always charge $8 for a latte that tastes like hot water. Fight me on this. I've been to enough bougie places to know the correlation is real.`,
    },
    {
      id: "human-ctrl-4",
      label: "human",
      text: `The fire started around 3 a.m. Tuesday, according to neighbors who were jolted awake by the sound of breaking glass and the acrid smell of smoke. By the time firefighters arrived — just seven minutes after the first 911 call — flames had already consumed the ground floor of the century-old Victorian. "I grabbed my kids and just ran," said Maria Torres, 34, who lived in the apartment above with her two daughters, ages 6 and 9. She stood across the street in bare feet, wrapped in a blanket a neighbor had given her, watching as firefighters wrestled a hose line through what had been her front door. The girls clung to her legs, their faces streaked with tears and soot.`,
    },
    {
      id: "human-ctrl-5",
      label: "human",
      text: `Weird day. Woke up late because my alarm didn't go off (or maybe I turned it off in my sleep, who knows). Rushed to get ready, spilled coffee on my shirt — the good white one of course — and had to change. Made it to the bus stop just as the bus was pulling away. So I walked. 45 minutes in the rain. By the time I got to work I looked like a drowned rat and my boss just looked at me and said "rough morning?" Understatement of the century, Dave. But then! THEN! After all that, Sarah from accounting told me the presentation I've been dreading got pushed to next week. I could have cried with relief. Ended up having a pretty good day after that actually.`,
    },
    {
      id: "human-ctrl-6",
      label: "human",
      text: `Look, I'm not going to pretend this vacuum is going to change your life or whatever. It's a vacuum. It sucks stuff up, which is... kind of the whole job description. But I will say this: after owning three different "smart" robot vacuums that mostly just got stuck under my couch and scared my cat, going back to a regular upright vacuum feels almost revolutionary. This thing actually picks up dog hair from my carpet. Like, ALL the dog hair. And I have a Golden Retriever, so that's saying something. The cord is annoyingly short though, and the attachment for upholstery is basically useless — it fell off every time I tried to use it. 4 stars because nothing in life is perfect.`,
    },
    {
      id: "human-ctrl-7",
      label: "human",
      text: `My grandmother's kitchen smelled like cinnamon and regret. She baked constantly — not because she particularly loved baking, but because she grew up during the Depression and wasting food was, to her, a kind of sin. Overripe bananas became bread. Stale bread became bread pudding. Bread pudding that nobody ate became... well, she found a use for that too, though I never asked what. She died when I was fourteen. I remember sitting in her kitchen the day after the funeral, surrounded by casserole dishes from well-meaning neighbors, and all I could think was that none of it smelled right. None of it smelled like her. I took the cinnamon shaker from her spice rack and put it in my pocket.`,
    },
    {
      id: "human-ctrl-8",
      label: "human",
      text: `So we migrated our entire backend from Express to Fastify last month and I want to be honest about how it went because most migration posts make everything sound smooth and ours was absolutely not. First off, middleware compatibility is a LIE. Or at least it's way more complicated than the docs suggest. We had about 40 custom Express middleware functions and roughly a third of them needed to be completely rewritten. The request/reply lifecycle in Fastify is different enough that some of our auth middleware broke in subtle ways — like, it worked in testing but silently failed to attach user context in production. That was a fun Wednesday night.`,
    },
    {
      id: "human-ctrl-9",
      label: "human",
      text: `The relationship between urban green spaces and mental health outcomes remains poorly understood, despite growing interest in nature-based interventions. While several cross-sectional studies have reported associations between proximity to parks and reduced psychological distress (Thompson et al., 2012; White et al., 2019), the causal mechanisms underlying these associations are far from clear. Our study attempted to address this gap through a longitudinal design tracking 1,847 participants over three years, but we encountered significant methodological challenges — particularly around self-selection bias, as individuals with better mental health may simply be more likely to choose residences near green spaces.`,
    },
    {
      id: "human-ctrl-10",
      label: "human",
      text: `The last time I saw my father, he was standing in the doorway of his apartment wearing one brown shoe and one black shoe. I didn't mention it. He wouldn't have wanted me to. He was always particular about appearances, which made the shoes more alarming than if he'd answered the door in his underwear — that might have been a choice, a deliberate casualness. The shoes were a mistake, and my father did not make mistakes. Not visible ones. "You look thin," he said, which was his way of saying hello. "You look good," I lied, which was my way of saying goodbye. Sometimes I think about those shoes.`,
    },
    {
      id: "human-ctrl-11",
      label: "human",
      text: `Hey, so about Saturday — I'm totally in but I might be a little late. My sister's flight lands at 2 and I promised I'd pick her up from the airport because apparently Uber is "too expensive" even though she literally just spent $400 on a carry-on suitcase. Sisters, man. Anyway I should be there by 4ish? Maybe 4:30 depending on traffic. Can you save me a seat? Also do I need to bring anything? I can grab beer on the way. Let me know if there's a specific kind people want. Actually scratch that, I'll just get a variety pack from that craft brewery on 5th.`,
    },
    {
      id: "human-ctrl-12",
      label: "human",
      text: `I've been teaching high school for twenty-two years, and I'm going to say something that might get me in trouble with my colleagues: homework is mostly pointless. Not all homework — I'm not a complete radical here. Practice problems in math serve a purpose. Reading assignments that prepare students for discussion can be valuable. But the worksheets? The busywork? The "write a five-paragraph essay about your weekend" assignments that nobody including me wants to read? We're wasting everyone's time. My students have seven other classes, most of them assigning homework too. They're exhausted, they're stressed, and they're learning to associate education with drudgery rather than curiosity.`,
    },
    {
      id: "human-ctrl-13",
      label: "human",
      text: `Moved to Denver 3 months ago knowing literally nobody and I gotta say — making friends as a 30-something adult is genuinely one of the hardest things I've ever done. Everyone says "join a rec league" or "go to meetups" and yeah I've done both but there's this awkward phase where you've hung out with someone twice and you're not sure if they actually like you or are just being polite. Like do I text them to hang out again? Is that too much? I feel like a middle schooler asking someone to sit at my lunch table. The weirdest part is I have great friendships back home that developed so naturally I never noticed the process.`,
    },
    {
      id: "human-ctrl-14",
      label: "human",
      text: `UPDATE to my post from last month about my landlord refusing to fix the heat. So after three weeks of space heaters and sleeping in a sleeping bag in my own apartment (in JANUARY), I finally got the city housing inspector involved. Inspector shows up, takes one look at the boiler, and his exact words were "how long has this been like this?" Turns out the thing hadn't been serviced in SIX YEARS and was actually a carbon monoxide risk. My landlord got slapped with violations and a deadline to fix it. He tried to blame me somehow?? Said I "didn't report it properly" even though I have 14 text messages in a row that he left on read.`,
    },
    {
      id: "human-ctrl-15",
      label: "human",
      text: `Just witnessed the most unhinged thing at Trader Joe's. Woman in front of me had approximately 47 bags of the dark chocolate peanut butter cups in her cart. The cashier very politely asked if she was shopping for an event and she just looked him dead in the eyes and said "no." Absolute legend. I respect the commitment. Meanwhile I'm there buying a single bag of frozen orange chicken like a peasant. The energy difference between us was palpable. She knew exactly what she wanted out of life and she was getting it, no questions asked. I aspire to that level of clarity.`,
    },
    {
      id: "human-ctrl-16",
      label: "human",
      text: `My dog just did the most dramatic thing. She wanted to go outside, so she brought me her leash. Normal enough. But when I didn't immediately get up from my desk, she sighed — actually SIGHED, like a disappointed parent — dropped the leash at my feet, walked to her bed, laid down facing the wall, and refused to look at me. I'm being guilt-tripped by a golden retriever and it's working. She held out for a full three minutes before peeking over her shoulder to see if I was coming. I was. Obviously. She won. She always wins. I don't make the rules in this house anymore.`,
    },
    {
      id: "human-ctrl-17",
      label: "human",
      text: `Here's the thing about running a small business that nobody tells you: the loneliness is brutal. Everyone sees the "being your own boss" part and thinks it's all freedom and flexibility. And yeah, I set my own schedule, which is great. But I also eat lunch alone every day. When something goes wrong at 2 AM, there's no coworker to commiserate with. When I land a big client, there's no office to high-five in. My wife is supportive but she doesn't fully get it. You can't really explain the specific anxiety of making payroll to someone who's never had to do it. Three years in and I still sometimes miss my cubicle.`,
    },
    {
      id: "human-ctrl-18",
      label: "human",
      text: `Went to my 20-year high school reunion last weekend and the whole experience was deeply surreal. The guy who used to copy my homework is now a surgeon. The girl I had a massive crush on didn't remember my name. The class clown is an accountant and seems genuinely happy about it. The prom queen is going through her third divorce. Nothing makes sense anymore. Also the gym hasn't changed at all — same weird basketball court, same smell, same water fountains. It's like walking into a time capsule while simultaneously being reminded that you are very much no longer 18. Would not recommend if you're already having an existential crisis.`,
    },
    {
      id: "human-ctrl-19",
      label: "human",
      text: `I made the mistake of telling my 4-year-old that clouds are made of water and now she thinks she can drink them. Every time we go outside she points at clouds and asks me to "get that one" for her. I explained that they're very high up and I can't reach them. She suggested I use a ladder. I said they're higher than any ladder. She said "use two ladders." Can't argue with that logic honestly. Yesterday she cried because a cloud "ran away" before I could catch it. Parenting is just a series of problems you never anticipated having to solve, and also you're exhausted.`,
    },
    {
      id: "human-ctrl-20",
      label: "human",
      text: `Three years ago I quit my corporate job to become a freelance photographer and everyone thought I was insane. My parents literally held an intervention. My dad showed me a PowerPoint about financial security. A POWERPOINT. With charts. He'd clearly spent hours on it which is both touching and infuriating. Fast forward to now: I'm making about 60% of what I used to make, I have zero savings, my retirement plan is "hopefully die before I'm old," BUT — and this is a big but — I wake up excited to work every single day. That has to count for something right? Right?? Someone please validate my life choices.`,
    },
    {
      id: "human-ctrl-21",
      label: "human",
      text: `My neighbor has been learning to play the drums for approximately six months now and I can confirm that the progress has been... minimal. Every evening between 7 and 8 PM, I am treated to what sounds like someone throwing pots and pans down a staircase in 4/4 time. I've considered leaving a passive-aggressive note but honestly at this point I'm invested in their journey. Last week they attempted what I think was supposed to be "In the Air Tonight" by Phil Collins and I had to respect the audacity even as my walls vibrated. If you're reading this, Apartment 3B: please keep going. You're terrible but you're committed and that's beautiful.`,
    },
    {
      id: "human-ctrl-22",
      label: "human",
      text: `Someone asked me what it's like being a nurse and I said "you know that dream where you show up to school and realize you forgot to study for a test?" and they said yes and I said "it's like that but the test is a person and they might die." That's obviously dramatic but some days it genuinely feels like that. The thing they don't prepare you for in nursing school is the emotional weight. You can study pharmacology and anatomy until your eyes bleed but nothing prepares you for a patient squeezing your hand and asking you if they're going to be okay. You learn to compartmentalize or you burn out. There's no middle ground.`,
    },
    {
      id: "human-ctrl-23",
      label: "human",
      text: `I just realized I've been putting off scheduling a dentist appointment for so long that my last visit was pre-pandemic. That's not a flex, that's a cry for help. I know I need to go. My teeth know I need to go. But every time I pick up the phone, some deep primal part of my brain convinces me that whatever's happening in there is probably fine and ignorance is bliss. This is obviously irrational. I'm a functional adult who pays taxes and maintains a houseplant collection. But apparently the dentist is where my maturity draws the line. Scheduling it tomorrow. (I've said this every week for six months.)`,
    },
    {
      id: "human-ctrl-24",
      label: "human",
      text: `The thing about grief that nobody warns you about is how boring it gets. Everyone expects the crying and the rage and the bargaining. Movies prepare you for that part. But nobody tells you about the Tuesday afternoons where you just sit on the couch and stare at nothing because your brain is too tired to feel anything. Or the weird guilt when you laugh at something three weeks after the funeral. Or how you'll be completely fine in the grocery store and then a specific brand of crackers will make you cry because your mom used to buy them. Grief isn't one big wave. It's a thousand little ones that catch you when you're not looking.`,
    },
    {
      id: "human-ctrl-25",
      label: "human",
      text: `Started a vegetable garden this year because I thought it would be "relaxing" and "therapeutic" and a nice way to "connect with nature." I am here to report that it is none of those things. It is a war. A war against squirrels, aphids, an inexplicably aggressive rabbit, my own incompetence, and whatever fungus keeps appearing on my tomato plants. My neighbor whose garden looks like a Martha Stewart photoshoot tried to give me advice and I nearly threw a trowel at her. My harvest so far: two cherry tomatoes and an emotional breakdown. But I am not quitting because I refuse to let the squirrels win.`,
    },
    {
      id: "human-ctrl-26",
      label: "human",
      text: `I think the hardest part of being an immigrant that people don't understand is the language gap with your own parents. My mom's English got her through grocery stores and PTA meetings but we've never had a real conversation about anything deep. And my Korean is stuck at whatever level I was when we moved here — roughly 8th grade. So there's this whole emotional landscape between us that we literally don't have the words for in either language. She can't tell me her hopes in English. I can't tell her my fears in Korean. We love each other across this linguistic no man's land and it's fine but sometimes it's really not.`,
    },
    {
      id: "human-ctrl-27",
      label: "human",
      text: `Just got back from a work conference and I need to debrief on the sheer audacity of conference networking. A man walked up to me, handed me a business card that said "Disruption Consultant" on it, and said — without a trace of irony — "I help companies fail forward faster." FAIL FORWARD FASTER. I excused myself to the bathroom where I laughed for three solid minutes. What does that even MEAN. The conference was in Phoenix in July which should be illegal. My name badge melted slightly. The coffee was terrible. The keynote speaker used the word "synergy" eleven times. I counted. Not going back.`,
    },
    {
      id: "human-ctrl-28",
      label: "human",
      text: `Dating in your 30s is an entirely different sport than dating in your 20s. In your 20s it's all butterflies and spontaneity and staying up until 3 AM talking about your dreams. In your 30s it's more like... "do you have a therapist? Great. Do you have health insurance? Even better. What's your relationship with your parents like? Interesting." I went on a date last week and we spent twenty minutes comparing our sleep schedules to see if we were compatible. And you know what? That's way more useful information than whatever we talked about on dates at 22. Romance isn't dead, it's just gotten practical.`,
    },
    {
      id: "human-ctrl-29",
      label: "human",
      text: `My kid's school sent home a fundraiser packet that's basically a small novel. There are 47 items you can sell, ranging from frozen cookie dough (reasonable) to a $65 scented candle that looks like it was designed by someone who's never seen a candle. The top seller gets a limo ride to Pizza Hut which honestly sounds like a nightmare but my 8-year-old is OBSESSED with winning it. So now I'm the adult going door to door in my neighborhood selling overpriced wrapping paper because I can't tell my kid that the limo dream is not worth my dignity. Spoiler: it absolutely is not.`,
    },
    {
      id: "human-ctrl-30",
      label: "human",
      text: `I just paid $6 for an iced coffee that was 80% ice and I'm going to make it everyone's problem. This is highway robbery happening in broad daylight and we've all just accepted it because caffeine addiction is a powerful motivator. Remember when coffee was $1.50? I'm only 34 but I sound like my grandfather at the diner complaining about prices. Next I'll be telling the barista about walking to school uphill both ways. The worst part is I'll absolutely go back tomorrow and pay $6 again because the iced coffee is good and I have no self-control. This is my villain origin story.`,
    },
    {
      id: "human-ctrl-31",
      label: "human",
      text: `Tried to explain TikTok to my 68-year-old father and it went about as well as you'd expect. "So people just... dance?" Not exactly, Dad. "And they film themselves eating?" Sometimes. "And this is a career?" For some people, yes. He stared at me for a long time and then said "I fought in a war for this" which is his go-to response for anything he doesn't understand about modern technology. He also says this about self-checkout machines and QR code menus. He did not in fact fight in a war but the dramatic delivery really sells it every time.`,
    },
    {
      id: "human-ctrl-32",
      label: "human",
      text: `There's a specific kind of existential dread that comes from opening your laptop at 9 AM to 147 unread emails. Not a single one is urgent but all of them need a response and each one requires just enough thought that you can't autopilot through them. By email 30 you're questioning every life choice that led you to a career that involves this much electronic correspondence. By email 60 you're fantasizing about becoming a lighthouse keeper. By email 100 you've accepted your fate and are merely surviving. The worst ones are the ones that say "per my last email" which is corporate for "can you read."`,
    },
    {
      id: "human-ctrl-33",
      label: "human",
      text: `I accidentally became the "plant person" at work and I need to confess something: most of them are barely alive. It started when I brought in one small succulent. Then someone said "oh you like plants!" and suddenly everyone was giving me their dying plants to "fix." Karen from HR gave me a fern that was literally crispy. My boss brought in an orchid that I think had already passed on to the great greenhouse in the sky. But I can't admit defeat because now it's my whole personality at this office. So I just keep replacing the dead ones with new ones from Trader Joe's and hoping nobody notices.`,
    },
    {
      id: "human-ctrl-34",
      label: "human",
      text: `Took my car to the mechanic yesterday and he did that thing where he sucks air through his teeth and says "well..." and I knew immediately that my wallet was about to take a beating. Turns out I need new brake pads, which I expected, but also the rotors are warped and something called a "control arm bushing" is going bad. I don't know what that is but it costs $400 so it better be important. The mechanic showed me the worn parts and explained everything in detail, which I appreciated even though I was nodding along understanding about 30% of it. Why don't they teach this stuff in school instead of calculus.`,
    },
    {
      id: "human-ctrl-35",
      label: "human",
      text: `The power went out last night during a thunderstorm and for exactly 45 minutes my family experienced what life was like before electricity. We sat around with candles and actually talked to each other. My teenager put her phone down (it was dead). My husband told a story about his childhood that I'd never heard. The kids played cards. It was genuinely lovely. Then the power came back on and within 30 seconds everyone was back on their devices like nothing happened. I briefly considered flipping the breaker off permanently but I need wifi to work so here we are, right back where we started.`,
    },
    {
      id: "human-ctrl-36",
      label: "human",
      text: `Anyone else absolutely terrible at estimating how long things take? I told my wife I'd be "five minutes" at the hardware store and came back two hours later with a cart full of things we don't need and exactly zero of the things we do need. In my defense, hardware stores are designed to trap you. You go in for one specific screw and suddenly you're in the power tools aisle thinking "I COULD build a deck." You cannot build a deck. You couldn't even hang a shelf last week. But in the hardware store, anything feels possible. It's like a casino but with lumber.`,
    },
    {
      id: "human-ctrl-37",
      label: "human",
      text: `My coworker microwaves fish for lunch every day and I've been silently seething about it for months. Today I finally said something and she looked at me like I was crazy and said "it's salmon, it's healthy." THAT'S NOT THE POINT LINDA. The entire fourth floor smells like a fishing village by 12:15. I've started eating lunch in my car to escape it. Other people have complained too but management says it's a "personal food choice" and they can't restrict it. Meanwhile I'm over here with my sad turkey sandwich wondering how we've advanced as a civilization yet cannot solve the office microwave fish problem.`,
    },
    {
      id: "human-ctrl-38",
      label: "human",
      text: `Got rear-ended in a parking lot today. Everyone's fine, cars are fine, but the other driver got out and the first thing she said was "I'm SO sorry, I was trying to skip a song on Spotify." At least she was honest. We exchanged insurance info while making small talk and it turns out she's a kindergarten teacher and I felt bad for even being mildly annoyed because those people are saints. Anyway my bumper has a little scuff that I'm going to tell everyone is from an "incident" without elaborating, because it sounds way cooler than "a woman who was trying to play Taylor Swift hit me at 3 mph."`,
    },
    {
      id: "human-ctrl-39",
      label: "human",
      text: `I've been going to the same barber for 11 years and I just found out his name isn't actually Tony. It's Thomas. THOMAS. Everyone calls him Tony — it's written on the shop window, his business cards say Tony's Cuts, other barbers call him Tony. But apparently his real name is Thomas and "Tony" just stuck from some misunderstanding in 2009 that he decided wasn't worth correcting. This man has been living under an assumed identity at his own barbershop for 15 years. I don't even know what's real anymore. He gave me a great haircut though. As always.`,
    },
    {
      id: "human-ctrl-40",
      label: "human",
      text: `Just watched my 3-year-old negotiate with a cat and honestly she has better conflict resolution skills than most adults I know. The cat was sitting in her favorite chair. Instead of screaming or crying (her usual strategy), she walked up, offered the cat a piece of cheese, waited for the cat to jump down to eat it, then casually took the chair. Cold. Calculated. Effective. I fear I am raising either a future diplomat or a future supervillain and honestly either way I'm impressed. The cat has been giving her dirty looks ever since. This household has entered a new era of political complexity.`,
    },
    {
      id: "human-ctrl-41",
      label: "human",
      text: `My upstairs neighbor apparently decided that 11 PM on a Tuesday was the perfect time to rearrange all their furniture. For two hours I lay in bed listening to what sounded like an IKEA showroom being dragged across hardwood floors by a team of enthusiastic elephants. At one point something heavy fell and my ceiling light flickered. I considered going up there but then I heard muffled arguing followed by what I think was a power drill and decided it was best to stay in my lane. This morning I saw them in the hallway and they looked exhausted. "Long night?" I asked. "You don't know the half of it," they said. I do though. I absolutely do.`,
    },
    {
      id: "human-ctrl-42",
      label: "human",
      text: `The thing about being a middle child that nobody appreciates is the diplomatic skill set you develop. By age 7 I could read a room better than most therapists. My older sister got attention for being the first at everything. My younger brother got attention for being the baby. I got attention for successfully preventing World War III at the dinner table every night. "Mom, she looked at me!" "He's breathing too loud!" "She touched my side of the seat!" And there I am, 9 years old, negotiating a ceasefire over the armrest. Corporate America should be recruiting middle children for their conflict resolution departments.`,
    },
    {
      id: "human-ctrl-43",
      label: "human",
      text: `Every few months I go through a phase where I'm convinced I'm going to become a morning person. I buy a sunrise alarm clock. I set out my workout clothes the night before. I prep overnight oats. I go to bed at 9:30 PM feeling incredibly smug about my upcoming transformation. Then the alarm goes off at 5:30 AM and the version of me that exists at that hour wants nothing to do with any of this. Morning Me is a completely different person who hates Nighttime Me's plans and ambitions. This cycle has repeated roughly 47 times and the results have never once varied. I am not a morning person. I need to accept this.`,
    },
    {
      id: "human-ctrl-44",
      label: "human",
      text: `Someone rear-ended my shopping cart at Costco and then apologized to ME like I was the one who'd done something wrong. This is peak Costco culture. It's thunderdome in there every Saturday. You've got people double-parking their oversized carts in the olive oil aisle while they debate between regular and extra virgin like it's a life-altering decision. The sample stations create traffic jams that would make Los Angeles jealous. And don't even get me started on the parking lot — I once saw a woman wait 8 minutes for a parking spot when there was an empty one two rows over. We are not our best selves at Costco.`,
    },
    {
      id: "human-ctrl-45",
      label: "human",
      text: `I just discovered that my 12-year-old has been running a Minecraft server that apparently has 200+ active users and he charges a monthly "membership fee" in Robux. He has a spreadsheet tracking his "subscribers." He made a FAQ document. He has MODERATORS. This child cannot remember to brush his teeth before bed but he's running a small business with better organization than some companies I've worked for. I don't know whether to be proud or concerned. My wife says both. She's probably right. She's always right about the things that are simultaneously impressive and terrifying.`,
    },
    {
      id: "human-ctrl-46",
      label: "human",
      text: `Today I spent twenty minutes looking for my glasses while wearing my glasses. This is not the first time this has happened but it might be the most embarrassing because I was also on a video call and at one point asked my coworker if they'd seen my glasses. They stared at me. I stared back. Then I reached up to scratch my nose and there they were. On my face. Where they'd been the entire time. My coworker is still laughing about it three hours later. I'm going to need to switch companies now. There's no coming back from this. I am forever the person who lost their glasses on their own face.`,
    },
    {
      id: "human-ctrl-47",
      label: "human",
      text: `There should be a support group for people who are terrible at parallel parking. I've been driving for 18 years and I still cannot do it without turning it into a 47-point turn while cars line up behind me. Last week I tried to parallel park in a spot that was roughly the size of a football field and STILL had to pull out and try again. Twice. A teenager on the sidewalk was watching and I could feel the judgment radiating from their entire body. My husband offered to do it for me and I said no because at some point in life you have to face your demons, even if your demons are a Honda Civic and a curb.`,
    },
    {
      id: "human-ctrl-48",
      label: "human",
      text: `The WiFi went out at work today and for 45 glorious minutes we all remembered what it was like to be human. People walked to each other's desks instead of sending Slack messages. Someone found a deck of cards. The accounting department apparently has a puzzle they've been working on in secret. It was beautiful. Then IT fixed it and we all went back to our screens and pretended that brief moment of connection never happened. We are all just hamsters on a wheel and the wheel is powered by broadband internet. This is fine. Everything is fine. I'm going to go stare at spreadsheets now.`,
    },
    {
      id: "human-ctrl-49",
      label: "human",
      text: `I accidentally said "love you bye" to a customer service representative today and I've been thinking about it ever since. It just came out. Muscle memory from ending every phone call with my wife that way. The representative paused for a beat and then very professionally said "thank you for calling Verizon, have a nice day" and I respect them for not making it weird. But I KNOW they told their coworkers immediately. I'm going to need a new phone provider now. Or a new identity. Honestly the identity change might be easier at this point because have you tried calling Verizon? That's how we got into this mess.`,
    },
    {
      id: "human-ctrl-50",
      label: "human",
      text: `My apartment's fire alarm goes off every single time I cook anything more complicated than toast. Not when there's actual smoke — when there's STEAM. I boiled pasta last night and the alarm went off. PASTA. The most benign food preparation in human history triggered a full building alert. My neighbors have stopped even checking anymore. They just hear the alarm, think "oh, apartment 4C is cooking again," and go back to their lives. I've tried fanning it, covering it, even cooking with every window open in January. Nothing works. I'm considering just eating cereal for every meal. The fire alarm has won. I accept defeat.`,
    },
  ];

  return hardcodedHumanSamples.filter((s) => s.text.length >= MIN_CHAR_LENGTH);
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function main() {
  const startTime = Date.now();
  console.log("═══════════════════════════════════════════════════════");
  console.log("  BALONEY VALIDATION PIPELINE");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log("");

  // ── Step 0: Check API keys ──
  const keys = checkApiKeys();
  console.log("API Key Status:");
  console.log(`  Gemini (GOOGLE_AI_KEY):    ${keys.gemini ? "OK" : "MISSING"}`);
  console.log(`  ChatGPT (OPENAI_API_KEY):  ${keys.chatgpt ? "OK" : "MISSING"}`);
  console.log(`  Claude (ANTHROPIC_API_KEY): ${keys.claude ? "OK" : "MISSING"}`);
  console.log(`  Pangram (PANGRAM_API_KEY):  ${process.env.PANGRAM_API_KEY ? "OK" : "MISSING"}`);
  console.log("");

  const availableModels = (
    ["gemini", "chatgpt", "claude"] as const
  ).filter((m) => keys[m]);

  if (availableModels.length === 0) {
    console.error(
      "ERROR: No LLM API keys found. Set at least one of:\n" +
      "  export GOOGLE_AI_KEY=...       # Gemini\n" +
      "  export OPENAI_API_KEY=...      # ChatGPT\n" +
      "  export ANTHROPIC_API_KEY=...   # Claude\n" +
      "Or add them to frontend/.env.local",
    );
    process.exit(1);
  }

  console.log(
    `Available models: ${availableModels.join(", ")} (${availableModels.length}/3)`,
  );
  console.log("");

  // ── Step 1: Generate AI text ──
  console.log("─── STEP 1: Generate AI Text ───────────────────────");

  let allSamples: GeneratedSample[] = [];

  // Check for cached samples
  if (existsSync(GENERATED_PATH)) {
    try {
      const cached = JSON.parse(
        readFileSync(GENERATED_PATH, "utf-8"),
      ) as GeneratedSample[];
      if (cached.length >= availableModels.length * 20) {
        console.log(
          `Found ${cached.length} cached samples, skipping generation.`,
        );
        console.log("  (Delete scripts/data/generated-samples.json to regenerate)");
        allSamples = cached;
      }
    } catch {
      // Ignore corrupt cache
    }
  }

  if (allSamples.length === 0) {
    const perModel = Math.min(
      SAMPLES_PER_MODEL,
      Math.ceil(SAMPLES_PER_MODEL / availableModels.length) *
        availableModels.length,
    );

    // Generate in parallel across models
    const generationPromises = availableModels.map(async (model) => {
      const prompts = getPromptsForModel(perModel);
      const { concurrency, delayMs } = RATE_LIMITS[model];
      console.log(
        `\nGenerating ${prompts.length} samples for ${model} (concurrency=${concurrency}, delay=${delayMs}ms)...`,
      );
      return generateBatch(model, prompts, concurrency, delayMs);
    });

    const results = await Promise.all(generationPromises);
    allSamples = results.flat();

    // Save generated samples
    writeFileSync(GENERATED_PATH, JSON.stringify(allSamples, null, 2));
    console.log(`\nSaved ${allSamples.length} generated samples to ${GENERATED_PATH}`);
  }

  // Report generation stats
  const modelCounts = new Map<string, number>();
  const platformCounts = new Map<string, number>();
  for (const s of allSamples) {
    modelCounts.set(s.model, (modelCounts.get(s.model) ?? 0) + 1);
    platformCounts.set(s.platform, (platformCounts.get(s.platform) ?? 0) + 1);
  }

  console.log("\nGeneration Summary:");
  for (const [model, count] of modelCounts) {
    console.log(`  ${model}: ${count} samples`);
  }
  for (const [platform, count] of platformCounts) {
    console.log(`  ${platform}: ${count} samples`);
  }
  console.log("");

  // ── Step 2: Collect human control samples ──
  console.log("─── STEP 2: Collect Human Control Samples ──────────");

  const humanSamples = getHumanControlSamples().slice(0, HUMAN_CONTROL_COUNT);
  console.log(`Collected ${humanSamples.length} human control samples (>= ${MIN_CHAR_LENGTH} chars)`);
  console.log("");

  // ── Step 3: Run Pangram detection ──
  console.log("─── STEP 3: Run Pangram Detection ──────────────────");

  if (!process.env.PANGRAM_API_KEY) {
    console.warn("");
    console.warn("╔══════════════════════════════════════════════════════════╗");
    console.warn("║  ⚠  SYNTHETIC DATA MODE                                ║");
    console.warn("║                                                        ║");
    console.warn("║  PANGRAM_API_KEY not set. Detection scores will be     ║");
    console.warn("║  randomly generated, NOT from real Pangram analysis.   ║");
    console.warn("║  All metrics in this run are MEANINGLESS.              ║");
    console.warn("║                                                        ║");
    console.warn("║  To run real detection:                                ║");
    console.warn("║    export PANGRAM_API_KEY=your_key_here                ║");
    console.warn("╚══════════════════════════════════════════════════════════╝");
    console.warn("");

    // Generate synthetic scores for demo/testing purposes
    const syntheticResults: DetectionResult[] = [];

    // AI samples — assign high synthetic scores
    for (const sample of allSamples) {
      const fractionAi = 0.85 + Math.random() * 0.14; // 0.85-0.99
      const fractionAiAssisted = Math.random() * 0.10;
      const fractionHuman = 1 - fractionAi - fractionAiAssisted;
      syntheticResults.push({
        id: sample.id,
        text_preview: sample.text.slice(0, 100),
        label: "ai",
        model: sample.model,
        platform: sample.platform,
        pangram_score: fractionAi,
        pangram_fraction_ai_assisted: fractionAiAssisted,
        pangram_fraction_human: Math.max(0, fractionHuman),
        pangram_classification: "AI",
        pangram_headline: "AI Detected",
        pangram_prediction: "Synthetic score for testing",
        pangram_num_ai_segments: 3,
        pangram_num_ai_assisted_segments: 0,
        pangram_num_human_segments: 0,
        pangram_windows: [],
        pangram_avg_window_confidence: 0.9,
        pangram_max_window_ai_score: fractionAi,
        detected_at: new Date().toISOString(),
      });
    }

    // Human samples — assign low synthetic scores
    for (const sample of humanSamples) {
      const fractionHuman = 0.85 + Math.random() * 0.14;
      const fractionAiAssisted = Math.random() * 0.05;
      const fractionAi = 1 - fractionHuman - fractionAiAssisted;
      syntheticResults.push({
        id: sample.id,
        text_preview: sample.text.slice(0, 100),
        label: "human",
        pangram_score: Math.max(0, fractionAi),
        pangram_fraction_ai_assisted: fractionAiAssisted,
        pangram_fraction_human: fractionHuman,
        pangram_classification: "Human",
        pangram_headline: "Fully Human Written",
        pangram_prediction: "Synthetic score for testing",
        pangram_num_ai_segments: 0,
        pangram_num_ai_assisted_segments: 0,
        pangram_num_human_segments: 3,
        pangram_windows: [],
        pangram_avg_window_confidence: 0.85,
        pangram_max_window_ai_score: 0,
        detected_at: new Date().toISOString(),
      });
    }

    writeFileSync(DETECTION_PATH, JSON.stringify(syntheticResults, null, 2));
    console.log(
      `Saved ${syntheticResults.length} synthetic detection results to ${DETECTION_PATH}`,
    );

    finishPipeline(allSamples, syntheticResults, startTime, true);
    return;
  }

  // Budget estimation
  const aiSubset = selectSubset(allSamples, PANGRAM_SAMPLES_PER_MODEL);
  const totalScans = aiSubset.length + humanSamples.length;
  const budget = estimateBudget(totalScans);
  console.log(`Budget estimate: ${budget.credits} credits (${budget.estimatedCost})`);
  console.log(
    `Scanning: ${aiSubset.length} AI samples + ${humanSamples.length} human controls = ${totalScans} total`,
  );
  console.log("");

  // Build detection samples
  const detectionSamples = [
    ...aiSubset.map((s) => ({
      id: s.id,
      text: s.text,
      label: "ai" as const,
      model: s.model,
      platform: s.platform,
    })),
    ...humanSamples.map((s) => ({
      id: s.id,
      text: s.text,
      label: "human" as const,
    })),
  ];

  // Run batch detection
  const detectionResults = await batchDetect(
    detectionSamples,
    DETECTION_PATH,
    500,
  );

  console.log(`\nDetection complete: ${detectionResults.length} results`);

  finishPipeline(allSamples, detectionResults, startTime, false);
}

// ---------------------------------------------------------------------------
// Select balanced subset from generated samples
// ---------------------------------------------------------------------------

function selectSubset(
  samples: GeneratedSample[],
  perModel: number,
): GeneratedSample[] {
  const byModel = new Map<string, GeneratedSample[]>();
  for (const s of samples) {
    if (!byModel.has(s.model)) byModel.set(s.model, []);
    byModel.get(s.model)!.push(s);
  }

  const result: GeneratedSample[] = [];
  for (const [, modelSamples] of byModel) {
    // Shuffle and take `perModel`
    const shuffled = [...modelSamples].sort(() => Math.random() - 0.5);
    result.push(...shuffled.slice(0, perModel));
  }

  return result;
}

// ---------------------------------------------------------------------------
// Finish pipeline: compute metrics, save report & markdown
// ---------------------------------------------------------------------------

function finishPipeline(
  samples: GeneratedSample[],
  detectionResults: DetectionResult[],
  startTime: number,
  isSynthetic: boolean = false,
) {
  console.log("\n─── STEP 4: Compute Metrics & Generate Reports ─────");

  // Filter out error results
  const validResults = detectionResults.filter(
    (r) => r.pangram_score >= 0,
  );

  if (validResults.length === 0) {
    console.error("ERROR: No valid detection results. Cannot compute metrics.");
    process.exit(1);
  }

  // Compute validation report
  const report = computeValidationReport(validResults);

  // Tag synthetic data
  const reportWithMeta = { ...report, isSynthetic };

  // Save JSON report
  writeFileSync(REPORT_PATH, JSON.stringify(reportWithMeta, null, 2));
  console.log(`Saved validation report to ${REPORT_PATH}`);

  // Print console report
  const consoleReport = formatReportForConsole(report);
  console.log(consoleReport);

  // Generate markdown report
  const timestamp = new Date().toISOString();
  const markdownReport = generateMarkdownReport({
    samples,
    report,
    timestamp,
    isSynthetic,
  });
  writeFileSync(MARKDOWN_PATH, markdownReport);
  console.log(`Saved markdown report to ${MARKDOWN_PATH}`);

  // ── Verification Summary ──
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("═══════════════════════════════════════════════════════");
  console.log("  VERIFICATION CHECKLIST");
  console.log("═══════════════════════════════════════════════════════");
  console.log(
    `  [${samples.length >= 90 ? "PASS" : "WARN"}] Generated samples: ${samples.length} (target: 135)`,
  );
  console.log(
    `  [${samples.every((s) => s.charCount >= 300) ? "PASS" : "WARN"}] All samples >= 300 chars`,
  );
  console.log(
    `  [${validResults.length >= 100 ? "PASS" : "WARN"}] Detection results: ${validResults.length} (target: 185)`,
  );
  console.log(
    `  [${report.auc_roc > 0.95 ? "PASS" : "WARN"}] AUC-ROC: ${report.auc_roc.toFixed(3)} (target: > 0.95)`,
  );
  console.log(`  Time elapsed: ${elapsed}s`);
  console.log("═══════════════════════════════════════════════════════");
  console.log("");

  // Output files list
  console.log("Output files:");
  console.log(`  ${GENERATED_PATH}`);
  console.log(`  ${DETECTION_PATH}`);
  console.log(`  ${REPORT_PATH}`);
  console.log(`  ${MARKDOWN_PATH}`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main().catch((error) => {
  console.error("Pipeline failed:", error);
  process.exit(1);
});
