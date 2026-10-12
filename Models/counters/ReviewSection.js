import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema({
  value: String,
  label: String,
});
const ReviewSchema = new mongoose.Schema({
  name: String,
  role: String,
  text: String,
  image: String,
});

const ReviewSectionSchema = new mongoose.Schema({
  section: {
    badgeText: String,
    highlightWord: String,
    headingLineOne: String,
    headingLineTwo: String,
    description: String,
  },
  stats: [StatsSchema],
  reviews:[ReviewSchema]
},
{
    timestamps :true
});

export default mongoose.models.ReviewSection || 
mongoose.model("ReviewSection", ReviewSectionSchema)

