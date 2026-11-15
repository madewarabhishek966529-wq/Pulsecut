import test from "node:test";
import assert from "node:assert/strict";

// Import built-in content
import {
  CONTENT_MANIFEST,
  BUILTIN_EFFECTS,
  BUILTIN_TRANSITIONS,
  BUILTIN_TEXT_PRESETS,
  BUILTIN_CAPTION_STYLES,
  BUILTIN_STICKERS,
  BUILTIN_TEMPLATES,
} from "../src/content/index.ts";

test("CONTENT_MANIFEST meets required minimum counts", () => {
  assert.ok(CONTENT_MANIFEST.counts.effects >= 12, "Must have at least 12 effects");
  assert.ok(CONTENT_MANIFEST.counts.transitions >= 8, "Must have at least 8 transitions");
  assert.ok(CONTENT_MANIFEST.counts.textPresets >= 8, "Must have at least 8 text presets");
  assert.ok(CONTENT_MANIFEST.counts.captionStyles >= 6, "Must have at least 6 caption styles");
  assert.ok(CONTENT_MANIFEST.counts.stickers >= 12, "Must have at least 12 stickers");
  assert.ok(CONTENT_MANIFEST.counts.templates >= 3, "Must have at least 3 templates");
});

test("All 12 built-in effects have valid GLSL fragment shaders and uniforms", () => {
  assert.equal(BUILTIN_EFFECTS.length, 12);

  for (const fx of BUILTIN_EFFECTS) {
    assert.ok(fx.id.startsWith("fx-"), `Effect ${fx.name} ID must start with fx-`);
    assert.ok(fx.fragmentShader.includes("precision mediump float;"), `${fx.name} missing precision mediump`);
    assert.ok(fx.fragmentShader.includes("gl_FragColor"), `${fx.name} must output to gl_FragColor`);
    assert.ok(fx.uniforms.length >= 1, `${fx.name} must declare at least 1 uniform`);

    for (const u of fx.uniforms) {
      assert.ok(u.name.startsWith("u"), `Uniform ${u.name} must start with 'u'`);
      assert.ok(u.default !== undefined, `Uniform ${u.name} must have a default value`);
      if (typeof u.default === "number" && u.min !== undefined && u.max !== undefined) {
        assert.ok(
          u.default >= u.min && u.default <= u.max,
          `Uniform ${u.name} default (${u.default}) outside min-max range [${u.min}, ${u.max}]`
        );
      }
    }
  }
});

test("All 8 built-in transitions have valid uProgress and shaders", () => {
  assert.equal(BUILTIN_TRANSITIONS.length, 8);

  for (const tr of BUILTIN_TRANSITIONS) {
    assert.ok(tr.id.startsWith("tr-"), `Transition ${tr.name} ID must start with tr-`);
    assert.ok(tr.fragmentShader.includes("uProgress"), `${tr.name} must reference uProgress`);
    assert.ok(tr.fragmentShader.includes("gl_FragColor"), `${tr.name} must output to gl_FragColor`);
  }
});

test("All 12 stickers contain valid inline SVG elements", () => {
  assert.equal(BUILTIN_STICKERS.length, 12);

  for (const stk of BUILTIN_STICKERS) {
    assert.ok(stk.id.startsWith("stk-"), `Sticker ${stk.name} ID must start with stk-`);
    assert.ok(stk.svg.length > 10, `${stk.name} SVG content is too short`);
    assert.ok(
      stk.svg.includes("<path") || stk.svg.includes("<circle") || stk.svg.includes("<rect"),
      `${stk.name} must contain valid vector tags`
    );
  }
});

test("All 3 templates have valid declarative edit ops", () => {
  assert.equal(BUILTIN_TEMPLATES.length, 3);

  for (const tpl of BUILTIN_TEMPLATES) {
    assert.ok(tpl.id.startsWith("tpl-"), `Template ${tpl.name} ID must start with tpl-`);
    assert.ok(tpl.targetDuration > 0, `${tpl.name} duration must be positive`);
    assert.ok(tpl.ops.length >= 3, `${tpl.name} must contain at least 3 operations`);
  }
});
