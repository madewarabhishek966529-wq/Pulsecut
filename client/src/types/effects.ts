export type UniformType = "float" | "vec2" | "vec3" | "color";

export interface UniformDef {
  name: string;
  type: UniformType;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface EffectDef {
  id: string;
  name: string;
  kind: "filter" | "transition" | "generated";
  fragment: string;
  uniforms: UniformDef[];
  defaults: Record<string, number | number[]>;
}
