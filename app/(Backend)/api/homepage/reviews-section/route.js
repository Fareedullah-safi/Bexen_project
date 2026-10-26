import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import ReviewSection from "@/Models/counters/ReviewSection";
import { NextResponse } from "next/server";

const defaults = {
  section: {
    badgeText: { en: "CLIENTS FEEDBACK", ps: "", fa: "" },
    highlightWord: { en: "Stories", ps: "", fa: "" },
    headingLineOne: { en: "Success Stories Fuel", ps: "", fa: "" },
    headingLineTwo: { en: "our Innovation.", ps: "", fa: "" },
    description: {
      en: "Manage the stats and review cards for your testimonial section.",
      ps: "",
      fa: "",
    },
  },
  stats: [],
  reviews: [],
};

const response = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

export async function GET() {
  try {
    await connectDB();
    const data = await ReviewSection.findOne().lean();
    return NextResponse.json({
      success: true,
      data: data || defaults,
    });
  } catch (error) {
    console.error(error);
    return response("Failed to load reviews.", 500);
  }
}

export async function POST(req) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectDB();
    const { section, stats, reviews } = await req.json();

    const data = await ReviewSection.findOne();
    const existing = new Map(
      (data?.reviews || []).map((review) => [String(review._id), review._id]),
    );

    const savedReviews = reviews.map(({ _id, ...review }) => ({
      ...review,
      ...(_id && existing.has(String(_id))
        ? { _id: existing.get(String(_id)) }
        : {}),
    }));

    const saved = data || new ReviewSection();
    saved.section = section;
    saved.stats = stats;
    saved.reviews = savedReviews;
    await saved.save();

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Reviews save error:", error);
    return response(error.message || "Failed to save reviews.", 400);
  }
}

export async function DELETE(req) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized) return permission.response;

    await connectDB();
    const { reviewId } = await req.json();
    const data = await ReviewSection.findOne();
    const review = data?.reviews.id(reviewId);

    if (!review) return response("Review not found.", 404);

    if (review.publicId) {
      await cloudinary.uploader.destroy(review.publicId);
    }

    data.reviews.pull({ _id: reviewId });
    await data.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reviews delete error:", error);
    return response("Failed to delete review.", 500);
  }
}
