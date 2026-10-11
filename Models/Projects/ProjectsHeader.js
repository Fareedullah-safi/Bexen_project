
import mongoose from "mongoose";

const ProjectsHeaderSchema = new mongoose.Schema(
  {
    badgeText: {
      type: String,
      required: true,
      trim: true,
    },

    headingLine: {
      type: String,
      required: true,
      trim: true,
    },

    highlightWord: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    buttonText: {
      type: String,
      required: true,
      trim: true,
    },

    buttonLink: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\/(?!\/)[a-zA-Z0-9/_-]*$/,
        "Enter a valid internal link starting with /",
      ],
    },
  },
  {
    timestamps: true,
  },
);

const ProjectsHeader =
  mongoose.models.ProjectsHeader ||
  mongoose.model("ProjectsHeader", ProjectsHeaderSchema);

export default ProjectsHeader;
