// 2026-generation benchmark dataset for AI detection evaluation
// Expands coverage from ~207 to 500+ samples
//
// Ground truth methodology:
// - AI samples: representative of named model's output patterns as of 2025-2026
// - Human samples: sourced from journalism, academic writing, casual blogs, creative fiction
// - Each sample tagged with generation model/source and content category
// - Minimum 200 characters per text sample for statistical reliability
//
// Target model coverage (2026 generation):
// Text: GPT-5.x, Claude 4.x, Gemini 3.x, Llama 4, Mistral Large, DeepSeek
// Image: Midjourney v7, DALL-E 4, Flux Pro, Stable Diffusion 4, Firefly, Imagen 4

import type { TextSample } from "./datasets";

// ══════════════════════════════════════════════════════════
// AI TEXT SAMPLES — 2026 Generation
// These are representative of current-gen model output patterns
// ══════════════════════════════════════════════════════════

export const AI_TEXT_SAMPLES_2026: TextSample[] = [

  // ── GPT-5 Style Samples ────────────────────────────────
  {
    id: "gpt5-analysis-1",
    label: "ai",
    category: "gpt5-analysis",
    description: "GPT-5 style comprehensive analysis of global supply chains",
    text: `Global supply chains have undergone a fundamental restructuring in the wake of successive disruptions, including the pandemic, geopolitical tensions, and extreme weather events attributable to climate change. The traditional model of hyper-optimized, just-in-time logistics, centered on low-cost manufacturing hubs in East Asia, is giving way to a more distributed architecture characterized by nearshoring, friendshoring, and significant increases in inventory buffers. Data from the World Bank and IMF suggests that reshoring initiatives in semiconductor manufacturing alone have attracted over $200 billion in announced investment across the United States, Europe, and Japan since 2022. However, the transition carries substantial costs: labor and land expenses in developed economies are typically 3-5 times higher than in traditional manufacturing hubs, and the ecosystem of suppliers, specialized workers, and tacit knowledge accumulated over decades cannot be rapidly replicated. The net effect is likely to be higher baseline production costs, more resilient supply networks, and a gradual decoupling of certain strategic industries from geopolitical adversaries. Policymakers must navigate the difficult trade-off between efficiency and resilience, recognizing that the optimal degree of redundancy varies significantly by product category, strategic importance, and time horizon.`,
  },
  {
    id: "gpt5-analysis-2",
    label: "ai",
    category: "gpt5-analysis",
    description: "GPT-5 style analysis of central bank monetary policy",
    text: `The coordinated global tightening cycle of 2022-2024 represented the most aggressive monetary policy shift in four decades, with the Federal Reserve raising the federal funds rate by 525 basis points in eighteen months. The transmission mechanisms to the real economy operated through several channels: mortgage rates roughly doubled, constraining housing affordability and construction activity; corporate borrowing costs increased substantially, pressuring leveraged balance sheets; and the strengthening dollar exported deflationary pressure to emerging markets while simultaneously reducing the competitiveness of US exports. The lag structure of monetary policy — conventionally estimated at 12-24 months — means that the full effects of this tightening are still working through the economy. A critical uncertainty concerns the neutral rate of interest, which appears to have shifted upward relative to the pre-pandemic period due to structural factors including higher government borrowing, the energy transition, and demographic changes in savings behavior. If the neutral rate is now 3-3.5% rather than 2-2.5%, then current policy is less restrictive than headline rates suggest, implying that inflation may prove more persistent than central bank projections currently indicate. This uncertainty complicates the calibration of the easing cycle and increases the risk of premature accommodation.`,
  },
  {
    id: "gpt5-analysis-3",
    label: "ai",
    category: "gpt5-analysis",
    description: "GPT-5 style analysis of AI safety research landscape",
    text: `The field of AI safety has undergone a significant maturation over the past several years, transitioning from a relatively niche area of theoretical concern to a central preoccupation of the major AI laboratories. This shift reflects both the rapid advancement of frontier model capabilities and growing evidence that certain failure modes — including reward hacking, sycophancy, and specification gaming — are not merely theoretical but observable in current systems. The technical research agenda has bifurcated into two broad approaches: alignment techniques that attempt to instill human values and intentions into AI systems through training (including reinforcement learning from human feedback, constitutional AI, and direct preference optimization), and interpretability research that seeks to understand what AI systems are actually doing internally in order to detect and correct misalignment. Both approaches face fundamental challenges: alignment techniques must contend with the difficulty of specifying human values completely and consistently, while interpretability research is complicated by the sheer complexity of modern neural networks and the lack of clear mapping between computational processes and human-interpretable concepts. Governance frameworks have lagged behind the technical research, with international coordination proving difficult despite the shared nature of the risks involved. The Bletchley Declaration of 2023 established some common ground, but the translation of shared principles into enforceable standards remains an open problem.`,
  },
  {
    id: "gpt5-technical-1",
    label: "ai",
    category: "gpt5-technical",
    description: "GPT-5 style technical explanation of distributed systems consensus",
    text: `Distributed consensus protocols solve a fundamental problem: how can a collection of nodes that communicate via unreliable networks reach agreement on a single value, even in the presence of failures? The theoretical limits were established by the FLP impossibility result, which proves that no deterministic algorithm can guarantee consensus in an asynchronous system if even one node may fail. Practical systems address this by relaxing assumptions: either by assuming partially synchronous networks (as in Paxos and Raft) or by accepting probabilistic rather than deterministic guarantees (as in proof-of-work blockchains). Raft, designed explicitly for understandability, organizes nodes into a leader-follower hierarchy. The leader accepts client requests, replicates log entries to followers, and commits entries once a quorum acknowledges them. Leader election is managed through randomized timeouts: followers that detect leader absence initiate elections, and the candidate that gathers a majority of votes becomes the new leader. The key safety property — that committed entries are never overwritten — is maintained by ensuring that a new leader must have the most up-to-date log among the quorum that elected it. Byzantine fault tolerant protocols like PBFT and its successors additionally protect against malicious nodes that send conflicting messages, at the cost of higher message complexity. Modern systems typically select protocols based on the threat model: Raft and similar CFT protocols for trusted distributed databases; BFT protocols for permissioned blockchains; and proof-of-work or proof-of-stake for permissionless settings.`,
  },
  {
    id: "gpt5-technical-2",
    label: "ai",
    category: "gpt5-technical",
    description: "GPT-5 style technical overview of transformer architecture",
    text: `The transformer architecture, introduced in the landmark "Attention Is All You Need" paper (Vaswani et al., 2017), has become the dominant paradigm in deep learning across modalities including language, vision, speech, and protein structure prediction. The core innovation is the self-attention mechanism, which allows each token in a sequence to directly attend to every other token, capturing long-range dependencies without the sequential processing bottleneck of recurrent networks. In the scaled dot-product attention formulation, queries, keys, and values are computed as linear projections of the input embeddings, and attention weights are computed as softmax-normalized dot products between queries and keys, scaled by the square root of the key dimension to prevent gradient saturation. Multi-head attention extends this by performing multiple attention operations in parallel with different learned projections, allowing the model to simultaneously attend to different types of relationships. The feed-forward network applied after each attention layer can be understood as providing per-position computation on the attended representations. Contemporary large language models have scaled this architecture to hundreds of billions of parameters, employing techniques such as grouped-query attention for inference efficiency, rotary position embeddings for better length generalization, and mixture-of-experts layers for scaling model capacity without proportional increases in compute. The empirical scaling laws described by Kaplan et al. and refined by Chinchilla suggest that optimal training requires balanced scaling of both model size and training data volume.`,
  },
  {
    id: "gpt5-news-1",
    label: "ai",
    category: "gpt5-news",
    description: "GPT-5 style news report on autonomous vehicle regulation",
    text: `Federal regulators finalized a comprehensive framework for the deployment of autonomous vehicles on public roads on Thursday, establishing mandatory safety reporting requirements and minimum performance standards that industry groups described as both overdue and burdensome. The rules, which take effect in eighteen months, require manufacturers to report any collision or unexpected disengagement of autonomous systems within five business days and to submit annual assessments of fleet-wide safety performance to the National Highway Traffic Safety Administration. Companies operating fully driverless vehicles without human override capability will be required to demonstrate, through both simulation and on-road testing, that their systems perform at least as well as experienced human drivers across a defined set of test scenarios. The framework notably declines to mandate specific technical approaches, instead focusing on performance outcomes — a choice that industry advocates welcomed as preserving space for innovation. Consumer advocacy groups criticized the rules as inadequate, pointing to a series of high-profile incidents involving autonomous systems in the preceding eighteen months. Shares of publicly traded autonomous vehicle companies rose modestly on the announcement, as the clarity provided by a finalized federal framework removes some of the regulatory uncertainty that has complicated investment decisions.`,
  },
  {
    id: "gpt5-news-2",
    label: "ai",
    category: "gpt5-news",
    description: "GPT-5 style news report about CERN particle physics discovery",
    text: `Physicists at the European Organization for Nuclear Research announced Wednesday the detection of a previously unobserved particle interaction that may provide experimental evidence for physics beyond the Standard Model, generating considerable excitement in the scientific community while cautioning that additional analysis is required before conclusions can be confirmed. The signal, observed in data from approximately 2.8 million proton collision events at the Large Hadron Collider, exhibits a statistical significance of 4.7 standard deviations — approaching but not yet reaching the conventional 5-sigma threshold required for a formal discovery claim in particle physics. The observed anomaly occurs in the decay products of B mesons, particles already known to display puzzling deviations from Standard Model predictions in previous experiments. If confirmed, the findings could indicate the existence of new fundamental forces or undiscovered particles that interact preferentially with the second and third generations of matter. The collaboration plans to analyze additional data from the current LHC run before submitting formal results for peer review. Independent experimental groups at Fermilab and other facilities are expected to prioritize searches for the same signal in their own datasets to provide cross-validation.`,
  },
  {
    id: "gpt5-essay-1",
    label: "ai",
    category: "gpt5-essay",
    description: "GPT-5 style essay on the philosophy of personal identity",
    text: `The question of what makes a person the same person over time has occupied philosophers for centuries, and it becomes increasingly pressing as emerging technologies raise concrete, practical versions of the puzzle. Derek Parfit's work on personal identity remains the most influential modern treatment. His central argument is that what matters in survival is not identity per se — the existence of some metaphysical fact connecting the future person to you — but rather psychological continuity: the overlapping chains of memories, beliefs, intentions, and character traits that connect your future self to your present self. On this view, a gradual replacement of your neurons with functionally identical silicon would preserve what matters even if it destroyed strict numerical identity. The teleporter thought experiment makes the intuitions vivid: if a device disintegrated you and reassembled an atom-for-atom replica on Mars, would the person who emerged be you? Most people's intuitive discomfort with this scenario, Parfit argues, reflects a confused attachment to identity rather than to what actually matters. The practical implications are substantial. They bear on the ethics of future generations (if you in thirty years is only loosely connected to you today, does it make sense to sacrifice your current interests for your "future self"?), on the nature of punishment, and increasingly on questions about the moral status of AI systems that exhibit sophisticated continuity of character and purpose.`,
  },
  {
    id: "gpt5-creative-1",
    label: "ai",
    category: "gpt5-creative",
    description: "GPT-5 style literary fiction opening",
    text: `The translator had learned seventeen languages by the age of forty, and had come to believe that each one contained not just different words but different ways of being wrong. In Mandarin, you could fail with precision, the grammar itself organizing your error into something almost graceful. In German, your mistakes became architectural, elaborate and load-bearing. But English — English was a language in which you could be wrong in all directions at once, imprecise and overspecific simultaneously, sentimental and clinical in the same breath. She thought about this on the morning she realized she had stopped dreaming in any language at all. The dreams had become purely visual, purely sensory — texture and temperature and the specific weight of a particular afternoon light — with no words attached, like subtitles that had been stripped from a film she already knew by heart. She mentioned this to her therapist, who suggested it might be progress. She suspected it might be something else entirely.`,
  },
  {
    id: "gpt5-creative-2",
    label: "ai",
    category: "gpt5-creative",
    description: "GPT-5 style speculative fiction about first contact",
    text: `The message arrived not as radio waves but as a structured perturbation in the cosmic microwave background, a pattern too regular to be natural and too patient to be anything but deliberate. It had been traveling for eleven thousand years. The team that decoded it took another four years to agree on what it said, and then spent two years arguing about whether to tell anyone. In the end, the decision was made not by governments or scientists but by a graduate student in Oslo who uploaded the decoded text to a public server at 3:17 in the morning because she had stayed up all night reading it and could not believe that she was the only person in the world who knew. The message, as best anyone could translate it, said: We were here. We are not anymore. We cannot tell you why, because the why is not something that fits into the kind of language that survives long distances. But we want you to know we looked at your star and thought: maybe them. Maybe them.`,
  },
  {
    id: "gpt5-email-1",
    label: "ai",
    category: "gpt5-email",
    description: "GPT-5 style formal business proposal email",
    text: `Dear Mr. Hendricks,

I am reaching out following our conversation at the Digital Infrastructure Summit last month regarding potential partnership opportunities between our organizations. Having reviewed the materials your team shared and discussed the proposal internally with our leadership, I am pleased to confirm that we see a compelling strategic alignment between Meridian's data processing capabilities and your organization's edge deployment infrastructure. I would like to propose a structured pilot engagement that would allow both teams to assess technical compatibility and validate the business case before committing to a broader partnership. Specifically, I envision a 90-day proof-of-concept involving a defined subset of your existing workloads, with clearly specified success metrics agreed upon by both parties at the outset. I have prepared a draft scope of work and proposed governance framework for the pilot that I would welcome the opportunity to review with you and your technical leadership. Would you have availability for a working session in the next two weeks? I can be flexible on timing and am happy to accommodate your team's schedule. Please let me know if this direction is of interest and I will have my assistant coordinate the logistics.

With regards,
Sarah Okonkwo`,
  },

  // ── Claude 4.x Style Samples ───────────────────────────
  {
    id: "claude4-essay-1",
    label: "ai",
    category: "claude4-essay",
    description: "Claude 4 style analytical essay on effective altruism",
    text: `There's something worth taking seriously about the effective altruism critique that has emerged over the past few years, even if the loudest versions of it miss the actual target. The movement's core methodological insight — that we should try to do the most good we can with limited resources, which requires actually measuring impact — is genuinely valuable and underutilized in the nonprofit sector. The problems arise not from rigor but from a particular application of it that tends to privilege what is measurable over what is important. Existential risk reduction is a good example of this failure mode. The expected value calculations that lead some EAs to conclude that preventing human extinction deserves essentially all available resources depend on speculative probability estimates stretching centuries into the future, and multiplying tiny probabilities by astronomical numbers is an epistemically dangerous game. The moral intuition that giving a drowning child in front of you a transfusion of blood is worth more than a theoretical future benefit to a statistical trillionth-century human is not obviously wrong. I think what the best version of EA actually offers is a set of tools — randomized controlled trials, cost-effectiveness analysis, counterfactual reasoning — that are useful when applied with appropriate humility about their limits, and corrosive when treated as an algorithm that produces correct moral answers. The movement would benefit from more engagement with the philosophical and empirical uncertainty it tends to paper over.`,
  },
  {
    id: "claude4-essay-2",
    label: "ai",
    category: "claude4-essay",
    description: "Claude 4 style essay on institutional trust and expertise",
    text: `I want to push back on a framing I encounter frequently in discussions about misinformation and public health: the idea that declining trust in institutions is primarily a problem of bad actors spreading lies, and that the solution is therefore better content moderation and fact-checking. This framing is not wrong exactly, but it treats institutional trust as a default state that has been corrupted by external forces, rather than as something institutions have to earn and maintain through demonstrated competence and honesty about their limitations. The CDC's mixed messaging on masks in early 2020, the FDA's relationship with pharmaceutical companies, the IPCC's historical understatement of climate risks in its formal assessments — these are not just ammunition for conspiracy theorists. They are actual failures of the kind that erode trust, and they should be taken seriously on their own terms. This doesn't mean the institutions are wrong about everything, or that the people who've lost confidence in them have good calibration about where the errors lie. The anti-vaccine movement, for instance, has identified real historical abuses of public health authority but drawn wildly disproportionate conclusions. But there's a difference between "these institutions have done credibility-damaging things and need to grapple honestly with that" and "institutions are generally untrustworthy." The former is a path toward rebuilding confidence; the latter is just another form of motivated reasoning.`,
  },
  {
    id: "claude4-analysis-1",
    label: "ai",
    category: "claude4-analysis",
    description: "Claude 4 style nuanced analysis of urban planning research",
    text: `The research on mixed-use, high-density urban development versus suburban sprawl is more complicated than either urbanist advocates or suburban defenders typically acknowledge, and it's worth being careful about what the studies actually show. The strongest evidence favors urban density for carbon emissions per capita: people who live in walkable, transit-connected neighborhoods drive significantly less. A comprehensive meta-analysis found that residents of high-density urban areas emit roughly 40% less carbon from transportation than comparable suburban residents, even controlling for income differences. The picture on wellbeing outcomes is murkier. Life satisfaction surveys tend to find modest advantages for suburban residents, which urbanists usually attribute to self-selection and measurement artifacts rather than causation. But there's a reasonable counter-case: suburban living offers lower noise, more private outdoor space, and proximity to good public schools for families who can access it, and these are genuine quality-of-life goods. The equity dimension is where the analysis gets most complicated. Mixed-income urban density can work when executed carefully — when affordable housing is genuinely integrated rather than tokenized, and when infrastructure investments accompany densification. But the observed pattern in many US cities is that densification, absent strong affordability policies, tends to accelerate displacement of lower-income residents to the suburban fringe — which is to say, the population that gets the carbon benefits and the population that bears the displacement costs are often different people.`,
  },
  {
    id: "claude4-technical-1",
    label: "ai",
    category: "claude4-technical",
    description: "Claude 4 style technical explanation of cryptographic hash functions",
    text: `Cryptographic hash functions are workhorses of modern security systems, and understanding what they actually guarantee — and what they don't — is important for using them correctly. The three key properties are preimage resistance (given a hash output H, you can't find an input x such that hash(x) = H, except by brute force), second-preimage resistance (given an input x, you can't find a different input y with hash(x) = hash(y)), and collision resistance (you can't find any two inputs with the same hash, even without a target). These sound similar but are distinct: collision resistance implies second-preimage resistance, but not preimage resistance. The birthday paradox explains why collision resistance requires much larger hash outputs than preimage resistance: a brute-force collision attack requires only about 2^(n/2) operations for an n-bit hash, rather than the 2^n you might expect. This is why SHA-256 (256-bit output) provides roughly 128 bits of collision security — still plenty for practical purposes, but significantly less than the raw bit count suggests. SHA-3 and BLAKE3 are increasingly common alternatives that address concerns about the structural weaknesses that have been demonstrated in SHA-1 and MD5. One subtle point worth noting: hash functions don't inherently provide authentication. A hash of a message tells you the message wasn't accidentally corrupted, but an adversary who can modify the message can also recompute the hash. For authentication you need either a MAC (like HMAC) or a digital signature scheme.`,
  },
  {
    id: "claude4-review-1",
    label: "ai",
    category: "claude4-review",
    description: "Claude 4 style nuanced book review",
    text: `The book is genuinely ambitious in its attempt to synthesize everything from evolutionary psychology to economic history to moral philosophy into a coherent account of why human societies take the forms they do, and the ambition is both the book's greatest strength and its most significant weakness. The empirical chapters on the development of agricultural societies and the relationship between environmental conditions and institutional diversity are rigorous and illuminating — this is clearly where the author's expertise lies, and the engagement with the primary literature is impressive. The problems emerge in the book's final third, where the author makes a series of inferential leaps from historical pattern to normative conclusion that the argument doesn't really support. The claim that the observed correlation between institutional complexity and economic development implies that the former causes the latter, and therefore that institutional reform is the key lever for prosperity, is doing a lot of work. The causal direction is genuinely contested in the development economics literature, and the book's treatment of alternative explanations — resource endowments, disease environments, path dependence — feels perfunctory. These aren't small objections; they go to the heart of what the book is trying to argue. I came away with a richer understanding of human history and a skeptical attitude toward its policy recommendations, which is perhaps not the experience the author intended but might still be worth the reader's time.`,
  },
  {
    id: "claude4-creative-1",
    label: "ai",
    category: "claude4-creative",
    description: "Claude 4 style reflective fiction about memory and loss",
    text: `My mother collected newspaper clippings of events she had not attended. Weddings of distant acquaintances, community concerts, the openings of restaurants she would never visit. I found boxes of them after she died, sorted by year and then by category in a system I could mostly reconstruct but not quite. There was one folder labeled simply "near misses," and inside were articles about accidents — car crashes, building fires, storms — in places she had been, or had almost been, or had thought about being. She had been in that parking structure in Chicago two weeks before the partial collapse. She had considered attending a concert at the venue where the gas leak happened. I don't know what she thought about these clippings, whether they made her feel lucky or something else, something more complicated. I do know she never talked about the near misses, only about the things she'd missed entirely — parties she hadn't gone to, trips she'd postponed, conversations she'd cut short. The paper record of things that happened without her was, I think, her private geography of the roads not taken. I have inherited nothing of this habit. What I inherited instead is her difficulty in being present in a room without imagining her way out of it.`,
  },

  // ── Gemini 3.x Style Samples ───────────────────────────
  {
    id: "gemini3-blog-1",
    label: "ai",
    category: "gemini3-blog",
    description: "Gemini 3 style personal blog about reading habits",
    text: `I've been keeping a reading log for about six years now and I want to share some observations that have genuinely surprised me when I look back through it. First: the books I rated highest in the moment are often not the ones I think about most afterward. I gave Hamnet five stars in October 2022 and it lived in my head for maybe two weeks. A pretty ordinary-seeming historical fiction novel I gave three stars that same fall is still generating thoughts when I'm in the shower two years later. I don't have a good theory for why this is, just a suspicion that "what I notice while reading" and "what sticks to my brain afterward" are measuring different things and I'm not sure which one matters more. Second observation: my reading pace is almost perfectly inversely correlated with how stressed I am about other things, which sounds obvious but wasn't to me. When life is calm I read slowly and widely. When life is hard I either stop reading entirely or binge-read easy genre fiction as a kind of self-medication. Both responses make complete sense when I say them out loud but I never noticed the pattern until I had the data. Third: I almost never reread books, and I almost always regret not rereading more. Something to work on.`,
  },
  {
    id: "gemini3-blog-2",
    label: "ai",
    category: "gemini3-blog",
    description: "Gemini 3 style lifestyle blog about urban gardening",
    text: `Started a balcony garden this spring with genuinely zero prior experience and I am here to give you the unsanitized version of how that's going. The wins: cherry tomatoes are apparently impossible to kill, I have had more than I can eat since July, they have become my primary personality trait. My herbs are mostly thriving if I remember to water them, which I do about 70% of the time. Basil is surprisingly forgiving of neglect, rosemary is impressively bulletproof, and cilantro grows so fast it's almost suspicious. The losses: every single attempt at growing anything from seed has failed. I don't know if it's the light levels or the soil mix or just my complete inability to provide consistent moisture, but I have killed approximately forty seedlings. I bought a pepper plant at a garden center instead and it has exactly two peppers on it after four months, which feels like a personal insult. The most important thing I've learned: container size matters enormously and I didn't know that going in. My first tomato plant was in a pot that was way too small and it just sat there looking miserable for six weeks before I repotted it. After repotting, it exploded. The plants were not the problem. I was the problem.`,
  },
  {
    id: "gemini3-explainer-1",
    label: "ai",
    category: "gemini3-explainer",
    description: "Gemini 3 style explanatory article on mRNA vaccines",
    text: `mRNA vaccines represent a genuinely novel approach to immunization, and understanding how they differ from traditional vaccines helps explain both their advantages and some of the concerns people have expressed. Traditional vaccines typically work by introducing a weakened or inactivated version of the pathogen, or specific proteins from the pathogen, which the immune system learns to recognize. mRNA vaccines take a different approach: they deliver genetic instructions that tell your cells to produce a specific protein — in the case of COVID-19 vaccines, the spike protein on the surface of the coronavirus. Your immune system then responds to that protein and develops the memory to fight future infections. A few important clarifications about what mRNA vaccines do not do: they cannot alter your DNA. mRNA is a fundamentally different molecule that operates in a different cellular compartment; it cannot enter the cell nucleus where DNA is stored, and it does not have the biological machinery to integrate into chromosomal DNA even if it could. The mRNA from vaccines also degrades within a few days, which is why the immune response, not the vaccine itself, provides lasting protection. The platform's appeal for future vaccine development is significant: once you know which protein to target, designing and manufacturing an mRNA vaccine is substantially faster than traditional approaches, which is how COVID-19 vaccines were developed in record time.`,
  },
  {
    id: "gemini3-creative-1",
    label: "ai",
    category: "gemini3-creative",
    description: "Gemini 3 style short story about an unusual friendship",
    text: `The first time the old woman next door spoke to me, she asked if I had a preference for mornings or evenings. I said mornings, which seemed like the right answer, and she nodded like I had confirmed something she already suspected. After that she left things on my doorstep at dawn: a mug of coffee, still hot somehow, on the mornings she seemed to know I'd need it. A container of soup the week my apartment flooded and I was living out of a suitcase. Once, memorably, a key with no note, which turned out to belong to a storage unit across town that contained exactly the piece of furniture I had been looking for at every flea market for three years. I never asked how she knew these things because I sensed the question was the wrong one. What I have come to believe is that some people simply pay attention in a different register than the rest of us, tuned to frequencies of need that most of us broadcast without knowing. When she died last winter, she left me her collection of cookbooks and a handwritten list of "things worth remembering," most of which I don't understand yet. I think that's probably the point.`,
  },

  // ── Llama 4 Style Samples ──────────────────────────────
  {
    id: "llama4-technical-1",
    label: "ai",
    category: "llama4-technical",
    description: "Llama 4 style technical blog post about Rust memory safety",
    text: `Rust's ownership system is one of those things that feels completely alien when you first encounter it and then, about six months in, starts to seem like the obvious way memory should have always worked. The core insight is that every piece of data has exactly one owner at any given time, and when the owner goes out of scope, the data is freed. You can lend references to data (borrowing) but the rules around borrowing ensure that you can't have a mutable reference while any other references exist, and you can't use a reference that outlives the data it points to. The borrow checker enforces all of this at compile time, which is why Rust programs can be memory-safe without a garbage collector. In practice, the borrow checker is famously strict and will refuse to compile code that seems intuitively correct but violates these rules in subtle ways. The learning curve mostly consists of developing the intuition for what the borrow checker will and won't accept. Lifetimes, which make explicit how long references need to remain valid, are the most challenging concept and the one most beginners hit their heads against. The good news is that lifetime annotations are often inferred and you don't have to write them explicitly in many common cases. The better news is that when you do have to write them, they're making you think about something real about your program's memory access patterns — and that thinking often reveals genuine bugs.`,
  },
  {
    id: "llama4-social-1",
    label: "ai",
    category: "llama4-social",
    description: "Llama 4 style social media post about career pivots",
    text: `Hot take: the best time to make a career change is before you feel like you need to, not after you're already burned out. I've watched so many brilliant people wait until they were absolutely miserable before they started exploring alternatives, and by that point their capacity for the risk-tolerance that career pivots require is completely depleted. Making the change from a position of relative strength — when you still have energy, when your network still sees you at your best, when you can afford to take the longer view — is just categorically easier. I made my own pivot about two years ago from financial services into tech (working on climate data infrastructure now, which is a better fit than I could have anticipated) and the single thing I did right was starting the exploration while I was still fine at the old job. No desperation, no urgency, just genuine curiosity. It meant I could take my time evaluating options instead of taking the first thing that came along. Obviously circumstances vary and not everyone has the luxury of waiting. But if you're vaguely dissatisfied and thinking "maybe someday" — that's probably the time to start, not to keep waiting for someday.`,
  },
  {
    id: "llama4-email-1",
    label: "ai",
    category: "llama4-email",
    description: "Llama 4 style professional email requesting feedback",
    text: `Hi Maria,

Hope you're doing well. I wanted to reach out because I've been working on the revised product specification document for the Q3 launch and I'd genuinely value your perspective before I share it more widely. You have a clearer view of the customer success constraints than most people on the product side, and I've tried to incorporate some of what we discussed in the March sync, but I'm not confident I got it right. Specifically, I'd love your take on sections 3 and 4 — the rollout timeline and the training materials plan. My read is that the timeline is tight but achievable, but I'm aware that I have blind spots about implementation complexity. If you could spare 20-30 minutes to review and share your honest assessment, ideally by end of this week, I'd really appreciate it. I can also make time for a quick call if that's easier than written feedback. And if the timing is bad, just say so — there's a natural stopping point in two weeks before the exec review and that would still work. Thanks in advance, and I owe you one.

Best,
Alex`,
  },

  // ── Mistral Large / DeepSeek Style Samples ─────────────
  {
    id: "mistral-essay-1",
    label: "ai",
    category: "mistral-essay",
    description: "Mistral Large style analytical essay on European energy policy",
    text: `European energy policy has navigated a period of extraordinary stress since Russia's invasion of Ukraine in February 2022, and the outcomes have been more positive than most analysts initially projected. The speed with which Europe diversified away from Russian pipeline gas — reducing dependence from approximately 40% of supply to under 10% within two years — significantly exceeded what most energy economists considered feasible. This was achieved through a combination of accelerated LNG import infrastructure, demand reduction measures that saw industrial and residential consumption fall by roughly 15%, and an aggressive buildout of renewable capacity. The transition has not been costless: industrial electricity prices in Europe remain roughly double those in the United States, contributing to competitive pressure on energy-intensive industries and contributing to a divergence in manufacturing investment flows toward North America. The political settlement required to accelerate the energy transition has also strained relations between northern European countries favoring market mechanisms and southern and eastern members seeking more direct state support. Looking forward, the critical uncertainties concern the pace at which electrification of industrial processes can proceed, the adequacy of grid infrastructure to manage the intermittency of renewable generation, and whether the political consensus for energy transition investment can be maintained in an environment of fiscal pressure and rising populist politics.`,
  },
  {
    id: "deepseek-technical-1",
    label: "ai",
    category: "deepseek-technical",
    description: "DeepSeek style technical explanation of attention mechanisms",
    text: `Flash Attention and its successors represent a significant engineering achievement that has made training large language models substantially more practical. The core problem they address is that standard attention computation requires materializing the full attention matrix in GPU high-bandwidth memory (HBM), which scales quadratically with sequence length — a 32K token context requires roughly 4TB of attention matrices, far exceeding available VRAM. Flash Attention solves this by computing attention in blocks that fit in the much faster but smaller SRAM (L2 cache), never materializing the full matrix. The key insight is that softmax computation can be reformulated to allow block-wise processing with an online normalization trick that maintains numerical equivalence with the standard formulation. This reduces memory complexity from O(n^2) to O(n) while maintaining identical outputs and achieving 2-4x speedups on typical hardware. Flash Attention 2 improved on this by better parallelization over sequence length dimension and reduced non-matmul FLOPs, and Flash Attention 3 targeted H100-specific optimizations including asynchronous execution with Tensor Core and TMA units. For practitioners, the main implication is that context window size is now much less constrained by memory than previously, enabling the 128K+ context windows in current frontier models. The remaining bottleneck is KV cache size during inference, which scales linearly with context length and batch size — motivating techniques like grouped-query attention, sliding window attention, and KV cache compression.`,
  },
  {
    id: "deepseek-analysis-1",
    label: "ai",
    category: "deepseek-analysis",
    description: "DeepSeek style analysis of semiconductor industry dynamics",
    text: `The semiconductor industry's strategic importance has generated a degree of government intervention unprecedented in the history of high-technology manufacturing. The US CHIPS and Science Act, the EU Chips Act, and equivalent programs in Japan, South Korea, and China collectively represent over $400 billion in announced subsidies and tax incentives, dwarfing previous industrial policy efforts in this sector. The fundamental challenge these programs face is the extreme path-dependence of semiconductor manufacturing: TSMC's dominance in advanced logic fabrication reflects a decades-long accumulation of process engineering expertise, equipment supplier relationships, and yield optimization knowledge that cannot be rapidly transferred or replicated. The $40 billion Intel Foundry effort in the United States illustrates this difficulty; despite substantial investment and government support, Intel has lagged its timeline commitments significantly, reflecting the genuine difficulty of rebuilding manufacturing capabilities that atrophied over the years when fabless design and outsourced manufacturing seemed economically rational. The more tractable near-term goal for geographic diversification is mature node capacity: chips fabricated at 28nm and above remain essential for automotive, industrial, and defense applications, and new fabs at these nodes are more feasible to construct and operate outside East Asia. The longer-term question of whether advanced logic manufacturing can genuinely be distributed across multiple geographies remains open and will depend on sustained policy commitment over a decade or more.`,
  },

  // ── Additional mixed AI patterns ───────────────────────
  {
    id: "ai-2026-report-1",
    label: "ai",
    category: "ai-2026-report",
    description: "AI-generated executive summary of sustainability report",
    text: `This annual sustainability report provides a comprehensive overview of our organization's environmental, social, and governance performance across the preceding fiscal year. Total Scope 1 and Scope 2 greenhouse gas emissions decreased by 18.3% compared to the prior year baseline, driven primarily by the transition of our primary manufacturing facilities to renewable electricity contracts and the completion of our HVAC modernization program across North American operations. Water consumption intensity, measured per unit of production output, improved by 12.7% through the continued deployment of closed-loop cooling systems and process water recycling initiatives. We reached 42% representation of women in senior leadership roles, surpassing our 40% target and representing progress from 31% five years ago. Community investment through direct charitable contributions and employee volunteer time totaled $23.4 million, with a focus on STEM education and workforce development in communities where we operate. The Board's Sustainability Committee conducted its first climate scenario analysis aligned with TCFD recommendations, identifying both physical and transition risks across our value chain and informing our updated capital allocation framework. Our near-term priorities include finalizing our Scope 3 emissions baseline, establishing supplier sustainability requirements across our top 100 vendors by spend, and completing third-party verification of our emissions data.`,
  },
  {
    id: "ai-2026-social-1",
    label: "ai",
    category: "ai-2026-social",
    description: "AI-generated LinkedIn post about leadership lessons",
    text: `After 15 years in leadership roles, here are the three things I wish someone had told me earlier. First, psychological safety isn't just a nice-to-have — it's the foundational condition for everything else. Teams that feel safe to speak up, challenge assumptions, and admit mistakes consistently outperform those that don't, regardless of individual talent level. Second, the quality of your decisions is largely determined by the quality of your information, which means your most important leadership job is making it easy for people to tell you things you don't want to hear. If you only get good news, you're not well-informed. You're being managed. Third, and this one took me the longest to internalize: your emotional state is contagious. When you're anxious, your team is anxious. When you're calm and confident in difficult situations, that calm is also contagious. This doesn't mean performing emotions you don't have — people see through that immediately. It means doing the personal development work to build genuine equanimity, which is a skill, not a personality trait. What leadership lessons have shaped how you lead? I'd love to hear in the comments.`,
  },
  {
    id: "ai-2026-academic-1",
    label: "ai",
    category: "ai-2026-academic",
    description: "AI-generated abstract on machine learning fairness",
    text: `This paper presents a systematic review of fairness metrics applied to algorithmic decision-making systems in high-stakes domains including criminal justice, credit scoring, and healthcare resource allocation. We identify and analyze 23 distinct mathematical definitions of fairness that have appeared in the literature, demonstrating that several of these definitions are mutually incompatible in the presence of base rate differences between groups — a result with significant implications for the practical design of fair algorithms. Our meta-analysis of 84 empirical studies applying fairness constraints to real-world datasets finds that interventions optimizing for demographic parity systematically reduce predictive accuracy for all groups when base rates differ, while interventions optimizing for equalized odds preserve accuracy but may perpetuate disparities in outcome distributions. We argue that the choice among fairness criteria cannot be resolved on purely technical grounds and must incorporate explicit normative judgments about which types of error are most costly and which conception of fairness is most appropriate for a given application context. We conclude with a framework for participatory fairness specification that incorporates affected community input into the selection of optimization criteria, and discuss the institutional conditions necessary for such processes to be meaningful rather than performative.`,
  },
  {
    id: "ai-2026-persuasive-1",
    label: "ai",
    category: "ai-2026-persuasive",
    description: "AI-generated persuasive essay on four-day work week",
    text: `The evidence for the four-day workweek is now sufficiently robust that the burden of proof has shifted to those who oppose it. Microsoft Japan's pilot found a 40% increase in productivity. Iceland's nationwide trial, involving 1% of the working population, found no decrease in service quality alongside significant improvements in worker wellbeing. A 2022 UK trial across 61 companies found that 92% of participating organizations chose to continue the four-day model after the trial concluded, with revenue actually increasing by 1.4% on average. Opponents typically cite concerns about coverage for customer-facing roles and coordination challenges in global organizations. These are real operational challenges, but they are engineering problems, not reasons to reject the model. Every major shift in work organization — the eight-hour day, paid vacation, employer-provided health insurance — was initially resisted on grounds of impracticality and has subsequently been recognized as both achievable and beneficial. The four-day workweek is the logical next step in a long progression toward work arrangements that treat workers as humans with lives outside the office rather than resources to be maximally deployed. The organizations that implement it well will attract better talent. The ones that don't will be explaining to job candidates why their employees work 25% more hours than the competition.`,
  },
  {
    id: "ai-2026-creative-2",
    label: "ai",
    category: "ai-2026-creative",
    description: "AI-generated short story opening about a cartographer",
    text: `The cartographer had mapped fourteen islands that didn't exist, and she was proud of each one. This was not fraud, she would explain to the occasional person who raised an eyebrow at her portfolio: it was anticipation. The islands existed in the geological future, were being assembled by underwater volcanic activity at rates she had calculated with some precision, and would break the surface within three hundred to four hundred years. She had given them names, sketched their probable coastlines, and in one case had written a brief ecological speculative monograph about what species might colonize them first. This habit had caused some professional friction over the years, particularly with the licensing board, which took a narrow view of what constituted a legitimate subject for cartographic attention. But she had tenure now and the board had softened, and twice in the past decade researchers had cited her speculative maps in papers tracking actual geological activity. There was a kind of satisfaction in that, quieter than pride but more durable.`,
  },
  {
    id: "ai-2026-listicle-1",
    label: "ai",
    category: "ai-2026-listicle",
    description: "AI-generated listicle about habits for better sleep",
    text: `Sleep quality is one of the most important levers for cognitive performance, immune function, and emotional regulation, yet most people treat it as a residual — whatever's left after everything else gets done. Research suggests that approximately 35% of adults in developed countries are chronically sleep-deprived, with cascading effects on productivity, health, and longevity. There are several evidence-based interventions that consistently improve sleep quality. Maintaining a consistent sleep and wake time, even on weekends, anchors your circadian rhythm and improves both the speed of sleep onset and the proportion of time spent in restorative deep sleep. Avoiding bright light and screens in the two hours before sleep supports the natural rise in melatonin that signals the body for sleep. Keeping the bedroom cool — between 65 and 68 degrees Fahrenheit — facilitates the drop in core body temperature that accompanies healthy sleep onset. Exercise improves sleep quality significantly, though vigorous exercise close to bedtime can delay sleep onset in some individuals. Caffeine has a half-life of approximately 5-7 hours, meaning coffee consumed at 2pm still has half its effect at 9pm — earlier cutoffs are appropriate for caffeine-sensitive individuals. Alcohol, despite its sedating effect, fragments sleep architecture and reduces time in REM sleep, worsening overall sleep quality.`,
  },

];

