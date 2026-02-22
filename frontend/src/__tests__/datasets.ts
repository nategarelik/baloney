// Curated real-world test datasets for AI detection evaluation
// Each sample is labeled with ground truth and source category

export interface TextSample {
  id: string;
  text: string;
  label: "ai" | "human";
  category: string;
  description: string;
}

export interface ImageTestCase {
  id: string;
  description: string;
  label: "ai" | "human";
  /** Base64 image data (small synthetic test images) */
  base64: string;
  mimeType: string;
  category: string;
}

// ══════════════════════════════════════════════════════════
// TEXT DATASETS — AI-Generated Samples
// These are representative of common AI output patterns
// ══════════════════════════════════════════════════════════

export const AI_TEXT_SAMPLES: TextSample[] = [
  {
    id: "ai-chatgpt-essay-1",
    label: "ai",
    category: "chatgpt-essay",
    description: "Typical ChatGPT essay about climate change",
    text: `Climate change represents one of the most pressing challenges facing humanity today. The scientific consensus is clear: human activities, particularly the burning of fossil fuels, are driving unprecedented changes in Earth's climate system. Rising global temperatures are leading to more frequent and severe weather events, rising sea levels, and disruptions to ecosystems worldwide. Addressing this crisis requires a multifaceted approach that combines technological innovation, policy reform, and individual action. Governments must implement robust carbon pricing mechanisms, invest in renewable energy infrastructure, and support communities most vulnerable to climate impacts. At the same time, businesses and individuals have a crucial role to play in reducing their carbon footprints and advocating for sustainable practices. The transition to a low-carbon economy presents both challenges and opportunities, and it is imperative that we act with urgency and determination to secure a sustainable future for generations to come.`,
  },
  {
    id: "ai-chatgpt-essay-2",
    label: "ai",
    category: "chatgpt-essay",
    description: "ChatGPT-style essay on artificial intelligence",
    text: `Artificial intelligence has emerged as a transformative force in modern society, reshaping industries and redefining the boundaries of what technology can achieve. From healthcare to finance, AI-powered systems are enabling more efficient processes, better decision-making, and innovative solutions to complex problems. Machine learning algorithms can analyze vast datasets to identify patterns that would be impossible for humans to detect, leading to breakthroughs in drug discovery, climate modeling, and personalized education. However, the rapid advancement of AI also raises important ethical considerations. Issues such as algorithmic bias, data privacy, and the potential displacement of workers must be carefully addressed to ensure that AI development benefits all of society. As we navigate this technological revolution, it is essential that we establish clear guidelines and frameworks that promote responsible AI development while fostering innovation and economic growth.`,
  },
  {
    id: "ai-chatgpt-blog-1",
    label: "ai",
    category: "chatgpt-blog",
    description: "AI-generated blog post about productivity",
    text: `In today's fast-paced world, productivity has become more important than ever. Whether you're a student, professional, or entrepreneur, maximizing your output while maintaining a healthy work-life balance is crucial for long-term success. Here are some proven strategies to boost your productivity. First, consider implementing the Pomodoro Technique, which involves working in focused 25-minute intervals followed by short breaks. This method helps maintain concentration and prevents burnout. Second, prioritize your tasks using the Eisenhower Matrix, which categorizes activities based on their urgency and importance. Third, leverage technology to automate repetitive tasks and streamline your workflow. Tools like project management software, calendar apps, and note-taking applications can significantly reduce the time spent on administrative duties. Finally, don't underestimate the power of adequate sleep, regular exercise, and proper nutrition in maintaining peak cognitive performance.`,
  },
  {
    id: "ai-formal-report-1",
    label: "ai",
    category: "ai-report",
    description: "AI-generated formal report paragraph",
    text: `The implementation of comprehensive data analytics frameworks within organizational structures has demonstrated significant improvements in operational efficiency and strategic decision-making capabilities. Our analysis reveals that companies adopting advanced analytics solutions experienced an average increase of 23% in productivity metrics and a 15% reduction in operational costs over a 12-month period. Furthermore, the integration of machine learning models into existing business intelligence platforms has enabled more accurate demand forecasting, resulting in optimized inventory management and reduced waste. These findings underscore the critical importance of data-driven approaches in maintaining competitive advantage in today's rapidly evolving business landscape. Moving forward, organizations should prioritize investment in analytics infrastructure and talent development to fully realize the transformative potential of data-driven decision-making.`,
  },
  {
    id: "ai-claude-analysis-1",
    label: "ai",
    category: "claude-style",
    description: "Claude-style analytical writing",
    text: `There are several important considerations when evaluating the effectiveness of remote work policies. Research suggests that while remote work can increase individual productivity for certain types of tasks, it may also lead to reduced collaboration and innovation over time. The key factors that determine success include clear communication protocols, appropriate technological infrastructure, and organizational culture that supports asynchronous work. It's worth noting that the impact of remote work varies significantly across industries and job functions. Knowledge workers in technology and creative fields tend to adapt more readily to remote environments, while roles requiring physical presence or high levels of real-time collaboration may be less suited to fully remote arrangements. A hybrid approach, combining the flexibility of remote work with the collaborative benefits of in-person interaction, appears to offer the most balanced solution for many organizations.`,
  },
  {
    id: "ai-generic-listicle-1",
    label: "ai",
    category: "ai-listicle",
    description: "AI-generated listicle content",
    text: `The world of technology continues to evolve at a remarkable pace, bringing new innovations that transform our daily lives. From artificial intelligence to quantum computing, these advancements are reshaping industries and creating unprecedented opportunities. One of the most significant developments in recent years has been the widespread adoption of cloud computing, which has enabled businesses of all sizes to access powerful computing resources without significant upfront investment. Additionally, the Internet of Things has connected billions of devices worldwide, creating smart ecosystems that improve efficiency in everything from manufacturing to home automation. As we look to the future, emerging technologies such as blockchain, augmented reality, and 5G connectivity promise to further revolutionize how we work, communicate, and interact with the world around us.`,
  },
  {
    id: "ai-social-media-1",
    label: "ai",
    category: "ai-social",
    description: "AI-generated social media caption",
    text: `Exploring the beauty of nature reminds us of the importance of environmental conservation. Today's hike through the stunning mountain trails was a powerful reminder of what we stand to lose if we don't take action to protect our natural spaces. The vibrant colors of the autumn foliage, the crisp mountain air, and the peaceful sounds of flowing water created an unforgettable experience that renewed my commitment to sustainable living. Let's all do our part to preserve these precious landscapes for future generations. Every small action counts, from reducing our carbon footprint to supporting local conservation efforts. Together, we can make a meaningful difference in protecting our planet's biodiversity and natural beauty.`,
  },
  {
    id: "ai-academic-1",
    label: "ai",
    category: "ai-academic",
    description: "AI-generated academic-style abstract",
    text: `This study examines the impact of social media usage on adolescent mental health outcomes through a comprehensive meta-analysis of existing literature. Drawing on data from 47 peer-reviewed studies conducted between 2018 and 2024, our analysis reveals a statistically significant correlation between excessive social media consumption and increased rates of anxiety and depression among teenagers aged 13 to 18. The findings suggest that the mechanisms driving this relationship include social comparison, cyberbullying exposure, sleep disruption, and reduced face-to-face social interaction. Notably, the strength of the correlation varied across platforms, with image-centric platforms showing stronger associations with body image dissatisfaction and self-esteem issues. These results have important implications for parents, educators, and policymakers seeking to develop evidence-based strategies for promoting healthy digital habits among young people.`,
  },
  {
    id: "ai-email-1",
    label: "ai",
    category: "ai-email",
    description: "AI-generated professional email",
    text: `I hope this email finds you well. I am writing to follow up on our recent discussion regarding the upcoming project timeline and deliverables. After careful consideration of the various factors involved, I believe it would be beneficial for our team to schedule a meeting to align on the key milestones and resource allocation for the next quarter. As discussed, the current timeline presents some challenges that we need to address proactively to ensure successful delivery. I have prepared a detailed project plan that outlines the critical path activities and their dependencies, which I would like to review with you and the team at your earliest convenience. Please let me know your availability for a meeting this week, and I will coordinate with the other stakeholders to find a suitable time. I look forward to your response and to working together to bring this project to a successful completion.`,
  },
  {
    id: "ai-news-summary-1",
    label: "ai",
    category: "ai-news",
    description: "AI-generated news summary",
    text: `In a landmark decision that could reshape the technology industry, regulators announced new comprehensive guidelines for artificial intelligence development and deployment. The framework, which has been under development for over two years, establishes clear standards for transparency, accountability, and safety in AI systems used across various sectors including healthcare, finance, and transportation. Industry leaders have expressed mixed reactions to the announcement, with some praising the balanced approach to regulation while others have raised concerns about potential impacts on innovation and competitiveness. The guidelines are expected to take effect within the next 18 months, giving companies time to assess their current AI practices and implement necessary changes to achieve compliance. Experts predict that this regulatory framework will serve as a model for similar initiatives in other countries around the world.`,
  },
  {
    id: "ai-persuasive-1",
    label: "ai",
    category: "ai-persuasive",
    description: "AI-generated persuasive writing",
    text: `The benefits of adopting a plant-based diet extend far beyond personal health improvements. Research consistently demonstrates that reducing meat consumption can significantly lower one's risk of heart disease, diabetes, and certain types of cancer. Moreover, the environmental impact of plant-based eating is substantial: livestock farming accounts for approximately 14.5% of global greenhouse gas emissions, and transitioning to plant-based alternatives could dramatically reduce our collective carbon footprint. From an ethical standpoint, choosing plant-based options helps reduce animal suffering in industrial farming operations. The economic benefits are also noteworthy, as plant-based proteins are generally more affordable than their animal-based counterparts. With the growing availability of delicious and nutritious plant-based products, there has never been a better time to make the switch. By embracing a plant-based lifestyle, you can improve your health, protect the environment, and contribute to a more compassionate world.`,
  },
  {
    id: "ai-technical-1",
    label: "ai",
    category: "ai-technical",
    description: "AI-generated technical explanation",
    text: `Understanding how neural networks process information requires a fundamental grasp of their architecture and training methodology. At its core, a neural network consists of interconnected layers of artificial neurons, each performing simple mathematical operations on their inputs. The input layer receives raw data, which is then transformed through one or more hidden layers before producing an output. During training, the network adjusts its internal parameters through a process called backpropagation, which calculates the gradient of the loss function with respect to each weight. This gradient information is then used by an optimization algorithm, such as stochastic gradient descent, to iteratively update the weights in a direction that minimizes the prediction error. The effectiveness of modern deep learning systems stems from their ability to learn hierarchical representations of data, with lower layers capturing basic features and higher layers combining these into increasingly abstract and complex patterns.`,
  },
];

