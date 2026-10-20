import { requireDeletePermission, requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import ReviewSection from "@/Models/counters/ReviewSection";
import { NextResponse } from "next/server";

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
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }
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
    //USER ADMIN CHECKS
    const permission = await requireDeletePermission();

    console.log("DELETE AUTHORIZATION:", {
      authorized: permission.authorized,
      role: permission.admin?.role,
    });

    if (!permission.authorized) {
      return permission.response;
    }
    //USER ADMIN CHECKS
    await connectDB();

    const { reviewId, publicId } = await req.json();

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: "Review ID is required" },
        { status: 400 },
      );
    }

    const reviewSection = await ReviewSection.findOne();

    if (!reviewSection) {
      return NextResponse.json(
        { success: false, message: "Review section not found" },
        { status: 404 },
      );
    }

    const review = reviewSection.reviews.id(reviewId);

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 },
      );
    }

    const imagePublicId = publicId || review.publicId;

    if (imagePublicId) {
      const result = await cloudinary.uploader.destroy(imagePublicId, {
        resource_type: "image",
      });

      if (result.result !== "ok" && result.result !== "not found") {
        return NextResponse.json(
          {
            success: false,
            message: "Cloudinary image could not be deleted",
            result: result.result,
          },
          { status: 500 },
        );
      }
    }

    reviewSection.reviews.pull({ _id: reviewId });
    await reviewSection.save();

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Review delete error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