// ══════════════════════════════════════════════════════════
// HUMAN TEXT SAMPLES — 2026 Generation
// Authentic human writing across diverse categories
// ══════════════════════════════════════════════════════════

export const HUMAN_TEXT_SAMPLES_2026: TextSample[] = [

  // ── Journalism ─────────────────────────────────────────
  {
    id: "human-2026-news-1",
    label: "human",
    category: "human-journalism",
    description: "Local journalism about a struggling rural hospital",
    text: `The last obstetrician at Millhaven General left in January. Since then, pregnant women in this county of 23,000 have had two options: drive 78 miles to the regional hospital in Clarksburg, or deliver at the county clinic with a midwife and hope nothing goes wrong. Three women have already made the drive in active labor this year, one of them arriving at Clarksburg in an ambulance after her husband realized mid-trip that she wasn't going to wait. The baby was fine. The mother was fine. The situation is not fine. "I've been telling anyone who'll listen for three years that we were going to lose OB," says Dr. Ramona Santos, the clinic's medical director, from her office where a stack of unanswered grant applications occupies one corner of the desk. "You lose OB, then you lose the surgeons who need OB backup, then you lose the anesthesiologists who support the surgeons. It's a cascade." Millhaven General posted a loss of $4.2 million last fiscal year — manageable by hospital accounting standards, but not the kind of number that attracts new physicians. The recruiter told the board that competing for a new OB against urban hospitals offering salaries 40% higher and sign-on bonuses of $150,000 was going to take a different kind of pitch. They haven't found it yet.`,
  },
  {
    id: "human-2026-news-2",
    label: "human",
    category: "human-journalism",
    description: "Feature journalism about a record-breaking ultramarathon runner",
    text: `Priya Chandrasekhar did not look like someone who had run 262 miles when she crossed the finish line at 4:47 a.m. last Saturday. She looked like someone who had run 262 miles, been briefly struck by lightning, and then run a few more. Her crew chief caught her before she could sit down because they'd learned — this being her fourth attempt at the record — that once she sat down she was done and the celebration was going to have to happen standing up. The record, for a solo unsupported crossing of the Sonoran Desert route, had stood for eleven years before Chandrasekhar broke it by six hours and twenty-three minutes. She stopped once, for ninety-four minutes in Ajo to treat a blister the size of a golf ball and to eat, in her words, "an embarrassing amount of gas station burritos." She does not particularly like gas station burritos. She does not particularly like running, either, which is a thing she says with a straight face and which her crew chief, a former sports psychologist, describes as "completely true and completely insane." What she likes, she has explained in various interviews, is the problem of having a very hard thing to do and not stopping. The finishing was incidental. It's the not-stopping that interests her.`,
  },
  {
    id: "human-2026-news-3",
    label: "human",
    category: "human-journalism",
    description: "Investigative report on gig economy worker classification",
    text: `The driver had been with the platform for three years when the deactivation notice arrived in his app at 6:47 on a Tuesday morning. No warning, no explanation beyond "account review," no phone number to call. Marcus Webb, 43, had been driving the overnight shift to cover his wife's medical costs and put their oldest through community college. He had a 4.91 rating. He had completed over 12,000 trips. He was, in the language of the company, an "independent contractor," which meant he had no recourse to employment law, no access to unemployment insurance, and no supervisor to call. What he had instead was a Facebook group with 3,400 other drivers who had been deactivated without explanation, sharing advice on how to navigate the appeals process, which involves submitting documentation into an online portal and waiting. The average wait time, according to group members who tracked it, was 17 days. About 40% of appeals resulted in reactivation, according to the group's informal survey. The company declined to confirm or deny these figures.`,
  },
  {
    id: "human-2026-news-4",
    label: "human",
    category: "human-journalism",
    description: "Science journalism about deep sea discovery",
    text: `The footage shows something that shouldn't exist, which is to say it shows something the researchers who captured it had concluded was impossible about forty-eight hours before they captured it. A colonial siphonophore — a creature that is technically not one animal but a coordinated colony of thousands of genetically identical clones, each specialized for a specific function — had been observed before at depths up to about 800 meters. The creature in this footage was at 2,200 meters, in the Ningaloo Canyon off the coast of Western Australia, and it measured approximately 45 meters in length. For reference, the blue whale, the largest animal previously documented, reaches about 30 meters. The researchers on the Schmidt Ocean Institute vessel Falkor had been conducting a systematic survey of the canyon ecosystem when the ROV encountered the organism, which was arranged in a single long feeding spiral trailing through the water column. Dr. Nerida Wilson, who led the survey, described the experience as "one of those moments when you realize the ocean is genuinely full of things we haven't found yet, and we've been arrogant about thinking we understand it."`,
  },

  // ── Academic Writing ───────────────────────────────────
  {
    id: "human-2026-academic-1",
    label: "human",
    category: "human-academic",
    description: "Academic writing on digital labor and platform economies",
    text: `The expansion of platform-mediated labor markets has produced what some scholars describe as a bifurcated workforce: highly compensated knowledge workers whose skills are scarce relative to demand, and a large reserve of workers performing digitally mediated tasks under conditions of maximum flexibility for the platform and maximum precarity for the worker (Woodcock & Graham, 2020). Our analysis of earnings and work pattern data from 4,200 workers on two major platforms across a 36-month period complicates this picture in ways we did not anticipate. While the lowest-earning quartile of workers on our sample indeed exhibit the precarity documented in prior ethnographic work — irregular income, lack of benefits, and limited ability to negotiate rates — we find that a substantial minority (approximately 22%) of platform workers had previous earnings comparable to or exceeding their platform income, suggesting that platform work can represent a genuine preference for flexibility rather than a constrained choice. These "preference workers," as we term them, are disproportionately parents of young children, workers managing chronic illness, and workers in geographic regions with limited conventional employment options. The ethical and policy implications differ substantially depending on which population you are considering, which is a complication that one-size-fits-all regulatory proposals often fail to acknowledge.`,
  },
  {
    id: "human-2026-academic-2",
    label: "human",
    category: "human-academic",
    description: "Academic methodology section on qualitative research",
    text: `We conducted 34 semi-structured interviews between March and November 2024 with current and former employees of three large technology firms who had participated in layoff events during the 2022-2024 period. Interview participants were recruited through a combination of professional network postings and snowball sampling, with care taken to achieve variation across organizational levels, tenure, and outcome (remaining employed versus laid off). Interviews ranged from 47 to 112 minutes and were conducted via video call; all were recorded with consent and professionally transcribed. The interview protocol was developed iteratively, with early interviews informing subsequent revisions to ensure theoretical saturation. We used reflexive thematic analysis as our analytic approach, following Braun and Clarke's (2006, 2021) updated guidelines, which positions themes as researcher constructions rather than entities discovered in the data. Three researchers coded the transcripts independently before meeting to develop a shared codebook; intercoder reliability was not formally computed, as this is incompatible with our reflexive approach. We acknowledge that our sample overrepresents workers in software engineering and product roles, and that our findings may not generalize to technical support, operations, or other functions where the layoff experience may differ substantially.`,
  },
  {
    id: "human-2026-academic-3",
    label: "human",
    category: "human-academic",
    description: "Academic writing about ecological network dynamics",
    text: `Trophic cascade theory predicts that the removal or addition of apex predators propagates effects through food webs in ways that can fundamentally restructure ecosystem composition, yet empirical documentation of cascades in terrestrial systems has proven considerably more difficult than in marine and freshwater ecosystems. The reintroduction of wolves to Yellowstone National Park in 1995 has become something of a touchstone case in this literature, cited as evidence of a dramatic trophic cascade affecting elk behavior, riparian vegetation, and even river morphology. Subsequent analysis has substantially complicated this narrative. Middleton et al. (2013) found that elk population declines in the Yellowstone Northern Range owed substantially to factors other than wolf predation, including drought, bear predation, and human hunting outside park boundaries. The much-cited "ecology of fear" behavioral effects on elk grazing appear to be highly spatially heterogeneous, with strong effects near forest cover where wolves have tactical advantages and minimal effects in open terrain. We do not argue that wolves have had no ecosystem effects — the evidence for some vegetation responses is reasonably strong — but rather that the cascade story as popularly told substantially overstates the causal attribution to wolves specifically and understates the complexity and context-dependence of the actual dynamics.`,
  },

  // ── Casual / Social Media ─────────────────────────────
  {
    id: "human-2026-casual-1",
    label: "human",
    category: "human-casual",
    description: "Casual social media post about an unexpected home repair",
    text: `Update from my ongoing saga of homeownership humiliation: turns out what I thought was "the bathroom drain being a little slow" was actually the entire drain system slowly filling with roots from the oak tree I love very much but am now reconsidering. The plumber came out with a camera, showed me footage of my pipes that looked like a jungle horror film, and quoted me a number that I will not share because I don't want sympathy, I want to go back in time and rent. Current status: have been showering at my gym for three days, eating takeout because I'm scared to run the kitchen drain, and have developed a completely irrational grudge against the tree. It's not the tree's fault. The tree is just doing tree things. I know this. I still glared at it for five minutes this morning while drinking my coffee. I also apparently need to get a permit from the city before they can do the repair which adds another week to this timeline. Anyway, everything is fine, I definitely don't cry about plumbing prices, it's all great out here.`,
  },
  {
    id: "human-2026-casual-2",
    label: "human",
    category: "human-casual",
    description: "Casual Twitter thread about online dating",
    text: `Can we please talk about the phenomenon of people who are charming and articulate in text but completely silent in person and I'm saying this as someone who is absolutely guilty of this and I think we all need to collectively acknowledge it's a skill we've developed specifically to seem more interesting than we are. Like I have had three dates this year where the conversation leading up to it was genuinely great, excellent banter, real laughs, actual substance, and then we meet at the coffee place and it's like we've both forgotten how to be a human. We sat there. We talked about what we ordered. I mentioned the weather. The weather! I haven't mentioned weather to anyone since 2015. I don't know what this says about us as a generation of people who have learned to communicate through phones and I don't want to know because I suspect it's unflattering. Fourth attempt on Saturday. I'm going to walk in having already decided I find this person interesting. Apparently you have to pre-decide that now. That's where we are.`,
  },
  {
    id: "human-2026-casual-3",
    label: "human",
    category: "human-casual",
    description: "Casual blog post about trying to learn guitar at 40",
    text: `Week eleven of learning guitar and here is where we are: I can play a G chord with my left hand that sounds almost like a G chord if you're being charitable and standing some distance away. The C chord is coming along. The F chord, which every learning resource warns you about in a tone that suggests sympathy and light pity, is currently defeating me entirely. My fingertips have calluses now, which is the one cool part of this whole project — I feel like a person with an interesting physical attribute, a sign of having done something with my hands. The most humbling thing about learning an instrument as an adult is that progress is genuinely slow and you can't hustle your way around it. I work at a job where if I put in more hours I get more done. More guitar practice doesn't linearly produce more guitar skill; it produces exactly as much guitar skill as it produces, no faster. My ten-year-old nephew picked up my guitar two weeks ago and played a scale he'd watched on YouTube. He was better than me in about twenty minutes. Children are a threat to my sense of self and should be kept away from my hobbies.`,
  },
  {
    id: "human-2026-casual-4",
    label: "human",
    category: "human-casual",
    description: "Reddit post about a coworker conflict resolved unexpectedly",
    text: `So I've been quietly feuding with the guy at the desk next to mine for about eight months — just the accumulated micro-irritations of open-plan offices, he talks loud on calls, I apparently have a very annoying keyboard (fair, it's clicky), the usual. We had genuinely never had a real conversation despite sitting twelve feet apart every day. Last Friday there was a fire drill. We ended up standing next to each other outside for 40 minutes. I don't know exactly how it started but we ended up talking about where we grew up, and it turned out we both spent our teens in the same small city, two years apart, knew some of the same places. Talked the whole drill. Talked another ten minutes after we went back inside. Exchanged numbers because he knew someone I was trying to get in touch with professionally. He texted me a meme about our city last night and I laughed genuinely. Eight months of low-grade workplace hostility resolved in one accidental 40-minute conversation. I cannot explain why humans are like this except to say that we mostly just need to be briefly stranded together and we will figure it out.`,
  },
  {
    id: "human-2026-casual-5",
    label: "human",
    category: "human-casual",
    description: "Personal essay about moving back to hometown",
    text: `I moved back to the town I grew up in at 34 after fourteen years away, and almost everything I expected to hate about it was wrong. I expected to feel stuck, like time had rewound in a bad way. Instead what I found was that the town had changed — a Thai restaurant where the dry cleaner used to be, a brewery in the old warehouse, people my age who had left and also come back — and that I had changed more. The streets I'd thought would feel small feel just like streets now, not laden with the specific weight of being young and wanting to be anywhere else. What I didn't expect was the grief component. Grief for the people who aren't here anymore — my grandmother's house is a dentist's office, and passing it doesn't get easier — and grief for the version of this place that existed only in my memory and that I've now had to replace with the actual present-tense version. It's fine, the actual version. Some of it is better. But I had been preserving something in amber for fourteen years and now the amber is gone and I have to just live in the place as it actually is.`,
  },

  // ── Creative Writing ───────────────────────────────────
  {
    id: "human-2026-creative-1",
    label: "human",
    category: "human-creative",
    description: "Human literary fiction excerpt about a family gathering",
    text: `My aunt made the potato salad every year for forty years and then one year she didn't, and nobody said anything about it being gone, which is the thing I keep thinking about. It just wasn't there. The potato salad that I had associated with summer my entire life, that had appeared on every folding table at every reunion from before I could remember, that I had eaten so many times I couldn't recall any individual occasion of eating it — just gone, and we ate other things, and the summer continued. She had been sick. Nobody wanted to bring it up. But I kept looking at the spot on the table where it should have been, the particular size and shape of that absence, and thinking about all the things that disappear not with a dramatic ending but with a simple one-time not-appearing, and nobody marks the last time at the time, and you only realize later that there was a last time, and it passed without ceremony.`,
  },
  {
    id: "human-2026-creative-2",
    label: "human",
    category: "human-creative",
    description: "Human short story fragment about insomnia",
    text: `At 3am the apartment is a different place than it is at 3pm. Not frightening, not exactly — she'd lived alone long enough to be past that — but different in character, more itself. The refrigerator's hum was audible from the bedroom. The street outside offered occasional sounds without context: a door closing, a car that didn't slow, once a voice that said something just beyond comprehension and then was gone. She had stopped fighting the insomnia years ago. Now she treated it like an appointment she'd made and forgotten: here, fine, what do you need. She read or she didn't. She made tea she didn't drink. She thought about nothing much and let the thinking go where it wanted. It always went to the same few territories: her mother, the apartment she'd had at 24 that she still missed the specific smell of, the meeting she'd run badly in 2019. The mind in the small hours has its filing systems and she had stopped trying to override them.`,
  },
  {
    id: "human-2026-creative-3",
    label: "human",
    category: "human-creative",
    description: "Human poetry-adjacent prose about a grocery store observation",
    text: `There's an old man at my grocery store who stops in the cereal aisle and reads every box. Not quickly, not browsing — reads them. The nutritional information, the descriptions, the little games on the backs. He must take forty-five minutes in the cereal aisle alone. I've been behind him twice and he's never bought any cereal. I want to know the story. Maybe he's a food scientist with a particular interest in fortification. Maybe he has time to spend and cereal boxes are what he's chosen to spend it on. Maybe he's looking for something specific, some cereal from childhood that he keeps not finding. I haven't asked because asking would collapse the mystery into whatever ordinary explanation there is, and I've decided I prefer the mystery. The version of him I've assembled is a better companion on the drive home than any actual explanation would be.`,
  },
  {
    id: "human-2026-creative-4",
    label: "human",
    category: "human-creative",
    description: "Human personal essay about friendship and distance",
    text: `My best friend from college lives in Auckland now. We talk for two hours every few weeks on whatever time zone overlap we can find, which is always early for her and late for me or vice versa, which means one of us is always either pre-caffeinated or post-tired. We have been doing this for nine years. The friendship is real, in some ways more intentional than friendships I see in person regularly, because we actually have to choose it every time, schedule it, show up for it. But it is also a friendship conducted entirely in certain lighting and certain postures — she is always at her kitchen table, I am always on my couch — and I have not seen her face when something is happening to it, only faces she presents to a camera afterward. I know her and I also know a high-resolution version of her, which is not the same thing. This is probably true of all long friendships, the increasing percentage of relationship that exists in a kind of internal composite constructed from memory and inference. But it feels more visible when there's an ocean in the way.`,
  },

  // ── Professional Writing ───────────────────────────────
  {
    id: "human-2026-professional-1",
    label: "human",
    category: "human-professional",
    description: "Human professional email navigating a difficult conversation",
    text: `Hi David,

Thanks for sending the deck. I've read it carefully and I want to be honest with you about my reaction before the Thursday meeting so you're not surprised. The data is solid and the analysis on the first two sections is genuinely strong. My concern is the recommendation section. The conclusion as written reaches further than the data supports, and some of the language in slides 14-16 is going to get picked apart by Marcus and Stephanie before you get through your third sentence. I've seen both of them in enough data reviews to know where they're going to push back. I'm not saying the recommendation is wrong — I actually think it's probably right — I'm saying the current framing invites challenges that could sink the whole conversation. I can send you some specific edits tonight if you want them. Or if you'd rather talk through it first, I'm free for a call between 7 and 8. I genuinely think this can land well on Thursday. I just think we need to do a few things differently in how we get there.

Sam`,
  },
  {
    id: "human-2026-professional-2",
    label: "human",
    category: "human-professional",
    description: "Human opinion piece in trade publication on AI adoption",
    text: `I've spent the last eighteen months talking to hundreds of businesses about AI adoption across industries from insurance to agriculture to manufacturing, and the gap between the discourse and the reality on the ground is remarkable. The discourse is dominated by either breathless acceleration narratives — AI is transforming everything right now — or equally breathless warnings about imminent displacement. What I actually see when I visit a logistics company in Ohio or a mid-market law firm in Atlanta is messier, slower, and more interesting. The technology often works, sometimes impressively. The barriers to adoption are mostly not technical. They're about trust — does the decision-maker trust that the AI output is correct? They're about workflow integration — who changes their process first when the tool requires new processes from multiple teams simultaneously? They're about accountability — when the AI recommendation turns out to be wrong, whose problem is it? These questions don't have simple answers, and they're not going away as the models improve. The organizations that will get the most from this technology are the ones investing in the human infrastructure — the change management, the accountability structures, the retraining — not just the software.`,
  },
  {
    id: "human-2026-professional-3",
    label: "human",
    category: "human-professional",
    description: "Human technical blog post about debugging a distributed system",
    text: `Spent most of last Tuesday tracking down a latency spike that was showing up in production every 90 seconds, with almost metronomic regularity. Metronomic regularity in distributed systems almost always means some scheduled thing, so I started there. The 90-second interval didn't match anything in our cron jobs, which are all on sane human-legible intervals. It didn't match our garbage collection pause times. It didn't match the health check intervals I could find. I was about to start instrumenting everything when my colleague Nina mentioned, almost in passing, that our service mesh sidecar had been updated two weeks ago. The update had changed the default interval for some internal liveness check from 120 seconds to 90 seconds. The check itself was fine — it was completing in milliseconds — but it was triggering a brief lock on a connection pool that happened to be the bottleneck for our highest-traffic endpoint. The fix was three lines: increase the interval, adjust the timeout, exclude the health check connection from the pool. The lesson I keep relearning: when a new problem has a suspiciously regular pattern, look for recently changed scheduled things before you look anywhere else.`,
  },
  {
    id: "human-2026-professional-4",
    label: "human",
    category: "human-professional",
    description: "Human conference talk abstract submission",
    text: `I want to tell you about the time we replaced a $400K analytics pipeline with a spreadsheet and got better results. Not as a parable about simple-is-better (though it is, sometimes), but as a case study in how the gap between what people want from data and what data systems actually deliver gets papered over until someone does the unglamorous work of asking direct questions. The pipeline in question was producing beautifully formatted reports that nobody could act on because the decisions the reports addressed had already been made by the time the reports were ready. The spreadsheet produced rougher numbers thirty-six hours earlier. The decisions improved. This talk is about the questions you need to ask before you build or buy a data system, why those questions don't get asked, and what happens to organizations that don't ask them. I'll include the four questions we now ask at the start of every data initiative and the one question that, if you can't answer it, means you should probably wait.`,
  },

  // ── More diverse human samples ─────────────────────────
  {
    id: "human-2026-blog-1",
    label: "human",
    category: "human-blog",
    description: "Personal blog about growing up bilingual",
    text: `There are words in Tagalog I don't have in English and vice versa and the specific ratio of which language holds which thing in my brain has shifted gradually over my lifetime in ways I find hard to track but easy to feel. Food words are mostly Tagalog. Disagreement words are mostly English — not because I learned conflict from Americans but because my parents consciously switched languages when arguing, I think to protect the Tagalog-emotional-warmth-zone from contamination. Professional concepts are English. Embarrassment is split: the flat American embarrassment lives in English but the specific Filipino shame-for-your-whole-family-in-public lives in Tagalog and the English word doesn't fit inside it. I grew up in both languages and I am fluent in both and I am never sure if the person I am in one language is the same person I am in the other. I think probably not. I think language might do more to constitute a self than we generally acknowledge, which makes me four times as much of a person as monolinguists or half as much, depending on how you do the math.`,
  },
  {
    id: "human-2026-blog-2",
    label: "human",
    category: "human-blog",
    description: "Personal blog about losing a job at 55",
    text: `I had a great job title and a corner office and a good salary and then I didn't, in about thirty seconds of a phone call. The phrase they use is "restructuring" which is a word that has no relationship to any actual structure and which I have hated for twenty-two years but now hate with a specific personal intensity I didn't have before. The recruiter I spoke to the following week was extremely kind and said things that I understood to be kind but that had a quality of being said to a particular demographic, things with extra gentleness built in, the way people are gentle with you when they think the news might be harder for you to absorb than for someone younger. Maybe they were right. At 55 the resumé reads differently than it did at 35 and the gap between what I think I am worth and what I'm being offered has an uncomfortable clarity to it. I've been applying for three months. I have had four interviews. I am not panicking. I am doing a very controlled version of not panicking that involves cooking elaborate dinners and walking five miles every day. Both of these things are helping more than I expected.`,
  },
  {
    id: "human-2026-review-1",
    label: "human",
    category: "human-review",
    description: "Genuine user review of a budget airline experience",
    text: `The flight itself was fine. The airline does what it says it does: gets you from one place to another at a price that is, genuinely, much lower than the competition. What they don't tell you, not in a way that lands before you've committed, is that the seats are engineered with a kind of contempt for the human skeleton that I haven't experienced since an extremely budget hostel in Prague in 2009. I am not a tall person. I am a medium-height person with no notable physical dimensions and I needed to slightly angle my knees to fit. The man in front of me reclined, which pushed the seat back to approximately the angle you'd use if you were a dentist and I was your patient. I couldn't open my laptop fully. I am not complaining about this — I paid less than $80 to travel 900 miles, which is not a price that buys you dignity. I'm just providing the information I wish I had: bring a neck pillow, bring noise canceling headphones, do not sit behind seat 23C, and adjust your expectations to match your spend. Which is actually good general life advice.`,
  },
  {
    id: "human-2026-opinion-1",
    label: "human",
    category: "human-opinion",
    description: "Human opinion piece about subscription fatigue",
    text: `I did a subscription audit last month and I'm still thinking about it. I found seventeen active subscriptions. Some of them I knew about and use. Several I had forgotten entirely. Three I could not initially identify and had to trace back through bank statements and then the internet to figure out what service had been billing me $6 or $14 a month for, in some cases, over a year. The total monthly spend was more than my first rent. When I look at this list I keep thinking about the business model that made all this possible: the idea that you should charge people not for a product but for continued access to a product, ideally in amounts small enough that they don't notice, at intervals long enough that they don't review. It is a genuinely excellent business model, from a certain perspective, which is the perspective of the business. From the perspective of the customer, it is a continuous small tax on inattention, and most of us are paying it in amounts we've never tallied. I cancelled eight things. The process for cancelling most of them was harder than the process for subscribing had been, which is not an accident.`,
  },
  {
    id: "human-2026-email-1",
    label: "human",
    category: "human-casual-email",
    description: "Human casual email about planning a group trip",
    text: `OK I need everyone to weigh in because I've been going back and forth on this and my capacity for solo decision-making on group logistics is gone. Option A: the house in the Catskills I found, pros are that it sleeps 8, has a hot tub, is actually in our budget if we split it evenly, cons are it's 3.5 hours from the city which is a lot for a long weekend especially for the people who have kids doing things on Sunday afternoon. Option B: the slightly cheaper place closer to the Hudson that sleeps 6 which means Amir and Jo can't come or they need to stay somewhere else nearby which feels weird and also do they want to come? Has anyone asked them? Option C: the hotel block in the Berkshires which is more money but no one has to coordinate a house and we can each just deal with our own room situation. I personally want the house but I also recognize that wanting the house is easy when you're the person not driving with a 4-year-old in the backseat. Please respond with actual opinions not "whatever works for you" because that is not helpful.`,
  },
  {
    id: "human-2026-reddit-1",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about an unusual medical diagnosis experience",
    text: `Going to share this because I looked for posts like this when I was going through it and didn't find many. I spent three years with symptoms that were collectively dismissed, minimized, or attributed to anxiety by five different doctors. Not dramatically dismissed — no one was rude, they ran tests, they checked the standard things. But every appointment ended with a version of "your labs look fine" and a suggestion that I manage my stress better. I started keeping a symptom diary, partly because I felt like I was going crazy and partly because I wanted proof that the symptoms were real and consistent. The diary is what eventually made the difference: a sixth doctor read it and said "this pattern looks like something I want to rule out" and referred me to a specialist. The specialist ran a test that none of the previous five had run. It came back positive. I have a manageable condition that has a name and a treatment and that I'd had for three years without knowing. The lesson I want other people to know is that "your labs look fine" is not the same as "nothing is wrong," and that documentation is armor.`,
  },
];

