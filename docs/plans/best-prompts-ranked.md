# Baloney — Best Prompts Ranked

Ranked by human-in-the-loop quality: human makes the decisions and tradeoffs, AI handles the repetitive execution.

---

### 1. Ben

> For this project, there are still many tasks that need to be done. I am not asking for them all to be done at once, but I need them planned out and the project needs to consider the future implementations when building the project out. Here is the description of the new features that need to be implemented, how I want them. There might be ambiguity in my instructions. Ask as many questions as required to have a full interpretation and understanding of my intent: [full extension UI spec with toggles, dot behavior, blur/block/scan modes, allowed websites, grammarly-style underlining, opacity states]

### 2. Ben

> Base: #f0e6ca Primary: #d4456b Secondary: #4a3728 Accent: #e8c97a [...] Focus of the feel of the website: Human, natural design. Focus on authenticity, messiness, and humanness [...] Propose a main and a secondary font that are allowed to be used for this use case [...] First: Create a DESIGN.md file that describes the design philosophy [...] Then, plan the full implementation of this and implement the front end to my specification.

### 3. Nate

> my only issue is, what if it sucks, to the point that we wasted Time. Would just testing api premade models like pangram for text perhaps, site engine for image and video. calls as a backend fallback maybe?

### 4. Nate

> Target the three biggest slop text sites -> X (tech/news), Facebook (engagement bait), and LinkedIn (corporate). Generate unique examples that would be posted on the sites, focus on formatting and tone differences in the prompt. Can reverse engineer prompts as well [...] Create 100 (maybe?) of these per llm. Create a percent per model and then calculate confidence ratios [...] it needs to optimize for using pangram api. Look at what costs money per X on the pangram api, and adjust how you format the data to [...] Emphasize in the presentation: presentation and technique, social impact, and then data methods. These are the judging criteria.

### 5. Ben

> This should not be how it works. It should start with SynthID for all since it is the most accurate at getting it right, given it is gemini. Like the false positive rate is so so low for synth id. Then if it passes that well, then move on to pangram for text and sightengine api for image/video. After that, you can move on to the "secondary" models. Ensure the implementation runs like this.

### 6. Ben

> Also, the "secondary" models are only used as fall backs for pangram/sightengine FAILURE. If they give back nothing. If they give a result, then the secondary models should never be considered. They are fallback api purposes. Like if SynthID gives back a score that indicates that its TOTALLY AI, then no need to consider the pangram/sightengine

### 7. Nate

> Im confused by our slop detected metric. Im seeing the primary, secondary, and a vaguely measured trust score impacted the ToTal confidence rating. Wouldnt it be best to just use the most accurate primary model TO account for false negatives or positives with less efficient. the secondary model architecture is purely for fallback api purposes

### 8. Ben

> Search and look through the project. When you detect if something is ai in the website I dont think that the models and assessment of if it is ai is true. Restructure the ui to align with the detection approach that is implemented in the project [...] Make sure that if the user say clicked on the AI detection of an image on X, it is under the image detector on the website. If it was a video, then it redirects to video detector, if it was text, then text detector. Make it cohesive.

### 9. Nate

> Please expertly and critically compare and consider the current plan to [...] Give me your thoughts. Consider to use synth id above all else for image and video since its googles watermark but that doesnt mean its the only method.

### 10. Ben

> can you put a very slightly beveled glassy looking square around the pig's face on the mona lisa. Like someone selected a square to end up detecting the ai. The 92% AI thing is good, but try to model the design off the actual extension's design when it shows the ai percentage. Make sure its positioned the same relative to the square as well.

### 11. Ben

> I took a lot of short notes about this project. Go through the files and reunderstand the context of what is done and what still has to be done. Here are the notes. Many are incomplete. Ask as many questions as you can about my ideas and what I mean/intend to mean. Create a plan for fixing the issues I have [...] "make sure the text detector needs to have a certain amount of data to allow itself to provide a score [...] Bayes stuff? Like if the model has whatever confidence ratio [...]"

### 12. Nate

> My only concern is if we create the model and train it, will we be able to have clear and enough evaluations. What we want to make is a solution to the rapid spread of disinformation in the age of ai. offering users a way to completely cater their browsing feed. The internet was meant to be the ultimate source of information, yet today there are no regulations to the growing misuse of ai.

### 13. Ben

> In order to check the big data part of the hackathon, we need to use a lot of data. Our solution was to test our implementation on a lot of data. To do this we need all the data from our users to flow straight into our db and in turn our dashboard on our website. Assess how effectively this current plan does this.

### 14. Ben

> Double check that this functionality is appropriate and will work. Be skeptical

### 15. Ben

> double check. poke holes in this. It must actually change something. Was this actually the big revelation that changed how it functioned?

### 16. Nate

> npx skills add railwayapp/railway-skills and you have vercel mcp authenticated. why do you need frontend

### 17. Ben

> make the top beveled header slightly less opaque.

### 18. Ben

> for the pink buttons, give them a bit of that 3d look that the header has

### 19. Nate

> only build page with good data

### 20. Ben

> needs to be moved down and left. Down by 1/3 of its height. Left by 1/4 of its height. Do not resize, just move

### 21. Ben

> what is the trust score actually?

### 22. Ben

> so keep the trust score, but contextualize it on the site. a bit.

### 23. Ben

> Implement the plan, also rename the trust score to Human Score

### 24. Nate

> 910468142 sight engine hf_[token] hf. what about synth id with vertex?

### 25. Nate

> considering our last pipeline where gemini with pangram yielded 1.000. id imagine our system seems polished. analyze and explore/fill all holes