// ══════════════════════════════════════════════════════════
// TEXT DATASETS — Human-Written Samples
// Sourced from authentic human writing patterns
// ══════════════════════════════════════════════════════════

export const HUMAN_TEXT_SAMPLES: TextSample[] = [
  {
    id: "human-reddit-1",
    label: "human",
    category: "reddit-post",
    description: "Casual Reddit post about cooking",
    text: `So I tried making sourdough for like the fifth time and honestly? This one actually turned out decent. Not great, mind you — the crumb is still way too dense and I think I overproofed it a bit. But the crust!! Oh man the crust was actually crispy for once. My wife said it tasted "like real bread" which I'm choosing to take as a compliment lol. The trick was using the dutch oven that's been collecting dust in our cabinet since our wedding. Who knew that thing was actually useful? Anyway if anyone has tips for getting a more open crumb I'm all ears. I've been following the King Arthur recipe but I feel like I'm missing something fundamental.`,
  },
  {
    id: "human-reddit-2",
    label: "human",
    category: "reddit-post",
    description: "Reddit post about a frustrating tech experience",
    text: `OK so I just spent 4 hours debugging what turned out to be a missing semicolon. FOUR HOURS. The error message was completely unhelpful — something about an unexpected token on line 847 when the actual problem was on line 12. I hate JavaScript sometimes, I really do. The worst part is I was pair programming with my colleague and neither of us caught it. We went down this whole rabbit hole thinking it was a webpack config issue. Rebuilt the entire build pipeline. Cleared every cache known to mankind. And then... semicolon. I need a drink. Actually I need a new career. Does anyone know if goat farming is profitable?`,
  },
  {
    id: "human-twitter-1",
    label: "human",
    category: "twitter-thread",
    description: "Human Twitter thread about a personal observation",
    text: `Hot take: the best coffee shops are the ones that look slightly sketchy from the outside. Every time I see a place with mismatched furniture, weird art on the walls, and a barista with more tattoos than me, I know the espresso is gonna be fire. Meanwhile the places with the perfectly curated Instagram aesthetic always charge $8 for a latte that tastes like hot water. Fight me on this.`,
  },
  {
    id: "human-news-1",
    label: "human",
    category: "news-article",
    description: "Excerpt from a human journalist's article",
    text: `The fire started around 3 a.m. Tuesday, according to neighbors who were jolted awake by the sound of breaking glass and the acrid smell of smoke. By the time firefighters arrived — just seven minutes after the first 911 call — flames had already consumed the ground floor of the century-old Victorian. "I grabbed my kids and just ran," said Maria Torres, 34, who lived in the apartment above with her two daughters, ages 6 and 9. She stood across the street in bare feet, wrapped in a blanket a neighbor had given her, watching as firefighters wrestled a hose line through what had been her front door. The girls clung to her legs, their faces streaked with tears and soot. No one was seriously injured, but the building, which had housed a beloved local bookstore on its ground level, was declared a total loss by morning.`,
  },
  {
    id: "human-journal-1",
    label: "human",
    category: "personal-journal",
    description: "Personal diary entry",
    text: `Weird day. Woke up late because my alarm didn't go off (or maybe I turned it off in my sleep, who knows). Rushed to get ready, spilled coffee on my shirt — the good white one of course — and had to change. Made it to the bus stop just as the bus was pulling away. So I walked. 45 minutes in the rain. By the time I got to work I looked like a drowned rat and my boss just looked at me and said "rough morning?" Understatement of the century, Dave. But then! THEN! After all that, Sarah from accounting told me the presentation I've been dreading got pushed to next week. I could have cried with relief. Ended up having a pretty good day after that actually. Funny how things work out.`,
  },
  {
    id: "human-review-1",
    label: "human",
    category: "product-review",
    description: "Genuine product review with authentic voice",
    text: `Look, I'm not going to pretend this vacuum is going to change your life or whatever. It's a vacuum. It sucks stuff up, which is... kind of the whole job description. But I will say this: after owning three different "smart" robot vacuums that mostly just got stuck under my couch and scared my cat, going back to a regular upright vacuum feels almost revolutionary. This thing actually picks up dog hair from my carpet. Like, ALL the dog hair. And I have a Golden Retriever, so that's saying something. The cord is annoyingly short though, and the attachment for upholstery is basically useless — it fell off every time I tried to use it. 4 stars because nothing in life is perfect and anyone who gives anything 5 stars is lying.`,
  },
  {
    id: "human-essay-1",
    label: "human",
    category: "student-essay",
    description: "Authentic student essay with imperfect writing",
    text: `My grandmother's kitchen smelled like cinnamon and regret. She baked constantly — not because she particularly loved baking, but because she grew up during the Depression and wasting food was, to her, a kind of sin. Overripe bananas became bread. Stale bread became bread pudding. Bread pudding that nobody ate became... well, she found a use for that too, though I never asked what. She died when I was fourteen. I remember sitting in her kitchen the day after the funeral, surrounded by casserole dishes from well-meaning neighbors, and all I could think was that none of it smelled right. None of it smelled like her. I took the cinnamon shaker from her spice rack and put it in my pocket. I still have it. It's been eleven years and the cinnamon is probably no good anymore, but I don't care. It's not really about the cinnamon.`,
  },
  {
    id: "human-blog-tech-1",
    label: "human",
    category: "tech-blog",
    description: "Authentic developer blog post",
    text: `So we migrated our entire backend from Express to Fastify last month and I want to be honest about how it went because most migration posts make everything sound smooth and ours was absolutely not. First off, middleware compatibility is a LIE. Or at least it's way more complicated than the docs suggest. We had about 40 custom Express middleware functions and roughly a third of them needed to be completely rewritten. The request/reply lifecycle in Fastify is different enough that some of our auth middleware broke in subtle ways — like, it worked in testing but silently failed to attach user context in production. That was a fun Wednesday night. The performance improvements are real though. We're seeing about 40% better throughput on our busiest endpoints and p99 latency dropped from ~450ms to ~180ms. So yeah, worth it? Probably. Would I do it again? Ask me after the PTSD fades.`,
  },
  {
    id: "human-academic-1",
    label: "human",
    category: "academic-paper",
    description: "Excerpt from actual human academic writing",
    text: `The relationship between urban green spaces and mental health outcomes remains poorly understood, despite growing interest in nature-based interventions. While several cross-sectional studies have reported associations between proximity to parks and reduced psychological distress (Thompson et al., 2012; White et al., 2019), the causal mechanisms underlying these associations are far from clear. Our study attempted to address this gap through a longitudinal design tracking 1,847 participants over three years, but we encountered significant methodological challenges — particularly around self-selection bias, as individuals with better mental health may simply be more likely to choose residences near green spaces. We controlled for baseline mental health status and socioeconomic factors, but acknowledge that unmeasured confounders likely remain. The results, while suggestive of a protective effect (OR = 0.73, 95% CI: 0.58-0.91), should be interpreted with caution.`,
  },
  {
    id: "human-creative-1",
    label: "human",
    category: "creative-writing",
    description: "Human creative fiction excerpt",
    text: `The last time I saw my father, he was standing in the doorway of his apartment wearing one brown shoe and one black shoe. I didn't mention it. He wouldn't have wanted me to. He was always particular about appearances, which made the shoes more alarming than if he'd answered the door in his underwear — that might have been a choice, a deliberate casualness. The shoes were a mistake, and my father did not make mistakes. Not visible ones. "You look thin," he said, which was his way of saying hello. "You look good," I lied, which was my way of saying goodbye.`,
  },
  {
    id: "human-email-casual-1",
    label: "human",
    category: "casual-email",
    description: "Authentic casual email",
    text: `Hey, so about Saturday — I'm totally in but I might be a little late. My sister's flight lands at 2 and I promised I'd pick her up from the airport because apparently Uber is "too expensive" even though she literally just spent $400 on a carry-on suitcase. Sisters, man. Anyway I should be there by 4ish? Maybe 4:30 depending on traffic. Can you save me a seat? Also do I need to bring anything? I can grab beer on the way. Let me know if there's a specific kind people want. Actually scratch that, I'll just get a variety pack from that craft brewery on 5th. Everyone seemed to like those last time.`,
  },
  {
    id: "human-opinion-1",
    label: "human",
    category: "opinion-piece",
    description: "Human opinion piece with personality",
    text: `I've been teaching high school for twenty-two years, and I'm going to say something that might get me in trouble with my colleagues: homework is mostly pointless. Not all homework — I'm not a complete radical here. Practice problems in math serve a purpose. Reading assignments that prepare students for discussion can be valuable. But the worksheets? The busywork? The "write a five-paragraph essay about your weekend" assignments that nobody including me wants to read? We're wasting everyone's time. My students have seven other classes, most of them assigning homework too. They're exhausted, they're stressed, and they're learning to associate education with drudgery rather than curiosity. Three years ago I stopped assigning homework entirely in my English classes. My students' grades went up. Their engagement went up. Their writing — and this is the part that shocked me — actually got better. Turns out when kids aren't burned out from three hours of nightly busywork, they actually pay attention in class.`,
  },
];