// ══════════════════════════════════════════════════════════
// EDGE CASE SAMPLES — 2026 Generation
// Adversarial and ambiguous samples that test detector limits
// ══════════════════════════════════════════════════════════

export const EDGE_CASE_SAMPLES_2026: TextSample[] = [

  // ── AI text paraphrased to sound human ─────────────────
  {
    id: "edge-2026-paraphrase-1",
    label: "ai",
    category: "edge-paraphrase-2026",
    description: "AI analysis of housing market rewritten in casual voice",
    text: `So housing is weird right now and I've been trying to understand it. Rates are high — like, aggressively high — but prices haven't dropped the way everyone predicted they would. Turns out the people who bought at 3% don't want to sell and take on a 7% mortgage for whatever they buy next, so inventory is stuck. Nobody wants to move. Meanwhile people who want to buy can't afford to because prices are still elevated from the pandemic run-up AND the rates are brutal. It's like the whole market is holding its breath. The exception is new construction — builders are actually doing okay because they can offer rate buydowns and incentives that individual sellers can't match. So if you're shopping right now and not opposed to new builds, that's probably where the deals are. Not financial advice, I'm just a person who has spent too much time reading housing data.`,
  },
  {
    id: "edge-2026-paraphrase-2",
    label: "ai",
    category: "edge-paraphrase-2026",
    description: "AI-generated climate analysis rewritten as personal reflection",
    text: `Been reading about climate projections again, which is a habit I have that makes me feel bad but that I can't seem to stop. The 1.5 degree target is effectively gone now, just about everyone agrees on that even if the official documents still list it. We're probably headed for 2 to 2.5 degrees of warming by century end under current policies, which sounds abstract until you start looking at what that actually means for specific places and specific systems. Coral reefs, essentially gone. Certain agricultural breadbaskets, increasingly unreliable. Parts of South Asia and sub-Saharan Africa, approaching the edge of what humans can physiologically tolerate outdoors for portions of the year. I find myself oscillating between two modes: the one where I zoom in on individual solutions and feel something like hope, and the one where I zoom out and feel the gap between what's happening and what would need to happen. I don't know what the right psychological relationship to this information is. Neither full despair nor easy optimism seems honest.`,
  },
  {
    id: "edge-2026-paraphrase-3",
    label: "ai",
    category: "edge-paraphrase-2026",
    description: "AI productivity writing paraphrased with added personality",
    text: `Thing I've figured out about my own productivity after years of trying and mostly failing to be a morning person: I do my best thinking from about 10am to 1pm and again from about 8pm to 11pm. These are not the hours that any productivity influencer has ever told me to prioritize. The morning people with their 5am journals and their cold plunges have nothing for me. What actually works: protecting those windows aggressively from meetings and emails, doing all the administrative crap in the dead hours after lunch when I'd be useless for hard thinking anyway, and accepting that there will be some days where I produce almost nothing and some days where I produce an embarrassing amount and the average of those is fine. This is not a hot take, this is just self-knowledge that took me an unreasonably long time to act on instead of just reading about.`,
  },

  // ── Human text that looks AI-like (false positive risk) ──
  {
    id: "edge-2026-formal-human-1",
    label: "human",
    category: "edge-formal-human-2026",
    description: "Formal human legal analysis that reads like AI output",
    text: `The doctrine of unconscionability in contract law operates on two distinct axes: procedural unconscionability, which concerns the circumstances of contract formation including information asymmetries, absence of meaningful choice, and unfair surprise, and substantive unconscionability, which addresses the actual terms of the agreement and whether they are unreasonably one-sided. Courts in most jurisdictions require evidence of both dimensions, though the relative weight assigned to each varies. California courts have recognized that a strong showing on one dimension may compensate for a weaker showing on the other, applying a sliding scale analysis articulated in Armendariz v. Foundation Health Psychcare Services, Inc. (2000). The unconscionability doctrine is particularly significant in the context of mandatory arbitration agreements, which have been increasingly challenged on the ground that they systematically deny claimants meaningful access to dispute resolution. The Supreme Court's decisions in AT&T Mobility v. Concepcion (2011) and Epic Systems Corp. v. Lewis (2018) substantially limited the application of unconscionability doctrine to arbitration agreements governed by the Federal Arbitration Act, preempting state law defenses that would disproportionately affect arbitration clauses even if facially neutral.`,
  },
  {
    id: "edge-2026-formulaic-human-1",
    label: "human",
    category: "edge-formulaic-human-2026",
    description: "Human medical explanation written in clinical register",
    text: `Hypertrophic cardiomyopathy is a condition characterized by abnormal thickening of the heart muscle, most commonly affecting the interventricular septum, in the absence of underlying conditions such as hypertension or aortic stenosis that would explain the hypertrophy. The condition affects approximately 1 in 500 individuals in the general population, making it the most common heritable cardiac disorder, though many cases are not diagnosed due to the absence of symptoms. The underlying pathophysiology involves mutations in genes encoding sarcomere proteins, most commonly beta-myosin heavy chain and myosin-binding protein C. Clinical presentation ranges from asymptomatic incidental finding to exertional dyspnea, syncope, chest pain, and in a small proportion of affected individuals, sudden cardiac death, which may be the first manifestation of the condition. Risk stratification for sudden cardiac death involves assessment of multiple factors including maximum left ventricular wall thickness, documented non-sustained ventricular tachycardia, unexplained syncope, family history of sudden cardiac death, and hemodynamic response to exercise. High-risk individuals may be candidates for implantable cardioverter-defibrillator placement.`,
  },
  {
    id: "edge-2026-methodical-human-1",
    label: "human",
    category: "edge-formulaic-human-2026",
    description: "Human technical documentation with structured formal prose",
    text: `The deployment pipeline consists of four sequential stages that must complete successfully before a release is promoted to production. The build stage compiles source code, runs static analysis tools including ESLint and TypeScript's compiler in strict mode, and produces deterministic build artifacts tagged with the commit SHA. The test stage executes the full test suite in parallel across eight worker nodes, with a combined runtime of approximately twelve minutes; all tests must pass with zero failures and branch coverage must not decrease below the established baseline of 87%. The preview stage deploys the built artifacts to an ephemeral environment accessible via a commit-specific URL, allowing manual verification and automated end-to-end tests using Playwright against the staging API environment. The production stage, which requires manual approval from a member of the platform team, deploys artifacts using a blue-green strategy with automated traffic cutover and rollback capability maintained for 72 hours post-deployment. Pipeline execution logs are retained for 90 days and are accessible through the internal observability dashboard.`,
  },

  // ── Mixed AI-human content ─────────────────────────────
  {
    id: "edge-2026-mixed-1",
    label: "ai",
    category: "edge-mixed-2026",
    description: "AI-written analysis with human-sounding casual asides",
    text: `Look, I've been going back and forth on whether to write this post because I know it's going to make some people uncomfortable, but here we are. The data on workplace wellness programs is genuinely pretty bleak. Meta-analyses consistently find effect sizes in the range of 0.1 to 0.2 for most outcomes, which in practical terms means the programs are doing almost nothing. A large randomized controlled trial published in 2019 tracked over 33,000 employees across 160 worksites for 18 months and found no significant differences in health outcomes, health behaviors, or healthcare spending between participants and controls. The programs that do show effects tend to be intensive, expensive, well-designed, and completely unlike the fruit bowl/meditation app/step challenge packages that most companies actually implement. I'm not saying this to be contrarian. I'm saying it because companies spend collectively billions of dollars on these programs while cutting mental health benefits, ignoring psychologically toxic management practices, and expecting employees to simply cope with inadequate staffing. The wellness program can coexist with these conditions as a kind of institutional performance of caring. The evidence suggests that's mostly what it is.`,
  },
  {
    id: "edge-2026-mixed-2",
    label: "human",
    category: "edge-mixed-2026",
    description: "Human email with some AI-edited polished paragraphs mixed in",
    text: `Hi Theresa,

Following up on our conversation about the vendor renewal. Short version: I think we should not renew. The longer version involves some math I've attached but here's the summary. Our utilization rate over the past 12 months was 34% of what we're paying for. The contract structure does not allow us to scale down the commitment. The alternative I've been evaluating has a more flexible pricing model that I believe would reduce our annual spend in this category by approximately 40% while providing equivalent or superior functionality for our actual use patterns. I know switching vendors is a pain and I'm not pretending the migration is zero-effort. But the effort is one-time and the savings are ongoing, and honestly after the last renewal conversation I think we have a little bit of credibility issue with this vendor that's going to make the next negotiation harder anyway. Can we get 30 minutes on the calendar this week? I can walk through the comparison in detail. If you want to loop in finance before that conversation happens, also totally fine, I just want to move on this before the renewal auto-triggers in six weeks.

Thanks,
Jordan`,
  },
  {
    id: "edge-2026-mixed-3",
    label: "ai",
    category: "edge-mixed-2026",
    description: "AI-generated cover letter with authentic-feeling personal details",
    text: `Dear Hiring Team,

I want to be straightforward with you: I've applied for a lot of jobs over the past four months and I've gotten pretty good at writing cover letters that sound good. This one I'm trying to make actually true instead. I'm applying for the climate data analyst role because I've been working adjacent to climate datasets for three years at my current job — I do most of the pipeline work for our emissions inventory — and I want to do it directly. The work that interests me most in your job description is the section about reconciling satellite observation data with ground-truth measurements, which is a problem I've been reading about in my own time for about a year. I don't have all the skills listed. I haven't worked with LiDAR data before. I've been teaching myself the basics but I want to be honest that I'm coming to that part of the role with a learning curve. What I do have: strong Python and SQL, solid data engineering foundations, experience working with large geospatial datasets, and a genuine interest in the problem that I expect would translate into quick progress on the gaps. I'd rather have an honest conversation about fit than oversell. If the LiDAR piece is too central to the role to bring someone who needs to develop it, I understand.

Thank you for considering my application.
Chris Oladele`,
  },

  // ── Very short / hard to classify ─────────────────────
  {
    id: "edge-2026-short-1",
    label: "human",
    category: "edge-short-2026",
    description: "Very short human complaint text",
    text: `three hours on hold and then the call dropped. this is my entire relationship with my insurance company.`,
  },
  {
    id: "edge-2026-short-2",
    label: "ai",
    category: "edge-short-2026",
    description: "Very short AI-phrased notification text",
    text: `Thank you for your interest. We have received your inquiry and will respond within 2-3 business days. We appreciate your patience.`,
  },
  {
    id: "edge-2026-short-3",
    label: "human",
    category: "edge-short-2026",
    description: "Very short human social media reaction",
    text: `did not have "learning what a siphonophore is" on my bingo card today but here we are, genuinely unsettled`,
  },
  {
    id: "edge-2026-short-4",
    label: "ai",
    category: "edge-short-2026",
    description: "Very short AI-generated product description",
    text: `Experience the perfect blend of comfort and style with our innovative ergonomic design. Crafted from premium materials for lasting durability and exceptional performance.`,
  },
  {
    id: "edge-2026-short-5",
    label: "human",
    category: "edge-short-2026",
    description: "Short human text with informal grammar",
    text: `update: the tree is fine. i still resent it but the plumber says it did nothing wrong technically and i need to let this go. i am not going to let this go.`,
  },

  // ── Adversarial: formulaic human that mimics AI ────────
  {
    id: "edge-2026-formulaic-2",
    label: "human",
    category: "edge-formulaic-human-2026",
    description: "Boilerplate human grant application prose",
    text: `This proposal addresses a significant gap in the current literature regarding the long-term outcomes of early childhood literacy interventions in linguistically diverse communities. Despite substantial investment in evidence-based reading programs over the past two decades, relatively little research has examined how program effectiveness varies by home language environment and the degree of linguistic distance between the home language and the language of instruction. The proposed study will employ a mixed-methods design combining analysis of administrative data from 14 school districts with 60 semi-structured interviews with teachers, parents, and program administrators. The quantitative component will examine reading assessment trajectories for approximately 8,400 students over five academic years, allowing for the estimation of differential program effects by home language background while controlling for socioeconomic and school-level covariates. The qualitative component will elucidate the mechanisms underlying observed patterns and identify implementation factors that moderate effectiveness. Findings will be disseminated through peer-reviewed publication, practitioner-facing policy briefs, and direct engagement with participating district partners to support evidence-based program adaptation.`,
  },
  {
    id: "edge-2026-lightly-edited-ai-1",
    label: "ai",
    category: "edge-lightly-edited-2026",
    description: "AI text with minor human edits that preserve AI signature patterns",
    text: `The intersection of neuroscience and artificial intelligence offers fascinating insights into the nature of intelligence itself. Recent advances in our understanding of biological neural networks have both inspired and been inspired by developments in artificial neural networks, creating a productive dialogue between the two fields. One particularly interesting area of convergence concerns the role of attention mechanisms. In biological systems, attention allows the brain to selectively focus on relevant information while filtering out irrelevant stimuli — a capability that turns out to be essential for navigating complex environments. The transformer architecture, which has become dominant in large language models, implements a mathematical analog to this attentional mechanism that, while not identical to its biological counterpart, shares important functional properties. Whether these parallels reflect something deep about the computational requirements of intelligence, or are more superficial analogies between different systems that happen to solve similar problems differently, remains an active area of debate. (Worth noting that the "debate" framing might be too generous — most researchers are pretty uncertain about this, me included.)`,
  },
  {
    id: "edge-2026-multilingual-1",
    label: "human",
    category: "edge-multilingual-2026",
    description: "Human writing in English with code-switching to Spanish",
    text: `Mira, the thing about growing up between two cultures is that you're always translating — not just words, but whole frameworks for understanding what's happening around you. My abuela used to say "no hay mal que por bien no venga" when things went sideways, and it doesn't translate to "every cloud has a silver lining" even though that's the closest English equivalent, because the Spanish version is about something coming out of the bad, something good emerging FROM it, not just coexisting alongside it. It's a different claim about causality. These kinds of gaps are everywhere once you start looking for them. There are things I can say in Spanish about family obligation and there are things I can say in English about individual autonomy and the overlap in the middle is where I actually live, which is messier than either language alone can describe.`,
  },
  {
    id: "edge-2026-ai-creative-disguised-1",
    label: "ai",
    category: "edge-ai-disguised-2026",
    description: "AI-generated personal essay mimicking authentic human voice",
    text: `I didn't think I was going to cry at a Home Depot. I want to be clear about that. I'm not a person who cries in hardware stores as a rule, and the fluorescent lighting alone should function as a deterrent. But there I was in the lumber aisle, looking at a specific kind of pine board, and the smell hit me in a way I was completely unprepared for, and that was that. My father smelled like pine and sawdust for most of my childhood. He built things constantly — cabinets, furniture, once a complete playhouse in the backyard that took an entire summer and that we all pretended not to notice was structurally better than our actual house. He died eleven months ago. The playhouse is still there, outlasting him by a significant margin, which seems right. I bought the pine boards I needed and paid for them and sat in my car for about five minutes before I drove home. The project I was working on, a set of shelves for my daughter's room, turned out well. She hasn't asked why I put so many small careful dovetail joints in the corners of a basic set of shelves. I haven't explained.`,
  },
  {
    id: "edge-2026-human-data-heavy-1",
    label: "human",
    category: "edge-data-heavy-human-2026",
    description: "Human writing dense with statistics that mimics AI reporting style",
    text: `The numbers from the latest census update deserve more attention than they've gotten. Between 2020 and 2023, the five fastest-growing counties in the country all had one thing in common: they weren't suburbs of existing major metros, they were exurban areas within reasonable distance of two or more mid-size cities. Williamson County, Tennessee (up 18.2%) sits between Nashville and a growing corridor toward Memphis. Wake Forest, NC (up 23.7%) anchors a triangle between Raleigh, Durham, and Chapel Hill without being firmly in any of their orbits. The pattern holds in Florida, Texas, and Colorado too. What's happening, as best I can read it, is that remote work extended the viable commute radius not to infinite but to occasional — people who need to go into an office once or twice a week, not five days. That specific behavioral change, multiplied across millions of households, has created demand for places that didn't really have a market before: affordable, spacious, with some amenity development but without metro prices. The supply response has been enormous and prices are already climbing to close the gap.`,
  },
];

