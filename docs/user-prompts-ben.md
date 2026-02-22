# Baloney — User Prompts Archive

Organized by theme. Raw prompt text preserved. Source JSONL files referenced for traceability.

---

## Theme 1: Design System & Brand Identity

**Source:** `59a31731-fb24-4601-a42b-9a2735158b32.jsonl`

### Prompt 1 — Full design spec + DESIGN.md request

> Base: #f0e6ca  
> Primary: #d4456b  
> Secondary: #4a3728  
> Accent: #e8c97a
>
> Logo: pig guy (baloney.png)
>
> This product (baloney) is an easy to use ai detector as a chrome extension, that detects ai and logs the percent of content the users of the chrome extension sees that flags as ai, categorized by the website that it is used on. This is a prompt about the frontend website that accompanies it. Any reference to getting/installing it needs to redirect to the exact chrome extension link. For now just do a placeholder to the chrome webstore. Elements of this website will link to the data we collect from the people using the chrome extension, like a dashboard to see exactly what sites have the most ai.
>
> Focus of the feel of the website: Human, natural design. Focus on authenticity, messiness, and humanness. Goes along with the branding of an anti-ai company. Work that feels lived in, textured, layered. People don't want it to be curated but real. People want a connection to the world around them and others, they want nostalgia, to experience things before phones were everywhere. Escape from monotony. Escape from artificiality.
>
> Propose a main and a secondary font that are allowed to be used for this use case. Use the ui/ux skill. Ones that exemplify the ideas that this brand represents. Ones that work well with the color scheme. Inform me on ways to introduce rough, natural, handwritten type accents, such as underlines, outlines, etc to the web design. Recall that this still a tech type company though. Some font ideas I was thinking of are fonts similar to Campana Script, Skia, Ugosagu, Sanseriffic, Trattatello. Possibly a serif font. One unique main font then a sans serif one for normal writing. Ones similar to these but obviously allowed use in commercial setting.
>
> The general layout of the website is: Main color is the Base/off white. The others are accent colors. Use handwritten/natural accents/elements sparingly. For example maybe a handwritten underline to what tab you are on. The top bar of the website should have the pig logo on the most left (pig logo is primary off white, with pink nose and ears, and then a black outline and a brown monocle), then the company name in the primary font. "Baloney" is the name. Then a tab for Product, one for AI Tracker. Then on the far right is a tab/text with a different background/outline/padding saying "Get Baloney for Free". The main headline/tag line is "Tell What's Baloney". Under it says "Your all-purpose truth verifier". Still not set on this tagline, possibly create a few short variations that explain the project well. On the left side of the screen. Under says "Try Free Now". To the right I am going to make an AI modified mona list picture in 5:3 aspect ratio that replaces her head with the pig face. Just make it blank for now, but i want an organic/natural looking picture frame around it, preferably the same color as the accent. This could be an actual picture frame or hand drawn type. You decide which is better. Under this main big title area, should be a section that has a short headline about knowing what's real on social media, with 2 placeholder images (all 16:9 landscape) from social media websites that are screenshots of what it looks like in use. Under this, is a "See how it works" section, with a button that redirects to the product page. This will be written later. The AI tracker page is going to be a dashboard like page. There will be one heading per social media site. These should be easily updatable. Currently, just have X, LinkedIn, and Substack. It should be autoselected to the "X" one. The headings should be simple text that has a line under the current page its on and the non-selected page headings (like if you were on the X heading, the LinkedIN and Substack ones would be like this) where they have lower opacity than say the X page, if you had the X page selected. As for the dashboard: It should have 3 dropdowns that all dropdown to a chart. Time on the X axis, Ai percentage on the Y axis. Ensure you know how the information can link with backend to update this across the people using it chrome users. We are using supabase as the database if that helps your understanding. There won't be login/auth on this website either. So, for each website we track on, there will be 3 dropdown, one for the text detection, one for the image detection, one for the video detection. Leave a placeholder footnote under each one that can be clarified later to add context to the data. I will do this later manually, so just write a placeholder note.
>
> First: Create a DESIGN.md file that describes the design philosophy in a consistent and descriptive/intentful manner that leaves no gaps for misunderstanding when creating UI. Perhaps ask questions about specifics with me before concretely going in with it (fonts, which colors where, what I want the design to feel like). Next, understand how you will integrate the data from the backend into the site frontend, what format you want the data in, how you will get it. Perhaps inspect the rest of the project to get whatever context is there on this. Then, plan the full implementation of this and implement the front end to my specification. Use placeholder text when unsure and focus on keeping the design modifiable easily as the scope and requirements of the project changes over time. Use UI/UX pro max skill. I have also uploaded a ui_heading_ref image of a reference of how to display the heading at the top of the website on the screen.