// ══════════════════════════════════════════════════════════
// EDGE CASE TEXT SAMPLES
// ══════════════════════════════════════════════════════════

export const EDGE_CASE_TEXT_SAMPLES: TextSample[] = [
  {
    id: "edge-short-1",
    label: "human",
    category: "short-text",
    description: "Very short human text",
    text: `bruh this is wild lmao`,
  },
  {
    id: "edge-short-2",
    label: "ai",
    category: "short-text",
    description: "Very short AI text",
    text: `That's a great question! Here are some key points to consider.`,
  },
  {
    id: "edge-formal-human-1",
    label: "human",
    category: "formal-human",
    description: "Formal human writing that might look AI-like",
    text: `The Committee on Foreign Affairs convened on March 15 to discuss amendments to House Resolution 4721. Members present included Representatives Johnson, Smith, Williams, and Garcia. After reviewing testimony from the State Department, the committee voted 7-3 to advance the resolution to the full House with modifications to Section 4(b) regarding diplomatic immunity provisions. Representative Garcia filed a dissenting opinion, arguing that the proposed language was insufficiently protective of existing treaty obligations. The full text of the dissent is appended to these minutes.`,
  },
  {
    id: "edge-creative-ai-1",
    label: "ai",
    category: "creative-ai",
    description: "AI attempting creative writing",
    text: `The old lighthouse stood sentinel against the churning sea, its beacon cutting through the fog like a golden blade. Inside, the keeper—a weathered man named Thomas—sat by the window and watched the storm approach with the calm resignation of someone who had seen a thousand storms before. Each wave that crashed against the rocks below told a story of distant shores and forgotten voyages. As the wind howled its ancient song, Thomas lit his pipe and settled deeper into his chair, finding comfort in the familiar rhythm of his solitary vigil. The lighthouse beam swept across the dark waters in its eternal dance, a faithful guardian watching over the souls who dared to challenge the sea.`,
  },
  {
    id: "edge-mixed-1",
    label: "ai",
    category: "ai-edited",
    description: "AI text lightly edited by a human",
    text: `OK so AI has some really interesting implications for education and I want to talk about that for a sec. The integration of artificial intelligence into educational settings presents both opportunities and challenges that deserve careful examination. Students are already using tools like ChatGPT and honestly I don't think we can put that genie back in the bottle. The question isn't whether students will use AI, but how we can guide them to use it in ways that enhance rather than replace genuine learning. Some teachers I know have completely banned it which seems... counterproductive? Like teaching kids to swim by banning water.`,
  },
  {
    id: "edge-repetitive-human-1",
    label: "human",
    category: "repetitive-human",
    description: "Repetitive human writing (technical documentation)",
    text: `To install the package, run npm install. To install the package globally, run npm install -g. To install the package as a dev dependency, run npm install --save-dev. To install a specific version of the package, run npm install package@version. To install the package from a git repository, run npm install git+https://github.com/user/repo. To uninstall the package, run npm uninstall. To update the package, run npm update. To list installed packages, run npm list. To check for outdated packages, run npm outdated.`,
  },
  {
    id: "edge-foreign-style-1",
    label: "human",
    category: "non-native-english",
    description: "Non-native English speaker's writing",
    text: `Yesterday I am going to the market and I see many beautiful fruits there. The apples is very red and the oranges smell so nice. I buy some mango because in my country we eat mango every day but here it is expensive very much. The seller man was kind and give me one extra mango for free. I am happy for this because I miss the taste of home. When I cook mango curry tonight my roommate say "what is this smell?" and I explain to him about our food. He try little bit and say it is good! Maybe next time I make more.`,
  },
];

