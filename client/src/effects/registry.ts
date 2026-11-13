import type { EffectDef } from "@/types/effects";

// Built-in and generated effects register here.
// TODO (T7/T8): add glitch, rgbSplit, vhs, zoomPulse, blur.
const effects = new Map<string, EffectDef>();

export const registerEffect = (def: EffectDef) => effects.set(def.id, def);
export const getEffect = (id: string) => effects.get(id);
export const listEffects = () => Array.from(effects.values());
