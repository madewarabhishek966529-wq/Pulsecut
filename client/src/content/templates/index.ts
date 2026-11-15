import type { TemplateRecipe } from "../manifest.ts";

export const BUILTIN_TEMPLATES: TemplateRecipe[] = [
  {
    id: "tpl-reel-hook",
    name: "Reel Hook (3s Fast Cut)",
    description: "Rapid triple-cut intro designed for TikTok and Instagram Reels to capture immediate attention.",
    targetDuration: 3.0,
    recommendedAspect: "9:16",
    tracksCount: 2,
    ops: [
      { action: "split", time: 0.8 },
      { action: "split", time: 1.8 },
      { action: "applyEffect", clipIndex: 0, effectId: "fx-zoom-through" },
      { action: "applyEffect", clipIndex: 1, effectId: "fx-glitch" },
      { action: "applyEffect", clipIndex: 2, effectId: "fx-bloom" },
    ],
  },
  {
    id: "tpl-product-showcase",
    name: "Product Showcase",
    description: "Clean modern showcase with smooth zoom, lower thirds, and amber vignette focus.",
    targetDuration: 8.0,
    recommendedAspect: "9:16",
    tracksCount: 3,
    ops: [
      { action: "setFadeIn", duration: 0.5 },
      { action: "setFadeOut", duration: 0.8 },
      { action: "addText", text: "NEW RELEASE", style: "txt-title-punch", start: 0.5, end: 3.5 },
      { action: "addText", text: "Engineered with Precision", style: "txt-lower-third", start: 3.5, end: 7.5 },
      { action: "applyEffect", effectId: "fx-vignette" },
    ],
  },
  {
    id: "tpl-quote-card",
    name: "Cinematic Quote Card",
    description: "Atmospheric 35mm film grain with warm duo-tone color grade and centered typographic quotation.",
    targetDuration: 5.0,
    recommendedAspect: "1:1",
    tracksCount: 2,
    ops: [
      { action: "applyEffect", effectId: "fx-grain" },
      { action: "applyEffect", effectId: "fx-duotone" },
      { action: "addText", text: "“SIMPLICITY IS THE ULTIMATE SOPHISTICATION”", style: "txt-kinetic-word", start: 0, end: 5.0 },
    ],
  },
];