// ══════════════════════════════════════════════════════════
// IMAGE TEST DATA — Synthetic base64 images
// Testing Method F (frequency) and Method G (metadata)
// ══════════════════════════════════════════════════════════

function createSyntheticJPEGWithExif(): string {
  // Simulates a JPEG with EXIF data (camera photo characteristics)
  // JPEG SOI: FF D8, EXIF marker: FF E1, followed by "Exif\0\0" and fake camera data
  const header = [
    0xFF, 0xD8, // SOI
    0xFF, 0xE1, // APP1 (EXIF)
    0x00, 0x62, // Length
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
  ];
  // Add fake camera make/model strings
  const cameraInfo = Array.from(Buffer.from("Canon EOS R5\0Nikon\0Apple iPhone 15\0"));

  // Add realistic high-frequency noise patterns (real photo characteristics)
  const pixelData: number[] = [];
  for (let i = 0; i < 2000; i++) {
    // Real photos have high variance between adjacent pixels
    const base = Math.floor(Math.random() * 256);
    const noise = Math.floor((Math.random() - 0.5) * 80);
    pixelData.push(Math.max(0, Math.min(255, base + noise)));
  }

  const allBytes = [...header, ...cameraInfo, ...pixelData];
  return "data:image/jpeg;base64," + Buffer.from(allBytes).toString("base64");
}