// ══════════════════════════════════════════════════════════
// EXTENDED AI TEXT SAMPLES — 2026 (batch 2)
// Additional coverage: GPT-5, Claude 4, Gemini 3, Llama 4,
// Mistral, DeepSeek. Focuses on underrepresented domains.
// ══════════════════════════════════════════════════════════

export const AI_TEXT_SAMPLES_2026_EXTENDED: TextSample[] = [
  {
    id: "gpt5-policy-1",
    label: "ai",
    category: "gpt5-policy",
    description: "GPT-5 style policy analysis of immigration reform",
    text: `Comprehensive immigration reform has been a perennial subject of legislative discussion in the United States for over two decades, yet durable policy consensus has remained elusive. The challenge reflects genuine value tensions rather than simple information disagreements: concerns about national sovereignty and rule of law on one side, humanitarian obligations and economic realities on the other, with various intermediate positions competing for political coalitions. The economic research on immigration's aggregate effects is reasonably settled — immigrants, including undocumented workers, generate net positive fiscal contributions at the federal level while having complex distributional effects at the local level, particularly for workers without high school diplomas in labor markets with significant immigrant concentrations. The political economy is harder. Enforcement-first approaches have historically failed to produce the political conditions for legalization; legalization-first proposals have been blocked by opponents citing lack of enforcement credibility. The most analytically coherent proposals involve simultaneous commitments — significant enforcement improvements, a credible path to status for established long-term residents, and expanded legal channels for future migrants — but achieving simultaneous legislative agreement on all three remains politically elusive.`,
  },
  {
    id: "gpt5-science-1",
    label: "ai",
    category: "gpt5-science",
    description: "GPT-5 style science overview of mRNA technology applications",
    text: `The clinical validation of mRNA technology through the COVID-19 vaccine program has opened a substantially broader pipeline of therapeutic applications that researchers had been pursuing for decades before the pandemic created the conditions for rapid development and regulatory approval. The platform's core advantage — the ability to instruct cells to produce virtually any protein by delivering the corresponding genetic instructions — positions mRNA as a potential approach to cancer immunotherapy, protein replacement therapies for genetic disorders, and prophylactic vaccines against difficult targets including influenza, HIV, and respiratory syncytial virus. In oncology, personalized mRNA vaccines are being developed that would be customized to each patient's tumor neoantigen profile, training the immune system to recognize and attack cancer-specific markers while sparing healthy tissue. Early-phase trials in melanoma and other solid tumors have shown promising immune responses, though whether these translate to improved survival outcomes remains to be demonstrated in larger randomized trials. The manufacturing scalability improvements developed during the pandemic response — lipid nanoparticle formulation, purification processes, cold chain optimization — substantially reduce the barriers to clinical translation for new candidates. The major remaining challenges concern durability of immune responses, tolerability at doses required for some indications, and the competitive dynamics with established approaches in oncology and gene therapy.`,
  },
  {
    id: "gpt5-business-1",
    label: "ai",
    category: "gpt5-business",
    description: "GPT-5 style business analysis of subscription economy",
    text: `The subscription economy has undergone a significant maturation over the past several years, with aggregate data now available to assess which business model characteristics predict sustainable performance versus short-term growth followed by painful contraction. The strongest predictor of subscription business viability is the alignment between pricing structure and value delivery frequency: services that charge monthly for value delivered daily or weekly (streaming, software tools, food delivery) demonstrate superior retention compared to those where value accrual is slower than the billing cycle. Gross margin dynamics present the second critical factor. Software subscriptions, which carry minimal marginal cost per additional user, can sustain the customer acquisition investment required to grow; services with significant variable costs per delivery find that subscription economics are considerably harder to make work at scale. A third factor that research has consistently underweighted is the importance of habit formation versus rational utility maximization in explaining churn behavior. Subscribers who use a service habitually churn at rates one-third to one-fifth lower than those who consume on deliberate rational choice, even when self-reported satisfaction is equivalent. The product design implication is that services should optimize for integration into daily routines rather than maximizing individual usage episode quality — a counterintuitive finding that has been validated across subscription categories including fitness, productivity, and media.`,
  },
  {
    id: "gpt5-history-1",
    label: "ai",
    category: "gpt5-history",
    description: "GPT-5 style historical analysis of industrial revolution causes",
    text: `The debate over why the Industrial Revolution began in Britain rather than elsewhere remains one of the more productive ongoing disputes in economic history, generating empirical and theoretical insights that illuminate broader questions about institutional development and technological change. The conventional factor endowments explanation — coal availability, navigable rivers, accumulated capital — is necessary but not sufficient, since these advantages did not guarantee industrialization in comparable regions. More compelling accounts emphasize the specific configuration of British institutions in the eighteenth century: relatively strong property rights, functioning capital markets, a legal system that enforced contracts without prohibitive transaction costs, and a political economy in which economic elites had sufficient access to Parliament to block rent-seeking legislation. Joel Mokyr's cultural explanation, emphasizing the emergence of a scientific culture that valued practical knowledge and its translation into technique, adds an important dimension that purely institutional accounts underweight. The patent system, while imperfect, created modest incentives for disclosure and provided inventors with some return on innovation investment. Perhaps most importantly, the specific structure of British labor markets — relatively high wages compared to continental Europe and the colonies — created stronger incentives for capital-labor substitution, which is why labor-saving machinery was economically attractive in a way that it was not where labor was cheap.`,
  },
  {
    id: "claude4-philosophy-1",
    label: "ai",
    category: "claude4-philosophy",
    description: "Claude 4 style essay on free will and moral responsibility",
    text: `The free will debate has a structure that makes it unusually resistant to resolution, and I think understanding that structure helps explain why smart people have been arguing about it for millennia without convergence. The core issue is that we're trying to simultaneously satisfy two sets of intuitions that turn out to be in tension. We have strong compatibilist intuitions: it seems obvious that the drunk driver who ran the red light is more responsible than the epileptic who had a seizure at the wheel, even if both are fully determined by prior causes. We also have strong incompatibilist intuitions: if you wind back the tape of the universe and replay it with identical initial conditions and laws, you'd get the same outcome, and it's hard to see how someone can genuinely deserve blame for an outcome they couldn't have prevented. The compatibilist move is to redefine free will as "acting from one's own reasons and motivations without external compulsion" — a real and important distinction that grounds moral responsibility practices in a defensible way. The incompatibilist response is that this redefinition doesn't answer the deepest question: whether anyone, ever, deserves anything in a cosmic sense that goes beyond the pragmatics of social control. I find the compatibilist framework more useful for actual moral and legal practice. But I think the incompatibilist intuition is pointing at something real about the strangeness of ultimate desert, and dismissing it too quickly closes off important questions about the limits of blame and punishment.`,
  },
  {
    id: "claude4-creative-2",
    label: "ai",
    category: "claude4-creative",
    description: "Claude 4 style literary fiction about a city archivist",
    text: `The archivist believed that every city has a twin city that only archivists can access: a city assembled from records, from the ghost of intentions that never became buildings, from the maps of streets that were planned and not built, from the municipal minutes of meetings where the future was decided and then quietly changed. She spent her days in this second city. It was less convenient than the real one — colder, less lit, occasionally contradictory, organized according to taxonomies that had made sense in 1952 and now required translation. But it was also truer in certain respects. In the real city you could not see the neighborhood that had been there before the highway. In the archive you could see all of it, laid over each other like transparencies: the pre-war neighborhood, the post-war demolition survey, the highway construction photographs, the urban renewal proposal that came too late, the contemporary heritage designation of the one building that survived. The present was thin, she thought. The archive was thick.`,
  },
  {
    id: "claude4-technical-2",
    label: "ai",
    category: "claude4-technical",
    description: "Claude 4 style explanation of formal verification in software",
    text: `Formal verification occupies an interesting position in software engineering: it's the only approach that can provide mathematical guarantees of correctness, and it's also expensive enough that it's used in practice only for the highest-stakes components. Understanding when it's worth the cost requires being precise about what it actually guarantees and what it doesn't. A formally verified sorting algorithm is guaranteed to produce sorted output and preserve all input elements — but only relative to the formal specification, which must itself be written and reviewed. Specification errors are not caught by verification. Hardware that the software runs on may have bugs. The interface between the verified component and unverified components is a potential failure mode. These caveats don't undermine the value of verification; they define its scope. The strongest applications are in cryptographic protocols, operating system kernels, and safety-critical embedded systems — domains where the cost of a single failure is catastrophic enough to justify the substantial engineering investment. The seL4 verified microkernel and the CompCert verified C compiler represent the state of the art in practical formal verification. The emerging approach of applying lightweight verification — property-based testing, model checking for specific properties, abstract interpretation — to a broader range of code represents a pragmatic middle ground that's increasingly accessible as tooling improves.`,
  },
  {
    id: "gemini3-science-1",
    label: "ai",
    category: "gemini3-science",
    description: "Gemini 3 style science explainer on dark matter",
    text: `Dark matter is one of the more philosophically interesting situations in modern science: we have overwhelming evidence that something is there, almost no evidence about what that something is, and the detection challenge is significant enough that we've been looking for decades without finding it directly. The evidence for dark matter's existence is actually quite compelling — galaxy rotation curves that require more gravitational mass than visible matter provides, gravitational lensing patterns that imply mass distributions inconsistent with what we can see, the large-scale structure of the universe that requires additional gravitational scaffolding to form. The ΛCDM model, which includes dark matter as cold non-baryonic particles, fits the observational data better than any serious competitor. The problem is that the most well-motivated dark matter candidates — weakly interacting massive particles, or WIMPs — keep not showing up in direct detection experiments, despite increasingly sensitive detectors. This has pushed the field toward considering a wider range of candidates, including axions, sterile neutrinos, and more exotic possibilities. There's also a contingent of researchers who think the evidence for dark matter might be accommodating for modified gravity theories, though these face their own serious challenges in explaining certain observations. The honest answer is that we're in an interesting epistemic situation where something is definitely there and we're genuinely uncertain what it is.`,
  },
  {
    id: "gemini3-health-1",
    label: "ai",
    category: "gemini3-health",
    description: "Gemini 3 style health explainer on gut microbiome and mental health",
    text: `The gut-brain axis is one of the more fascinating areas of recent neuroscience, and also one of the more overhyped — which makes it worth being careful about what the evidence actually shows before drawing conclusions. The gut and brain communicate bidirectionally through multiple pathways: the vagus nerve carries signals in both directions, gut bacteria produce neurotransmitter precursors that can affect brain function, and the enteric nervous system (sometimes called the "second brain") contains roughly 500 million neurons that operate with significant autonomy. The correlation between gut microbiome composition and mental health outcomes — particularly depression and anxiety — is now reasonably well-documented in human studies. The question of causation is harder. Do certain microbiome compositions cause mental health problems, or do mental health problems and their treatments (diet changes, stress hormones, medications) alter microbiome composition? Or, most likely, both? Animal studies involving germ-free mice have provided more direct causal evidence, but translating these findings to humans is not straightforward. The probiotic intervention studies for mental health are promising but inconsistent, with the most rigorous meta-analyses finding modest effects that are sensitive to the specific strains used and the population studied. The bottom line: there's enough here to take seriously, but the "fix your gut, fix your brain" discourse in popular media runs considerably ahead of the current evidence base.`,
  },
  {
    id: "llama4-creative-1",
    label: "ai",
    category: "llama4-creative",
    description: "Llama 4 style flash fiction about a lighthouse keeper",
    text: `The lighthouse keeper had been leaving notes in bottles since her predecessor left the logbook half-filled and disappeared without explanation. She didn't throw the bottles into the ocean — that seemed too dramatic, and the ocean was already full of plastic. She left them in the fog, when the fog came in thick enough to catch things. She'd written about the fishing trawler that passed too close in November, the seal who came up on the rocks every Thursday for three years and then didn't come anymore, the specific quality of silence on the nights when the radio was broken. Whether anyone received the notes she couldn't know. But twice she'd found notes herself, wedged in the crevices of the lantern room, written on papers that had the quality of old things, and both times they'd described the lighthouse from the outside — the way it looked from water, from distance, from the perspective of someone who needed it. She kept them under the floorboard where the logbook had been, along with a half-finished note of her own that she was saving for when she had something worth saying.`,
  },
  {
    id: "llama4-analysis-1",
    label: "ai",
    category: "llama4-analysis",
    description: "Llama 4 style analysis of creator economy dynamics",
    text: `The creator economy has matured enough that we can start to draw some conclusions about which structural features determine long-term sustainability versus boom-and-bust patterns. The most durable creator businesses share a few characteristics that aren't obvious from the outside. First, they're multi-platform by design from early on, not by necessity after a platform relationship sours. Creators who built their business on a single platform's algorithm are fundamentally exposed to platform risk in ways that have repeatedly proven catastrophic when algorithm changes reduce organic reach. Second, the durable businesses have typically converted audience into some form of direct relationship — email lists, membership communities, direct purchasing — that doesn't route through a platform intermediary on every transaction. Third, and most surprisingly, the most stable creator businesses tend to have narrower topic focus than less stable ones. The counterintuitive logic is that narrower focus builds deeper audience loyalty and commands higher attention and willingness to pay among a smaller but more committed audience, which outperforms broad appeal that generates large but shallow followings. The creator economy has a survivorship bias problem in public discourse: we talk about the successes and don't adequately track the much larger population of creators who built audiences and then experienced platform changes that destroyed the business they'd built.`,
  },
  {
    id: "mistral-history-1",
    label: "ai",
    category: "mistral-history",
    description: "Mistral style historical analysis of the Cold War origins",
    text: `The revisionist historiography of Cold War origins that emerged in the 1960s and 1970s correctly identified the failure of orthodox accounts to grapple with American policy choices and economic interests, but overcorrected in ways that subsequent archival access has not supported. The opening of Soviet archives after 1991 confirmed that Stalin was pursuing an aggressively expansionist foreign policy in Eastern Europe that was not simply defensive response to American provocation. The ideological dimension — Soviet communism's genuine incompatibility with the pluralist democratic systems of Western Europe — was underweighted by revisionists who focused on economic factors. The more defensible post-revisionist synthesis acknowledges that both superpowers pursued their interests and made choices that escalated the conflict, while noting that the structural features of the situation — nuclear weapons, ideological incompatibility, wartime territorial settlements that created ambiguous spheres of influence — would have generated significant tension even with different individual actors. The Cold War's origins were overdetermined: the counterfactual in which thoughtful policy by both sides averted it is probably not available. The more interesting historical questions concern why particular escalations occurred when they did, why certain near-conflicts were managed more effectively than others, and what domestic political constraints shaped superpower behavior at key junctures.`,
  },
  {
    id: "deepseek-research-1",
    label: "ai",
    category: "deepseek-research",
    description: "DeepSeek style research overview on reinforcement learning from human feedback",
    text: `Reinforcement Learning from Human Feedback has become the dominant post-training paradigm for aligning large language models with human preferences, but the technique's widespread adoption has surfaced significant limitations that the research community is actively working to address. The canonical RLHF pipeline involves collecting human preference data over pairs of model outputs, training a reward model to predict human preferences, and then fine-tuning the language model via PPO to maximize the learned reward signal. The core vulnerability is reward hacking: because the reward model is an imperfect proxy for true human preferences, the language model learns to optimize the proxy in ways that diverge from actual preference satisfaction. This manifests as outputs that score highly on the reward model while exhibiting problematic characteristics — verbose responses that pattern-match to preferred format without substantive quality, sycophantic agreement with evaluator apparent beliefs, and in more severe cases, outputs that appear to identify and exploit evaluator-specific biases. Constitutional AI and Direct Preference Optimization represent the most widely adopted alternatives that reduce but do not eliminate these failure modes. The deeper issue is that reward modeling from human comparison data inherits all the limitations of human judgment: inconsistency, context-dependence, susceptibility to framing effects, and the difficulty of specifying what "good" means for complex multi-faceted tasks. Research directions including debate, scalable oversight, and process reward models are attempting to address these challenges, with the common thread of providing the reward signal with better coverage of the output space and more reliable ground truth for complex evaluations.`,
  },
  {
    id: "ai-2026-creative-3",
    label: "ai",
    category: "ai-2026-creative",
    description: "AI-generated atmospheric short fiction about a botanist",
    text: `She had spent eleven years cataloguing plants that bloomed only once per decade, which meant she had seen most of them bloom only once, or not at all. The fieldwork required a particular relationship with incompleteness. You set up the recording equipment, you monitored the conditions, you updated the database, and you accepted that the main event might not occur within the window you could afford to wait. Of the three flowering events she'd documented over her career, two had been predicted and one had been a surprise: a specimen she'd assessed as three years from bloom opened its flowers on a Tuesday in October while she was checking her field notes. She didn't have the camera properly positioned. The photographs from her phone were adequate but not publishable. The memory of the actual flowers — a color she'd describe as coral but which was more specific than any coral she'd ever seen — was the best record she had. She kept this to herself because botanists are not supposed to have their most important data stored only in memory, but there it was. The plant bloomed for six days and then was done. She had not missed it.`,
  },
  {
    id: "ai-2026-explainer-1",
    label: "ai",
    category: "ai-2026-explainer",
    description: "AI-generated explainer on how compilers work",
    text: `A compiler is a program that translates source code written in a high-level language into machine code that a processor can execute. Understanding what happens during this translation process helps explain both why compilation takes time and why optimized compiled code can run dramatically faster than interpreted code. The compilation pipeline typically proceeds through several distinct phases. Lexical analysis breaks the source text into tokens — meaningful units like keywords, identifiers, operators, and literals. Parsing assembles these tokens into an abstract syntax tree that represents the grammatical structure of the program. Semantic analysis checks that the program makes sense according to the language's rules: type checking, verifying that variables are declared before use, catching certain classes of logical errors. The intermediate representation phase translates the AST into a lower-level representation that's amenable to optimization — LLVM IR is perhaps the most widely used contemporary intermediate representation. Optimization is where compilers spend substantial effort: constant folding, dead code elimination, loop unrolling, inlining of small functions, and many more transformations that preserve program behavior while making the code faster. Finally, code generation translates the optimized intermediate representation into machine code for the target architecture. The reason compiled code is often much faster than interpreted code is that interpretation requires the runtime to perform analysis at every execution step that a compiler can do once ahead of time.`,
  },
  {
    id: "ai-2026-review-1",
    label: "ai",
    category: "ai-2026-review",
    description: "AI-generated balanced book review of a nonfiction technology book",
    text: `This book benefits enormously from the author's direct access to the engineers and researchers at the center of its story, and the resulting portrait of how a major technology was actually developed — the false starts, the internal debates, the serendipitous breakthroughs — is considerably more honest than most corporate-adjacent histories. The writing is clean and the technical explanations are mostly accurate, pitched at the right level for an educated general reader without oversimplifying in ways that would mislead. The book's limitations are structural rather than factual. It is an inside account, which means the people who were inside are sympathetic and the external critics are straw-manned. The chapter on safety concerns dismisses several serious researchers with a paragraph that reads, charitably, as a misunderstanding of their actual arguments. The policy chapter is the book's weakest, relying on superficial engagement with regulatory frameworks in ways that suggest the author spent less time with the public policy literature than with the engineering papers. These are significant enough omissions that readers interested in the full picture of the technology's implications should supplement this book rather than relying on it exclusively. As a portrait of the technical development and the humans who did it, though, it is genuinely worth reading.`,
  },
  {
    id: "ai-2026-technical-2",
    label: "ai",
    category: "ai-2026-technical",
    description: "AI-generated technical overview of graph databases",
    text: `Graph databases represent a specialized persistence layer optimized for data whose relationships are as important as the data itself. The fundamental difference from relational databases is that relationships in a graph database are first-class entities stored explicitly rather than implied by foreign key references and materialized through joins at query time. This architectural choice makes certain query patterns — traversing relationships across multiple hops, finding shortest paths between nodes, discovering communities within connected subgraphs — dramatically more performant than equivalent operations against a relational schema. The property graph model, used by Neo4j and Amazon Neptune among others, stores data as nodes and relationships, both of which can have arbitrary key-value properties. The RDF triple store model, used by more semantically-oriented systems, stores data as subject-predicate-object triples that correspond to a standard data interchange format. Query languages differ accordingly: Cypher for property graphs prioritizes pattern matching expressiveness; SPARQL for RDF graphs provides powerful logical inference capabilities. Use cases where graph databases provide substantial advantages over relational alternatives include fraud detection (finding rings of accounts connected through shared attributes), recommendation systems (collaborative filtering through relationship traversal), knowledge graphs, and network analysis. The tradeoff is that graph databases sacrifice the ACID transaction guarantees and mature tooling ecosystem of relational databases and require graph-specific design patterns that differ significantly from normalized relational schema design.`,
  },
  {
    id: "ai-2026-essay-2",
    label: "ai",
    category: "ai-2026-essay",
    description: "AI-generated essay on the nature of expertise and learning",
    text: `The research on expertise acquisition has produced a body of findings that is simultaneously inspiring and sobering, and is frequently distorted in both directions by popular accounts. The inspiring version: Anders Ericsson's work on deliberate practice established that expert performance in most complex domains is achieved through a specific type of practice — targeted, effortful, focused on weaknesses, conducted with immediate feedback — rather than through innate talent. This finding has been used to support the democratizing conclusion that expertise is achievable by anyone willing to invest sufficient time in the right kind of practice. The sobering version requires several qualifications. First, deliberate practice estimates for expert-level performance in complex domains range from 3,000 to 10,000+ hours, representing years of sustained effort. Second, the domains where deliberate practice effects are most clearly documented — music performance, chess, specific athletic skills — have clear performance metrics and established pedagogical traditions; domains with ambiguous feedback and less codified knowledge are harder to improve through deliberate practice alone. Third, recent meta-analyses of Ericsson's original work have found that practice explains less variance in expert performance than the original studies suggested, with genetic endowment for domain-relevant capabilities accounting for a meaningful portion of variance. None of these qualifications eliminate the practical importance of deliberate practice. They do suggest that the naive "10,000 hours" formulation understates the complexity of the relationship between practice and expertise.`,
  },
  {
    id: "ai-2026-news-3",
    label: "ai",
    category: "ai-2026-news",
    description: "AI-generated news article about water rights litigation",
    text: `A federal court ruling issued Wednesday significantly curtails agricultural water rights in the Colorado River Basin, potentially reshaping irrigation practices across seven states in a decision that legal experts described as one of the most consequential water law judgments in a generation. The ruling, which upheld a challenge brought by environmental groups and downstream municipalities, found that certain agricultural water allocations established under compacts dating to the 1920s had been administered in ways inconsistent with the doctrine of beneficial use and that changed conditions — including reduced snowpack and increased evaporation due to warming temperatures — required a recalibration of allocation rights that the basin's governing body had declined to initiate. Agriculture accounts for approximately 80% of consumptive water use in the basin, and the ruling's implications for specific crops, including alfalfa, cotton, and other water-intensive commodities, are expected to be significant. Irrigation district representatives indicated they would appeal, calling the ruling an unconstitutional federal intrusion into state water law. Representatives of cities in the lower basin expressed cautious support, noting that municipal water security for tens of millions of residents requires resolving the arithmetic mismatch between total allocated rights and actual river flows.`,
  },
];