### Prompt 2 — Floating beveled nav bar + fonts + mona lisa background

> Make the top bar of the website a floating, beveled bar. It seems the fonts we chose are not appearing on the site and only basic fonts are. If i need to manually download/fix them let me know. Otherwise do it on your own. Behind the main text, I want a mona lisa image. Get rid of the picture frame thing. Just have the whole background to the main text be this image spanning the whole width of the page. I added this picture to assets. Also, I updated the pig logo.

### Prompt 3 — Add logo to footer

> add the logo to the bottom of the screen where it talks about the built at maddata part right above that at the bottom

### Prompt 4 — Lower header opacity

> make the top beveled header slightly less opaque.

### Prompt 5 — 3D pink buttons

> for the pink buttons, give them a bit of that 3d look that the header has

### Prompt 6 — "Know What's Real" section — pink background + gold accent words

> also make the "Tell whats real.." part brown background, and then the text that off white. Accent that gold color to highlight certain words

*(Follow-up: "you changed the Tell what's baloney part. I didn't want that changed (other than the pink button and the accent yellow text) so remove that background you put. I was talking about this section right below it with the 'Know What's Real on Social Media' text")*

*(Follow-up: "instead of brown do the pink and adjust the text colors accordingly")*

---

## Theme 2: Extension UI Redesign

### 2A — Feature Roadmap Planning Prompt

**Source:** `037de9e2-4f58-44e6-bfe6-b681d0e78237.jsonl`

