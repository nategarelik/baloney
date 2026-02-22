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
    description: "AI text edited to sound like personal reflection — career change",
    text: `Made a huge career change last year — left a stable engineering job to go into teaching. Everyone thought I was crazy and honestly some days I think they might be right. The pay cut was brutal. Like I knew it would be bad but seeing the actual numbers on that first paycheck was a special kind of pain. And the workload is wild — I spend more hours on lesson planning, grading, and parent emails than I ever spent coding. But here's the thing that surprised me: I actually feel like what I do matters in a way I never did building enterprise software. When a kid who's been struggling with algebra suddenly gets it and you can see the moment it clicks? Man. That's something no deployment to production ever gave me. I miss the engineering salary a lot though not gonna lie. And the intellectual challenge of hard technical problems. Teaching has its own intellectual challenges but they're different — more emotional intelligence, more improvisation, more reading the room. I don't know if I'll stay in teaching forever but I'm glad I did it. Everyone should work in a completely different field at least once just to shake loose all your assumptions about what work means to you.`,
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
