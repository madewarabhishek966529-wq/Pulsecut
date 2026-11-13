import { Schema, model } from "mongoose";

const CustomEffectSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    prompt: String,
    fragment: { type: String, required: true },
    uniforms: [Schema.Types.Mixed],
    defaults: Schema.Types.Mixed,
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CustomEffect = model("CustomEffect", CustomEffectSchema);