> For this project, there are still many tasks that need to be done. I am not asking for them all to be done at once, but I need them planned out and the project needs to consider the future implementations when building the project out. Here is the description of the new features that need to be implemented, how I want them. There might be ambiguity in my instructions. Ask as many questions as required to have a full interpretation and understanding of my intent:
>
> **Tasks that still need to be done:**
>
> - Update the text on the website to be more descriptive/final (can be done at the end and display metrics, ie 70% detection on x dataset)
> - Update dashboard for the specific user to look like the general user dashboard (the one that can be clicked on in the extension tool)
> - Create a detector for text/video that lives on the website itself. There is a toggle at the top, in a similar style to the X/LinkedIn/Substack ones that changes between text (the text one will just have a text box and then a detect button that generates a large text below that is a percentage animation [animation starts at 0% then increases to the percent that was calculated in a smooth, gradual animation, then a brief interpretation of the results like "Likely AI Generated" and other similar interpretations of the physical number]), image detection with an upload area with a description that says what image files are accepted, and video detection with a similar upload thing. The image/video will display in the website once uploaded (video can be playable) and then a similar % indicator and interpretation like the text one I described earlier.
> - The ui for the chrome extension needs to be updated to fit the ui of the website. This is the preferred layout of it. Ensure to reference DESIGN.md when making this. The top is the Baloney logo with the Baloney text in the top left. The top right is a 'light' that is green when the tool is turned on, and off when it is turned off. Under this, there is a counter for the # scanned and # flagged, side by side with bordered rounded padding and different color separating it. Then below are three toggle sliding buttons. The first is an "Auto Scan Text". This is turned off by default. The default setting is to have the user manually select the text and then right click to ai detect. The second toggle/slider should be Auto Scan Images. The third is Auto Scan Videos. Put a link as a footnote on this to edit allowed websites. Then, there should be a slider with three options. "Blur" "Block" and "Scan". The blur one adds a blur to any images/videos detected as 100% ai. The block removes the user from ever seeing such images/videos. The scan is the default option that just adds a ui in the right corner of the image. This ui should also be on the blur feature. The blur feature should have an overlayed unblur button. Ensure there is a toggle to completely turn it off in the extension ui up at the top near the "on" light/dot. this when toggled needs to obviously shut off the extension briefly, stop scanning obviously, and change the opacity of the entire extension so it appears "off".
> - Make sure that it only scans a certain allowed websites. This should be stated somewhere on the website. Make a suggestion about where this should go and how to toggle this. It probably will end up updating on the dashboard as well. The default ones should be X, LinkedIn, Substack right now, the same ones that are on the global dashboard for all users. This should also be a link as a footnote on the actual extension as well.
> - For the UI when the scan is done, there should be a colored button in the top right if there is a significant enough detection. The color should change based on how extreme this is, ie a 60% chance should end up having a different color with a corresponding implication of how extreme it is compared to a 100%. when hovering over the green dot, it should expand to the left (ie the dot expands to a rounded rectangle and shows the actual percentage. When you click on the dot/expanded dot, it should open a page that gives very descriptive information to the user on how the model came to the answer. There should also be a link that redirects back. Remember to not collect the links as this may violate tos. Remember to use the fonts from the design file. When the image/video is not detected there should be no dot. The dot should also never be 100% opacity. The goal is a very discreet ui that is not invasive.
> - The text detection when Auto Scan text is turned off should be an option when right clicking. Reference the grammarly document about text underlining. When the button is hit the text should be underlined like that and then the similar dot (just pre expanded) should show. The dot needs to have the same functionality as the dot for auto scanned things. Do a similar manual mode feature for images and videos, however disregard the underlining feature since this is obviously not needed for images and videos.
>
> For everything ui, remember to use UI/UX tool. Use tools, especially the chrome extension tool as well. Spin up subagents and use skills. Remember to always update claude.md and other md files, including ai citation md.

### 2B — Extension UI Issues (post-implementation)

**Source:** `6cc3507c-ec7e-4c98-9649-564912dc78a1.jsonl`

> Issues with the extension currently: the logo for the extension needs to be the pig logo from the assets. Not a basic pig icon. The extension needs to use a mix of the primary and secondary font in its design.
>
> The text auto scan does not work. the little corner button does not work to give more information when i highlight it and such. I like the pop up when highlighting text, however it ends up not redirecting to a page where i can see the actual model data. I want this to be the case. This is for a data hackathon, so the more data you can present I think is much better. Also ensure the new page for in website ai detection has a tab at the top of the website.
>
> On /dashboard, it should just be the personal data resourced from the cookies. This should be added as a top bar for someone to click, only if they have cookie data using the ai models. The dashboard heading text needs to also be the main font, not a bold version of the secondary one.
>
> /analyze looks good, however the video detection has yet to be implemented. Also this needs to be added as a link from the top page header as well.

---

## Theme 3: Analyze Page UI

**Source:** `af63be7f-b63d-4bdf-8ebf-9a62d41a4fa7.jsonl`

### Prompt 1 — Restructure UI to match real detection + extension flow

> Search and look through the project. When you detect if something is ai in the website I dont think that the models and assessment of if it is ai is true. Restructure the ui to align with the detection approach that is implemented in the project. Use opacity to convey layering. This same page also comes up for when you click the overlay on the images on a website like X. This is good. When this happens, on that page instead of still having video upload/image upload/text upload. put the url in a non-poppy color, more a mute one, and have it in that same type of box. Make sure that if the user say clicked on the AI detection of an image on X, it is under the image detector on the website. If it was a video, then it redirects to video detector, if it was text, then text detector. Make it cohesive.

### Prompt 2 — Trust score clarification

> what is the trust score actually?

> so keep the trust score, but contextualize it on the site. a bit.

**Source:** `0cc8895e-a48a-4c33-8118-897a5f7392ef.jsonl`

### Prompt 3 — Implement restructure + rename to Human Score

> Implement the plan, also rename the trust score to Human Score

*(Plan covers: 3-tier opacity hierarchy, SourceContext component for muted source URL display, MethodBreakdown promoted to primary position, removal of generic "Primary Model"/"Secondary Analysis" bars, PipelineStageBadge, Trust Score → Human Score as contextualized small stat.)*

---

## Theme 4: Dashboard & Charts

**Source:** `a826864a-5737-4245-bfbe-b8241959c288.jsonl`

*(Full plan covers: 3-section personal dashboard — stats row → AiRateBySiteChart → Recent Scans table; community dashboard as `/dashboard/community`; navbar Dashboards dropdown; staggered hero fade-in animations.)*

### Prompt 1 — Community dashboard spec

> The community dashboard should just be the x/linkedin/substack data from the first version of the dashboard. Where the charts are separated by the type of medium (text/image/video) and also separated by the website, also only using the websites that come. If you completely removed that let me know first of all. If you still remember then replace it. Also, remember to update ai citation md and the claude md

### Prompt 2 — Big data / data flow concern

> In order to check the big data part of the hackathon, we need to use a lot of data. Our solution was to test our implementation on a lot of data. To do this we need all the data from our users to flow straight into our db and in turn our dashboard on our website. Assess how effectively this current plan does this. If you determine it can be improved to reach our goal then say. Also, note that before the hackathon finishes, there is no way to actually get it onto the google extension marketplace. We can only get it on by load unpacked in dev mode.

---

## Theme 5: Navbar & Product Page

**Source:** `dcb24f1d-e95d-4098-9f52-1f3715aa853e.jsonl`

*(Squiggle fix: move HandDrawnUnderline out of inner `<span>` relative context onto `<button>` to match other nav links.)*
*(Product page: remove emojis, replace hardcoded stats with [TBD] placeholders, rewrite pipeline section to show actual cascading architecture.)*

### Prompt 1 — Mona Lisa hero: detection indicator overlay

> can you put a very slightly beveled glassy looking square around the pig's face on the mona lisa. Like someone selected a square to end up detecting the ai. The 92% AI thing is good, but try to model the design off the actual extension's design when it shows the ai percentage. Make sure its positioned the same relative to the square as well.

### Prompt 2–8 — Position/style micro-adjustments

> needs to be moved down and left. Down by 1/3 of its height. Left by 1/4 of its height. Do not resize, just move

> move it up very slightly, maybe about 1/10th. Expand it wider to be a square. Remove the opacity thing. Make it clear

> now in the top right, put a mouse cursor, a pixelated one

> to the right a whole width of the mouse

> down and left slightly, very slightly

> add a drop shadow under the mouse. Make the border look more glassy

> Make the border slightly thicker

### Prompt 9 — Detection pipeline order: SynthID first

> This should not be how it works. It should start with SynthID for all since it is the most accurate at getting it right, given it is gemini. Like the false positive rate is so so low for synth id. Then if it passes that well, then move on to pangram for text and sightengine api for image/video. After that, you can move on to the "secondary" models. Ensure the implementation runs like this.

### Prompt 10 — Secondary models are failure-fallback only

> Also, the "secondary" models are only used as fall backs for pangram/sightengine FAILURE. If they give back nothing. If they give a result, then the secondary models should never be considered. They are fallback api purposes. Like if SynthID gives back a score that indicates that its TOTALLY AI, then no need to consider the pangram/sightengine

### Prompt 11 — Research detection pipelines + papers

> Research the actual text detection and image/video detection pipelines currently. Then find their corresponding research papers. The links to them. A brief description of them as well. Describe them in detail. Describe why they were used over other ones by looking at the md files.

---

## Theme 6: Extension Off State & Beveling

**Source:** `8bdb242d-f63f-47fc-a4d9-b1db7992f8d4.jsonl`

### Prompt 1 — Notes dump + presentation planning

> I took a lot of short notes about this project. Go through the files and reunderstand the context of what is done and what still has to be done. Here are the notes. Many are incomplete. Ask as many questions as you can about my ideas and what I mean/intend to mean. Create a plan for fixing the issues I have. Some of it has to do with presentation. Create a separate md file for things that do not have to do with actual coding. Writing drafts, talking points, etc. Things that do not have to do with adding/fixing features. Make sure to clarify clarify clarify. Here are my notes:
>
> "make sure the text detector needs to have a certain amount of data to allow itself to provide a score
>
> Ensure the data calculations fit this plan statistically for a confidence level. The charts should have a calculation that doesn't take every single ai flag at the same rate. Also a 50% ai flag doesn't mean it's ai even though it counts as it. There should be a floor level, maybe 70% because with the current model that doesn't do detection to a SOTA level detects actual ai videos as possibly 70%.
>
> Bayes stuff? Like if the model has whatever confidence ratio,
>
> Ensure the data actually updates into the dashboards on the website.
>
> Make the squiggle under the X button look right.
>
> Give a minimum amount of characters for the text detection to be allowed.
>
> In the presentation emphasize the data, the problem first, the models used. Use a time that ai generated video has actually impacted real [life situation]...
>
> Extension dropdown beveled edges. When off button hit → whole thing decreases opacity, looks 'powered down'. Top bar disappear/reappear animation on scroll."

---

## Theme 7: Allowed Sites & Popup Functionality

### 7A — Allowed Sites Page

**Source:** `1a5891c8-bcc9-40c9-8a94-072f41be251a.jsonl`

*(Plan covers: add twitter.com to DEFAULT_SITES, add loading state, add prominent disconnected-state banner with AlertTriangle icon and link to /extension.)*

### Prompt 1 — Skeptical review

> Double check that this functionality is appropriate and will work. Be skeptical

### Prompt 2 — Everything is broken

> Try to figure out why none of the extension functionality works. Use skills, subagents, specifically ux ui max skill and chrome extension skill. Everything that can change and should change does not work. The off button, the opacity change when off, the light, the counter of whats scanned as ai and total scanned, all buttons, all sliders, the page stats dropdown doesnt drop down, the edit allowed websites, the content mode picker. The three auto scan things move but they do and change absolutely nothing. The only thing that actually works is the open dashboard button. The extension isnt even beveled like i said. Investigate this deeply. Use skills, and subagents, using ui ux max skill and chrome extension skill

### 7B — Fix All Popup Functionality

**Source:** `c3c1c79c-10b0-4c08-8215-0c428866ad21.jsonl`

*(Root cause: MV3 CSP blocks inline `<script>` tags — fix was extracting 153 lines of inline JS from popup.html to popup.js. Also adds beveling to stat cards, page stats toggle, segment control, toggle tracks. Allowed Websites page: 3-wide grid beveled cards, +card to add site, edit/trash on hover.)*

### Prompt 1 — Skeptical double-check

> double check. poke holes in this. It must actually change something. Was this actually the big revelation that changed how it functioned?

---

## Meta Notes

- All "Implement the following plan:" messages contain Claude-generated plans, not raw user prose. Raw user intent is captured in the earlier sessions per theme.
- Source files: `/Users/benverhaalen/.claude/projects/-Users-benverhaalen-baloney/<uuid>.jsonl`
- Extracted 2026-02-22 using Python JSONL parsing (role: "user", content type: "text", length > 30 chars, non-command messages only).
