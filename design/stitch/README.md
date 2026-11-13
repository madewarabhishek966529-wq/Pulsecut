# How to use these in Google Stitch

1. Open Stitch and start a new project (choose Web/Desktop).
2. For each screen file, paste the contents, then paste `00-style-line.md` at the end.
3. Generate in this order: 01 Editor, 02 Dashboard, 03 Prompt-to-Filter, 04 Export, 05 Landing.
4. After the Editor is generated, reuse it as a reference for the other screens so they stay consistent.
5. Refine with follow-ups such as "make the timeline taller", "make clips look more like CapCut", "increase contrast on labels".
6. Export each screen's HTML/CSS (or copy to Figma) into `/design/exports/<screen>/` and save a PNG screenshot beside it.

Keep the final look aligned with `design/DESIGN.md`. If Stitch changes colors, fix them in code using the tokens, not by copying Stitch's values.
