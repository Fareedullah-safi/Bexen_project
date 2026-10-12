import { NextResponse } from "next/server";
import connectDB from "@/Lib/mongoDB";
import ReviewSection from "@/Models/counters/ReviewSection";

export async function GET() {
  try {
    await connectDB();

    let data = await ReviewSection.findOne();

    if (!data) {
      data = await ReviewSection.create({
        section: {
          badgeText: "CLIENTS FEEDBACK",
          highlightWord: "Stories",
          headingLineOne: "Success Stories Fuel",
          headingLineTwo: "our Innovation.",
          description:
            "Manage the stats and review cards for your testimonial section.",
        },
        stats: [
          { value: "93%", label: "Projects Completed" },
          { value: "20M", label: "Reach Worldwide" },
          { value: "8.5X", label: "Faster Growth" },
          { value: "100+", label: "Awards Archived" },
        ],
        reviews: [],
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load data",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { section, stats, reviews } = body;

    let data = await ReviewSection.findOne();

    if (!data) {
      data = await ReviewSection.create({
        section,
        stats,
        reviews,
      });
    } else {
      data.section = section;
      data.stats = stats;
      data.reviews = reviews;
      await data.save();
    }

    return NextResponse.json({
      success: true,
      message: "Saved successfully",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save data server error",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}


export async function DELETE(req) {
  try {
    const { reviewId, publicId } = await req.json();

    await connectDB();

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    await ReviewsSection.updateOne(
      {},
      { $pull: { reviews: { _id: reviewId } } }
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}