import dbConnect from "@/Lib/mongoDB"; // Ensure this path points to your DB connection file
import ServiceDetails from "@/Models/Services-Details/Service-Details/ServiceDetails";
import { NextResponse } from "next/server";

// GET: Fetch data (and auto-create if empty)
export async function GET() {
  try {
    await dbConnect();

    // Fetch the single document
    let data = await ServiceDetails.findOne();

    // If database is brand new and empty, create a default document automatically
    if (!data) {
      data = await ServiceDetails.create({});
    }

    return NextResponse.json(
      {
        success: true,
        data: data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/service-details Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Update or Insert data
export async function POST(req) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }

    await dbConnect();

    // Parse incoming JSON safely
    const body = await req.json();

    // Atomic update: Updates the document if it exists, creates it if it doesn't (upsert)
    const updatedData = await ServiceDetails.findOneAndUpdate(
      {}, // Empty filter means "find the first/only document"
      { $set: body },
      {
        new: true, // Return the updated document
        upsert: true, // Create if it doesn't exist
        runValidators: true, // Run schema validation
        setDefaultsOnInsert: true, // Apply defaults if creating new
      },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Service Details successfully updated.",
        data: updatedData,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/service-details Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update Service Details. Please try again.",
      },
      { status: 500 },
    );
  }
}