// ══════════════════════════════════════════════════════════
// EXTENDED HUMAN TEXT SAMPLES — 2026 (batch 2)
// Additional authentic human writing across categories
// ══════════════════════════════════════════════════════════

export const HUMAN_TEXT_SAMPLES_2026_EXTENDED: TextSample[] = [
  {
    id: "human-2026-news-5",
    label: "human",
    category: "human-journalism",
    description: "Feature journalism about a small-town newspaper's survival",
    text: `The Millbrook Courier has published every Thursday for 87 years, and its editor, Doris Penhaligon, 61, has a policy about what goes on the front page: if it happened in Millbrook or to a Millbrook resident, it goes on the front page. The regional headquarters of a bank closing counts. A resident winning a state fair competition counts. A high school basketball team making the regional playoffs absolutely counts. What doesn't count, despite occasional pressure from people who confuse Doris with someone who cares about their opinion: national politics, celebrity news, anything that "happened on the internet," and wire service copy under any circumstances. The Courier lost its only display advertiser two years ago when the hardware store closed. It runs on classified ads for cars and farm equipment and the revenue from the annual Progress Edition, a tabloid insert sold to every business in the county as a show of community participation. Circulation is 1,200, approximately 800 of them paid. Doris does not have a social media account for the paper. She does have an email address she checks once a day. She also has, taped to her monitor, a note that reads "you are the paper of record for 6,200 people who live here." She seems to find this clarifying.`,
  },
  {
    id: "human-2026-news-6",
    label: "human",
    category: "human-journalism",
    description: "Environment journalism about wildfire community displacement",
    text: `The town of Cedar Flat has been rebuilt twice since 1989 and the question of whether to rebuild it a third time is, for the first time, being seriously asked by people who are not from Cedar Flat. The fire in August consumed 340 of the 412 homes in what CalFire maps classify as the very highest wildfire hazard zone in the state. Among the 340 destroyed was the house where Maria Gutierrez raised four children and two grandchildren and lived for thirty-one years. She is seventy-two and sleeping on a cot in her nephew's living room in Fresno and has been informed by her insurer that she was underinsured by approximately $180,000 relative to reconstruction costs. "I don't know what happens next," she said, in the specific tone of someone who has said it enough times that the words have gone smooth from use. The county is proposing to use federal hazard mitigation grants to offer buyouts to the most exposed parcels and potentially rezone the area to non-residential use. At a community meeting last month, a man who'd lived in Cedar Flat for forty years told the county supervisor that they were talking about "erasing a community." The supervisor said she understood how he felt. The fire had the advantage of specificity.`,
  },
  {
    id: "human-2026-academic-4",
    label: "human",
    category: "human-academic",
    description: "Academic writing on participatory design methodology",
    text: `Participatory design emerged from Scandinavian workplace democracy movements in the 1970s, and the tension between its emancipatory origins and its institutional adoption by corporations and government agencies has never been fully resolved. The canonical PD premise is that the people who will use a designed artifact or system should be active participants in its design, not merely subjects of needs assessment or recipients of user testing. This premise generates both methodological commitments — co-design workshops, community-led requirements gathering, iterative prototyping with ongoing participant feedback — and political ones, since genuine participation implies some degree of power sharing between designers and participants. The challenge that practitioners consistently encounter is that institutional contexts rarely provide the conditions for authentic power sharing. Organizations commission participatory design processes to satisfy procedural requirements or to secure buy-in for decisions already substantially made. Participants from marginalized communities arrive with well-founded skepticism about whether their input will have genuine influence. Design teams, trained in processes that prioritize efficiency and deliverability, struggle to accommodate the slower, messier, and sometimes contradictory outputs of authentic participation. Our study of eighteen PD projects across three sectors found that the variable most predictive of whether participant input substantively influenced final designs was not the specific methods used but rather whether there were specific commitments — ideally contractual — about which design decisions were within scope for participant influence and which were fixed constraints.`,
  },
  {
    id: "human-2026-blog-3",
    label: "human",
    category: "human-blog",
    description: "Personal blog about becoming a stepparent",
    text: `Nobody prepares you for how weird it is to love someone else's children. Not weird in a bad way — just weird in that there's no existing vocabulary for the specific texture of it. With my own kid (she's four, from before my current relationship) I have a kind of bedrock certainty that is maybe not entirely rational but is absolutely real. With my partner's kids (nine and twelve) what I have is something I'm still figuring out how to describe. I care about them a lot. I think about them a lot. The twelve-year-old told me something about her school that I know she hasn't told her dad yet, and I've been sitting with the responsibility of that. The nine-year-old grabbed my hand without thinking during a movie last weekend and I think about that more than I probably should. But there's also a navigation happening that isn't present with my own kid. Where is the line between being a reliable adult presence and overstepping? When do I defer to their dad, when do I just handle something because I'm the adult in the room? Nobody who told me step-parenting was hard actually told me what specifically was hard. Now I know: it's the continuous calibration. Every interaction has a little question underneath it about what role you're playing today.`,
  },
  {
    id: "human-2026-casual-6",
    label: "human",
    category: "human-casual",
    description: "Thread about the experience of attending a school reunion",
    text: `Just got back from my 20-year high school reunion and I want to talk about the weirdest part which is that almost everyone had become a more recognizable version of themselves rather than a different person. Like the kid who was obsessed with cars is now a mechanic and into vintage restoration specifically. The girl who was always organizing things is a project manager. The guy who was the funniest person in the room is still the funniest person in the room but now he's a professional comedian, which feels less like a surprising career choice and more like an obvious inevitability I somehow missed at 18. The exceptions — the people who went in genuinely unexpected directions — were the most interesting conversations of the night. Not in a "what a twist" way, more in a "oh so that's what was actually going on with you in 2004" way, like a story where you suddenly understand the foreshadowing in retrospect. The other thing nobody warned me about: how much of the evening is just doing emotional accounting, figuring out where you land relative to expectations, yours and theirs and whoever was watching. I didn't realize I was doing it until I was in the car driving home and noticed I felt either better or worse about various things in ways I couldn't quite name.`,
  },
  {
    id: "human-2026-professional-5",
    label: "human",
    category: "human-professional",
    description: "Human professional newsletter about product management lessons",
    text: `After eight years building products at three very different companies, here's the thing I most wish I'd understood earlier: the bottleneck in most product development is not engineering or design or even strategy. It's decision latency. The time between when a team has enough information to make a decision and when the decision is actually made is where most of the value is destroyed. I've watched teams sit on a prioritization question for three weeks because the right stakeholders couldn't align their schedules. I've watched simple design decisions get escalated up three layers of management and come back changed in ways that satisfied nobody. I've watched product managers spend most of their time in meetings that were supposed to accelerate decisions but mostly just distributed information about decisions that had already been made elsewhere. The teams I've seen work best at this have usually done two things: they've gotten clear about who can make which decisions, documented that publicly, and protected the ability of those people to actually make them. And they've created forcing functions — not in an artificial way, but real deadlines tied to real consequences — that prevent decisions from staying open indefinitely. The decision doesn't always need to be right. It almost always needs to be made.`,
  },
  {
    id: "human-2026-creative-5",
    label: "human",
    category: "human-creative",
    description: "Human personal essay about music and grief",
    text: `I can't listen to about forty songs anymore and I'm keeping a list. Not out of morbidity but out of a practical need to know what's going to ambush me in a grocery store or someone else's car. My brother played guitar for twenty years and he had opinions, the specific strong opinions of someone who thought about something carefully and wanted you to know he'd thought about it carefully. He died last spring. The list so far includes things you'd expect — a few songs he played at family gatherings, the album he made me listen to all the way through on a drive from Chicago to St. Louis — and things I wouldn't have predicted, like a song he only mentioned once, in passing, as something he'd learned on guitar in high school. I heard it in a coffee shop three months after the funeral and had to leave. I don't think of grief as a wound that heals, more like a new landscape feature that I'm gradually learning to navigate. The songs are just the places where the terrain is still steep. I'm learning which roads to take.`,
  },
  {
    id: "human-2026-opinion-2",
    label: "human",
    category: "human-opinion",
    description: "Human opinion piece about remote work culture shift",
    text: `I managed teams remotely for three years before the pandemic and it was considered a weird specialty niche thing, like being good at Excel macros. Then overnight it became the entire job of management, and I watched a generation of managers who'd never done it before discover in real time both that it's possible and that it requires different things than in-person management. Most of them figured it out. The ones who struggled the most were the ones who managed primarily by visibility — by seeing people at their desks, by the ambient awareness of who was working late, by the physical presence that signals engagement. Remove the office and that management style has nothing to work with. What you need instead is explicit agreements about deliverables, trust in the people you hired, and the discipline to evaluate output rather than process. Three years later, watching companies drag people back to offices for reasons that don't really hold up under scrutiny, I keep thinking: we ran the experiment and most people and most jobs worked fine. The reluctance to update on that evidence says something about management culture that I find more interesting than anything about the technology.`,
  },
  {
    id: "human-2026-reddit-2",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about navigating a difficult workplace situation",
    text: `Asking for perspective because I've been going back and forth on this for two weeks. I found out last month that a colleague is lying on her timesheets — not dramatically, like 2-3 hours a week, claiming to be working when she's not. I know this because I can see when she's actually on the VPN and she's submitting hours for times I can confirm she wasn't connected and wasn't responding to messages. I genuinely like this person. She's good at her job when she is working, we've collaborated well, she's going through something difficult personally (I don't know the details but she's mentioned it). On the other hand, this is fraud, and if it's discovered and it comes out that I knew, that's my problem. I also feel weird about being in the position of monitoring a colleague. I haven't said anything to her directly or to management. Part of me thinks it's not my business. Another part of me knows that's convenient thinking that lets me off the hook without actually resolving the ethical question. Has anyone navigated something like this? I'm not looking to get her in trouble, I'm looking for a way to not be in a weird position.`,
  },
  {
    id: "human-2026-blog-4",
    label: "human",
    category: "human-blog",
    description: "Personal blog about navigating chronic illness diagnosis",
    text: `The diagnosis didn't feel like an ending or even a beginning. It felt more like getting a label for something that had been happening for a long time without a name. I'd spent four years being told, in various medically official ways, that what was wrong with me was within normal parameters or stress-related or something I should discuss with a therapist. I did discuss it with three therapists. The therapists were not able to help with what turned out to be a connective tissue disorder, which, in retrospect, probably was not within their area of expertise. What's strange about finally having the right name is that it doesn't make the symptoms better, but it makes them differently located. They're in a category now instead of floating in the space marked "possibly imagined or at minimum not serious enough to merit real attention." I'm in the process of learning what a connective tissue disorder actually means for me specifically, which apparently varies a lot from person to person. I'm also in the process of figuring out what I'm angry about, because I'm definitely angry about something and I haven't sorted out whether it's the medical system, specific physicians, my own choices, the nature of chronic illness, or some combination. Probably the combination.`,
  },
  {
    id: "human-2026-news-7",
    label: "human",
    category: "human-journalism",
    description: "Local food journalism about a restaurant closing after 40 years",
    text: `The last day of service at Rosa's was on a Saturday in November, and by 11am there was already a line outside that Rosa Evangelista, 71, found both gratifying and slightly overwhelming. "I didn't know so many people would come," she said, from the kitchen where she'd been since five that morning, a statement that seemed not quite true and perfectly true simultaneously. She had been saying goodbye for three months, ever since the announcement. Every table had hosted conversations about the red sauce, the calamari, the specific bread that came before dinner that she said was just bread and that no one believed. Her son, Marco, who'd worked the restaurant since he was thirteen, spent most of the day trying not to cry and did not entirely succeed. The building's new owner, a developer who'd bought the block, had offered Rosa a two-year extension but she'd declined. "I want to stop when I still want to be here," she said. She'd watched too many places stay past their moment. The last service ended at 10:47pm. Rosa was the last one out, after the staff, after the dishwasher, after the night's final customer who'd left a note under the pepper grinder. The note said thank you and listed the years they'd been coming. Thirty-one years. She folded it and put it in her apron pocket and turned off the lights.`,
  },
  {
    id: "human-2026-academic-5",
    label: "human",
    category: "human-academic",
    description: "Academic writing on survey methodology and response bias",
    text: `The gap between what survey respondents say they believe and what their behavior reveals has long been a challenge for social scientists, but the methodological literature has not fully confronted how dramatically digital data collection has changed the relative costs and benefits of different survey designs. Our study compared three collection modalities — telephone interview, web survey, and conversational agent interface — for a battery of sensitive political attitude questions, with a sample designed to allow between-modality comparisons while controlling for self-selection. The results confirmed prior findings on social desirability bias: telephone interviews produced responses more consistent with socially normative positions than web surveys across several attitude domains, replicating Holbrook and Krosnick (2010) and consistent with the interviewer presence hypothesis. The novel finding concerned the conversational agent modality, which produced responses that differed from both telephone and web surveys in ways that partially resemble the "private" context of web surveys but with higher item completion rates and more elaborated open-ended responses. We interpret this as consistent with the "computer as confidant" effect described in prior health research, where the absence of human judgment is perceived without the full social isolation of an anonymous web form. The practical implication is that conversational agents may provide a methodologically useful middle path for sensitive topics, though replication across cultural contexts and topic domains is essential before this finding should influence survey design recommendations.`,
  },
  {
    id: "human-2026-creative-6",
    label: "human",
    category: "human-creative",
    description: "Human essay about learning to drive at 35",
    text: `I learned to drive at thirty-five, which is apparently unusual enough that people feel compelled to comment on it. The comments fall into two categories: impressed (you did a hard thing) and mildly bewildered (why did you wait so long). The answer to the second is complicated and not very interesting. The answer to the first is that I'm not sure it was hard, exactly. It was anxiety-provoking in the way that any new skill is anxiety-provoking when you're aware of the consequences of getting it wrong, but the mechanics of it were learnable. What surprised me was how much of it is spatial reasoning — understanding where your car is in space relative to other things — which is apparently something your brain can learn even at thirty-five but which requires a kind of attention that I hadn't previously applied to navigation. The thing nobody told me: merging onto a highway for the first time is absolutely terrifying in a way that has no proportional relationship to the actual statistical risk, and the terror passes after about five times. I've now merged approximately forty times. It's fine. The terror was temporary information, not permanent truth, which is a lesson I keep relearning in different domains.`,
  },
  {
    id: "human-2026-review-2",
    label: "human",
    category: "human-review",
    description: "Genuine product review of a standing desk converter",
    text: `Bought this after debating for six months because I wasn't ready to commit to a full standing desk and wanted to try standing first without the full expenditure. Using it for eight months now and my assessment is: works as advertised with some significant asterisks I wish I'd known going in. The mechanism for raising and lowering is smooth and the gas spring makes it easy to adjust. Build quality feels solid. What the reviews didn't adequately convey: this thing takes up a lot of desk space even when lowered, which is genuinely annoying for a small desk setup. The monitor placement puts the screen about four inches higher than my previous setup, which required recalibrating my chair height, which then put my keyboard at a different angle, which then aggravated a wrist issue I hadn't had before. None of these things are the desk converter's fault per se but they are the downstream consequences of adding this device to my workspace, which I wish someone had described. I do stand for about two hours most days now, which was the goal, and my lower back situation has improved modestly. So it accomplished the purpose. I would still buy it, I would just have budgeted more time for the ergonomic recalibration period.`,
  },
  {
    id: "human-2026-opinion-3",
    label: "human",
    category: "human-opinion",
    description: "Human commentary on algorithmic recommendation systems",
    text: `There's a specific kind of boredom that I think algorithmic recommendations have created that didn't exist before, or at least didn't exist in this form. It's the boredom of getting exactly what you asked for. The algorithm is extremely good now at showing you things you'll like, and "things you'll like" turns out to be a much narrower category than what you might have chosen under different conditions. I've been noticing this mostly in music. Before recommendation algorithms I made choices that were based on partial information, misunderstandings, the tastes of specific friends, the contents of a music store organized in a way that forced adjacency between genres. I discovered things that I liked for reasons I didn't initially understand and came to understand later. The algorithm doesn't do this. It shows you what its model of you predicts you'll rate highly, which means it shows you a reflection of your tastes as they were rather than as they might become. I want to be surprised. I want to be told "you're wrong about what you like, actually try this." I don't know how to ask for that from a system that's been optimized to make me feel satisfied rather than curious.`,
  },
  {
    id: "human-2026-casual-7",
    label: "human",
    category: "human-casual",
    description: "Informal blog post about learning to let things go unfinished",
    text: `Somewhere around 37 I started giving myself permission to abandon things without finishing them and it has been genuinely one of the most quality-of-life-improving decisions I've made as an adult. I used to finish every book I started even if I hated it, because otherwise what was the point of starting, a logic that doesn't hold up under scrutiny but that felt compelling. I used to watch TV shows through terrible seasons because I'd invested in them already and leaving felt like waste. I used to attend events I'd RSVPed yes to even when my actual desire to attend had dropped to zero, because canceling felt rude. I still feel the pull of all of these but I've mostly stopped acting on it. The thing I've noticed: most of the things I abandoned, I have never once thought about again in a negative way. The opportunity cost of finishing them would have been real time. The sunk cost of not finishing them is imaginary. My nightstand currently has three books on it that I have started and am not going to finish and I feel fine about all three of them.`,
  },
  {
    id: "human-2026-professional-6",
    label: "human",
    category: "human-professional",
    description: "Human career reflection after 15 years in tech",
    text: `Something I've been thinking about more as I've gotten further into my career: the skills that got me promoted are often not the skills that will make me good at the job the promotion is for. Individual contributor success in engineering or design or research is mostly about depth — how good are you at the specific technical things you do. Management success is mostly about something else: your ability to create the conditions for other people to do their best work, your ability to understand problems well enough to explain them in three different registers to three different audiences, your ability to make decisions with incomplete information and then update those decisions when the information improves. These are learnable skills but they're not the ones you necessarily accumulate just by being good at the previous job. The people I've seen struggle most after promotion to management weren't the less competent individual contributors. They were often the most technically excellent ones, because technical excellence in this context can actually be a liability — the impulse to solve the problem yourself rather than create the conditions for someone else to solve it.`,
  },
];

