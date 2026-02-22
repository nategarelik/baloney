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

  // ── GPT-4 Medical Samples ──────────────────────────────────
  {
    id: "gpt4-medical-1",
    label: "ai",
    category: "gpt4-medical",
    description: "GPT-4 style medical explanation of Type 2 diabetes",
    text: `Type 2 diabetes mellitus is a chronic metabolic disorder characterized by insulin resistance and relative insulin deficiency. The condition affects approximately 462 million individuals worldwide, making it one of the most prevalent non-communicable diseases globally. The pathophysiology involves a complex interplay between genetic predisposition and environmental factors, including sedentary lifestyle, excessive caloric intake, and obesity. When cells become resistant to insulin's effects, the pancreatic beta cells initially compensate by producing more insulin. Over time, however, these cells become exhausted, leading to progressive hyperglycemia. Management strategies typically involve a combination of lifestyle modifications, including dietary changes and regular physical activity, along with pharmacological interventions such as metformin as a first-line agent. Regular monitoring of glycated hemoglobin levels is essential for assessing long-term glycemic control, with a target of less than 7% recommended for most adults.`,
  },
  {
    id: "gpt4-medical-2",
    label: "ai",
    category: "gpt4-medical",
    description: "GPT-4 style medical overview of CRISPR gene therapy",
    text: `CRISPR-Cas9 gene editing technology has emerged as a revolutionary tool in the field of molecular medicine, offering unprecedented precision in modifying genetic sequences associated with hereditary diseases. The system works by utilizing a guide RNA molecule to direct the Cas9 endonuclease to a specific genomic location, where it creates a double-strand break that can be repaired through either non-homologous end joining or homology-directed repair. Clinical trials have demonstrated promising results in treating conditions such as sickle cell disease, beta-thalassemia, and certain forms of inherited blindness. The landmark approval of Casgevy in 2023 for sickle cell disease marked a pivotal moment in gene therapy. However, significant challenges remain, including off-target effects, delivery mechanisms, ethical considerations regarding germline editing, and equitable access to these potentially transformative but costly therapies. Ongoing research aims to improve the specificity and efficiency of CRISPR systems while developing more effective delivery vectors for clinical applications.`,
  },
  {
    id: "gpt4-medical-3",
    label: "ai",
    category: "gpt4-medical",
    description: "GPT-4 style explanation of gut microbiome research",
    text: `The human gut microbiome, comprising trillions of microorganisms residing in the gastrointestinal tract, has become a focal point of medical research due to its profound influence on human health and disease. Recent advances in metagenomic sequencing have revealed that the gut harbors over 1,000 distinct bacterial species, with the composition varying significantly between individuals based on factors such as diet, geography, age, and antibiotic exposure. Dysbiosis, or an imbalance in the microbial community, has been implicated in a wide range of conditions including inflammatory bowel disease, obesity, type 2 diabetes, and even neuropsychiatric disorders through the gut-brain axis. The bidirectional communication between the enteric nervous system and the central nervous system, mediated in part by microbial metabolites such as short-chain fatty acids and neurotransmitter precursors, represents a fascinating area of ongoing investigation. Therapeutic interventions targeting the microbiome, including fecal microbiota transplantation and precision probiotics, are showing considerable promise in clinical trials.`,
  },

  // ── GPT-4 Legal Samples ────────────────────────────────────
  {
    id: "gpt4-legal-1",
    label: "ai",
    category: "gpt4-legal",
    description: "GPT-4 style legal analysis of intellectual property",
    text: `The intersection of artificial intelligence and intellectual property law presents novel challenges that existing legal frameworks are ill-equipped to address. The fundamental question of whether AI-generated works qualify for copyright protection hinges on the requirement of human authorship, a principle deeply embedded in copyright doctrine across most jurisdictions. In the United States, the Copyright Office has consistently maintained that works must be created by a human author to receive protection, as reaffirmed in the Thaler v. Perlmutter decision. However, this position creates a growing gray area when AI serves as a tool augmenting human creativity rather than operating autonomously. The European Union has taken a somewhat different approach through its AI Act, which focuses primarily on risk classification rather than authorship questions. Patent law faces similar uncertainties, particularly regarding the inventorship requirement and whether AI systems can be named as inventors on patent applications. These unresolved questions have significant implications for innovation incentives and the allocation of rights in an increasingly AI-driven creative and inventive landscape.`,
  },
  {
    id: "gpt4-legal-2",
    label: "ai",
    category: "gpt4-legal",
    description: "GPT-4 style analysis of data privacy regulation",
    text: `The global landscape of data privacy regulation has undergone a fundamental transformation since the implementation of the European Union's General Data Protection Regulation in 2018. The GDPR established a comprehensive framework for personal data protection that has served as a template for similar legislation worldwide, including Brazil's LGPD, California's CCPA and its successor CPRA, and India's Digital Personal Data Protection Act. These regulatory frameworks share common principles including data minimization, purpose limitation, and the requirement for a lawful basis for processing personal data. The enforcement mechanisms vary considerably across jurisdictions, with the GDPR providing for administrative fines of up to 4% of global annual turnover or 20 million euros, whichever is greater. Compliance challenges for multinational organizations are substantial, as they must navigate a patchwork of sometimes conflicting requirements across different jurisdictions. The emergence of cross-border data transfer mechanisms, such as Standard Contractual Clauses and adequacy decisions, has partially addressed but not fully resolved the complexities of international data flows in an interconnected digital economy.`,
  },
  {
    id: "gpt4-legal-3",
    label: "ai",
    category: "gpt4-legal",
    description: "GPT-4 style analysis of antitrust in technology",
    text: `Recent antitrust enforcement actions against major technology companies represent a significant shift in regulatory philosophy toward digital platform markets. The traditional consumer welfare standard, which has dominated antitrust analysis since the 1970s, is increasingly viewed as insufficient for addressing the unique competitive dynamics of multi-sided platforms. The Department of Justice's landmark case against Google, alleging monopolistic practices in search and digital advertising, and the Federal Trade Commission's ongoing litigation against Meta exemplify this evolving approach. Central to these cases is the concept of network effects and the role of data accumulation as a barrier to entry. Critics of aggressive enforcement argue that consumers benefit from free services and that market dominance reflects superior products rather than anticompetitive conduct. Proponents of reform contend that traditional metrics fail to capture harms such as reduced innovation, degraded privacy, and the suppression of potential competitors through strategic acquisitions. The outcomes of these proceedings will likely establish precedents that shape the competitive landscape of the technology sector for decades to come.`,
  },

  // ── GPT-4 News Samples ─────────────────────────────────────
  {
    id: "gpt4-news-1",
    label: "ai",
    category: "gpt4-news",
    description: "GPT-4 style news article about renewable energy",
    text: `A consortium of international energy companies announced Tuesday the completion of the world's largest offshore wind farm, a milestone project that underscores the accelerating global transition toward renewable energy sources. The installation, located approximately 90 kilometers off the coast, comprises 277 turbines with a combined generating capacity of 3.6 gigawatts, sufficient to power approximately 3.4 million homes. The project, which required an investment of approximately $12.8 billion over five years, represents a significant advancement in offshore wind technology, with individual turbines capable of producing 13 megawatts each. Industry analysts note that the facility demonstrates the increasing economic viability of offshore wind energy, with the levelized cost of electricity now competitive with conventional fossil fuel generation in many markets. The development is expected to create approximately 2,500 permanent jobs in operations and maintenance while contributing to the host country's target of achieving net-zero carbon emissions by 2050.`,
  },
  {
    id: "gpt4-news-2",
    label: "ai",
    category: "gpt4-news",
    description: "GPT-4 style news report about quantum computing breakthrough",
    text: `Researchers at a leading quantum computing laboratory have achieved a significant breakthrough in error correction, a development that experts say brings practical quantum computing considerably closer to reality. The team demonstrated a logical qubit with an error rate below the critical threshold needed for fault-tolerant computation, maintaining coherence for over 1,000 microseconds while performing complex gate operations. This achievement addresses one of the most persistent challenges in quantum computing: the extreme fragility of quantum states and their susceptibility to environmental noise. The research, published in a peer-reviewed journal on Wednesday, details a novel approach to surface code error correction that reduces the overhead of physical qubits required per logical qubit by approximately 40 percent compared to previous methods. Industry observers suggest that this advance could accelerate the timeline for quantum computers capable of solving problems intractable for classical machines, with potential applications ranging from drug discovery and materials science to cryptography and optimization of complex systems.`,
  },
  {
    id: "gpt4-news-3",
    label: "ai",
    category: "gpt4-news",
    description: "GPT-4 style news report on global food security",
    text: `The United Nations Food and Agriculture Organization released its annual assessment on Wednesday, warning that climate-related disruptions to agricultural production have pushed an additional 78 million people into food insecurity over the past year. The report highlights a concerning trend of consecutive below-average harvests in key grain-producing regions, driven by unprecedented drought conditions in parts of South Asia and sub-Saharan Africa, combined with flooding events in major river basins that destroyed crops during critical growing periods. Global wheat reserves have declined to their lowest levels in over a decade, contributing to a 23 percent increase in benchmark grain prices on international commodity markets. The organization called for an urgent scaling up of climate-adaptive agricultural practices and a restructuring of food distribution systems to address what it described as a growing humanitarian crisis. Several member states have already announced emergency food aid packages, while agricultural economists debate the long-term structural reforms needed to build resilience in the global food system.`,
  },

  // ── GPT-4 Creative Samples ─────────────────────────────────
  {
    id: "gpt4-creative-1",
    label: "ai",
    category: "gpt4-creative",
    description: "GPT-4 style creative fiction opening",
    text: `The city existed in two versions: the one you could see and the one that whispered beneath it. Maya discovered this on a Tuesday, quite by accident, when she dropped her coffee cup in the subway station and watched it fall through what should have been solid concrete. The ceramic mug disappeared into the floor as if the tiles were made of smoke, and from the impossible hole came a faint blue light and the sound of someone humming a melody she almost recognized. She knelt down, pressing her palm against the floor. It was solid again. The commuters streamed around her without a glance — New York had trained them well in the art of ignoring the extraordinary. But Maya stayed there, her knees on the grimy tile, her hand flat against the ground, feeling the vibration of something vast and alive just below the surface. She had always suspected the world was more than what it appeared to be. She just hadn't expected to find proof before finishing her morning coffee.`,
  },
  {
    id: "gpt4-creative-2",
    label: "ai",
    category: "gpt4-creative",
    description: "GPT-4 style creative fiction about memory",
    text: `In the town of Millhaven, memories had weight. Not metaphorical weight — actual, measurable mass that accumulated in the body over a lifetime. The happiest people were the lightest, their joyful recollections buoyant as helium. The saddest shuffled through town bent nearly double, carrying decades of grief in their bones. Eleanor Voss was the heaviest person anyone had ever known. At ninety-two, she moved through the world with a gravitational pull that made the floorboards creak and the silverware tremble on the table. It wasn't sadness that made her heavy, though she had known plenty of that. It was attention. She had spent her life noticing everything — the exact shade of copper in an autumn oak leaf, the way her husband's laugh changed after his mother died, the specific quality of light on a February afternoon. Every detail she had ever absorbed was still there inside her, pressing outward against her ribs, filling her up with the weight of a life thoroughly lived. Her granddaughter once asked her if it hurt. Eleanor considered the question carefully. "Only when I try to forget," she said.`,
  },
  {
    id: "gpt4-creative-3",
    label: "ai",
    category: "gpt4-creative",
    description: "GPT-4 style creative writing about time",
    text: `The Clockmaker's shop sat at the corner of Vine and Third, though if you asked three different people for directions, you would receive three different answers. This was not because the directions were wrong but because the shop had a peculiar relationship with geography. It stayed in one place the way a cat stays in your lap — voluntarily, and only for as long as it suited. Inside, every surface was covered with timepieces. Grandfather clocks lined the walls like sentries. Pocket watches hung from the ceiling on silk threads, spinning slowly in invisible currents. And in the center of it all sat the Clockmaker herself, a woman of indeterminate age with silver hair and ink-stained fingers. She did not merely repair clocks. She negotiated with them. "This one is running fast because it's anxious," she explained to a customer once, holding up a wristwatch that was gaining forty minutes a day. "It's afraid of what's coming and wants to get there quickly. We need to convince it that the present is worth lingering in."`,
  },

  // ── Claude Essay Samples ───────────────────────────────────
  {
    id: "claude-essay-1",
    label: "ai",
    category: "claude-essay",
    description: "Claude-style analytical essay on social media and democracy",
    text: `The relationship between social media platforms and democratic governance is more nuanced than either techno-optimists or techno-pessimists tend to acknowledge. On one hand, these platforms have demonstrably expanded access to information and lowered barriers to political participation — movements from the Arab Spring to various civil rights campaigns have leveraged social media for organizing and awareness-raising in ways that were previously impossible. On the other hand, the attention-economy incentives that drive platform design tend to favor emotionally charged, divisive content over measured deliberation. There's an important distinction to draw here between the technology itself and the business models built around it. A social media platform optimized for time-on-site through algorithmic content curation will produce very different democratic outcomes than one designed to facilitate informed civic discourse. The challenge, then, isn't whether social media is "good" or "bad" for democracy — that framing is too simplistic. The more productive question is: what specific design choices, regulatory frameworks, and civic norms might help us capture the democratic benefits of networked communication while mitigating the well-documented risks of polarization, misinformation, and manipulation?`,
  },
  {
    id: "claude-essay-2",
    label: "ai",
    category: "claude-essay",
    description: "Claude-style essay on the nature of expertise",
    text: `I think it's worth being honest about the complicated relationship between expertise and public trust. The pandemic revealed something that had been building for years: a significant portion of the public doesn't simply reject expert opinion — they reject the social structure that grants authority to experts in the first place. Understanding why requires examining several distinct phenomena that often get conflated. First, there's the legitimate observation that experts are sometimes wrong, and that institutional incentives can distort scientific consensus. The replication crisis in psychology, the evolving guidance on dietary fat, and historical episodes like the opioid crisis demonstrate that expert opinion is not infallible. Second, there's the more troubling dynamic of motivated reasoning, where people selectively engage with or reject expert opinion based on whether it aligns with their prior beliefs. Third, and perhaps most importantly, there's a class dimension: the credential-based authority of experts can feel exclusionary to people whose knowledge is rooted in lived experience rather than formal education. None of these observations justify wholesale rejection of scientific expertise. But acknowledging their validity is essential for rebuilding trust. Experts who insist on deference rather than engagement are unlikely to persuade a skeptical public.`,
  },
  {
    id: "claude-essay-3",
    label: "ai",
    category: "claude-essay",
    description: "Claude-style essay on the ethics of attention",
    text: `There's a growing philosophical argument that attention is the most important ethical resource of the twenty-first century, and I find it increasingly persuasive. The economic value of human attention has been well-documented — the attention economy generates hundreds of billions in advertising revenue annually. But the ethical dimension is more interesting and less discussed. When a technology company designs an interface to be maximally "engaging" (a euphemism for addictive), it is making a claim on a finite and deeply personal resource: your conscious experience of being alive. Every minute you spend scrolling through algorithmically curated content is a minute you don't spend in unmediated conversation, in reflection, in boredom (which, research suggests, is crucial for creativity), or simply in noticing the world around you. This isn't an argument for technological asceticism. These tools provide genuine value. But I think we should be more explicit about the tradeoffs involved. The relevant question isn't "is this content entertaining?" but rather "is this how I would choose to spend my attention if I were choosing deliberately rather than being nudged by a system designed to keep me engaged?" The distinction between chosen and captured attention may be one of the defining ethical questions of our time.`,
  },

  // ── Claude Analysis Samples ────────────────────────────────
  {
    id: "claude-analysis-1",
    label: "ai",
    category: "claude-analysis",
    description: "Claude-style data analysis of housing market trends",
    text: `Looking at the housing market data for the past eighteen months reveals some interesting and somewhat counterintuitive patterns. Despite mortgage rates remaining above 6.5%, home prices in most metropolitan areas have continued to appreciate, albeit at a slower pace than during the 2020-2022 boom. The median existing home price rose approximately 4.2% year-over-year nationally, with considerable regional variation ranging from 1.1% in the Mountain West to 7.8% in the Northeast. The conventional explanation for this resilience is the "lock-in effect" — homeowners with sub-4% mortgages are reluctant to sell and take on higher rates, constraining supply. The data broadly supports this narrative: existing home inventory remains approximately 38% below pre-pandemic levels. However, there are some notable complications. New construction starts have increased by 12% over the same period, and in markets with significant new supply (particularly in the Sun Belt), price appreciation has stalled or turned slightly negative. This suggests that the supply constraint story, while largely correct, may be a temporary phenomenon rather than a structural one. As new construction gradually addresses the housing deficit and as more homeowners eventually need to relocate for life reasons regardless of rate differentials, the current equilibrium seems unlikely to persist indefinitely.`,
  },
  {
    id: "claude-analysis-2",
    label: "ai",
    category: "claude-analysis",
    description: "Claude-style analysis of streaming industry dynamics",
    text: `The streaming industry's evolution over the past three years tells a story about the limits of growth-at-all-costs business models. During the "streaming wars" phase from 2019 to 2022, the dominant strategy was subscriber acquisition through heavy content spending, with major players collectively investing over $50 billion annually in original programming. The data now shows this was largely a zero-sum game in mature markets: total streaming subscriptions per household plateaued at approximately 4.7 in the US by mid-2023, meaning new subscribers for one service increasingly came at the expense of another. The pivot to profitability has been instructive. Ad-supported tiers have grown to represent 30-40% of new subscriptions at services that offer them. Content spending has been rationalized, with several studios reducing original programming budgets by 15-25%. And bundling strategies — often with competitors — have emerged as the primary tool for reducing churn. Perhaps most telling is the password-sharing crackdown data: the largest service's enforcement effort added approximately 30 million paid subscribers globally but also coincided with a measurable increase in cancellation rates among existing subscribers. This suggests that the incremental revenue from converted password-sharers may be partially offset by goodwill erosion among the paying customer base.`,
  },
  {
    id: "claude-analysis-3",
    label: "ai",
    category: "claude-analysis",
    description: "Claude-style analysis of remote work productivity data",
    text: `The available data on remote work productivity is more ambiguous than advocates on either side tend to acknowledge, and I think it's important to be precise about what the research actually shows. Meta-analyses of studies conducted between 2020 and 2025 generally find that individual task productivity — measured by output per hour on defined deliverables — is roughly equivalent for remote and in-office workers, with some studies showing a modest 3-5% advantage for remote work on focused tasks. However, metrics related to collaborative innovation tell a different story. Patent filing rates, cross-team project initiation, and measures of "weak tie" network density have declined measurably at organizations that shifted to fully remote work. The most methodologically rigorous study I've seen, a randomized controlled trial at a large technology company, found no significant difference in individual productivity but a 17% decline in the rate at which employees initiated new collaborative projects with colleagues outside their immediate team. The implication is that the "productivity" question is really two different questions with two different answers. Remote work appears to be at least as efficient for executing known tasks but may reduce the serendipitous interactions that generate new ideas. This explains why hybrid arrangements, despite their logistical complexity, continue to be the modal preference for both employers and employees.`,
  },

  // ── Claude Email Samples ───────────────────────────────────
  {
    id: "claude-email-1",
    label: "ai",
    category: "claude-email",
    description: "Claude-style professional email about project status",
    text: `Subject: Q2 Platform Migration — Status Update and Timeline Adjustment

Hi team,

I wanted to provide a comprehensive update on the platform migration project and flag a timeline adjustment that I believe is warranted given recent developments. The core database migration is tracking on schedule and is approximately 75% complete, with the remaining tables expected to be migrated by end of next week. However, we've encountered some unexpected complexity in the API layer compatibility testing that I think warrants extending the overall timeline by approximately two weeks. Specifically, three of our legacy endpoints are returning inconsistent response formats under the new infrastructure, and resolving these discrepancies requires coordination with the mobile team to ensure backward compatibility. Rather than rushing this critical integration work, I'd recommend we adjust the launch target from March 15 to March 29. This allows for proper regression testing and a staged rollout that reduces risk. I've drafted a revised timeline document that I'll share in tomorrow's standup. Please review it and come prepared to discuss any concerns or dependencies I may have missed. Happy to discuss any of this in more detail before then.

Best regards`,
  },
  {
    id: "claude-email-2",
    label: "ai",
    category: "claude-email",
    description: "Claude-style professional email declining a meeting",
    text: `Subject: Re: Innovation Workshop — March 8

Hi Jennifer,

Thank you for the invitation to participate in the Innovation Workshop next month. I appreciate the thought that went into the agenda, and the topics you've outlined — particularly the session on cross-functional ideation methodologies — are genuinely relevant to our team's current priorities. Unfortunately, I won't be able to attend on March 8 due to a pre-existing commitment to our quarterly planning cycle, which runs that entire week. I want to suggest an alternative that might work for both of us: I could send one of my senior team members, Alex Chen, who has been leading several of our most successful recent innovation initiatives and would bring valuable perspective to the discussion. Additionally, I'd be happy to provide written input on the pre-workshop survey and to review any materials or action items that come out of the session. If a future session is planned, I would very much like to be included. Please don't hesitate to reach out if there's another way I can contribute to this initiative.

Best,
Michael`,
  },
  {
    id: "claude-email-3",
    label: "ai",
    category: "claude-email",
    description: "Claude-style professional email about performance review",
    text: `Subject: Performance Review Discussion — Follow-up Notes

Hi David,

Thank you for the thoughtful conversation during your performance review yesterday. I want to capture the key points we discussed and the goals we agreed upon to ensure we're aligned moving forward. First, I want to reiterate that your technical contributions this quarter have been outstanding — the authentication refactor you led reduced incident response time by 40%, which is a meaningful improvement that the entire engineering organization has benefited from. The area we identified for growth is stakeholder communication: specifically, proactively providing status updates to non-technical stakeholders before they need to ask. We agreed on a concrete action plan: you'll send a brief weekly summary to the product leads for your current projects, and we'll revisit the cadence after 30 days to see if it's the right frequency. I also committed to providing you with more visibility into the product roadmap so you have better context for prioritization decisions. I'll set up a recurring monthly session for that starting next week. Please review these notes and let me know if I've missed or mischaracterized anything from our discussion.

Regards,
Sarah`,
  },

  // ── Gemini Blog Samples ────────────────────────────────────
  {
    id: "gemini-blog-1",
    label: "ai",
    category: "gemini-blog",
    description: "Gemini-style blog post about sustainable living",
    text: `Making the switch to a more sustainable lifestyle doesn't have to be an all-or-nothing proposition, and honestly, the perfectionism around environmentalism might be doing more harm than good. I've been on this journey for about two years now, and here's what I've learned: small, consistent changes add up in meaningful ways. Start with what's easy for you. For me, that was switching to a reusable water bottle and bringing my own bags to the grocery store. These seem trivial, but they eliminated hundreds of single-use plastics from my annual consumption. From there, I moved on to bigger changes — composting kitchen scraps, buying secondhand clothing, and gradually reducing my meat consumption to about twice a week. The key insight is that sustainability is a spectrum, not a binary. Someone who takes public transit three days a week and drives the other two is making a positive impact, even if they're not car-free. Someone who reduces their food waste by 50% is doing meaningful work, even if their kitchen isn't zero-waste. The goal should be progress, not perfection, and I think we'd get a lot more people on board with that framing.`,
  },
  {
    id: "gemini-blog-2",
    label: "ai",
    category: "gemini-blog",
    description: "Gemini-style blog about morning routines",
    text: `I want to push back on the entire "5 AM miracle morning" industrial complex for a moment. Every productivity influencer on the internet seems to believe that waking up at dawn, meditating for twenty minutes, journaling, exercising, and reading ten pages of a business book before most people are awake is the secret to success. And look, if that genuinely works for you, that's great. But the research on chronotypes suggests that roughly 25-30% of the population are natural night owls, and forcing an early morning routine on these individuals actually decreases their cognitive performance during peak working hours. My morning routine is embarrassingly simple: I wake up when my body wakes up (usually around 7:30), I make coffee, I check my messages for anything urgent, and I start working. No meditation, no cold shower, no gratitude journaling. And my output has been consistently higher since I stopped trying to conform to someone else's optimal schedule. The real productivity hack isn't any specific routine — it's self-awareness. Know when you do your best work and protect those hours aggressively. Everything else is decoration.`,
  },
  {
    id: "gemini-blog-3",
    label: "ai",
    category: "gemini-blog",
    description: "Gemini-style blog post about learning to cook",
    text: `Here's the thing about learning to cook that no recipe blog will tell you: the first two years are going to involve a lot of mediocre meals, and that's completely fine. We've been conditioned by cooking shows and Instagram food photography to believe that every dish should look and taste restaurant-quality, and this unrealistic expectation stops a lot of people from even trying. When I started cooking seriously about three years ago, I burned rice. Consistently. For weeks. My stir-fries were simultaneously overcooked and under-seasoned, which I didn't even think was possible. But gradually, through repetition and a willingness to eat my own mistakes, I developed an intuition for heat, timing, and seasoning that no recipe can fully teach you. The single most useful piece of advice I received was this: learn five meals really well before branching out. Master a simple pasta, a grain bowl, a soup, a sheet-pan dinner, and a stir-fry. Cook each one repeatedly until you can do it without consulting a recipe. This gives you a foundation of techniques that transfer to almost everything else. Also, invest in a good chef's knife and a meat thermometer. Everything else is optional.`,
  },

  // ── Gemini Review Samples ──────────────────────────────────
  {
    id: "gemini-review-1",
    label: "ai",
    category: "gemini-review",
    description: "Gemini-style product review of noise-canceling headphones",
    text: `After spending three months with these noise-canceling headphones as my daily drivers, I feel confident providing a comprehensive assessment. The active noise cancellation is genuinely impressive — it effectively eliminates the low-frequency hum of airplane engines, office HVAC systems, and the general ambient noise of a busy coffee shop. The sound quality is rich and well-balanced, with a slight emphasis on the low end that suits most popular music genres without overwhelming classical or acoustic recordings. Battery life consistently delivers around 28-30 hours with ANC enabled, which exceeds the manufacturer's stated specification. The companion app offers extensive EQ customization and the ability to adjust the level of noise cancellation, which is a welcome feature for situations where you need some environmental awareness. On the downside, the headphones are noticeably heavy for extended wearing sessions. After about three hours, I experience some discomfort around the top of my ears. The multipoint Bluetooth connection works well in theory but occasionally struggles when switching between devices, requiring a manual reconnect. Overall, these represent excellent value at their price point and are a strong recommendation for commuters and open-office workers.`,
  },
  {
    id: "gemini-review-2",
    label: "ai",
    category: "gemini-review",
    description: "Gemini-style review of a standing desk",
    text: `I've been using this electric standing desk for approximately six months, and my experience has been largely positive with a few notable caveats. The motorized height adjustment is smooth and quiet, transitioning from sitting to standing height in about twelve seconds. The memory presets are a genuinely useful feature — I have three programmed: sitting height, standing height, and a middle position for when I'm using a drafting stool. Build quality feels solid, with a steel frame and a desktop surface that has held up well against daily use, including the occasional coffee spill. The cable management tray underneath is well-designed and keeps the workspace looking clean. Where this desk falls short is stability at maximum standing height. There's a noticeable wobble when typing vigorously, which becomes more pronounced with heavier monitor configurations. Adding a crossbar brace (sold separately, unfortunately) largely resolves this issue but adds cost and complexity. Assembly took approximately 90 minutes with two people and the instructions, while adequate, could be clearer about the orientation of certain brackets. For the price, this desk delivers on its core promise of reliable sit-stand functionality and represents a solid mid-range option in an increasingly crowded market.`,
  },
  {
    id: "gemini-review-3",
    label: "ai",
    category: "gemini-review",
    description: "Gemini-style review of a language learning app",
    text: `After using this language learning application daily for four months while studying intermediate Spanish, I have a nuanced perspective on its strengths and significant limitations. The app excels at vocabulary acquisition through its spaced repetition system, which intelligently surfaces words at optimal intervals for long-term retention. The gamification elements — streaks, experience points, leaderboards — are effective motivational tools, particularly during the first few weeks when motivation is highest. The bite-sized lesson format (5-10 minutes each) integrates well into a busy schedule. However, the app has fundamental weaknesses in developing conversational fluency. The exercises are heavily translation-based, training you to convert between languages rather than think in the target language. Grammar instruction is largely implicit and unsystematic, which can leave learners confused about why certain constructions work the way they do. Most critically, there is minimal opportunity for producing original language. You're selecting from multiple choice options and arranging pre-written tiles rather than generating your own sentences. As a supplementary tool alongside a structured course or conversation practice, this app is valuable. As a standalone path to fluency, it is insufficient. Think of it as a vocabulary trainer with some exposure to sentence structure, not a comprehensive language education platform.`,
  },

  // ── LLaMA Social Samples ───────────────────────────────────
  {
    id: "llama-social-1",
    label: "ai",
    category: "llama-social",
    description: "LLaMA-style social media post about fitness",
    text: `Just hit a major milestone in my fitness journey and I'm so excited to share! After 8 months of consistent training, I finally deadlifted 315 lbs today. For context, when I started last March, I could barely handle 135 lbs with proper form. The key to my progress? Consistency over intensity. I showed up 4 days a week, every week, even on days when I really didn't feel like it. I followed a progressive overload program, adding just 5 lbs per week to my working sets. Some weeks I had to deload and that's totally okay. Recovery is just as important as the work itself. I also want to be transparent: nutrition played a huge role. I tracked my protein intake (aiming for 0.8g per pound of bodyweight) and prioritized sleep. No supplements, no shortcuts, just the basics done consistently. If you're just starting out, please don't compare your beginning to someone else's middle. Everyone's journey looks different and that's perfectly fine. Keep showing up and trust the process!`,
  },
  {
    id: "llama-social-2",
    label: "ai",
    category: "llama-social",
    description: "LLaMA-style social media post about travel",
    text: `Unpopular opinion: the best way to experience a new city is to completely ditch the tourist itinerary for at least one full day. Last week in Lisbon, I spent my first two days hitting all the recommended spots — Belem Tower, Time Out Market, the famous tram 28 route. And it was great! No complaints. But on day three, I just walked. No map, no plan, no destination. I ended up in this tiny neighborhood called Graca where I found a family-run restaurant that wasn't on any travel blog. The owner spoke almost no English and I speak zero Portuguese, but through gestures and Google Translate, she recommended a dish I never would have ordered from a menu. It was incredible. Then I stumbled into this little ceramics workshop where an artist was painting tiles by hand the same way his grandfather did fifty years ago. He let me watch for an hour and tried to teach me some basic techniques. My tile looked terrible but the experience was unforgettable. Those unplanned moments were the highlight of my entire trip. Sometimes the best adventures are the ones you don't plan for.`,
  },
  {
    id: "llama-social-3",
    label: "ai",
    category: "llama-social",
    description: "LLaMA-style social media post about tech industry",
    text: `Can we talk about the elephant in the room in tech right now? The industry laid off over 260,000 workers in the past two years while simultaneously posting record profits. Companies are hiring AI researchers and laying off customer support teams. They're automating away junior developer positions while complaining about a "talent shortage" at the senior level. The disconnect is staggering. And the "learn to code" advice that was everywhere five years ago? Now it's "learn AI" or "learn prompt engineering." The goalposts keep moving. I don't think this means tech is dead as a career — far from it. But I think we need to be much more honest with people entering the field about what the landscape actually looks like. The days of bootcamp-to-six-figures in twelve weeks were already overstated, and they're certainly not the norm now. What I'd tell anyone starting their tech career today: specialize deeply in something, build things that solve real problems (not just tutorial projects), and develop skills that are harder to automate — system design, architecture decisions, understanding business context. The people who thrive in any market are the ones who can do things that aren't easily commoditized.`,
  },

  // ── Mistral Technical Samples ──────────────────────────────
  {
    id: "mistral-technical-1",
    label: "ai",
    category: "mistral-technical",
    description: "Mistral-style technical documentation on database indexing",
    text: `Database indexing is a critical optimization technique that significantly improves query performance by reducing the number of disk I/O operations required to locate specific rows. A B-tree index, the most common type used in relational databases, organizes data in a balanced tree structure where each node contains multiple keys and pointers, enabling logarithmic time complexity for search operations. When creating indexes, it is essential to consider the cardinality of the indexed column — columns with high cardinality (many distinct values) benefit most from indexing, while low-cardinality columns may actually degrade performance due to the overhead of maintaining the index structure during write operations. Composite indexes, which span multiple columns, should be designed with the leftmost prefix rule in mind: the index can be used for queries that filter on the first column, the first and second columns, and so on, but not for queries that skip the leading column. Index-only scans represent an additional optimization where the database engine can satisfy a query entirely from the index without accessing the underlying table data. Regular analysis of query execution plans using EXPLAIN ANALYZE is recommended to identify missing indexes and to detect situations where existing indexes are not being utilized by the query optimizer.`,
  },
  {
    id: "mistral-technical-2",
    label: "ai",
    category: "mistral-technical",
    description: "Mistral-style documentation on container orchestration",
    text: `Container orchestration with Kubernetes provides automated deployment, scaling, and management of containerized applications across clusters of machines. The fundamental unit of deployment in Kubernetes is the Pod, which encapsulates one or more containers that share network namespace and storage volumes. Deployments manage the desired state of Pod replicas, handling rolling updates and rollbacks through a declarative configuration model specified in YAML manifests. The Service resource provides stable network endpoints for accessing groups of Pods, abstracting away the ephemeral nature of individual Pod IP addresses through label-based selectors. For stateful applications, StatefulSets guarantee ordered deployment and stable network identities, which is essential for databases and other applications that require persistent storage and predictable naming. The Horizontal Pod Autoscaler adjusts the number of Pod replicas based on observed CPU utilization or custom metrics, enabling applications to scale dynamically in response to varying load patterns. ConfigMaps and Secrets provide mechanisms for externalizing application configuration and sensitive data, respectively, promoting the twelve-factor app methodology of strict separation between configuration and code. Network Policies enable fine-grained control over Pod-to-Pod communication, implementing a zero-trust security model within the cluster.`,
  },
  {
    id: "mistral-technical-3",
    label: "ai",
    category: "mistral-technical",
    description: "Mistral-style technical docs on WebSocket implementation",
    text: `The WebSocket protocol, defined in RFC 6455, establishes a persistent, full-duplex communication channel over a single TCP connection, enabling real-time bidirectional data transfer between client and server. The connection lifecycle begins with an HTTP upgrade handshake, where the client sends a standard HTTP request with the Connection: Upgrade and Upgrade: websocket headers, along with a Sec-WebSocket-Key for security validation. Upon successful handshake, the server responds with HTTP 101 Switching Protocols and the connection is elevated from HTTP to the WebSocket protocol. Data is transmitted in frames, with each frame containing an opcode that identifies the payload type (text, binary, ping, pong, or close). The protocol supports message fragmentation, allowing large payloads to be split across multiple frames for efficient memory utilization. Implementation considerations include heartbeat mechanisms using ping/pong frames to detect stale connections, exponential backoff strategies for reconnection logic, and message queuing during disconnected states to prevent data loss. For production deployments, connection pooling, load balancer configuration with session affinity, and proper handling of the close handshake sequence are essential for maintaining reliability. Security best practices include using the wss:// scheme for TLS encryption, validating the Origin header during the upgrade handshake to prevent cross-site WebSocket hijacking, and implementing rate limiting to mitigate denial-of-service attacks.`,
  },

  // ── Paraphrased AI Samples ─────────────────────────────────
  {
    id: "paraphrased-ai-1",
    label: "ai",
    category: "paraphrased-ai",
    description: "AI text heavily edited to sound human — climate discussion",
    text: `Yeah so the climate stuff is getting pretty bad — I was reading some data the other day and basically we've already blown past some of the targets that scientists set back in 2015. Like the 1.5 degree thing? Probably not happening. And what bugs me is how the conversation always turns into these massive systemic debates about carbon pricing and international agreements (which matter, sure) but nobody talks about the weird middle-ground stuff. Like how my city still doesn't have a composting program in 2026, or why it's cheaper to buy new furniture than to get the old stuff repaired. There are all these small structural problems that add up but they're not sexy enough for policy discussions. Anyway I don't have solutions, I'm just frustrated with the gap between the urgency of the science and the pace of actual change on the ground.`,
  },
  {
    id: "paraphrased-ai-2",
    label: "ai",
    category: "paraphrased-ai",
    description: "AI text edited to sound conversational — education take",
    text: `Honestly I think the whole standardized testing debate misses the point. People argue about whether tests are biased (they are, somewhat) or whether they predict college success (they do, weakly) but the real question is why we've built an entire educational system around a few hours of bubble-filling. My kid spent basically all of March doing test prep instead of actual learning because the school's funding depends on scores. That's insane right? Like the test has become the curriculum instead of measuring it. And before someone says "but we need accountability" — yeah obviously. But there are dozens of ways to assess learning that don't involve sitting a nervous 16 year old in a fluorescent room for 4 hours with a number 2 pencil. Portfolios exist. Project-based assessments exist. But they're harder to scale and harder to rank so we stick with the thing that's easy to measure even though we know it measures the wrong stuff.`,
  },
  {
    id: "paraphrased-ai-3",
    label: "ai",
    category: "paraphrased-ai",
    description: "AI text made to sound like casual blog — remote work",
    text: `Two years into working from home full-time and I have some thoughts that might be unpopular with the WFH crowd. I love it. I'm more productive, I get more sleep, I don't miss commuting at all. BUT — and this is the thing I never see anyone admit — I'm definitely worse at my job in some ways? Like the creative collaborative stuff has taken a real hit. We used to have these random hallway conversations that would turn into actual good ideas, and Slack just... isn't that. You don't casually riff on ideas in a Slack thread the way you do standing at the coffee machine. Also I've noticed my network has shrunk significantly. I basically only talk to my immediate team now. The cross-functional relationships that used to develop organically just don't when everyone's a little Zoom square. So idk, I think the ideal is probably 2-3 days in office which is the most boring possible take but sometimes the boring answer is the right one.`,
  },
  {
    id: "paraphrased-ai-4",
    label: "ai",
    category: "paraphrased-ai",
    description: "AI text rewritten as informal opinion — AI in creative work",
    text: `The AI art discourse drives me absolutely up the wall because both sides are arguing past each other. The "AI art isn't real art" people are ignoring that the tool doesn't determine the art — photography wasn't considered art for decades and now nobody argues about that. But the "AI will democratize creativity" people are ignoring that there's a meaningful difference between having a vision and being able to express it, and the struggle of developing technical skill is often where the most interesting creative choices happen. Like when a painter has to figure out how to render light with limited pigments, that constraint produces something unique. An AI model has no constraints — it can render anything, which paradoxically might make its outputs less interesting. Anyway the real issue nobody's talking about is the training data thing. Using artists' work without consent or compensation to build commercial tools is just... not great, regardless of where you stand on the "is it art" question. Fix the compensation problem and I think a lot of the hostility goes away.`,
  },
  {
    id: "paraphrased-ai-5",
    label: "ai",
    category: "paraphrased-ai",
    description: "AI text heavily edited to sound like personal reflection — career change",
    text: `Made a huge career change last year — left a stable engineering job to go into teaching. Everyone thought I was crazy and honestly some days I think they might be right. The pay cut was brutal. Like I knew it would be bad but seeing the actual numbers on that first paycheck was a special kind of pain. And the workload is wild — I spend more hours on lesson planning, grading, and parent emails than I ever spent coding. But here's the thing that surprised me: I actually feel like what I do matters in a way I never did building enterprise software. When a kid who's been struggling with algebra suddenly gets it and you can see the moment it clicks? Man. That's something no deployment to production ever gave me. I miss the engineering salary a lot though not gonna lie. And the intellectual challenge of hard technical problems. Teaching has its own intellectual challenges but they're different — more emotional intelligence, more improvisation, more reading the room. I don't know if I'll stay in teaching forever but I'm glad I did it. Everyone should work in a completely different field at least once just to shake loose all your assumptions about what work means to you.`,
  },

  // ── Additional GPT-4 Samples ───────────────────────────────
  {
    id: "gpt4-medical-4",
    label: "ai",
    category: "gpt4-medical",
    description: "GPT-4 style overview of Alzheimer's disease research",
    text: `Alzheimer's disease, the most common form of dementia, affects an estimated 55 million people worldwide and represents one of the greatest challenges in modern neurology. The disease is characterized by the progressive accumulation of amyloid-beta plaques and neurofibrillary tangles composed of hyperphosphorylated tau protein in the brain. Despite decades of research focused on the amyloid hypothesis, therapeutic approaches targeting amyloid clearance have yielded only modest clinical benefits, as demonstrated by the controversial approval of lecanemab, which showed a 27% slowing of cognitive decline over 18 months but raised concerns about adverse events including amyloid-related imaging abnormalities. Emerging research has increasingly focused on alternative mechanisms, including neuroinflammation, synaptic dysfunction, vascular contributions, and the role of the glymphatic system in waste clearance during sleep. The identification of genetic risk factors beyond APOE4, facilitated by genome-wide association studies, has revealed the involvement of immune-related pathways, suggesting that Alzheimer's may be fundamentally a disease of the brain's immune response gone awry.`,
  },
  {
    id: "gpt4-legal-4",
    label: "ai",
    category: "gpt4-legal",
    description: "GPT-4 style analysis of platform liability under Section 230",
    text: `The ongoing debate surrounding Section 230 of the Communications Decency Act has intensified as both legislative and judicial actors grapple with the appropriate scope of platform immunity in an era of algorithmically curated content. The statute's key provision, which shields interactive computer services from liability for third-party content, was enacted in 1996 when the internet landscape bore little resemblance to today's ecosystem of recommendation algorithms and targeted content delivery. The central legal question that has emerged is whether algorithmic amplification constitutes an editorial function that should fall outside the scope of Section 230's protection. The Supreme Court's decisions in Gonzalez v. Google and Twitter v. Taamneh left this question largely unresolved, declining to establish clear precedent on the boundaries between passive hosting and active curation. State-level initiatives have attempted to fill this regulatory gap, with Texas and Florida enacting laws restricting content moderation practices, though these face their own First Amendment challenges. The resulting legal uncertainty has created significant compliance burdens for platforms of all sizes while leaving fundamental questions about accountability in the digital public sphere unanswered.`,
  },
  {
    id: "gpt4-news-4",
    label: "ai",
    category: "gpt4-news",
    description: "GPT-4 style news about a labor market shift",
    text: `A comprehensive analysis released Thursday by the Bureau of Labor Statistics reveals a significant structural shift in the American workforce, with remote and hybrid work arrangements now accounting for approximately 34% of all full-time employment, up from just 5% prior to the pandemic. The data shows that the adoption of flexible work arrangements varies dramatically by industry, with information technology and professional services leading at 68% and 52% respectively, while healthcare, manufacturing, and retail remain predominantly on-site. Perhaps most notably, the analysis found that companies offering remote or hybrid options experienced 23% lower turnover rates compared to those requiring full-time office attendance, a differential that increased among workers under 35. Economists cautioned, however, that the trend has contributed to a growing geographic decoupling between where jobs are based and where workers reside, with implications for commercial real estate markets, local tax revenues, and the economic vitality of traditional business districts. Several major cities have reported persistent office vacancy rates above 20%, prompting discussions about adaptive reuse of commercial properties for residential purposes.`,
  },
  {
    id: "gpt4-creative-4",
    label: "ai",
    category: "gpt4-creative",
    description: "GPT-4 style creative fiction about a bookshop",
    text: `The bookshop at the end of Hawthorn Lane had a peculiar quality that only its most loyal customers noticed: it seemed to know what you needed to read. Not what you wanted — that was a different matter entirely — but what you needed, in the way that a cold glass of water is what you need on a hot day even if you think you want lemonade. Margaret Chen discovered this on a rainy Thursday when she walked in looking for a cookbook and walked out with a slim volume of poetry by a Lithuanian author she had never heard of. She read it on the bus home and cried so hard that the woman next to her offered her a tissue and then, after a pause, a hug. The poems were about motherlessness. Margaret's mother had died six weeks earlier and she hadn't cried yet — not at the funeral, not when packing up the apartment, not when she found her mother's reading glasses still resting on the nightstand with a bookmark holding a page she would never finish. But the Lithuanian poems unlocked something that all the sympathy cards and casseroles could not, and by the time the bus reached her stop, Margaret felt lighter than she had in months.`,
  },
  {
    id: "claude-essay-4",
    label: "ai",
    category: "claude-essay",
    description: "Claude-style essay on the paradox of choice",
    text: `The relationship between choice and wellbeing turns out to be considerably more complicated than the standard economic assumption that more options are always better. Barry Schwartz's "paradox of choice" thesis — that an abundance of options can paradoxically decrease satisfaction — has been partially validated by subsequent research, though the effect appears to be more domain-specific and personality-dependent than originally proposed. There's a useful distinction to draw between what Schwartz calls "maximizers" (people who seek the optimal choice) and "satisficers" (those who choose the first option meeting their criteria). Maximizers report consistently lower satisfaction with their decisions despite often making objectively better choices by measurable criteria. This suggests that the psychological cost of evaluating many options may outweigh the marginal benefit of selecting a superior one. The practical implications extend beyond consumer behavior to institutional design. When we offer employees 47 retirement fund options instead of 5, or when we present patients with every conceivable treatment pathway, we may be transferring decision burden in ways that feel empowering but actually produce anxiety, decision fatigue, and a persistent sense that the unchosen alternatives might have been better.`,
  },
  {
    id: "claude-analysis-4",
    label: "ai",
    category: "claude-analysis",
    description: "Claude-style analysis of social media engagement metrics",
    text: `An interesting pattern emerges when you look at engagement metrics across social media platforms over the past two years: average time spent per session has decreased on most major platforms (down 8-12%), but the total number of sessions per day has increased (up 15-20%). Users are spending less time per visit but visiting more frequently, suggesting a shift from long browsing sessions to habitual checking behavior. This has meaningful implications for content creators and advertisers. Content optimized for the old pattern — long-form pieces designed to keep users scrolling — may underperform relative to short, immediately engaging content that can capture attention in the context of a 3-5 minute session. The data also shows divergent trends by age cohort: users over 40 largely maintain longer session patterns, while users 18-24 show the most pronounced shift toward frequent, brief sessions. This behavioral divergence may partly explain why platform features targeting younger demographics (short-form video, stories formats) have consistently outperformed features designed for sustained engagement. One caveat worth noting: these metrics capture time within the app but don't account for cross-platform behavior, where a user might see content on one platform and engage with it on another.`,
  },
  {
    id: "gemini-blog-4",
    label: "ai",
    category: "gemini-blog",
    description: "Gemini-style blog about digital minimalism",
    text: `I did a digital declutter last month — deleted 47 apps from my phone, unsubscribed from 200+ email newsletters, and turned off all non-essential notifications — and the results have been genuinely transformative. The first thing I noticed was the silence. Not literal silence, but the absence of the constant low-level anxiety that comes from knowing there are always unread notifications, unfinished articles, and unanswered messages waiting for your attention. My phone went from being a slot machine that I compulsively checked 80+ times a day to being a tool that I pick up when I need it and put down when I don't. The process itself was illuminating. Of those 47 apps, I had opened maybe 12 of them in the past month. The rest were just sitting there, taking up storage and mental bandwidth, relics of a moment when I thought I'd start meditating, or learn chess, or track my water intake. I didn't miss a single one. The email unsubscribe marathon took about two hours and was the most productive two hours I've spent in recent memory. Most of those newsletters I had never read — they just contributed to inbox anxiety and the vague guilt of having 3,000 unread emails. If you're feeling overwhelmed by your devices, I'd strongly recommend this exercise. Start with the apps you haven't opened in 30 days. You won't miss them.`,
  },
  {
    id: "gemini-review-4",
    label: "ai",
    category: "gemini-review",
    description: "Gemini-style review of an air purifier",
    text: `After living with this air purifier for four months through both wildfire season and a nasty cold and flu stretch, I can provide a thorough assessment. The unit covers our 450 square foot living room effectively, and the real-time air quality display provides useful feedback that correlates well with my own perception of air freshness. During the wildfire smoke events this past summer, the purifier brought our indoor PM2.5 levels from approximately 85 to under 10 within about 90 minutes of operation on the highest fan setting. That performance alone justified the purchase for our household. The HEPA filter appears well-constructed and the manufacturer's claim of a 6-month replacement interval seems reasonable based on the filter condition indicator. Replacement filters are reasonably priced at $40 each. The noise level is the primary weakness. On the lowest setting it produces a gentle white noise that most people would find acceptable for sleeping. On medium and high settings, however, it becomes genuinely loud — disruptive enough that holding a conversation in the same room requires raising your voice. The auto mode, which adjusts fan speed based on detected air quality, works well in principle but can cycle between settings in a way that's more distracting than a consistent noise level.`,
  },
  {
    id: "llama-social-4",
    label: "ai",
    category: "llama-social",
    description: "LLaMA-style social media post about mental health awareness",
    text: `Something I've been thinking about a lot lately: we've gotten really good at talking about mental health in the abstract but we're still pretty bad at accommodating it in practice. Like everyone will share an infographic about anxiety on their story but when your coworker actually needs to take a mental health day, there's still judgment. "Must be nice" someone will mutter, as if depression is a vacation. Companies put "we care about your wellbeing" on their career page while expecting you to answer Slack messages at 10pm. Schools teach kids about emotional regulation while giving them 7 hours of homework and a 6:30am start time. The awareness part is great, don't get me wrong. But awareness without structural change is just performance. We know burnout is real — now build schedules that prevent it. We know therapy is important — now make insurance actually cover it without a 6-month waitlist. We know sleep matters — now stop glorifying hustle culture. The conversation needs to move from "it's okay to not be okay" to "here are the systemic changes we're making so fewer people are not okay."`,
  },
  {
    id: "mistral-technical-4",
    label: "ai",
    category: "mistral-technical",
    description: "Mistral-style docs on OAuth 2.0 authorization flows",
    text: `OAuth 2.0 defines multiple authorization grant types to accommodate different client architectures and security requirements. The Authorization Code grant, recommended for server-side applications, involves a two-step process: the client redirects the user to the authorization server, which returns an authorization code via a redirect URI; the client then exchanges this code for an access token through a back-channel request, ensuring the token is never exposed to the user agent. The Proof Key for Code Exchange (PKCE) extension, originally designed for public clients (mobile and single-page applications), is now recommended for all clients as an additional defense against authorization code interception attacks. The extension works by having the client generate a cryptographic code verifier and its corresponding code challenge, which is included in the initial authorization request. The authorization server validates the code verifier during the token exchange, binding the token request to the original authorization request. The Implicit grant type, which returns tokens directly in the redirect URI fragment, has been deprecated by the OAuth 2.0 Security Best Current Practice document due to the risk of token leakage through browser history, referrer headers, and open redirect vulnerabilities. For machine-to-machine communication, the Client Credentials grant provides a straightforward mechanism where the client authenticates directly with the authorization server using its own credentials, without any user interaction.`,
  },
  {
    id: "gpt4-creative-5",
    label: "ai",
    category: "gpt4-creative",
    description: "GPT-4 style creative writing about a letter",
    text: `The letter arrived on a Tuesday, which was significant because Tuesdays were the only days that nothing happened in the Winters household. Mondays were for groceries. Wednesdays were for piano lessons. Thursdays through Sundays were for the various obligations and emergencies that seemed to multiply with each passing year. But Tuesdays were hollow, predictable, safe — which is perhaps why the universe chose that day to deliver a letter postmarked from 1987 in handwriting that Eleanor Winters recognized immediately as her own. She hadn't written it. She was certain of that, the way one is certain of gravity or the color of the sky. And yet there was her name, her address, in the looping cursive that her third-grade teacher had drilled into her hand until it became as natural as breathing. The postmark read March 14, 1987. Eleanor had been seven years old in March of 1987. She opened the letter at the kitchen table with steady hands and an unsteady heart. Inside was a single sheet of lined paper — the kind with the wider spaces meant for children. It contained exactly four words: "Don't sell the house."`,
  },
  {
    id: "claude-email-4",
    label: "ai",
    category: "claude-email",
    description: "Claude-style email about vendor evaluation",
    text: `Subject: Vendor Evaluation Summary — Analytics Platform RFP

Hi team,

I've completed the initial evaluation of the four analytics platform vendors who responded to our RFP, and I wanted to share a summary before our selection committee meeting on Thursday. I've scored each vendor across our five evaluation criteria (functionality, scalability, total cost of ownership, implementation timeline, and vendor stability) using the weighted rubric we agreed upon.

The short version: Vendors A and C emerged as the clear frontrunners. Vendor A scores highest on functionality and scalability but has a significantly higher TCO due to their per-seat licensing model, which becomes expensive at our projected user count of 500+. Vendor C offers a more competitive pricing structure with comparable core functionality, though their reporting module is less mature. Vendors B and D fell below our minimum threshold on scalability and implementation timeline respectively.

My recommendation is to advance Vendors A and C to the proof-of-concept phase and have each build a prototype using our sample dataset. This would give us a much clearer picture of real-world performance and usability before committing. I've drafted an evaluation scorecard that I'll share before Thursday.

Please come prepared with any additional criteria or concerns you'd like to discuss.

Best,
Rebecca`,
  },
  {
    id: "gpt4-medical-5",
    label: "ai",
    category: "gpt4-medical",
    description: "GPT-4 style explanation of mRNA vaccine technology",
    text: `The development of mRNA vaccine technology represents a paradigm shift in vaccinology, enabling rapid vaccine design and production in response to emerging infectious diseases. Unlike traditional vaccine approaches that utilize inactivated pathogens or recombinant proteins, mRNA vaccines deliver genetic instructions that direct host cells to produce a specific antigenic protein, thereby stimulating both humoral and cellular immune responses. The mRNA molecule is encapsulated in lipid nanoparticles that facilitate cellular uptake and protect the fragile nucleic acid from enzymatic degradation. Once inside the cell, the mRNA is translated by ribosomes into the target protein, which is then processed and presented on the cell surface, triggering immune recognition. The mRNA is subsequently degraded by normal cellular mechanisms and does not integrate into the host genome, addressing a common misconception about this technology. The flexibility of the mRNA platform allows vaccines to be redesigned within days of identifying a new pathogen sequence, as demonstrated during the COVID-19 pandemic when initial vaccine candidates were designed within 48 hours of the SARS-CoV-2 genomic sequence becoming available. Current research is expanding mRNA applications beyond infectious disease to include personalized cancer vaccines, autoimmune disease treatments, and rare genetic disorders.`,
  },
  {
    id: "gpt4-news-5",
    label: "ai",
    category: "gpt4-news",
    description: "GPT-4 style news about education technology policy",
    text: `School districts across the country are implementing widely divergent policies regarding artificial intelligence use in classrooms, creating what education researchers describe as a patchwork landscape that may exacerbate existing inequities in educational outcomes. A survey of 500 school districts conducted by a major education policy institute found that 38% have banned generative AI tools entirely, 27% have established formal AI use policies, and the remaining 35% have no formal policy in place. The variation often correlates with district resources: wealthier districts are more likely to have developed nuanced policies that integrate AI as a learning tool with appropriate guardrails, while under-resourced districts tend toward blanket prohibitions, partly due to limited capacity for policy development and teacher training. The National Education Association has called for federal guidelines to establish minimum standards, arguing that students in restrictive districts may be disadvantaged in developing the digital literacy skills increasingly required by employers. Meanwhile, early evidence from districts with well-implemented AI integration programs suggests modest improvements in student engagement and personalized learning outcomes, though researchers caution that the data is preliminary and subject to significant confounding factors.`,
  },
  {
    id: "claude-essay-5",
    label: "ai",
    category: "claude-essay",
    description: "Claude-style essay about the value of boredom",
    text: `There's a growing body of research suggesting that boredom, far from being a state to be avoided, may serve important cognitive and creative functions that we're systematically eliminating from modern life. The constant availability of stimulation through smartphones means that the micro-moments of boredom that previous generations experienced — waiting in line, riding an elevator, sitting in a waiting room — have been almost entirely replaced by scrolling. This matters more than it might seem. Studies in cognitive psychology have found that periods of boredom activate the brain's default mode network, which is associated with mind-wandering, self-reflection, and creative problem-solving. When you're bored, your brain isn't idle — it's doing important background processing, consolidating memories, making novel connections between disparate ideas, and engaging in the kind of undirected thinking that often precedes creative breakthroughs. This isn't an argument against technology or stimulation. It's an argument for intentional gaps. The most interesting idea I've had in the past year came to me in the shower — one of the few remaining environments where I'm not connected to anything. I suspect that's not a coincidence. We might benefit from deliberately creating more spaces in our lives where there's nothing to do and nothing to check, and seeing what our minds produce when they're given the room to wander.`,
  },
  {
    id: "gpt4-legal-5",
    label: "ai",
    category: "gpt4-legal",
    description: "GPT-4 style analysis of employment law and gig economy",
    text: `The classification of gig economy workers continues to present one of the most challenging questions in contemporary employment law. The traditional binary distinction between employees and independent contractors, developed in an era of stable, long-term employment relationships, proves inadequate for workers who may simultaneously engage with multiple platforms, exercise considerable autonomy over their working hours while being subject to algorithmic management, and bear the economic risks of self-employment without the entrepreneurial upside. The California legislature's passage of Assembly Bill 5, which codified the ABC test for worker classification, represented one of the most aggressive regulatory responses to the gig economy, but was subsequently undermined by Proposition 22, a ballot initiative funded by major platform companies that created a special classification for app-based drivers. The European Union's proposed Platform Work Directive takes a different approach, establishing a rebuttable presumption of employment for platform workers who meet certain criteria regarding algorithmic control and economic dependence. These divergent regulatory approaches reflect fundamentally different views about whether gig work represents a welcome innovation in labor market flexibility or an erosion of worker protections achieved over more than a century of labor organizing.`,
  },
  {
    id: "mistral-technical-5",
    label: "ai",
    category: "mistral-technical",
    description: "Mistral-style technical docs on GraphQL schema design",
    text: `Effective GraphQL schema design requires careful consideration of the query patterns consumers will use and the underlying data relationships they need to traverse. The schema should be designed from the client's perspective rather than mirroring the database structure, a principle known as "demand-oriented" or "consumer-driven" schema design. Connections should be modeled using the Relay specification's connection pattern, which provides standardized pagination through cursor-based navigation with PageInfo metadata, enabling efficient traversal of large result sets. Input types should leverage the input object pattern for mutations, grouping related arguments into structured types that improve readability and facilitate validation. Interfaces and union types enable polymorphic queries while maintaining type safety, allowing the schema to express that a SearchResult may be a User, Post, or Comment without requiring the consumer to know in advance which type will be returned. Fragment-based composition at the client level should inform schema granularity: fields should be atomic enough to support varied fragment compositions without requiring over-fetching. Performance considerations include the N+1 query problem, which should be addressed through DataLoader-style batching at the resolver level, and query complexity analysis to prevent resource exhaustion from deeply nested or broadly expanding queries. Schema evolution should follow additive-only practices, deprecating fields rather than removing them to maintain backward compatibility.`,
  },
  {
    id: "llama-social-5",
    label: "ai",
    category: "llama-social",
    description: "LLaMA-style social post about remote work culture",
    text: `Hot take about remote work that I've been sitting on: we replaced one form of performative work with another. In the office, the performance was showing up, looking busy, staying late. Remote, the performance is being permanently available on Slack, sending messages at off hours to prove you're working, having your green dot on at all times. I've caught myself sending messages at 8pm not because the work was urgent but because I wanted people to know I was still working. That's not productivity, that's theater. And the meetings. Oh god the meetings. We replaced the casual desk conversation with 30-minute calendar blocks because Slack doesn't capture nuance and email feels too formal, so now everyone's calendar is a Tetris board of back-to-back video calls and the actual work gets done in the margins. I don't have a solution, I just think it's worth naming the problem: we're optimizing for visibility instead of output, and the medium changed but the underlying dysfunction didn't. The truly productive remote workers I know are the ones who are comfortable being invisible for hours at a time while they do deep work. That takes a level of professional security that most people don't have.`,
  },
  {
    id: "gemini-blog-5",
    label: "ai",
    category: "gemini-blog",
    description: "Gemini-style blog about learning from failure",
    text: `I launched a product last year that failed spectacularly, and I want to talk about what I actually learned because the "failure is the best teacher" platitude glosses over how painful and specific the lessons are. The product was a meal planning app — nothing revolutionary, but I thought we had a unique angle on the problem. We spent eight months building, had a beautiful UI, solid tech stack, positive beta feedback. Launched to crickets. Not a dramatic crash, which would have at least been interesting. Just... nothing. A slow trickle of sign-ups followed by a slower trickle of cancellations. Here's what I learned that I couldn't have learned any other way: we built what we wanted to build, not what users needed. Our beta testers told us nice things because humans are polite when you put something in front of them and ask what they think. We should have been watching what they did, not listening to what they said. The metrics told a clear story we chose to ignore: 70% of users stopped using the app within the first week. We attributed that to onboarding friction. It was actually a value problem. People didn't need another meal planning tool. They needed someone to make the decision about what to eat tonight, and our app just gave them more options to be paralyzed by.`,
  },
  {
    id: "gpt4-creative-6",
    label: "ai",
    category: "gpt4-creative",
    description: "GPT-4 style creative writing — sci-fi premise",
    text: `The first message from the future arrived at 3:47 AM on a Sunday, embedded in the white noise between radio stations. Dr. Lena Okafor almost missed it. She was running a routine analysis of cosmic background radiation at the Arecibo Observatory — not the famous dish, which had long since collapsed, but the smaller digital array that had been built in its shadow. The signal was narrow-band, deliberately structured, and contained a sequence of prime numbers followed by a compressed data packet that, when decoded, contained a single sentence in English, Mandarin, Arabic, and seven other languages: "This message was sent from your coordinates, 127 years from now. We have 14 months." No further context. No explanation. No instructions. Just the date, the location, and a countdown. Dr. Okafor ran the analysis three times, checked for equipment errors, consulted with the night shift at two other observatories, and then sat in her office for twenty minutes staring at the wall. She was, by training and temperament, a skeptic. But the signal's characteristics were unlike anything natural or any known artificial source. By Monday morning, she had to decide who to tell and what to say, knowing that either possibility — that the message was real or that it wasn't — had the potential to change everything.`,
  },
  {
    id: "claude-analysis-5",
    label: "ai",
    category: "claude-analysis",
    description: "Claude-style analysis of restaurant industry post-pandemic",
    text: `The restaurant industry's recovery from pandemic-era disruptions has been uneven in ways that reveal deeper structural shifts rather than a simple return to normal. Full-service restaurants have recovered approximately 92% of pre-pandemic revenue in inflation-adjusted terms, but this aggregate figure masks significant divergence. Fine dining establishments in major metropolitan areas have largely exceeded pre-pandemic performance, buoyed by pent-up demand and consumers' demonstrated willingness to spend on experiential dining. Meanwhile, casual dining chains in suburban and exurban locations continue to struggle, with same-store sales still 5-8% below 2019 levels at several major chains. The most notable structural change is the persistence of off-premises dining, which stabilized at approximately 35% of total restaurant revenue — roughly double the pre-pandemic share. This has created a bifurcation in restaurant strategy: establishments either optimize for the dine-in experience (investing in ambiance, service, and dishes that don't travel well) or lean into delivery and takeout (simplifying menus, optimizing packaging, building ghost kitchen capacity). The middle ground — a standard restaurant that serves both channels equally well — appears to be increasingly untenable. Labor dynamics compound these challenges, with turnover rates remaining above 80% annually in an industry that had already struggled with retention before 2020.`,
  },

  // ── Additional AI Samples for 200+ Coverage ─────────────────
  {
    id: "ai-chatgpt-essay-3",
    label: "ai",
    category: "chatgpt-essay",
    description: "ChatGPT-style essay on the future of work",
    text: `The future of work is being reshaped by the convergence of artificial intelligence, remote collaboration technologies, and shifting societal expectations about employment's role in human life. As automation handles routine cognitive and manual tasks, human work evolves toward activities requiring creativity, emotional intelligence, and complex problem-solving. Organizations investing in workforce reskilling and flexible employment models will be better positioned to navigate this transition. The gig economy continues to expand, offering unprecedented flexibility while raising important questions about benefits, job security, and worker protections. Policymakers face the challenge of updating labor regulations designed for twentieth-century employment models to address twenty-first-century realities.`,
  },
  {
    id: "ai-chatgpt-blog-2",
    label: "ai",
    category: "chatgpt-blog",
    description: "AI-generated blog about mindfulness practices",
    text: `Mindfulness meditation has gained significant traction as a scientifically supported practice for improving mental health and well-being. Research published in peer-reviewed journals demonstrates that regular mindfulness practice can reduce anxiety and depression symptoms, lower cortisol levels, and produce measurable changes in brain structure. The beauty of mindfulness lies in its accessibility — it requires no special equipment and can be adapted to fit even the busiest schedules. Beginners often find it helpful to start with guided meditations of just five to ten minutes. Common techniques include focused breathing, body scan meditation, and loving-kindness meditation, each offering unique benefits.`,
  },
  {
    id: "ai-report-2",
    label: "ai",
    category: "ai-report",
    description: "AI-generated quarterly business summary",
    text: `Third quarter fiscal year 2025 demonstrated continued momentum across all key performance indicators, with consolidated revenue reaching $2.3 billion, a 14.7% year-over-year increase. Growth was broadly distributed across segments, with North America contributing 58%, Europe 27%, and Asia-Pacific 15%. Gross margins expanded 220 basis points to 64.2%, driven by favorable product mix shift toward higher-margin software subscriptions. Customer acquisition cost decreased 8% quarter-over-quarter while lifetime value improved 12%. The enterprise segment added 47 new logos with annual contract values exceeding $500,000. Management reaffirms full-year guidance.`,
  },
  {
    id: "ai-listicle-2",
    label: "ai",
    category: "ai-listicle",
    description: "AI-generated listicle about healthy eating",
    text: `Establishing healthy eating habits doesn't require drastic dietary overhauls. Research supports a gradual approach centered on sustainable modifications. First, increase consumption of whole, minimally processed foods. Second, practice mindful eating by paying attention to hunger and fullness cues. Third, prioritize hydration throughout the day. Fourth, plan meals in advance to reduce impulsive food choices. Fifth, embrace food variety to ensure a broad spectrum of nutrients. Remember that perfection is neither necessary nor realistic — the goal is a pattern of choices that supports your health over time.`,
  },
  {
    id: "ai-social-2",
    label: "ai",
    category: "ai-social",
    description: "AI-generated LinkedIn post about leadership",
    text: `After fifteen years in leadership roles, I've learned that the most impactful thing a manager can do is create psychological safety. When team members feel safe to take risks and admit mistakes without fear of punishment, work quality improves dramatically. Teams operating in trust consistently outperform those driven by fear. The key is modeling vulnerability — being willing to say "I don't know" or "I was wrong." Investing in your people's growth isn't just good management — it's the foundation of sustainable high performance. What leadership lessons have shaped your approach?`,
  },
  {
    id: "ai-academic-2",
    label: "ai",
    category: "ai-academic",
    description: "AI-generated abstract about microplastics",
    text: `This review synthesizes knowledge regarding the environmental fate and ecological impacts of microplastic contamination in freshwater ecosystems. Microplastics have been detected in virtually every freshwater environment sampled, including remote alpine lakes and deep groundwater aquifers. Sources include fragmentation of larger debris, textile microfibers, and tire particle weathering. Once in aquatic environments, microplastics interact with organic matter and contaminants, potentially serving as vectors for persistent organic pollutants. Laboratory studies demonstrate adverse effects on freshwater organisms, but ecological relevance remains uncertain as laboratory concentrations often exceed environmental levels by orders of magnitude.`,
  },
  {
    id: "ai-email-2",
    label: "ai",
    category: "ai-email",
    description: "AI-generated onboarding welcome email",
    text: `Subject: Welcome to the Team

Dear Taylor,

On behalf of the entire engineering team, I am delighted to welcome you to the organization. We are excited about the expertise you bring to the Senior Backend Engineer role. To ensure a smooth transition, I have outlined key activities for your first week. Monday: HR onboarding at 9 AM and equipment setup. Your buddy, Marcus Chen, will be your primary contact for questions about our codebase and processes. I have shared access to our internal documentation hub containing architecture diagrams, coding standards, and project roadmaps. Please don't hesitate to reach out if you need anything.

Best regards,
Sandra`,
  },
  {
    id: "ai-persuasive-2",
    label: "ai",
    category: "ai-persuasive",
    description: "AI-generated persuasive piece about public transit",
    text: `Investing in robust public transportation is not merely an urban planning preference — it is an economic imperative. Cities with well-developed transit networks experience higher productivity, as efficient transportation reduces commute times and connects workers to broader employment opportunities. Every dollar invested in public transit generates approximately four dollars in economic returns. Shifting commuters from private vehicles reduces greenhouse gas emissions, congestion, and public health costs from pollution. The equity implications are equally compelling: reliable transit provides essential mobility for those who cannot afford private vehicles. The argument that transit is a financial burden overlooks the enormous hidden subsidies automobile infrastructure receives.`,
  },
  {
    id: "ai-technical-2",
    label: "ai",
    category: "ai-technical",
    description: "AI-generated explanation of distributed consensus",
    text: `Distributed consensus algorithms address the challenge of achieving agreement among nodes where communication is unreliable and nodes may fail. The Raft algorithm decomposes consensus into leader election, log replication, and safety. One node is elected leader and manages the replicated log, accepting client requests and replicating entries to followers. An entry is committed once a majority of nodes have written it. Leader election uses randomized timeouts: when a follower doesn't hear from the leader, it initiates an election. The safety property guarantees committed entries persist across leader changes, preventing data loss.`,
  },
  {
    id: "ai-news-summary-2",
    label: "ai",
    category: "ai-news",
    description: "AI-generated news about educational AI policy",
    text: `School districts nationwide are implementing divergent policies on AI use in classrooms, creating what researchers call an inequity-amplifying patchwork. A survey of 500 districts found 38% have banned generative AI entirely, 27% established formal policies, and 35% have none. Wealthier districts more often develop nuanced integration policies, while under-resourced districts tend toward blanket prohibitions. The National Education Association has called for federal guidelines, arguing students in restrictive districts may lack digital literacy skills employers increasingly require. Early evidence from well-implemented AI programs suggests modest improvements in engagement, though researchers caution the data is preliminary.`,
  },
  {
    id: "paraphrased-ai-6",
    label: "ai",
    category: "paraphrased-ai",
    description: "AI text rewritten as casual rant about tech interviews",
    text: `Can we collectively agree that the tech interview process is broken? I've been interviewing for two months and the disconnect between what they test and what the job involves is staggering. One company asked me to implement a red-black tree on a whiteboard. A RED-BLACK TREE. When's the last time anyone did that in production? You import it from a library like a normal person. Another gave me a 6-hour take-home that was basically building their product for free. And my favorite — a "culture fit" interview asking what animal I'd be. The whole thing is theater testing how well you perform in artificial scenarios, not whether you can do the job.`,
  },
  {
    id: "gemini-review-5",
    label: "ai",
    category: "gemini-review",
    description: "Gemini-style review of a mechanical keyboard",
    text: `After three months of daily use, this mechanical keyboard has become an integral part of my workflow. The tactile switches provide a satisfying typing experience with a noticeable actuation point that reduces accidental keypresses during fast typing sessions. The PBT keycaps resist the shine development that plagues cheaper ABS alternatives. Backlighting is fully customizable through the companion software, though the software itself is somewhat unintuitive. Build quality is excellent with an aluminum frame that adds heft without being unwieldy. My main criticism is the integrated cable — given the price point, a detachable USB-C connection would have been preferable for portability and replacement purposes.`,
  },
  {
    id: "claude-analysis-6",
    label: "ai",
    category: "claude-analysis",
    description: "Claude-style analysis of podcast industry economics",
    text: `The podcast industry's economics tell a story about the limits of advertising-supported media in a fragmented attention landscape. Total US podcast advertising revenue crossed $2 billion in 2024, which sounds impressive until you consider that this is split among over 4 million active shows. The distribution is predictably Pareto: the top 1% of podcasts capture an estimated 80% of advertising revenue, leaving the vast majority of creators earning effectively nothing from ads. This has driven interesting strategic adaptations. Premium subscription models have gained traction, with several platforms reporting that paid subscribers generate 8-12x more revenue per listener than ad-supported listeners. Membership and patronage models work for creators with dedicated audiences but require a fundamentally different relationship with listeners than ad-supported content. The most economically sustainable podcasts tend to be those that function as marketing channels for other revenue streams — consulting practices, courses, SaaS products — rather than standalone media businesses.`,
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

  // ── More Reddit Posts ──────────────────────────────────────
  {
    id: "human-reddit-3",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about moving to a new city",
    text: `Moved to Denver 3 months ago knowing literally nobody and I gotta say — making friends as a 30-something adult is genuinely one of the hardest things I've ever done. Everyone says "join a rec league" or "go to meetups" and yeah I've done both but there's this awkward phase where you've hung out with someone twice and you're not sure if they actually like you or are just being polite. Like do I text them to hang out again? Is that too much? I feel like a middle schooler asking someone to sit at my lunch table. The weirdest part is I have great friendships back home that developed so naturally I never noticed the process. Now I'm trying to reverse-engineer friendship and it turns out there's no recipe for it. You just have to keep showing up and eventually it clicks with somebody. Anyway if anyone in Denver wants to grab a beer with a mildly anxious transplant from Chicago, my DMs are open lol.`,
  },
  {
    id: "human-reddit-4",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about a bad landlord experience",
    text: `UPDATE to my post from last month about my landlord refusing to fix the heat. So after three weeks of space heaters and sleeping in a sleeping bag in my own apartment (in JANUARY), I finally got the city housing inspector involved. Inspector shows up, takes one look at the boiler, and his exact words were "how long has this been like this?" Turns out the thing hadn't been serviced in SIX YEARS and was actually a carbon monoxide risk. My landlord got slapped with violations and a deadline to fix it. He tried to blame me somehow?? Said I "didn't report it properly" even though I have 14 text messages in a row that he left on read. Anyway the heat is fixed now and I'm looking for a new apartment because there's no way I'm renewing with this guy. Lesson learned: document EVERYTHING in writing, never rely on phone calls, and know your local tenant rights because your landlord sure as hell isn't going to tell you about them.`,
  },
  {
    id: "human-reddit-5",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about adopting a rescue dog",
    text: `Adopted a rescue pit bull mix last Saturday and I need to tell someone who'll understand: the first night was ROUGH. She paced the apartment for four straight hours, wouldn't eat, wouldn't drink, whimpered anytime I left the room even to go to the bathroom. I slept on the floor next to her crate because she was shaking so hard. I honestly questioned whether I'd made a terrible mistake. Day two: slightly better. She ate a little kibble out of my hand. Still wouldn't touch the water bowl but I got her to lick water off my fingers (gross but hey, hydration is hydration). Day three: she played with a squeaky toy for about 30 seconds before getting spooked by the squeaking noise she herself was making. Day seven (today): she fell asleep with her head on my lap while I was watching TV. Just... laid her head down like she'd been doing it forever. I literally cried. They told me at the shelter she'd been returned twice before. She's never going back. Her name is Potato and she is perfect.`,
  },
  {
    id: "human-reddit-6",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about a kitchen disaster",
    text: `TIFU by trying to make homemade caramel for the first time without reading the recipe all the way through. Apparently "do not stir the sugar" is like the most important instruction in candy making and I just... stirred it. Constantly. Like I was making risotto. The sugar crystallized into this horrifying rock-hard mass that welded itself to my best saucepan. I'm not exaggerating when I say it took two hours of soaking and chipping to get it off and there are still scorch marks. My smoke detector went off three times. My cat hid under the bed for the rest of the evening. My roommate came home, looked at the kitchen, and asked if we'd been burglarized. The truly humiliating part? I work at a bakery. I literally make desserts for a living. But apparently my professional skills evaporate the moment I enter my own kitchen. Going to buy store-bought caramel sauce like a normal person from now on.`,
  },
  {
    id: "human-reddit-7",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about quitting social media",
    text: `Deleted Instagram, TikTok, and Twitter three months ago and here's my honest report since people always ask. The first two weeks were genuinely terrible. I'd pick up my phone like 50 times a day out of pure muscle memory, stare at it, realize there was nothing to open, and put it down. The phantom urge to "check" something that doesn't exist anymore is wild. Week three it started getting easier. By month two I noticed I was reading more, sleeping better, and — this is the weird one — I felt less angry? Like I didn't realize how much low-grade irritation I was absorbing from strangers arguing about stuff online. The downsides are real though. I miss knowing about events. I found out a friend had a baby TWO WEEKS after it happened because apparently Instagram stories is how adults share news now. And some friendships have faded because the casual interaction of liking each other's posts was the only thread keeping them connected. Net positive though? Absolutely. 8/10 would recommend. Just download a bunch of podcasts first because you'll need something to do with your hands.`,
  },

  // ── More Twitter/X Threads ─────────────────────────────────
  {
    id: "human-twitter-2",
    label: "human",
    category: "human-twitter",
    description: "Twitter thread about parenting and screen time",
    text: `Controversial parenting take thread: I let my 4 year old watch an hour of TV every day and I refuse to feel bad about it. Yes I've read the AAP guidelines. Yes I know screens are "bad." But you know what else is bad? A burned-out parent who hasn't had a single uninterrupted thought since 6am. That hour of Bluey is the difference between me making a real dinner and ordering pizza for the third time this week. Also Bluey is legitimately great television that teaches emotional intelligence better than most kids' books, but that's beside the point. The point is that the discourse around screen time has become so fear-based that parents are drowning in guilt over something that, in moderation, is completely fine. My kid also plays outside, reads books, builds Lego, and has plenty of unstructured playtime. One hour of TV hasn't rotted her brain. I promise.`,
  },
  {
    id: "human-twitter-3",
    label: "human",
    category: "human-twitter",
    description: "Twitter thread about the housing market",
    text: `Nobody told me that buying a house would make me a person who worries about the foundation. I used to be fun. I used to think about art and music and where to get the best tacos. Now I lie awake at 2am wondering if that crack in the basement wall is "settling" or "structural." I have strong opinions about gutters now. GUTTERS. Last week I got excited about a sale on caulk at Home Depot. Actual genuine excitement. I texted my wife about it. She did not respond. Being a homeowner is just slowly transforming into your dad. Next month I'll probably start complaining about the thermostat.`,
  },
  {
    id: "human-twitter-4",
    label: "human",
    category: "human-twitter",
    description: "Twitter thread about being a freelancer",
    text: `Freelancing year one: "I'm my own boss! Freedom! Flexibility!" Freelancing year two: "I have forty seven bosses, no benefits, and I just spent three hours writing an invoice for $87." The thing nobody tells you about freelancing is the sheer volume of unpaid labor. Pitching clients, writing proposals, chasing invoices, doing your own taxes, managing your own retirement savings, buying your own health insurance. You're not just doing the work — you're running an entire business infrastructure that a company normally handles for you. And the feast/famine cycle is REAL. Last month I had more work than I could handle. This month? Crickets. Am I retired? Did everyone forget I exist? Should I send a "just checking in" email to every human I've ever met? This is fine. Everything is fine.`,
  },
  {
    id: "human-twitter-5",
    label: "human",
    category: "human-twitter",
    description: "Twitter thread about gym culture observations",
    text: `Gym observations from someone who's been going to the same gym for 5 years: There's always one guy who treats the locker room like his living room. Full grooming routine. Electric razor, cologne, ironing his shirt. Sir this is a Planet Fitness. The group of guys who take 45 minutes between sets because they're showing each other memes. They have collectively done 6 reps in an hour. The woman who runs on the treadmill at what appears to be a dead sprint for 90 straight minutes. I'm convinced she's not human. And my personal favorite: the old dude who's been coming every single day since I started and somehow looks exactly the same. He does the exact same routine in the exact same order at the exact same time. He's the most consistent person I've ever met and I respect him deeply.`,
  },
  {
    id: "human-twitter-6",
    label: "human",
    category: "human-twitter",
    description: "Twitter thread about learning a new language as an adult",
    text: `Learning Japanese at 35 and the humiliation is exquisite. Today I tried to tell a shopkeeper "that looks delicious" and apparently said something closer to "your face is a potato." She laughed so hard she had to sit down. My tutor keeps saying "you're making great progress" in a tone that suggests I am in fact not making great progress. I've been studying for 8 months and can confidently order food, apologize, and count to 999. That's it. That's my Japanese. Every conversation is just me aggressively apologizing then pointing at things. But honestly? It's the most fun I've had learning anything in years. Being bad at something as an adult is actually kind of liberating once you get past the ego thing.`,
  },

  // ── Human News/Journalism ──────────────────────────────────
  {
    id: "human-news-2",
    label: "human",
    category: "human-news",
    description: "Local journalism about a community garden dispute",
    text: `The community garden on Elm Street — a 30-year fixture of the Northside neighborhood — faces an uncertain future after the property's owner notified gardeners last week that the land will be sold to a developer. For Delia Washington, 74, who has tended the same plot since 1996, the news hit hard. "This garden saved my life after my husband died," she said, her hand resting on a tomato cage she'd built from scrap lumber. "I know that sounds dramatic but it's the truth. I came here every day that first summer just to have somewhere to be." The developer plans a 12-unit condominium. The sale price, according to county records, is $1.4 million. A hastily organized neighborhood group has raised $83,000 in two weeks toward a counter-offer, but they know it isn't enough. City Council member Rosa Gutierrez says she's exploring whether historic designation might delay the sale, though she acknowledged the legal basis is "thin." Meanwhile, the gardeners keep watering.`,
  },
  {
    id: "human-news-3",
    label: "human",
    category: "human-news",
    description: "Investigative journalism about school lunch debt",
    text: `When Briarwood Elementary started sending collection notices to parents with overdue lunch accounts last fall, lunch lady Teresa Simmons decided she'd had enough. In her 18 years working the cafeteria line, she'd watched the district's unpaid lunch debt policy evolve from quiet tolerance to increasingly aggressive collection — including, as of September, denying hot lunch to students with balances over $25 and giving them a cold cheese sandwich instead. "You can tell which kids get the sandwich," Simmons said. "The other kids can tell too." She began paying off student debts out of her own pocket — $5 here, $10 there. By November, she'd spent over $400. Then she mentioned it to a parent at pickup, who posted about it on Facebook. The post went viral locally. Within a week, the community had raised $14,000, enough to clear the entire district's lunch debt and fund a reserve. The school board, facing public pressure, quietly rescinded the cold sandwich policy at their December meeting. They did not publicly acknowledge Simmons.`,
  },
  {
    id: "human-news-4",
    label: "human",
    category: "human-news",
    description: "Feature journalism about a disappearing profession",
    text: `Eddie Fontana is one of the last neon sign benders in the tristate area, and he knows it. His shop on Industrial Boulevard, wedged between an auto body place and a self-storage facility, is where he's spent the last 41 years heating glass tubes over a ribbon burner and bending them into the letters and shapes that once defined the American streetscape. "Used to be we had six guys in here working full time," he says, adjusting his safety glasses with hands that bear the crosshatch scars of a career spent working with 1,700-degree glass. "Now it's me and Saturdays it's me and my nephew, when he feels like showing up." LED signs killed most of the business. They're cheaper, easier, don't require a specialist to install or maintain. Eddie doesn't begrudge the technology — "progress is progress" — but he maintains that something is lost when a hand-bent neon cocktail glass gets replaced by a flat LED panel that looks, in his words, "like a laptop fell asleep on a bar wall."`,
  },
  {
    id: "human-news-5",
    label: "human",
    category: "human-news",
    description: "War correspondence excerpt",
    text: `The hospital had run out of anesthetic three days before we arrived. Dr. Amira Khoury performed a leg amputation that morning using only a local nerve block and, when that wore off mid-procedure, her calm voice telling the patient to squeeze a rolled-up towel. The patient was nineteen. His name was Sami and he'd been studying engineering at the university before a mortar round landed in the market where he was buying bread for his mother. He didn't scream during the surgery, which almost made it worse — he just stared at the ceiling with an expression of such concentrated endurance that I had to step outside. In the hallway, a nurse was crying into her phone. Through a window, I could see children playing in the rubble of what had been a school. The normality of their laughter against the backdrop of systematic destruction is something I don't think I'll ever be able to adequately describe. You write the words and they just sit there on the page, nowhere close to the thing itself.`,
  },
  {
    id: "human-news-6",
    label: "human",
    category: "human-news",
    description: "Science journalism about bird migration",
    text: `The bar-tailed godwit holds a record that seems physiologically impossible: in October 2022, a tagged individual flew 13,560 kilometers from Alaska to Tasmania without stopping. Eleven days of continuous flight over open ocean with no food, no water, no rest. When researchers first proposed these distances based on satellite tracking data in the early 2000s, the ornithological community was skeptical. Birds simply couldn't do that — their fuel reserves, calculated from body mass at departure, shouldn't be sufficient. It took years of study to understand the trick: before migration, godwits undergo a radical internal remodeling. Their digestive organs shrink by up to 25%, effectively metabolizing their own intestines to make room for the fat deposits that fuel the flight. Their hearts and flight muscles enlarge. They become, for a brief period, a fundamentally different machine than the bird that spent the summer probing mudflats for worms. After landing, everything regenerates. They eat voraciously, rebuild their guts, and spend the southern summer looking like perfectly ordinary shorebirds, giving no outward indication of the extraordinary thing their bodies just accomplished.`,
  },

  // ── Human Academic Writing ─────────────────────────────────
  {
    id: "human-academic-2",
    label: "human",
    category: "human-academic",
    description: "Academic writing about bilingualism and cognition",
    text: `The so-called "bilingual advantage" in executive function has been one of the most contested findings in cognitive psychology over the past two decades. The original studies by Bialystok and colleagues (2004, 2006) reported that bilingual individuals outperformed monolinguals on tasks requiring inhibitory control and cognitive flexibility. However, subsequent large-scale replication attempts have yielded inconsistent results. Paap and Greenberg (2013) found no bilingual advantage across 15 indicators of executive function in a sample of 229 participants. de Bruin et al. (2015) raised concerns about publication bias, demonstrating that studies finding a bilingual advantage were significantly more likely to be published than those finding null results. Our own work (Chen & Ramirez, 2023) suggests that the discrepant findings may partly reflect the heterogeneity of what "bilingualism" means across studies — variables such as age of acquisition, relative proficiency, frequency of language switching, and the sociolinguistic context of language use are rarely controlled for systematically. We argue that moving beyond the binary bilingual/monolingual comparison toward continuous measures of language experience may resolve some of these contradictions.`,
  },
  {
    id: "human-academic-3",
    label: "human",
    category: "human-academic",
    description: "Academic writing about soil microbiology methodology",
    text: `A persistent methodological challenge in soil microbial ecology is the disconnect between culture-based and molecular approaches to characterizing community composition. Traditional plate-counting methods capture only an estimated 0.1-1% of soil microorganisms (Amann et al., 1995), a phenomenon referred to as the "great plate count anomaly." While 16S rRNA amplicon sequencing has dramatically expanded our ability to detect unculturable taxa, it introduces its own biases through primer selection, PCR amplification efficiency, and the somewhat arbitrary thresholds used to define operational taxonomic units. In this study, we compared community profiles generated by three approaches — culture-dependent isolation, 16S amplicon sequencing, and shotgun metagenomics — applied to the same set of 48 soil samples from a long-term agricultural experiment. Results confirm that each method captures a partially overlapping but distinct subset of the microbial community. Notably, we identified 12 genera that were consistently detected by culture methods but underrepresented in amplicon data, likely due to primer mismatches in the V4 region. These findings reinforce the argument that no single method provides a complete picture of soil microbial diversity, and that methodological pluralism remains essential.`,
  },
  {
    id: "human-academic-4",
    label: "human",
    category: "human-academic",
    description: "Academic writing about urban sociology and gentrification",
    text: `The gentrification literature has undergone a significant theoretical shift in recent years, moving from models that emphasize individual consumer preferences (Ley, 1986) toward structural analyses that foreground the role of capital flows, policy decisions, and institutional actors (Smith, 1996; Hackworth, 2002). Yet empirical studies continue to rely heavily on proxy measures — changes in median household income, educational attainment, and housing values — that capture outcomes but tell us little about mechanisms. Our three-year ethnographic study of the Riverside neighborhood in a mid-sized Midwestern city attempts to address this gap. Through 87 semi-structured interviews with long-term residents, newcomers, business owners, and city officials, we trace the specific sequences of events and decisions that transformed a predominantly working-class Black neighborhood into a destination for young professionals. What we found challenges simple narratives of displacement. Many long-term residents were not physically displaced but described a process of "cultural displacement" — a sense of no longer belonging in a place that remained technically available to them. Mrs. Johnson, a 68-year-old retiree who has lived on the same block since 1979, put it plainly: "I can still afford my house. I just don't recognize my neighborhood."`,
  },
  {
    id: "human-academic-5",
    label: "human",
    category: "human-academic",
    description: "Academic writing about machine learning limitations",
    text: `Despite remarkable progress in benchmark performance, contemporary deep learning systems exhibit failure modes that reveal fundamental limitations in their capacity for generalization. The most well-documented of these is the problem of shortcut learning (Geirhos et al., 2020), wherein models exploit superficial statistical regularities in training data rather than learning the intended task-relevant features. A model trained to classify X-ray images as COVID-positive, for instance, may learn to rely on the presence of hospital-specific text overlays or patient positioning artifacts rather than actual pathological features (DeGrave et al., 2021). This finding is not merely academic — it has direct implications for the deployment of AI systems in high-stakes domains. We demonstrate this concretely through a systematic evaluation of four widely used chest X-ray classifiers, showing that performance degrades by 15-31% when models are tested on data from hospitals not represented in their training sets, despite controlling for pathology distribution. The degradation is not random: it correlates strongly with hospital-specific imaging protocols, suggesting that the models have indeed learned to exploit institutional signatures. These results argue for mandatory out-of-distribution evaluation protocols before clinical deployment and, more broadly, for greater epistemic humility about what benchmark performance actually demonstrates.`,
  },
  {
    id: "human-academic-6",
    label: "human",
    category: "human-academic",
    description: "Academic writing about sleep and memory consolidation",
    text: `The role of sleep in memory consolidation has been extensively studied, yet the relative contributions of different sleep stages remain a subject of active debate. The dual-process hypothesis (Diekelmann & Born, 2010) proposes that slow-wave sleep (SWS) preferentially consolidates declarative memories while rapid eye movement (REM) sleep supports procedural and emotional memory processing. Our study employed a within-subjects design (N=42) with targeted memory reactivation during specific sleep stages, using EEG-triggered auditory cues associated with previously learned word pairs. Contrary to the strict dual-process account, we observed significant declarative memory enhancement when cues were presented during both SWS and N2 sleep, with no significant difference between the two stages (t(41) = 0.87, p = .39). REM-stage cueing did not produce reliable declarative enhancement but, unexpectedly, was associated with increased false memory intrusions on a DRM-paradigm variant administered the following morning. We interpret these findings as consistent with the active systems consolidation framework (Born & Wilhelm, 2012) rather than a strict stage-specific model, while noting that our sample was limited to healthy young adults and may not generalize to older populations where sleep architecture differs substantially.`,
  },

  // ── Human Blogs ────────────────────────────────────────────
  {
    id: "human-blog-1",
    label: "human",
    category: "human-blog",
    description: "Personal blog about living alone for the first time",
    text: `Living alone for the first time at 28 and the things nobody warned me about: the silence is louder than you'd think. Not in a spooky way just in a... there's nobody to narrate your life to kind of way. I made an incredible pasta the other night and had literally no one to tell about it in real time. I considered texting a photo to my mom then realized that's exactly what my mom does that I've always found annoying. I'm becoming my mother. The other thing: decisions are both easier and harder. There's nobody to argue with about what to watch or eat, which is great. But there's also nobody to blame when you watch four hours of reality TV instead of doing laundry. That's all you. The fridge is the most honest mirror you'll ever own. There's nobody else's groceries to hide behind — it's just your sad collection of condiments, one wilting bag of spinach, and leftover Thai food from a concerning number of days ago. But honestly? I'm starting to love it. There's something quietly powerful about building a life that's entirely yours. Even if that life includes talking to your plants because they're the only other living things in the apartment.`,
  },
  {
    id: "human-blog-2",
    label: "human",
    category: "human-blog",
    description: "Personal blog about becoming a parent and losing identity",
    text: `Here's the thing about becoming a parent that the baby books don't cover: you grieve your old self. Not all at once, and not in any way that's socially acceptable to express (because you're supposed to be grateful and overjoyed and fulfilled, and you ARE, but also). I used to be a person who went to concerts on weekdays. Who read entire books in a single sitting. Who could accept a spontaneous dinner invitation without consulting a spreadsheet of childcare logistics. That person didn't die exactly but she went into a kind of hibernation, and some days I miss her with an intensity that makes me feel guilty. The guilt is the worst part actually. Because how do you say "I love my child more than anything in the universe AND I also miss the version of me that didn't have a child" without sounding like a monster? You don't. So you don't say it. Until you're at a playground and another parent says it first and you both stand there with your lukewarm coffees feeling seen for the first time in months.`,
  },
  {
    id: "human-blog-3",
    label: "human",
    category: "human-blog",
    description: "Personal blog about running a first marathon",
    text: `Ran my first marathon on Sunday and I need to process this publicly because my family is tired of hearing about it. The first 20 miles were honestly great. I felt strong, hit my pacing targets, high-fived some kids on the sideline. Very main character energy. Miles 20 through 23 is where the wheels started coming off. My legs went from "working normally" to "filled with wet concrete" in about a quarter mile. I started doing math in my head about whether I could just walk the rest and still beat the cutoff time. The math wasn't great. Mile 24 I saw my wife and nearly cried. She yelled "you look great!" which was objectively false — I've seen the photos, I looked like a reanimated corpse. Mile 26: a stranger handed me a orange slice and I genuinely think it was the best thing I've ever tasted in my life. I finished in 4:47:12. Not fast by any real runner's standards but I DON'T CARE because I finished and nothing else about my personality matters anymore. I am now a marathon runner. That is my entire identity. Sorry to everyone who has to interact with me for the next six months.`,
  },
  {
    id: "human-blog-4",
    label: "human",
    category: "human-blog",
    description: "Personal blog about dealing with imposter syndrome",
    text: `Got promoted to senior engineer last month and my immediate thought was "they're going to figure out I'm a fraud." Classic imposter syndrome, the kind therapists love to explain with nice diagrams, and knowing what it is doesn't make it go away even slightly. Here's what's wild: I have eight years of experience. I've shipped features used by millions of people. I literally mentored the person who now sits next to me. And yet some part of my brain is absolutely convinced that I've somehow fooled everyone and the reckoning is imminent. The worst trigger is meetings where I don't understand something immediately. Every senior person in the room seems to just GET it and I'm sitting there like "hmm yes interesting" while frantically trying to parse what was just said. What I've learned (from talking to basically everyone I trust about this): they're all doing the same thing. Every single one. My manager told me he felt like a fraud his first year as a director and "it kind of never goes away, you just get better at functioning through it." Cool cool cool, very reassuring, thanks for that.`,
  },
  {
    id: "human-blog-5",
    label: "human",
    category: "human-blog",
    description: "Personal blog about grief and baking",
    text: `My dad died in October and I've been baking bread every Sunday since. Not because I'm processing my feelings in some beautifully symbolic way — I'm not that insightful. It just started because I needed something to do with my hands on Sundays, which is when we used to call each other, and baking requires enough attention that your brain can't fully spiral. The thing about bread is you have to wait. You mix, you knead, you wait. You shape, you wait again. There's no rushing it. The yeast doesn't care about your schedule or your grief or anything else. It just does its slow invisible work and eventually you have something warm and real that you can hold and share. Some Sundays the bread turns out great. Some Sundays it's a dense brick. My dad would have eaten it either way. He was like that about everything I made — always enthusiastic, always asking for seconds, even when we both knew it wasn't great. I miss him on Sundays. I miss him on other days too but Sundays are the sharpest. The bread helps. I can't explain exactly how. It just does.`,
  },

  // ── Human Product/Service Reviews ──────────────────────────
  {
    id: "human-review-2",
    label: "human",
    category: "human-review",
    description: "Yelp restaurant review with personality",
    text: `OK so this place has been hyped up on every food blog in the city and I went in prepared to be underwhelmed and... I wasn't. The brisket was incredible. Like fall-apart, smoky, don't-need-sauce-but-the-sauce-is-also-great incredible. The mac and cheese had actual flavor instead of just being "cheese on noodles" which is what most bbq place mac is. And the cornbread had honey butter on it which should be standard everywhere. HOWEVER. The sides are à la carte and by the time you add a meat, two sides, and a drink you're looking at $35 per person which is a lot for what is essentially fancy cafeteria food. Also the wait was 45 minutes on a Tuesday at 5:30pm. TUESDAY. I don't want to eat dinner at 4pm like a retiree but I also don't want to stand outside for 45 minutes like it's a nightclub. No reservations either. So: amazing food, annoying logistics, bring your patience and your wallet.`,
  },
  {
    id: "human-review-3",
    label: "human",
    category: "human-review",
    description: "Amazon review of a mattress with real frustration",
    text: `Bought this mattress based on the 4.5 star rating and roughly 10,000 reviews saying it changed their life. Maybe I got a defective one because this thing is like sleeping on a cloud that hates you. The first week was fine — that "break-in period" they warn about. But by week three a body-shaped crater had formed exactly where I sleep. I'm 165 lbs, not a dump truck. The edge support is nonexistent — sit on the side of the bed and you'll slowly slide onto the floor like a very tired glacier. The motion transfer thing they claim? Complete marketing fiction. My wife rolls over and I feel it in my TEETH. Now here's why I'm giving it 2 stars instead of 1: the return process was actually easy, I'll give them that. Free pickup, full refund, no hassle. So the company itself isn't terrible, the product is just not what they claim it is. Going to an actual mattress store next time where I can lie on the thing for more than zero seconds before buying.`,
  },
  {
    id: "human-review-4",
    label: "human",
    category: "human-review",
    description: "Google Maps review of a mechanic shop",
    text: `I've been going to Tony's for three years and he's saved me from getting ripped off at the dealership more times than I can count. Last month I took my car to the dealer for a weird noise — they quoted me $2,400 for a "complete brake system overhaul." Took it to Tony, he looked at it for 10 minutes and said one of my brake pad clips was loose. He fixed it for free. FREE. The man literally refused my money. He said "I'm not going to charge you for something that took me 30 seconds." Find me a dealership that would do that. The only reason this isn't 5 stars is the wait times can be brutal because (understandably) everyone in the neighborhood goes here. Last time I dropped my car off at 8am and it wasn't ready until 5pm for what was supposed to be a 2-hour job. But honestly? For the money I save and the peace of mind that he's not inventing problems, the wait is worth it. Tony, if you're reading this, please never retire.`,
  },
  {
    id: "human-review-5",
    label: "human",
    category: "human-review",
    description: "App store review of a meditation app",
    text: `Downloaded this because my therapist recommended meditation and I can't sit in silence without my brain turning into a conspiracy theory generator. The guided sessions are genuinely good — the voice is calming without being patronizing, which is harder to get right than you'd think. I've used three other meditation apps and they all made me feel like I was being talked to by a sentient candle. This one talks to you like a normal human who happens to be calm. The free tier is limited but reasonable, and the annual subscription isn't outrageous compared to competitors. What I don't love: the "streaks" and gamification stuff. I'm trying to achieve inner peace, I don't need a push notification at 9pm shaming me for breaking my streak. Also the social features (sharing your meditation stats??) feel antithetical to the whole concept. But you can turn all that off. Been using it nightly for 2 months and I genuinely fall asleep faster. Could be placebo. Don't care. 4 stars.`,
  },
  {
    id: "human-review-6",
    label: "human",
    category: "human-review",
    description: "Review of a coworking space",
    text: `Switched from working from home to this coworking space 6 months ago and it's been a mixed bag. The good: the internet is blazing fast (ran a speed test, 800mbps down), the coffee is unlimited and actually decent, and there's a good variety of workspaces from quiet library-style areas to more social open sections. The mid: it's a little too "startup culture" for my taste. There are motivational quotes on every wall and the event calendar is packed with things like "Network & Chill" and "Fireside Chat with a Thought Leader." I'm just here to answer emails, not find my purpose. The bad: it costs $350/month for a hot desk which, when you actually do the math, comes out to about $17/day if you come every weekday. That's a $17 cover charge to use wifi and sit in a chair. I could do that at a coffee shop for the price of a latte. Still renewing my membership though because it turns out my productivity doubles when I can't do laundry between meetings. My apartment is too full of temptation.`,
  },

  // ── Human Emails ───────────────────────────────────────────
  {
    id: "human-email-1",
    label: "human",
    category: "human-email",
    description: "Casual email to a friend about weekend plans",
    text: `Hey!! So change of plans for Saturday — Jake can't make it because he's got some work thing (on a SATURDAY, his job is insane) so it'll just be us four. I was thinking instead of the movie we could do that escape room on Pine Street? They have a new horror themed one that's supposed to be really hard. Sarah would probably love it, you know how she is with puzzles. OR if that's too intense we could just do dinner somewhere. I really want to try that new Thai place by the library but apparently you need reservations like a week out which seems excessive for a restaurant that's been open for three weeks but whatever. Lmk what you think!! Also do you still have my blue jacket from last time? I can't find it anywhere and it's literally the only warm jacket I own. No rush just whenever.`,
  },
  {
    id: "human-email-2",
    label: "human",
    category: "human-email",
    description: "Professional but slightly frustrated email about a deadline",
    text: `Hi Marcus,

Thanks for the update on the Henderson project. I want to make sure I'm reading this correctly — the new timeline has us delivering the final report by March 3, which is two weeks earlier than what we originally agreed to in the SOW. I just want to flag that this is going to be tight for us, especially since we're still waiting on the data from your analytics team (I believe Rachel said it would be ready by the 15th?).

I don't want to be the person who always pushes back on timelines, but I also don't want to commit to something and then deliver subpar work. Can we get on a quick call tomorrow to talk through what's actually feasible? I've got 2-4pm open.

If the March 3 date is truly immovable, we can make it work, but I'd want to pare down the scope of the competitive analysis section. Let me know.

Thanks,
Priya`,
  },
  {
    id: "human-email-3",
    label: "human",
    category: "human-email",
    description: "Email to apartment neighbors about noise",
    text: `Hi neighbors (units 4A through 4D),

I'm the person in 4B and I really hate being "that neighbor" but I wanted to bring something up before it becomes a bigger issue. Over the past few weeks there's been pretty loud music coming from the hallway end of the floor (I'm honestly not sure which unit) late on weeknights, usually starting around 11pm. I totally get that we all have different schedules and I'm not trying to be the noise police but I've got to be at work by 7 and it's been rough.

If this is you, could we maybe do headphones after 10? Or if you're having people over, a heads up would be great so I can plan around it. I'm really not trying to start conflict — I just moved in and I want to get along with everyone. Also if you ever need anything from me (mail pickup while you're away, whatever) happy to help.

Thanks!
Mike (4B)`,
  },
  {
    id: "human-email-4",
    label: "human",
    category: "human-email",
    description: "Email to a professor asking for deadline extension",
    text: `Dear Professor Navarro,

I'm writing to ask if it would be possible to get a short extension on the midterm paper due this Friday. I know the syllabus says no extensions but I wanted to at least explain the situation. My grandmother passed away on Monday and I had to fly home to El Paso for the funeral on short notice. I just got back today and I'm trying to catch up on everything I missed. I have about half the paper written from before I left and I'm confident I can finish a quality draft by Sunday evening if you'd allow it.

I have the boarding passes and a copy of the obituary if you need documentation — I know some professors require that and I completely understand.

I'm sorry for the late notice and I appreciate any flexibility you can offer. If the answer is no, I understand and I'll do my best to turn in what I have by Friday.

Thank you,
Daniela Reyes
Section 003`,
  },
  {
    id: "human-email-5",
    label: "human",
    category: "human-email",
    description: "Email negotiating a freelance rate",
    text: `Hey Chris,

Thanks for thinking of me for the website redesign project — it sounds like a really interesting gig and I'd love to be involved. I do want to be upfront about the budget though. The $2,000 flat rate for the full site (8 pages, custom animations, CMS integration, and responsive design) is unfortunately below what I can do for that scope of work. For reference, my typical rate for a project like this would be in the $5,000-$6,000 range.

That said, I'd really like to make this work if we can find a middle ground. A few options:

1. We keep the budget at $2K but reduce scope — maybe 4 core pages with a simpler template-based design, no custom animations
2. We do the full scope at $4,500 (I'm giving you a friend-of-a-friend discount here, please don't tell my other clients lol)
3. Phase it — I do the core pages now at $2K and we tackle the rest in Q2

Let me know what works on your end. Happy to jump on a call if that's easier.

Best,
Jamie`,
  },

  // ── Human Creative Writing ─────────────────────────────────
  {
    id: "human-creative-2",
    label: "human",
    category: "human-creative",
    description: "Human flash fiction about a bus ride",
    text: `The old man on the bus was holding a birthday cake. Not in a box — just the cake, on a plate, balanced on his knees. It was yellow with white frosting and it said HAPPY BIRTHDAY RUTH in slightly crooked blue letters. Every time the bus lurched he steadied it with both hands, the way you'd steady a child learning to walk. Nobody asked him about it because this was the 47 bus and you didn't ask people things on the 47. But I watched him carry it off at Maple Street, walking very carefully up the sidewalk toward a brick apartment building. He pressed a buzzer with his elbow. Waited. Pressed again. The door didn't open. He stood there for a long time, the cake balanced perfectly, the afternoon light making the frosting glow. Then he set the cake gently on the front step and walked away. I think about it sometimes. I think about Ruth.`,
  },
  {
    id: "human-creative-3",
    label: "human",
    category: "human-creative",
    description: "Human poem about insomnia",
    text: `3 AM and the house makes its sounds —
the fridge compressor humming its one note,
the click of baseboard heaters expanding,
a branch on the bedroom window
like someone trying to get in
or trying to get out.

I've counted sheep and they've unionized,
demanding better working conditions.
I've done the breathing exercises, the body scans,
imagined myself on a beach which only made me
need to pee.

My mind is a browser with forty tabs open.
Did I lock the car? What's the capital of Burkina Faso?
That thing I said to my boss in 2017 —
was that weird? It was weird.

Tomorrow I'll be useless,
running on caffeine and the peculiar energy
of someone who's been awake long enough
to find everything slightly hilarious.
But for now it's just me and the ceiling
and the sound of the house breathing
like a large, indifferent animal
that has no trouble sleeping at all.`,
  },
  {
    id: "human-creative-4",
    label: "human",
    category: "human-creative",
    description: "Human memoir excerpt about a childhood kitchen",
    text: `Our kitchen had orange countertops — that specific burnt orange that existed only in the 1970s and should probably stay there. My mother loved them. She loved everything about that kitchen, which was small enough that two people cooking at the same time required the kind of choreography usually reserved for figure skating. My father would reach over her to get the paprika and she'd duck under his arm to check the oven and somehow nobody ever collided. They'd been married thirty years and their bodies knew each other's geography the way your hand knows the light switch in the dark. I didn't appreciate any of this at the time. I was thirteen and the orange countertops embarrassed me because Megan Calloway's house had granite and Megan Calloway was the metric by which I measured everything. Now I'm forty-one and those countertops are gone — my parents sold the house six years ago — and I would give a frankly unreasonable amount of money to sit at that ugly orange counter one more time and watch my parents not bump into each other.`,
  },
  {
    id: "human-creative-5",
    label: "human",
    category: "human-creative",
    description: "Human short story opening about a diner",
    text: `Waffle House at 2 AM is a liminal space and I will not be taking questions. You walk in and the fluorescent lights hit you like a confession — everything is visible, nothing is hidden. The man in booth three has been crying into his hash browns for twenty minutes. The couple in the corner are either falling in love or breaking up; it's impossible to tell and they might not know either. The cook, whose name tag says DARYL, has the energy of someone who has seen things that cannot be unseen and has made his peace with all of them. Daryl and I have an understanding. I come in every Thursday after my night shift at the hospital, I order the same thing (scattered, smothered, covered, chunked), and he makes it without me having to say the words. In exchange, I never ask Daryl about his life and he never asks about mine. It's the most honest relationship I've ever been in.`,
  },
  {
    id: "human-creative-6",
    label: "human",
    category: "human-creative",
    description: "Human personal essay about learning to swim as an adult",
    text: `I learned to swim at thirty-four, which is its own kind of humiliation. I stood in the shallow end of the community pool in a swim cap and goggles, surrounded by six-year-olds who moved through the water like small confident dolphins, and I couldn't put my face in. The instructor, a college kid named Tyler who had clearly never considered that an adult might not know how to swim, kept saying "just relax and float" as if relaxation were possible when your entire body is convinced it's about to die. Water is not my element. My element is land, specifically a couch, specifically my couch, with a blanket. But I'd signed up because my daughter asked me to come to her pool party and I couldn't keep saying no. Seven weeks of lessons. I swallowed approximately half the pool. My ears were perpetually waterlogged. I did the dead man's float on week four and Tyler literally applauded, which was both encouraging and devastating. But on the last day of lessons, I swam the width of the pool. Not gracefully — I looked like a panicking starfish. But I crossed it. The six-year-olds didn't clap. They didn't even notice. But I noticed. Some things you do entirely for yourself and that has to be enough.`,
  },

  // ── Human ESL (Non-Native English) Samples ─────────────────
  {
    id: "human-esl-1",
    label: "human",
    category: "human-esl",
    description: "Non-native English speaker writing about university life",
    text: `When I first came to study in United States, everything is so different from my expectation. In Korea, university student study very hard, maybe 12 hours every day in library. Here the students are more relaxed I think. They go to party, they join many clubs, they do many activity outside of class. At first I think they are not serious about study, but then I realize they are learning different things — how to talk to people, how to work in team, how to manage many responsibility at same time. My English was not so good when I arrive (it is still not perfect, I know) and making friend was very difficult. American student are friendly but the conversation move so fast and they use many slang I don't understand. My roommate help me a lot — she explain thing patiently and never make me feel embarrass about my English. Now after one year I feel more comfortable but I still sometimes can't find the right word and it is frustrating because in Korean I can express exactly what I mean.`,
  },
  {
    id: "human-esl-2",
    label: "human",
    category: "human-esl",
    description: "Non-native English speaker writing a product complaint",
    text: `Hello, I am writing because I have problem with the washing machine I buy from your store three week ago. When I put the clothes inside and start the washing, it make very loud noise like something is broken inside. My husband say maybe we install it wrong but we follow all the instruction in the manual exactly. Also the water not drain complete after the cycle finish, always some water stay in the bottom. I try to call your customer service number but I wait for 40 minute and nobody answer, then the call disconnect. This is very frustrating for me because this machine cost a lot of money and I expect better quality. Can someone please come to look at it? I am available Monday through Wednesday any time. My address is in the purchase record. Also I want to know if this problem is cover by the warranty because if I have to pay more money for repair I am not happy about this. Thank you for your time.`,
  },
  {
    id: "human-esl-3",
    label: "human",
    category: "human-esl",
    description: "Non-native English speaker writing about cultural adjustment",
    text: `The most difficult thing about living in Canada is not the cold (although the cold is really terrible, minus 30 degree is something I never imagine before moving from Brazil). The most difficult thing is the small talk. In Brazil, when you meet someone, you hug them, you ask about their family, you have real conversation. Here people say "how are you?" but they don't actually want to know how you are. If you start to really tell them, they look uncomfortable and try to leave. I learn this the hard way when my colleague ask me how is my weekend and I tell her honestly about my grandmother being sick and how I am worry about her, and she just say "oh that's tough" and walk away. I'm not angry with her because I understand now it's just cultural difference. But sometimes I feel lonely even when I am surround by people because the connection is on the surface only. My Brazilian friend here call it "smiling loneliness" — everybody is polite, everybody is nice, but nobody really know each other.`,
  },
  {
    id: "human-esl-4",
    label: "human",
    category: "human-esl",
    description: "Non-native English speaker writing a restaurant review",
    text: `I go to this restaurant with my family last Saturday for my wife birthday. The place is very beautiful, nice decoration and candle on the table. The waiter was professional and recommend us the special menu which include appetizer, main dish, and dessert. The food was good quality — the steak cooked perfectly how I ask and the fish my wife order was fresh and tasty. But I have to say the portion is very small for the price. In my country (Turkey) when you pay this much money for dinner, you get big plate with lots of food. Here the plate is big but the food is small and put in the middle with some sauce decoration around. My children still hungry after and we have to stop at McDonald on the way home which is a little bit embarrass. Also one more complaint — they add 20% tip automatic to the bill which I think should be my decision not theirs. Overall the taste is good but the value for money is not so great in my opinion.`,
  },
  {
    id: "human-esl-5",
    label: "human",
    category: "human-esl",
    description: "Non-native English speaker writing about learning to drive",
    text: `Getting the driving licence in Australia was one of most stressful experience of my life. In Japan we drive on left side too so that part is okay, but everything else is different. The road is so wide here and people drive very fast on the highway — 110 km/h feel like flying to me because in Tokyo I never drive more than 40 because of the traffic. My driving teacher is a nice old man name Kevin who keep telling me to "relax your shoulders" which is impossible when you are controlling a metal box at 100 km per hour with other metal boxes all around you. The worst part was the parking. In Japan the parking space is very small but I am good at it because I practice every day. Here the space is huge but for some reason I keep going crooked. Kevin say "you're overthinking it" which is definitely true about everything in my life not just parking. I fail the test first time because I forget to check my mirror when change lane. Pass second time with only one small mistake. Now I drive every day and actually enjoy it. Kevin would be proud I think. My shoulders are still not relax though.`,
  },

  // ── Additional Human Reddit Posts ──────────────────────────
  {
    id: "human-reddit-8",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about a job interview disaster",
    text: `Had the worst job interview of my life today and I need to tell someone. It was a video call and I was fully prepared — practiced answers, researched the company, nice shirt, the whole deal. What I forgot to account for was my cat. Thirty seconds into "tell me about yourself," my cat jumped onto my desk, knocked my water directly into my keyboard, and then sat on the laptop FACING THE CAMERA like she was the one being interviewed. The keyboard shorted out immediately so I couldn't type in the chat to explain. I grabbed my phone to email them but by the time I reconnected the interviewer had already moved on to the next candidate. The recruiter was nice about it and offered to reschedule but honestly I'm so embarrassed I kind of want to move to another state and start over with a new identity. The cat is not sorry. She is currently napping on the very keyboard she destroyed, zero remorse, as cats do.`,
  },
  {
    id: "human-reddit-9",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about an unexpected friendship",
    text: `My 78-year-old neighbor and I (27M) have become genuinely close friends and I think it's the most unlikely friendship of my life. It started because his wifi stopped working and his grandkids live too far to help, so I went over to fix it. Took me 5 minutes (it was unplugged). He insisted on paying me with homemade cookies and then asked if I wanted to see his workshop. Guys. This man builds ship models. Not the snap-together kit kind — full handcrafted wooden ships with actual rigging. He's been doing it for 40 years and his basement looks like a tiny maritime museum. Now I go over every Sunday and we work on a model together. He teaches me woodworking, I help him set up video calls with his family. We watch football. He tells me stories about his time in the Navy that are probably 60% exaggerated but 100% entertaining. Last week he called me his "best young friend" and I honestly got choked up. Sometimes the best relationships in your life are the ones you never planned for.`,
  },
  {
    id: "human-reddit-10",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about returning to college as an older student",
    text: `Started community college at 34 and I feel like a time traveler. The kids in my classes were born the year I graduated high school. They have cultural references I don't understand, use slang that sounds like a different language, and move through the world with a confidence that I'm simultaneously jealous of and baffled by. But here's the thing: I'm actually a much better student now than I was at 18. I do the reading. I go to office hours. I ask questions without worrying about looking dumb because buddy I already look like the oldest person in the room, that ship has sailed. I got a 96 on my first English paper and I texted my mom about it like I was 12 years old. She framed it, which is both sweet and unnecessary. The hardest part isn't the coursework — it's the logistics. Working full time, going to class at night, homework on weekends, trying to maintain a relationship with a partner who I basically see on Tuesday mornings. But every time I think about quitting I remember that I've been saying "I should go back to school" for 15 years and I'm finally actually doing it.`,
  },

  // ── Additional Human Twitter Threads ───────────────────────
  {
    id: "human-twitter-7",
    label: "human",
    category: "human-twitter",
    description: "Twitter thread about public transit observations",
    text: `Daily commute observations, a thread: The same woman gets on at my stop every morning carrying an absolutely enormous tote bag and a small cactus. Different cactus each time. Where is she taking them. Who are they for. I've been watching this for three months and I have so many questions. There's a couple that always gets on at Broadway and they are clearly in the early stages of dating because they can't stop touching each other's arms while talking. Give it six months and they'll be on opposite ends of the train staring at their phones like the rest of us married people. The bus driver on the 7:45 route says good morning to EVERY SINGLE PERSON who boards. Every one. In a city where making eye contact with a stranger is basically a declaration of war, this man chooses joy. I don't know his name but he's keeping me from becoming a complete misanthrope.`,
  },
  {
    id: "human-twitter-8",
    label: "human",
    category: "human-twitter",
    description: "Twitter thread about the reality of working from home with kids",
    text: `Working from home with a toddler is just you on mute during a zoom call while a tiny person screams about a banana being broken. The banana is broken because she bit it. She broke the banana and is now furious at the banana for being broken. This is my 2pm meeting. My 3pm meeting was interrupted by "MAMA LOOK A BUG" at a volume suggesting the bug was at least horse-sized. It was an ant. A single ant. I had to negotiate a peace treaty between my child and this ant while my boss waited for my Q3 projections. We released the ant outside with full diplomatic honors. By 4pm I'd attended three meetings, answered zero emails, built a blanket fort (mandatory), cleaned up orange juice from the couch, and somehow still had to do a full day's work after bedtime. The company keeps saying they "support work-life balance" and I would love to know what they think that looks like because THIS AIN'T IT.`,
  },

  // ── Additional Human Journalism ────────────────────────────
  {
    id: "human-news-7",
    label: "human",
    category: "human-news",
    description: "Feature journalism about a rural hospital closing",
    text: `The day River County Memorial Hospital closed its doors for the last time, Nurse Practitioner Donna Kelley drove 47 miles to the nearest emergency room just to see how long it would take. Forty-seven minutes in good conditions. An hour fifteen in the rain or snow. "For a heart attack, that's the difference between living and dying," she said, pulling into the hospital parking lot and cutting the engine. "People are going to die because of this." River County Memorial was the last hospital in a 3,000 square mile rural area. It had been operating in the red for a decade, kept alive by a combination of Medicare reimbursements that didn't cover costs, a dwindling population of insured patients, and the sheer stubbornness of its 84-person staff, many of whom hadn't received raises in three years. When the parent health system announced the closure in January, citing losses of $2.4 million annually, there were protests. The county board passed a resolution opposing it. A GoFundMe raised $127,000, a figure that seemed impressive until you divided it by $2.4 million. The hospital closed anyway, on a Wednesday in March, and Donna Kelley was the last person to leave the building.`,
  },
  {
    id: "human-news-8",
    label: "human",
    category: "human-news",
    description: "Profile journalism about an immigrant small business owner",
    text: `Yun-Mi Park opens the door to her dry cleaning shop at 5:30 every morning, an hour before her first customer will arrive, because that hour belongs to her. She makes tea. She eats a rice cake wrapped in seaweed that she prepares the night before. She reads the Korean-language newspaper on her phone. Then she turns on the machines and the day begins. She's been doing this for twenty-three years, ever since she and her husband borrowed $40,000 from a cousin and took over a failing cleaner on Route 9. Her husband died seven years ago — stomach cancer, fast and merciless — and for a while she considered selling. But the shop was the thing they'd built together, the tangible proof that the terrifying decision to leave Busan in 1997 with a five-year-old and a suitcase had been worth something. So she stayed. She hired help. She learned the bookkeeping her husband had always handled. Her daughter, the five-year-old who is now a physician at Johns Hopkins, sends money that Yun-Mi quietly puts into a college fund for her granddaughter without telling anyone.`,
  },

  // ── Additional Human Blog Posts ────────────────────────────
  {
    id: "human-blog-6",
    label: "human",
    category: "human-blog",
    description: "Personal blog about leaving a toxic friendship",
    text: `I ended a 15-year friendship last month and I'm writing about it here because I can't talk to anyone in our mutual friend group without it becoming a Thing. The short version: she got increasingly controlling over the past few years — monitoring who I spent time with, making passive-aggressive comments when I couldn't attend her events, and the final straw was finding out she'd been telling other friends that my marriage was in trouble (it isn't). The long version would take a book. But what I want to say is this: the grief of ending a friendship is wildly underestimated. There are no greeting cards for it. No culturally recognized mourning period. Nobody sends flowers. You're just expected to be fine because it's "just a friendship" as if fifteen years of someone knowing you — really knowing you, the embarrassing stuff, the fears you never told anyone else — doesn't create a bond that hurts when it breaks. I keep catching myself wanting to text her when something funny happens. The muscle memory of that friendship is still in my fingers.`,
  },
  {
    id: "human-blog-7",
    label: "human",
    category: "human-blog",
    description: "Tech blog about a production outage post-mortem",
    text: `Our production database went down for 4 hours on a Friday afternoon (because of course it did) and I want to write up what happened because I think the chain of failures is instructive. The root cause was a migration script that was supposed to add an index to a 200M row table. In staging it ran fine because staging had 50k rows. In production it locked the table for writes, which caused a queue to build up in the connection pool, which caused the application servers to run out of connections, which caused health checks to fail, which caused the load balancer to mark every instance as unhealthy, which caused the auto-scaler to spin up new instances that also couldn't get connections, which caused us to hit our AWS instance limit. Beautiful cascade, really. Almost elegant in how each safety mechanism made things worse. The fix was embarrassingly simple: kill the migration, restart the database, let the connection pools recover. Total fix time: 8 minutes. Total time to figure out what was happening: 3 hours and 52 minutes. We've since added a pre-migration check that compares table sizes between staging and prod, and we run large migrations during off-hours with a maintenance window. Lessons are always obvious in retrospect.`,
  },

  // ── Additional Human Reviews ───────────────────────────────
  {
    id: "human-review-7",
    label: "human",
    category: "human-review",
    description: "Airbnb review written with genuine personality",
    text: `Stayed here for a week with my partner and two kids. The listing photos are accurate which honestly puts this place in the top 10% of Airbnbs I've used. The beds were comfortable (my back is the canary in the coal mine for bad mattresses and it was fine), the kitchen was well-equipped (actual sharp knives! a rarity!), and the location was walkable to basically everything we wanted to do. The host was responsive and left a really nice welcome basket with local snacks and a hand-drawn map of the neighborhood with his personal restaurant recommendations. One of them — a tiny ramen place three blocks away — was genuinely life-changing. Minor complaints: the wifi was slow (fine for streaming but video calls were choppy), the upstairs bathroom shower has about 30 seconds of hot water before it goes lukewarm (we adapted by doing navy showers which my kids found hilarious), and the mattress in the kids' room squeaks loudly enough that you can hear it from the living room. Would absolutely stay again.`,
  },
  {
    id: "human-review-8",
    label: "human",
    category: "human-review",
    description: "Course review from a community college student",
    text: `Taking Prof. Chen's Statistics 101 was the first time math actually made sense to me and I'm genuinely upset nobody taught it this way in high school. She starts every concept with a real-world example FIRST, then shows you the math behind it, instead of the other way around. Like when we learned standard deviation she didn't start with the formula — she showed us two basketball players' scoring records and asked "which one is more consistent?" and by the time we got to the actual calculation our brains already understood what the number meant. Her grading is fair but not easy. The homework is genuinely helpful (I know, shocked me too). The final was hard but nothing on it was a surprise if you'd been paying attention. Only complaint is office hours are always packed because everyone loves her, so get there early or you're standing in the hallway. If you have to take stats and you can get into her section, do it. I went from thinking I was "bad at math" to getting an A- and actually understanding what a p-value means, which apparently puts me ahead of some published researchers (her joke, not mine).`,
  },

  // ── Additional Human Creative Writing ──────────────────────
  {
    id: "human-creative-7",
    label: "human",
    category: "human-creative",
    description: "Human micro-fiction about a voicemail",
    text: `My mother left me a voicemail the day she died. Not about dying — she didn't know yet. It was about a bird she'd seen at her feeder. "A painted bunting," she said, her voice bright with the particular excitement she reserved for unexpected beauty. "I looked it up and it's not even supposed to be in this part of the state. He's just sitting there eating sunflower seeds like he owns the place." She laughed. "Anyway, call me back when you get a chance, I want to tell you about something else too." I was in a meeting. I saw the notification and thought: I'll call her tonight. I didn't call her tonight. I didn't call her any night after that. I've listened to that voicemail so many times the phone shows it as my most-played audio file, beating out every song and podcast in my library. I'll never know what the something else was. But I know about the painted bunting, and sometimes that feels like enough and sometimes it doesn't.`,
  },
  {
    id: "human-creative-8",
    label: "human",
    category: "human-creative",
    description: "Human short fiction about a neighborhood",
    text: `The Garcias had the loudest house on the block and everyone pretended to mind but nobody actually did. Saturday mornings it was cumbia from a speaker in the garage, where Mr. Garcia worked on cars that somehow ran despite having no logical reason to. Wednesday evenings it was Mrs. Garcia's cooking class — she taught neighborhood women to make tamales and the whole street smelled like corn husks and chili. Sunday afternoons were the worst (best): the whole extended family came over, kids spilling into the yard, uncles arguing about soccer at a volume that suggested the World Cup was being personally refereed by Mr. Garcia, which honestly he would have been good at since the man had opinions about everything. When they moved away — Mr. Garcia's job transferred him to Houston — the silence on the block was physical. You could feel it in your chest. The Johnsons moved in and they were perfectly nice. Quiet. Kept to themselves. Never a speaker in the garage, never the smell of tamales drifting through the screen door. Perfectly nice, like plain oatmeal is perfectly nice. We missed the Garcias the way you miss weather after moving somewhere that's always 72 degrees.`,
  },

  // ── Additional Human ESL Samples ───────────────────────────
  {
    id: "human-esl-6",
    label: "human",
    category: "human-esl",
    description: "Non-native English speaker writing about homesickness",
    text: `Sometimes in the evening when the sun go down I feel a heavy thing in my chest that I know is missing home. In Nigeria the sunset is different — more orange, more big, the sky turn color like fire. Here in Manchester the sky is usually just grey becoming more grey. I speak to my mother on WhatsApp every day but it is not the same like sitting together. She always ask "are you eating?" and I say yes even when I only eat instant noodle because I am too tired to cook after studying. My flatmate is from Germany and she also miss home so sometimes we cook together — she make German food and I make jollof rice and we share. The jollof rice never taste exactly right because the tomato here is different, more watery, but she always say it is delicious so I think she understand about trying to make home in a place that is not home. Christmas was the most difficult. Everyone here go to their family and the dormitory was almost empty. Just me and two other international student watching film and pretending we are not sad.`,
  },
  {
    id: "human-esl-7",
    label: "human",
    category: "human-esl",
    description: "Non-native English speaker writing about a job experience",
    text: `My first job in America was washing dish at Italian restaurant. The owner name is Giovanni but everyone call him Johnny. He is very loud man, always shouting in the kitchen, but not mean shouting, more like excited shouting because he love food very much. My English was terrible when I start — I know maybe 100 word — and the kitchen is very fast and hot and everyone yell things I don't understand. First week I break maybe 15 plate because I am nervous and the soap make everything slippery. Johnny just wave his hand and say "plates are cheap, don't worry about it." After three month I learn enough English to take order on the phone, which Johnny say is "promotion" even though he don't pay me more money. But he teach me to make pasta sauce from scratch, real Italian way, and he let me eat whatever I want from the kitchen. When I got better job at office, Johnny give me big hug and two jar of his tomato sauce and say "don't forget where you start." I still have one jar. I am save it for special occasion but honestly I think the special occasion is just remembering.`,
  },

  // ── Additional Human Samples for 200+ Coverage ──────────────
  {
    id: "human-reddit-11",
    label: "human",
    category: "human-reddit",
    description: "Reddit post about a neighborhood potluck disaster",
    text: `Our neighborhood had its annual potluck and I'm pretty sure I've accidentally started a feud. I made my grandma's potato salad which has always been a hit and I put it on the table next to another potato salad that was already there. Big mistake. Turns out the other one was made by Judy from two doors down who has apparently won the "best side dish" informal award at this potluck for NINE YEARS running. My potato salad was demolished in 20 minutes. Judy's still had a full serving spoon in it at cleanup. She hasn't spoken to me since. Her husband waved at me yesterday and she pulled his arm down. Over potato salad. I'm simultaneously proud and terrified. My grandma would be thrilled, she always said her recipe could start wars.`,
  },
  {
    id: "human-twitter-9",
    label: "human",
    category: "human-twitter",
    description: "Twitter thread about aging and hobbies",
    text: `Turning 40 this year and my hobbies have evolved in ways that would horrify 20-year-old me. I now have strong opinions about mulch. I voluntarily read the owner's manual for my dishwasher. I got genuinely excited about finding a sale on organizational bins at Target. Spent an entire Saturday reorganizing my garage and described it to my wife as "honestly one of the best days I've had in months" and she didn't even question it because she spent the same Saturday excited about new curtains. We're living our best boring lives and I wouldn't trade it for anything.`,
  },
  {
    id: "human-news-9",
    label: "human",
    category: "human-news",
    description: "Sports journalism with voice and personality",
    text: `In the thirty-seventh minute, with the score still knotted at nil, Alejandra Vega did something that no amount of tactical analysis can fully explain. She received the ball forty yards from goal with her back to the defense, flicked it over the head of the nearest midfielder with her left heel — her weaker foot — spun past two defenders who collided with each other trying to close her down, and struck a shot from twenty-five yards that bent around the goalkeeper's outstretched hand and into the far upper corner of the net. The stadium went quiet for exactly one second, the way a crowd sometimes does when it needs a moment to process what it has seen, and then erupted. Her coach, a man not known for emotional displays, threw his water bottle into the air and forgot to catch it. It landed on the fourth official, who barely noticed.`,
  },
  {
    id: "human-academic-7",
    label: "human",
    category: "human-academic",
    description: "Academic writing about placebo effect in clinical trials",
    text: `The placebo response in clinical trials has proven far more complex than the simple dichotomy of "real" versus "sham" treatment suggests. Our meta-analysis of 312 randomized controlled trials across six therapeutic areas found that placebo response rates have increased significantly over the past three decades, from a pooled mean of 27% in trials from 1990-2000 to 38% in those from 2010-2020 (p < .001). This trend was most pronounced in trials for depression and chronic pain, where placebo response rates now routinely exceed 40%. Several non-mutually-exclusive mechanisms likely contribute: increasing trial duration, expanded inclusion criteria that enroll patients with milder symptoms, enhanced therapeutic contact in modern trial protocols, and the contextual effects of participating in research at well-resourced clinical sites. The practical consequence is that genuinely efficacious interventions may fail to demonstrate superiority over placebo, not because they lack therapeutic value but because the placebo condition has become increasingly therapeutic. We argue that rather than viewing high placebo response as a methodological nuisance, researchers should investigate its mechanisms as a legitimate therapeutic pathway.`,
  },
  {
    id: "human-blog-8",
    label: "human",
    category: "human-blog",
    description: "Personal blog about quitting caffeine",
    text: `Quit coffee three weeks ago and day one through three I was basically a human headache with legs. Day four I fell asleep at my desk at 2pm and my coworker thought I was dead. Day five I seriously considered going back because life without coffee isn't really life, it's just existing. But I stuck with it because my doctor said my blood pressure was "concerning" and I was drinking 6 cups a day which apparently is "a lot" and "please stop that." Week two the headaches went away but were replaced by a bone-deep tiredness that no amount of sleep fixed. I went to bed at 8:30pm like a kindergartner. Week three: something shifted. I started waking up actually alert instead of that zombie state where you need 20 minutes and a cup of coffee before you can form sentences. My sleep is dramatically better. My anxiety is lower, which I didn't expect at all. The hardest part is the ritual — I miss holding a warm mug in the morning and having that little moment of calm. I bought herbal tea but it's not the same. It's like when you want pizza and someone offers you a rice cake. Technically a food. Not the food I want.`,
  },
  {
    id: "human-email-6",
    label: "human",
    category: "human-email",
    description: "Email from a parent to a school about a bullying concern",
    text: `Dear Mrs. Patterson,

I'm reaching out because my son Lucas (5th grade, Ms. Kim's class) has been coming home upset several days this week and I finally got him to tell me what's going on. Apparently a group of boys has been making fun of him at lunch because he reads during recess instead of playing sports. Yesterday one of them took his book and threw it in a puddle. He didn't want me to email you — he's embarrassed and afraid it'll make things worse, which I understand, but as his mom I can't just let it go.

I don't want to make a huge deal out of this if it can be resolved quietly. Lucas doesn't know I'm writing to you and I'd prefer to keep it that way if possible. He's a sensitive kid and the last thing he needs is to feel like his mom is fighting his battles for him. But the book-in-the-puddle thing crossed a line for me.

Is there a time we could talk this week? I'm flexible except Thursday morning.

Thank you,
Sarah Chen`,
  },
  {
    id: "human-creative-9",
    label: "human",
    category: "human-creative",
    description: "Human poem about a grocery store at night",
    text: `The grocery store at midnight is a chapel
for the insomniac and the heartbroken,
the nurse just off the night shift
still smelling of antiseptic and someone else's emergency,
the college kid buying ramen and optimism,
the old man in slippers choosing between
two nearly identical cans of soup
as if the decision mattered,
and maybe it does.

The fluorescent lights forgive everything.
Under them we are all the same shade of tired,
pushing carts with one bad wheel
through aisles that know our secrets:
the ice cream after the breakup,
the pregnancy test hidden under bananas,
the single serving of everything.

The checkout girl says have a nice night
and means it, or doesn't, and either way
we take our bags and go back out
into the dark, fed if not nourished,
alone but not quite lonely,
the automatic doors closing behind us
like a prayer we didn't know we were saying.`,
  },
  {
    id: "human-review-9",
    label: "human",
    category: "human-review",
    description: "Brutally honest review of a self-help book",
    text: `Bought this because the algorithm knows I'm going through a rough patch (thanks for that, targeted advertising, very cool). The first three chapters are genuinely good — there's a section on cognitive reframing that actually made me reconsider some patterns I'd been stuck in for years. But then around chapter four it devolves into the same "manifest your reality" pseudoscience that every other self-help book peddles. You can't think your way out of systemic problems and telling people their negative circumstances are the result of "limited thinking" is not just unhelpful, it's kinda mean? The author's personal story is compelling though — grew up broke, overcame addiction, built a business from nothing — and I wish the book leaned more into that honest vulnerability instead of pivoting to the woo-woo stuff. If you can separate the practical advice from the magical thinking, there's maybe $5 worth of useful content in a $26 book. Could've been a blog post.`,
  },
  {
    id: "human-blog-9",
    label: "human",
    category: "human-blog",
    description: "Personal blog about adopting a shelter cat",
    text: `The shelter said she was "shy" which is cat-volunteer code for "this animal is feral and will destroy your home." I adopted her anyway because she looked at me through the cage with an expression that I can only describe as grudging acceptance, like she'd weighed her options and I was the least bad one. She hid under the bed for the first 72 hours. I put food and water nearby and talked to her in a calm voice like all the websites suggested. On day four she crept out while I was reading on the couch and sat exactly 8 feet away from me, staring. Day six, 6 feet. Day eight, 4 feet. Day twelve she jumped on the couch and sat on the opposite end, aggressively not looking at me. Day seventeen she was on my lap and I didn't move for three hours because my legs went numb but I didn't care because THE CAT WAS ON MY LAP. That was four months ago. She now sleeps on my pillow, screams at me when dinner is late, and has destroyed exactly one pair of headphones. I love her with my entire stupid heart.`,
  },
  {
    id: "human-twitter-10",
    label: "human",
    category: "human-twitter",
    description: "Tweet thread about awkward social encounters",
    text: `The absolute worst social interaction is when you wave back at someone who wasn't waving at you. You just have to commit. Own the wave. Pretend you were stretching. Pretend you see someone behind them. Or do what I did yesterday: maintain eye contact, keep waving, and say "I know you weren't waving at me and I've chosen to wave anyway" which the stranger found either charming or deeply unsettling based on the speed at which they walked away. Related: accidentally saying "you too" when the waiter says "enjoy your meal" is a wound from which I have never fully recovered. It's been 15 years. I still think about it.`,
  },
  {
    id: "human-email-7",
    label: "human",
    category: "human-email",
    description: "Professional email with personality from a small business owner",
    text: `Hi Andrea,

Quick update on the website project: we're about 80% done with the redesign and it's looking really good. The new color palette (the warm terracotta and cream you picked) works way better than I expected — I was skeptical when you showed me the mood board but you were right and I was wrong, which I believe counts as one of my quarterly admissions of error.

Two things I need from you before we can launch:
1. Headshots of the team. Real ones, not the ones from 2019 where Carlos still has the mustache.
2. Updated pricing for the catering menu — the PDF you sent still has 2024 prices.

Aiming for a soft launch by Friday the 14th. If you can get me those by Wednesday I can make it happen. If not, no stress, we push to the following week.

Also your banana bread recipe is incredible and my wife wants to know if you're open to sharing it or if it's a trade secret situation.

Best,
Tom`,
  },
  {
    id: "human-academic-8",
    label: "human",
    category: "human-academic",
    description: "Academic writing about the reproducibility crisis",
    text: `The reproducibility crisis in biomedical research, while widely acknowledged, has proven resistant to straightforward solutions. Our survey of 823 principal investigators across twelve R1 universities reveals a striking disconnect between beliefs and behavior: 87% of respondents agreed that reproducibility is a "significant problem" in their field, yet only 34% reported having ever attempted to reproduce another researcher's published findings, and only 12% had pre-registered their own study protocols. When asked to identify barriers to reproducible practices, the most frequently cited factors were lack of time (78%), insufficient incentives within the promotion and tenure system (71%), and concerns about being "scooped" if methods and data are shared prior to publication (54%). These findings suggest that the reproducibility crisis is not primarily a problem of awareness or intention but of institutional structures that continue to reward novelty over rigor. Reforms targeting individual researcher behavior without addressing the systemic incentives that shape that behavior are unlikely to produce meaningful change. We propose a framework of institutional interventions including reproducibility credits in tenure review, mandated pre-registration for funded research, and shared resource pools for replication studies.`,
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

  // ── Very Short Texts (50-100 chars) ────────────────────────
  {
    id: "edge-short-3",
    label: "human",
    category: "short-text",
    description: "Very short casual human text",
    text: `ngl that movie was mid at best, saved by the soundtrack tho`,
  },
  {
    id: "edge-short-4",
    label: "human",
    category: "short-text",
    description: "Very short text message style",
    text: `running 10 min late, grab me a coffee? large oat milk latte thx`,
  },
  {
    id: "edge-short-5",
    label: "ai",
    category: "short-text",
    description: "Very short AI-style response",
    text: `Certainly! Here are some key takeaways from the article you shared.`,
  },
  {
    id: "edge-short-6",
    label: "human",
    category: "short-text",
    description: "Very short emotional human reaction",
    text: `wait WHAT. no way. this can't be real. someone tell me this is fake`,
  },
  {
    id: "edge-short-7",
    label: "ai",
    category: "short-text",
    description: "Very short AI acknowledgment",
    text: `That's an excellent point. Let me provide some additional context on this topic.`,
  },

  // ── AI With Heavy Human Edits ──────────────────────────────
  {
    id: "edge-ai-edited-1",
    label: "ai",
    category: "ai-heavy-edit",
    description: "AI text about machine learning heavily edited by human",
    text: `So I've been messing around with ML models at work and honestly the whole thing is wilder than I expected. Like the basics are straightforward enough — you feed data in, the model finds patterns, cool. But the part nobody talks about is how much of the job is just... cleaning data. I swear 80% of my time is fixing missing values and dealing with inconsistent formats. The actual model training is almost the easy part. We're using a transformer-based architecture (won't bore you with the details) and after weeks of tuning hyperparameters we got the accuracy up to like 94% which sounds great until you realize the remaining 6% is where all the interesting edge cases live. The model is confidently wrong about those and that's honestly scarier than if it were just randomly wrong.`,
  },
  {
    id: "edge-ai-edited-2",
    label: "ai",
    category: "ai-heavy-edit",
    description: "AI climate article heavily personalized by human editor",
    text: `I read yet another climate report last week (my therapist says I need to stop doom-scrolling these) and ok yes it was depressing but there was actually some stuff in there that surprised me in a good way? Like solar installation rates are genuinely bonkers right now — up something like 50% year over year in some markets. And battery storage costs keep plummeting which was always the bottleneck everyone pointed to. The piece that gave me actual hope tho was about how quickly EVs are being adopted in countries like Norway. They didn't get there through guilt or individual sacrifice — they just made EVs cheaper and more convenient than gas cars through smart policy. Wild concept. Maybe we should try that here instead of yelling at people for using straws.`,
  },
  {
    id: "edge-ai-edited-3",
    label: "ai",
    category: "ai-heavy-edit",
    description: "AI-written recipe intro edited to sound like a real food blogger",
    text: `Ok look, I know every recipe blog has a 3000 word backstory before the actual recipe and I KNOW that's annoying so I'll keep this short. This soup happened because I had half a butternut squash going soft in the fridge and a desperate need for something warm. It's not fancy. It's not "elevated" (god I hate that word applied to food). It's just good soup. My kid ate two bowls which is basically a Michelin star in my household because this child rejects anything with visible vegetables. The secret is roasting the squash until it's nearly burnt — those caramelized edges are doing all the heavy lifting flavor-wise. You could add cream but honestly it doesn't need it. The texture from the roasted garlic is plenty creamy on its own. Total time is about 45 minutes, most of it hands-off while the oven does its thing.`,
  },
  {
    id: "edge-ai-edited-4",
    label: "ai",
    category: "ai-heavy-edit",
    description: "AI tech review rewritten with human quirks",
    text: `Alright I've had this phone for two months now and I have Thoughts with a capital T. The camera is stupid good — like I took a picture of my dog at sunset and it looked like a professional shot and I am decidedly NOT a professional anything. Night mode is sorcery. However (and this is a big however) the battery life is a lie. They claim "all day battery" and sure, technically your day ends when the phone dies at 4pm. If you actually USE the phone — you know, for phone things — you're reaching for the charger by early afternoon. The other thing that drives me insane is they removed the headphone jack (yes I'm still mad about this years later, I will never not be mad) AND the charger brick isn't included. So you're paying $1000+ for a phone that doesn't come with a way to charge it. The audacity. Anyway I love it and will buy the next one too because I'm trapped in the ecosystem and we all know it.`,
  },
  {
    id: "edge-ai-edited-5",
    label: "ai",
    category: "ai-heavy-edit",
    description: "AI fitness advice rewritten as personal experience",
    text: `Three things I wish someone had told me when I started lifting: First, your "newbie gains" period is magical and you will never experience anything like it again, so enjoy watching the numbers go up weekly because that stops. Permanently. Second, nobody at the gym is watching you. I was convinced everyone was judging my baby weights and terrible form but actually everyone is (a) focused on their own workout, (b) staring at themselves in the mirror, or (c) on their phone between sets. Third — and I cannot stress this enough — stretching isn't optional. I skipped it for six months because it felt like a waste of time and then threw out my back picking up a laundry basket. A LAUNDRY BASKET. I'm in my 30s and was nearly taken out by dirty clothes. Now I stretch religiously and foam roll like my life depends on it because apparently it does.`,
  },

  // ── Formal Human Writing Mimicking AI Style ────────────────
  {
    id: "edge-formal-human-2",
    label: "human",
    category: "formal-human-ai-style",
    description: "Corporate annual report written by human, sounds AI-like",
    text: `The fiscal year 2025 represented a period of significant transformation for the organization, marked by strategic investments in digital infrastructure, workforce development, and market expansion initiatives. Revenue grew by 12.3% year-over-year to $847 million, driven primarily by strong performance in the enterprise solutions segment, which accounted for 62% of total revenue. Operating margins improved by 180 basis points to 18.7%, reflecting the benefits of our ongoing operational efficiency program and the successful integration of the two acquisitions completed in the prior fiscal year. Customer retention rates remained robust at 94.2%, exceeding our internal benchmark of 92%. During the year, we expanded our global footprint to 23 countries, established three new regional data centers, and grew our workforce by 1,400 positions, bringing total headcount to 12,850. Looking ahead, we remain focused on executing our three-pillar growth strategy while maintaining the financial discipline that has underpinned our consistent performance over the past decade.`,
  },
  {
    id: "edge-formal-human-3",
    label: "human",
    category: "formal-human-ai-style",
    description: "Government policy document, human-written but very formal",
    text: `Pursuant to Section 7(a) of the Environmental Protection Act as amended, the Agency hereby establishes the following revised standards for particulate matter emissions from stationary combustion sources with rated heat input capacity exceeding 100 million BTU per hour. Affected facilities shall achieve compliance with the emission limits specified in Table 3 of this regulation within 36 months of the effective date. The revised limits reflect the Agency's determination, based on a comprehensive review of available control technologies and an analysis of costs and benefits, that additional reductions in fine particulate emissions are both technically feasible and necessary to protect public health with an adequate margin of safety. Facilities seeking an extension of the compliance deadline may petition the Regional Administrator, provided that the petition demonstrates good faith efforts toward compliance and includes a binding schedule for the installation of required control equipment. Nothing in this regulation shall be construed to affect the applicability of existing emission standards for criteria pollutants other than particulate matter.`,
  },
  {
    id: "edge-formal-human-4",
    label: "human",
    category: "formal-human-ai-style",
    description: "Medical discharge summary, human-written clinical prose",
    text: `The patient is a 67-year-old male with a past medical history significant for hypertension, hyperlipidemia, and type 2 diabetes mellitus who presented to the emergency department with acute onset of substernal chest pressure radiating to the left arm, associated with diaphoresis and shortness of breath. Initial troponin was elevated at 0.47 ng/mL with serial elevation to 2.13 ng/mL. ECG demonstrated ST-segment elevation in leads V1-V4 consistent with anterior STEMI. The patient was taken emergently to the cardiac catheterization laboratory where a 95% occlusion of the left anterior descending artery was identified and treated with percutaneous coronary intervention and placement of a drug-eluting stent with restoration of TIMI-3 flow. Post-procedural course was uncomplicated. Echocardiogram obtained on hospital day two demonstrated left ventricular ejection fraction of 45% with anterior wall hypokinesis. The patient was started on guideline-directed medical therapy including dual antiplatelet therapy, high-intensity statin, beta-blocker, and ACE inhibitor. Cardiac rehabilitation referral was placed. The patient was discharged on hospital day four in stable condition with close follow-up arranged.`,
  },
  {
    id: "edge-formal-human-5",
    label: "human",
    category: "formal-human-ai-style",
    description: "Technical RFC document, human-written but structured like AI",
    text: `This document specifies the requirements and implementation guidelines for the Distributed Session Management Protocol (DSMP), version 2.0. The protocol is designed to maintain consistent session state across geographically distributed server nodes with a maximum synchronization latency of 150 milliseconds under normal operating conditions. DSMP utilizes a conflict-free replicated data type (CRDT) approach to handle concurrent session modifications, eliminating the need for distributed locking mechanisms that introduce unacceptable latency in multi-region deployments. Each session object is represented as a last-writer-wins register with vector clock versioning, where the timestamp resolution is sufficient to order events within a single datacenter while the vector clock component resolves cross-datacenter conflicts. Implementations MUST support the mandatory message types defined in Section 4 (SESSION_CREATE, SESSION_UPDATE, SESSION_DELETE, SESSION_SYNC) and SHOULD support the optional SESSION_MIGRATE message type for live session handoff between regions. Conforming implementations MUST pass all test vectors specified in Appendix A.`,
  },
  {
    id: "edge-formal-human-6",
    label: "human",
    category: "formal-human-ai-style",
    description: "Scholarly book review, human-written in very polished academic prose",
    text: `Professor Hartfield's latest monograph represents a substantial contribution to the increasingly crowded field of digital humanities scholarship, though not without significant limitations that merit critical examination. The central argument — that algorithmic curation has fundamentally altered not merely how we access information but how we construct meaning from it — is neither novel nor, in its broad strokes, particularly controversial. Where Hartfield distinguishes herself is in the granularity of her case studies, particularly the extended analysis of how recommendation algorithms on academic platforms have reshaped citation practices in the social sciences. Her finding that papers surfaced by algorithmic recommendation receive 340% more citations than comparably rigorous papers that are not surfaced is striking and, if the methodology withstands scrutiny, profoundly troubling for the epistemic foundations of peer-reviewed knowledge production. The theoretical framework, drawing on Habermas and Bourdieu in roughly equal measure, is competent if somewhat predictable. One wishes Hartfield had engaged more substantively with the critical algorithm studies literature, particularly the work of Safiya Noble and Ruha Benjamin, which would have enriched her analysis of the distributional consequences of algorithmic visibility.`,
  },

  // ── Mixed AI/Human Documents ───────────────────────────────
  {
    id: "edge-mixed-2",
    label: "ai",
    category: "mixed-ai-human",
    description: "AI-drafted LinkedIn post with human personal details added",
    text: `Thrilled to announce that after 6 months of late nights and way too much caffeine (sorry liver), our team just shipped the biggest feature update in company history. Real talk though: the journey here was messy. We scrapped the entire architecture twice. I had a minor breakdown in the parking lot in September (shoutout to my manager Angela for the pep talk). And our original timeline was so optimistic it was basically fiction. But here we are. The new real-time collaboration engine processes over 10,000 concurrent connections with sub-50ms latency, enabling seamless multi-user editing experiences across distributed teams. Our A/B testing showed a 34% improvement in user engagement and a 28% reduction in workflow completion time. None of this happens without the incredible engineering team — you know who you are and I owe every one of you a drink. Also massive thanks to our beta users who found approximately 847 bugs (slight exaggeration but not by much). What's next? Can't say yet but it's big. Stay tuned.`,
  },
  {
    id: "edge-mixed-3",
    label: "ai",
    category: "mixed-ai-human",
    description: "Human blog post with AI-generated statistics paragraph inserted",
    text: `I've been thinking a lot about burnout lately, partly because I experienced it myself last year and partly because literally everyone I know seems to be going through some version of it. The way it crept up on me was sneaky — I didn't feel stressed exactly, I just felt... nothing. Like the pilot light went out and I was going through the motions of caring about my work without actually caring. According to recent research, approximately 76% of employees report experiencing burnout at least sometimes, with 28% reporting they feel burned out "very often" or "always." The World Health Organization formally recognized burnout as an occupational phenomenon in 2019, defining it as a syndrome resulting from chronic workplace stress that has not been successfully managed. The three dimensions identified include feelings of energy depletion, increased mental distance from one's job, and reduced professional efficacy. Yeah, that tracks. All three of those, simultaneously, for about four months. What finally broke the cycle for me wasn't a vacation or a meditation app — it was having an honest conversation with my boss where I said "I cannot keep doing this at this pace" and instead of the catastrophe I expected, she said "I know, let's figure it out."`,
  },
  {
    id: "edge-mixed-4",
    label: "human",
    category: "mixed-ai-human",
    description: "Human email with AI-suggested professional phrasing mixed in",
    text: `Hey team,

Wanted to give everyone a quick heads up about the client meeting tomorrow. So basically Janet from their side is... not happy. I had a call with her yesterday and she was pretty direct about their concerns regarding the delayed deliverables. I would like to take this opportunity to address some of her key points and outline our proposed path forward for ensuring alignment on project milestones and expectations. (sorry, that last sentence was my attempt at sounding professional — you know what I mean though)

The main issues are: 1) we're three weeks behind on the API integration, 2) the test coverage isn't where we said it would be, and 3) she found two bugs in production that we should have caught. All valid complaints honestly. I've put together a remediation plan that demonstrates our commitment to delivering a high-quality product within a revised timeline that accounts for the technical complexities we've encountered. Translation: I made a new gantt chart with realistic dates this time. Let's sync at 9am before the 10am client call so we're all on the same page. Bring coffee, it's gonna be a long morning.

- Rob`,
  },
  {
    id: "edge-mixed-5",
    label: "ai",
    category: "mixed-ai-human",
    description: "AI-generated cover letter with human personal touches",
    text: `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the Senior Data Engineer position at Meridian Analytics, as advertised on your careers page. OK honestly I found this listing at 11pm while stress-eating crackers and it felt like it was written specifically for me, which is either a sign or the algorithm doing its job. With over seven years of experience designing and implementing large-scale data pipelines, I bring a comprehensive skill set that aligns closely with the requirements outlined in the job description. My expertise spans the modern data stack including dbt, Airflow, Snowflake, and Spark, and I have a proven track record of building systems that process terabytes of data daily with 99.9% uptime. At my current company (which I'm leaving on good terms — my manager will confirm this, she actually encouraged me to apply when I showed her this posting), I led the migration from a legacy ETL system to a streaming architecture that reduced data freshness from 24 hours to under 15 minutes. My colleagues would describe me as someone who is deeply committed to writing clean, well-documented code. I would describe myself as someone who is deeply committed to writing clean, well-documented code and also someone who has strong opinions about naming conventions that I will share whether you ask or not. I look forward to discussing how I can contribute to the innovative work being done at Meridian.

Sincerely,
Jordan Park`,
  },
  {
    id: "edge-mixed-6",
    label: "ai",
    category: "mixed-ai-human",
    description: "Student essay mixing AI paragraphs with personal anecdotes",
    text: `The opioid crisis in rural America is often discussed in terms of statistics — the 75,000 overdose deaths in a single year, the billions in healthcare costs, the economic devastation of communities that lost their workforce to addiction. These numbers are important but they can obscure the individual human stories that give the crisis its true weight. The socioeconomic factors contributing to the epidemic are multifaceted, encompassing the aggressive marketing practices of pharmaceutical companies, the inadequacy of mental health infrastructure in rural communities, and the economic despair resulting from decades of industrial decline that left many regions without viable employment opportunities. My uncle was one of those statistics. He hurt his back working at the grain elevator in 2015, got prescribed OxyContin, and within a year he was buying pills off the internet because his doctor cut him off. He's alive, barely, living in a halfway house in Springfield. He used to build furniture in his garage — beautiful stuff, all hand-joined, no nails. He built my dresser when I was born. I don't know if he'll ever build anything again. The policy solutions are there: expanded access to medication-assisted treatment, reformed prescribing guidelines, investment in rural mental health services. But policy moves slow and addiction moves fast.`,
  },

  // ── Additional Edge Cases for 200+ Coverage ─────────────────
  {
    id: "edge-short-8",
    label: "human",
    category: "edge-short",
    description: "Very short frustrated human text",
    text: `this app crashes every 5 min. fix it. 1 star.`,
  },
  {
    id: "edge-short-9",
    label: "ai",
    category: "edge-short",
    description: "Very short AI-style transitional phrase",
    text: `In conclusion, it is evident that further research is needed in this area.`,
  },
  {
    id: "edge-short-10",
    label: "human",
    category: "edge-short",
    description: "Very short sarcastic human text",
    text: `oh cool another meeting that could have been an email. love that for us.`,
  },
  {
    id: "edge-short-11",
    label: "human",
    category: "edge-short",
    description: "Very short human text with typos",
    text: `jsut saw the most gorgeous sunest from my balcony. no filter needed tbh`,
  },
  {
    id: "edge-paraphrased-1",
    label: "ai",
    category: "edge-paraphrased",
    description: "AI text heavily paraphrased to evade detection — nutrition topic",
    text: `Yeah so I've been reading up on this whole seed oils debate and honestly the science is way less clear than Twitter would have you believe. There's some animal model stuff showing inflammatory effects at high doses but the actual human epidemiological data is mixed at best. The studies linking seed oils to bad outcomes usually can't separate the oil from the ultra-processed food it's in, which is a huge confound. Meanwhile olive oil — everyone's favorite "good" oil — performs well in studies that are mostly done in Mediterranean populations who also walk more, eat more vegetables, and have stronger social connections. Correlation isn't causation, people. I still cook with olive oil because it tastes good, not because I think canola oil is poison.`,
  },
  {
    id: "edge-paraphrased-2",
    label: "ai",
    category: "edge-paraphrased",
    description: "AI text paraphrased and personalized — personal finance",
    text: `My hot take on personal finance advice: most of it is useless if you're actually broke. "Just invest 15% of your income!" Cool, 15% of my income is $73 and that's also my grocery budget for the week. "Cut the lattes!" I don't drink lattes, I drink the free coffee at work because it's free. "Build an emergency fund of 3-6 months!" That would take me literally years at my current saving rate of "whatever's left over, which is usually nothing." I'm not saying the advice is wrong — compound interest IS powerful, investing IS important. I'm saying there's a gap between "knows the theory" and "can actually do it" that personal finance gurus fill with motivational platitudes instead of acknowledging that systemic wage stagnation is the actual problem for most people who can't save.`,
  },
  {
    id: "edge-paraphrased-3",
    label: "ai",
    category: "edge-paraphrased",
    description: "AI text heavily rewritten to sound like stream of consciousness",
    text: `Thinking about how weird it is that we carry tiny computers in our pockets that connect us to the entirety of human knowledge and we mostly use them to argue with strangers and look at pictures of food. Like if you showed a medieval peasant an iPhone they would literally think it was sorcery and we're over here going "ugh the wifi is slow" while sitting on a toilet that has heated water jets. The future arrived and we're bored of it already. Humans are the most adaptable and simultaneously most ungrateful species in the known universe and honestly I find that kind of comforting? Like if we can normalize smartphones in fifteen years we can normalize literally anything.`,
  },
  {
    id: "edge-paraphrased-4",
    label: "ai",
    category: "edge-paraphrased",
    description: "AI text rewritten as an opinionated parenting take",
    text: `Controversial opinion incoming: "gentle parenting" as practiced by most people on social media is not gentle parenting, it's permissive parenting with nicer vocabulary. Actual gentle parenting as described by the developmental psychology literature involves firm boundaries delivered with empathy — you still say no, you still enforce consequences, you just don't scream while doing it. What I see online is parents negotiating with their 3-year-old for 45 minutes about why we don't hit the dog, while the dog continues to get hit. That's not respecting your child's autonomy, that's abdicating your role as the adult in the room. My kids have feelings AND they have bedtimes. Those things can coexist. The "gentle" in gentle parenting refers to the HOW, not the WHETHER.`,
  },
  {
    id: "edge-mixed-7",
    label: "ai",
    category: "edge-mixed",
    description: "AI-written product description with human marketing edits",
    text: `Look, we know what you're thinking. "Another productivity app? Really?" And fair enough — the app store has approximately ten billion of them and most are garbage. But hear us out. TaskFlow is built on the premise that the best productivity system is the one you actually use, which means it needs to be dead simple. No 47-step onboarding tutorial. No gamification medals for checking off "take shower." Just a clean interface where you dump everything in your brain, drag things into priority order, and get on with your life. The app leverages advanced machine learning algorithms to analyze your task completion patterns and suggest optimal scheduling configurations based on your demonstrated productivity cycles. (That means it figures out when you actually do stuff and reminds you at the right time.) Available on iOS and Android. Free tier is genuinely usable, paid tier is $4/month if you want the fancy stuff.`,
  },
  {
    id: "edge-formal-human-7",
    label: "human",
    category: "edge-formal-human",
    description: "Insurance claim letter, human-written but extremely formal",
    text: `Dear Claims Department,

I am writing with respect to Policy Number HO-2847291, regarding the property damage sustained at 412 Maple Drive, Unit 3B, on the evening of January 14, 2026. At approximately 9:45 PM, a pipe in the unit above mine (3C) burst, resulting in significant water damage to my ceiling, north-facing wall, and the hardwood flooring in the living room and hallway. I immediately contacted building maintenance, who shut off the water supply and provided temporary tarps. I have obtained three independent contractor estimates for the repair work, ranging from $4,200 to $5,800. Photographs documenting the extent of the damage were taken within hours of the incident and are enclosed herewith. I have also included the maintenance report filed by the building superintendent confirming the origin of the leak. I would appreciate your prompt attention to this matter and am available to provide any additional documentation you may require to process this claim expeditiously.

Respectfully submitted,
Daniel R. Hoffman`,
  },
  {
    id: "edge-formal-human-8",
    label: "human",
    category: "edge-formal-human",
    description: "Scientific grant proposal abstract, human-written",
    text: `We propose a three-year investigation into the mechanisms by which chronic sleep restriction modulates the tumor immune microenvironment in murine models of colorectal cancer. Preliminary data from our laboratory demonstrate that mice subjected to a chronic sleep fragmentation protocol (mimicking the disrupted sleep patterns common in shift workers) exhibit a 2.3-fold increase in tumor growth rate compared to controls, accompanied by a significant reduction in tumor-infiltrating CD8+ T cells and an expansion of immunosuppressive myeloid-derived suppressor cells. The proposed experiments will (1) characterize the temporal dynamics of immune cell infiltration under varying degrees of sleep restriction, (2) identify the molecular signaling pathways linking sleep disruption to myeloid cell polarization through single-cell RNA sequencing, and (3) test whether pharmacological restoration of sleep architecture reverses the immunosuppressive phenotype. This work addresses a critical gap in our understanding of modifiable lifestyle factors that influence cancer immunity and has direct translational implications for the approximately 15 million Americans engaged in shift work.`,
  },
  {
    id: "edge-mixed-8",
    label: "ai",
    category: "edge-mixed",
    description: "AI-generated Wikipedia-style text edited with human commentary",
    text: `The Great Emu War of 1932 was an actual real thing that happened in Australia and I need everyone to know about it. Following World War I, the Australian government settled large numbers of ex-soldiers on farming land in Western Australia. By 1932, approximately 20,000 emus had migrated into the agricultural region, damaging crops and fences that the farmers depended upon for their livelihoods. The Minister of Defence authorized a military operation employing soldiers armed with Lewis guns to cull the emu population. The operation was, by most accounts, a spectacular failure. The emus proved remarkably resilient to gunfire and adept at tactical retreat (I am not making this up — they literally used guerrilla warfare tactics against the Australian military). After expending approximately 9,860 rounds of ammunition and killing an estimated 986 emus — a rate of nearly ten bullets per bird — the military withdrew. The emus won. THEY WON. A flightless bird defeated a modern military. Australia subsequently switched to a bounty system, which proved considerably more effective. But the fact remains: emus 1, Australian Army 0. This is the kind of history they should teach in schools.`,
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