function createSyntheticJPEGWithoutExif(): string {
  // JPEG without EXIF (suspicious — AI-generated images lack EXIF)
  const header = [
    0xFF, 0xD8, // SOI
    0xFF, 0xE0, // APP0 (JFIF, not EXIF)
    0x00, 0x10,
    0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  ];

  // Smooth gradients (AI characteristic — low high-frequency energy)
  const pixelData: number[] = [];
  for (let i = 0; i < 2000; i++) {
    // AI images have smooth gradients with less noise
    pixelData.push(Math.floor((i / 2000) * 255));
  }

  const allBytes = [...header, ...pixelData];
  return "data:image/jpeg;base64," + Buffer.from(allBytes).toString("base64");
}

function createSyntheticPNG(): string {
  // PNG image (cameras rarely output PNG — slightly suspicious)
  const pngHeader = [
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x10, // width: 16
    0x00, 0x00, 0x00, 0x10, // height: 16
    0x08, 0x02, // bit depth: 8, color type: RGB
    0x00, 0x00, 0x00, // compression, filter, interlace
  ];

  // Uniform pixel data (AI-like)
  const pixelData: number[] = [];
  for (let i = 0; i < 1500; i++) {
    pixelData.push(Math.floor((Math.sin(i * 0.05) + 1) * 127));
  }

  const allBytes = [...pngHeader, ...pixelData];
  return "data:image/png;base64," + Buffer.from(allBytes).toString("base64");
}

