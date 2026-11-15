import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";

export const aiRouter = Router();

const GenerateFilterSchema = z.object({
  prompt: z.string().min(2, "Prompt must be at least 2 characters"),
});

const SHADER_SYSTEM_PROMPT = `
You are an expert WebGL GLSL shader engineer for Pulsecut, a high-performance browser video editor.
Generate a custom, valid WebGL Fragment Shader based on the user's description.

SHADING SPECIFICATION:
1. Precision: precision mediump float;
2. Varying inputs:
   varying vec2 vTextureCoord;
3. Standard Uniforms:
   uniform sampler2D uSampler;
   uniform float uTime;
   uniform float uIntensity;
   uniform vec2 uResolution;
4. Audio Uniforms (all 0.0 to 1.0):
   uniform float uBass;
   uniform float uMid;
   uniform float uHigh;
   uniform float uBeat;
5. Any custom uniforms you define must have float or vec2/vec3/vec4 types.
6. The shader MUST output to gl_FragColor.
7. Must be pure, valid GLSL ES 1.0 / WebGL1 & WebGL2 compatible. Do NOT use undefined functions.

Respond ONLY with valid JSON in this exact structure:
{
  "name": "Short Name",
  "description": "Short explanation of the effect",
  "uniformDefs": {
    "uIntensity": { "type": "float", "default": 0.8, "min": 0.0, "max": 1.0 },
    "uSpeed": { "type": "float", "default": 1.0, "min": 0.1, "max": 3.0 }
  },
  "fragmentShader": "precision mediump float;\\nvarying vec2 vTextureCoord;\\nuniform sampler2D uSampler;\\nuniform float uTime;\\nuniform float uIntensity;\\nuniform float uBass;\\nvoid main() {\\n  vec4 color = texture2D(uSampler, vTextureCoord);\\n  // effect logic\\n  gl_FragColor = color;\\n}"
}
`;

aiRouter.post("/filter", async (req, res) => {
  try {
    const { prompt } = GenerateFilterSchema.parse(req.body);

    if (!env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured on the server. AI filter generation is unavailable.",
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${SHADER_SYSTEM_PROMPT}\n\nUser Prompt: "${prompt}"` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI] Gemini API error:", response.status, errText);
      return res.status(response.status).json({
        error: `Gemini API request failed: ${response.statusText}`,
      });
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(502).json({ error: "Gemini did not return any content." });
    }

    const parsedShader = JSON.parse(rawText);
    return res.json({ ok: true, filter: parsedShader });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0]?.message ?? "Invalid input" });
    }
    console.error("[AI] Filter generation error:", err);
    return res.status(500).json({ error: (err as Error).message || "Internal server error" });
  }
});
