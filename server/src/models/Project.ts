import { Schema, model } from "mongoose";

const ProjectSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Untitled" },
    thumbnailUrl: String,
    timeline: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Project = model("Project", ProjectSchema);