function createNoisyJPEG(): string {
  // JPEG with high noise (real photo with texture)
  const header = [
    0xFF, 0xD8,
    0xFF, 0xE1, 0x00, 0x40,
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
  ];
  const cameraInfo = Array.from(Buffer.from("Sony A7III\0"));

  // Highly variable pixel data — lots of texture and noise
  const pixelData: number[] = [];
  for (let i = 0; i < 3000; i++) {
    // Simulate real photo texture with rapid value changes
    const texture = Math.random() * 256;
    const grain = (Math.random() - 0.5) * 100;
    const edges = (i % 50 === 0) ? Math.random() * 200 : 0;
    pixelData.push(Math.max(0, Math.min(255, Math.floor(texture + grain + edges))));
  }

  const allBytes = [...header, ...cameraInfo, ...pixelData];
  return "data:image/jpeg;base64," + Buffer.from(allBytes).toString("base64");
}

function createSmoothGradientImage(): string {
  // Extremely smooth gradient image (AI diffusion characteristic)
  const header = [
    0xFF, 0xD8,
    0xFF, 0xE0, 0x00, 0x10,
    0x4A, 0x46, 0x49, 0x46, 0x00,
    0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  ];

  // Very smooth data — almost no high-frequency content
  const pixelData: number[] = [];
  for (let i = 0; i < 3000; i++) {
    // Gentle sine wave + minimal noise
    const smooth = Math.floor((Math.sin(i * 0.002) + 1) * 127);
    const tinyNoise = Math.floor((Math.random() - 0.5) * 5);
    pixelData.push(Math.max(0, Math.min(255, smooth + tinyNoise)));
  }

  const allBytes = [...header, ...pixelData];
  return "data:image/jpeg;base64," + Buffer.from(allBytes).toString("base64");
}