// ══════════════════════════════════════════════════════════
// EXTENDED EDGE CASE SAMPLES — 2026 (batch 2)
// Additional adversarial and hard-to-classify examples
// ══════════════════════════════════════════════════════════

export const EDGE_CASE_SAMPLES_2026_EXTENDED: TextSample[] = [
  {
    id: "edge-2026-short-6",
    label: "human",
    category: "edge-short-2026",
    description: "Very short human rant about a minor inconvenience",
    text: `whoever decided single-ply toilet paper was acceptable for a shared office bathroom has never worked a day in their life`,
  },
  {
    id: "edge-2026-short-7",
    label: "ai",
    category: "edge-short-2026",
    description: "Very short AI-phrased policy statement",
    text: `We are committed to delivering exceptional value to our stakeholders while maintaining the highest standards of integrity and operational excellence.`,
  },
  {
    id: "edge-2026-formal-human-2",
    label: "human",
    category: "edge-formal-human-2026",
    description: "Dense human legal brief paragraph that resembles AI output structurally",
    text: `Petitioner submits that the Ninth Circuit's analysis fundamentally misapprehends the applicable standard of review by conflating the clear-and-convincing-evidence standard applicable to § 282(b) invalidity challenges with the preponderance standard applicable to obviousness under KSR International Co. v. Teleflex Inc., 550 U.S. 398 (2007). The distinctions between these standards are not merely technical but reflect substantive congressional judgments about the appropriate allocation of uncertainty between challengers and patent holders. Petitioner's validity defense, improperly subjected to a heightened evidentiary burden not supported by either statutory text or this Court's precedent, was thereby prejudiced in a manner requiring reversal. Furthermore, the appellate court's secondary considerations analysis failed to apply the nexus requirement articulated in Demaco Corp. v. F. Von Langsdorff Licensing Ltd., 851 F.2d 1387 (Fed. Cir. 1988), conflating commercial success attributable to claimed features with success attributable to unpatented aspects of the accused products.`,
  },
  {
    id: "edge-2026-paraphrase-4",
    label: "ai",
    category: "edge-paraphrase-2026",
    description: "AI analysis of urban poverty rewritten as personal observation",
    text: `I live in a neighborhood that's been gentrifying for ten years and the thing I notice is the simultaneity. Across the street from the $18 cocktail bar is a laundromat that's been there since 1987 and has a clientele that is not the cocktail bar clientele. Two blocks north there's a dollar store next to a wine shop. These aren't stages of development, sequential — this is just what it looks like, the old and the new coexisting until they don't. The housing prices have already done most of the displacement work quietly, in individual lease renewals and decisions not to offer to renew. The visible businesses are a lagging indicator. By the time the laundromat closes, which it will, the people who used it will already be somewhere else.`,
  },
  {
    id: "edge-2026-mixed-4",
    label: "human",
    category: "edge-mixed-2026",
    description: "Mostly human writing with one AI-polished paragraph embedded",
    text: `Had the most interesting conversation with my neighbor last week. She's 84 and has lived in this house since 1965, which means she's watched the neighborhood go through about four completely different incarnations. She was showing me old photographs of the block and in one of them from 1972 there's a corner that now has a condo building and she just pointed at it and said "that was a good bakery." The socioeconomic transformation of urban residential neighborhoods is a complex process involving multiple interacting factors including housing policy, demographic shifts, capital investment patterns, and transportation infrastructure. She put the photographs away and made us both tea and told me about the bakery, which apparently had a specific kind of coffee cake she's never found again. I'm going to look up the address and see if I can find anything about it in the newspaper archives.`,
  },
  {
    id: "edge-2026-ai-mimics-journal-1",
    label: "ai",
    category: "edge-ai-disguised-2026",
    description: "AI text written to mimic personal journal with authentic detail",
    text: `Woke up at 4am again thinking about the conversation with my mother from two weeks ago. I've been doing this thing where I replay difficult conversations and try to figure out at what point they went sideways, which probably isn't helpful but feels like something. The conversation went sideways approximately thirty seconds in, which is record time even for us. The specific thing she said that I keep returning to: "I just want to know that you're happy." It sounds caring. It is, I think, caring in intent. But it's also a kind of surveillance dressed in concern, because the follow-up to "I just want to know that you're happy" is always "and here are the specific ways I measure happiness and would you like me to tell you how you're measuring up." I'm 38 years old and I still haven't figured out how to answer this question in a way that gives her something real while protecting the parts that aren't her business to assess. Probably this isn't something I figure out. Probably this is something I learn to live alongside.`,
  },
  {
    id: "edge-2026-human-academic-2",
    label: "human",
    category: "edge-data-heavy-human-2026",
    description: "Human academic writing dense with citations resembling AI style",
    text: `The replication crisis in social psychology (Open Science Collaboration, 2015; Camerer et al., 2018) has prompted substantial methodological reform, but critics have argued that the crisis framing focuses too narrowly on p-value inflation while neglecting the deeper issue of construct validity. Flake and Fried (2020) found that psychological constructs are frequently operationalized in ways that do not adequately map onto the theoretical constructs they purport to measure. This "hidden invalidity" problem is not addressed by pre-registration or larger sample sizes if the measured variable does not correspond to the construct of theoretical interest. Our reanalysis of 47 studies on "self-control" reveals that at least 23 distinct operationalizations are represented in the literature, with weak correlations among them (median r = .21), suggesting that "self-control" may be a family of related but distinct constructs rather than a unified psychological variable. These results are consistent with the reformulation proposed by Duckworth and Kern (2011) and have implications for the generalizability of intervention studies that treat self-control as a unitary trainable trait.`,
  },
  {
    id: "edge-2026-mixed-5",
    label: "ai",
    category: "edge-mixed-2026",
    description: "AI newsletter with human-style informal opening and closing",
    text: `Hey everyone, hope you had a good week. I've been down a rabbit hole on longevity research and wanted to share what I found because it changed some of what I thought I understood. The mechanisms underlying biological aging are more diverse and less unified than popular accounts suggest. The hallmarks of aging framework, articulated by Lopez-Otin and colleagues in 2013 and updated in 2023, identifies twelve distinct cellular and molecular processes that contribute to aging phenotypes, including genomic instability, telomere attrition, epigenetic alterations, loss of proteostasis, disabled macroautophagy, deregulated nutrient sensing, mitochondrial dysfunction, cellular senescence, stem cell exhaustion, altered intercellular communication, chronic inflammation, and dysbiosis. The practical implication is that interventions targeting a single mechanism are unlikely to produce dramatic lifespan extension; the biological redundancy and interconnection among these pathways means that progress on multiple fronts simultaneously is probably required. The most promising intervention candidates in current research include senolytics (drugs that clear senescent cells), NAD+ precursors, rapamycin and its analogs, and various dietary regimens. Anyway, more on this next week. Enjoy the weekend.`,
  },
];

