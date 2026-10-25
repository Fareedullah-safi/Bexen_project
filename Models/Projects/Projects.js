import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    fa: { type: String, default: "" },
    ps: { type: String, default: "" },
  },
  { _id: false },
);

const headerSchema = new mongoose.Schema(
  {
    badgeText: { type: translationSchema, default: () => ({}) },
    headingLine: { type: translationSchema, default: () => ({}) },
    highlightWord: { type: translationSchema, default: () => ({}) },
    description: { type: translationSchema, default: () => ({}) },
    buttonText: { type: translationSchema, default: () => ({}) },
    buttonLink: { type: String, default: "/projects" },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema({
  tag: { type: translationSchema, default: () => ({}) },
  title: { type: translationSchema, default: () => ({}) },
  image: { type: String, default: "" },
  publicId: { type: String, default: "" },
  order: { type: Number, default: 0 },
});

const projectsSchema = new mongoose.Schema(
  {
    header: { type: headerSchema, default: () => ({}) },
    projects: { type: [projectSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.Projects ||
  mongoose.model("Projects", projectsSchema);