function createSmallImage(): string {
  // Very small file — slightly suspicious for AI
  const header = [
    0xFF, 0xD8,
    0xFF, 0xE0, 0x00, 0x10,
    0x4A, 0x46, 0x49, 0x46, 0x00,
    0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  ];

  // Very small pixel payload
  const pixelData = Array.from({ length: 200 }, () => Math.floor(Math.random() * 256));

  const allBytes = [...header, ...pixelData];
  return "data:image/jpeg;base64," + Buffer.from(allBytes).toString("base64");
}

export const IMAGE_TEST_CASES: ImageTestCase[] = [
  {
    id: "img-real-camera-1",
    description: "JPEG with EXIF and camera make (real photo)",
    label: "human",
    base64: createSyntheticJPEGWithExif(),
    mimeType: "image/jpeg",
    category: "camera-photo",
  },
  {
    id: "img-real-noisy-1",
    description: "Noisy JPEG with Sony camera EXIF",
    label: "human",
    base64: createNoisyJPEG(),
    mimeType: "image/jpeg",
    category: "camera-photo",
  },
  {
    id: "img-ai-no-exif-1",
    description: "JPEG without EXIF + smooth gradients (AI-like)",
    label: "ai",
    base64: createSyntheticJPEGWithoutExif(),
    mimeType: "image/jpeg",
    category: "ai-generated",
  },
  {
    id: "img-ai-png-1",
    description: "PNG with uniform patterns (AI-like)",
    label: "ai",
    base64: createSyntheticPNG(),
    mimeType: "image/png",
    category: "ai-generated",
  },
  {
    id: "img-ai-smooth-1",
    description: "Extremely smooth gradient JPEG (diffusion model)",
    label: "ai",
    base64: createSmoothGradientImage(),
    mimeType: "image/jpeg",
    category: "ai-generated",
  },
  {
    id: "img-ai-small-1",
    description: "Very small JPEG file (AI efficient output)",
    label: "ai",
    base64: createSmallImage(),
    mimeType: "image/jpeg",
    category: "ai-generated",
  },
];

// ══════════════════════════════════════════════════════════
// COMBINED DATASET
// ══════════════════════════════════════════════════════════

export const ALL_TEXT_SAMPLES = [
  ...AI_TEXT_SAMPLES,
  ...HUMAN_TEXT_SAMPLES,
  ...EDGE_CASE_TEXT_SAMPLES,
];
