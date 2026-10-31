import connectDB from "@/Lib/mongoDB";
import Contact from "@/Models/home/Contact";
import { NextResponse } from "next/server";

// ==========================================
// YOUR EXACT POST ROUTE (UNTOUCHED)
// ==========================================
export async function POST(request) {
  try {
    const { fullName, email, phone, service, message } = await request.json();

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const contact = await Contact.create({
      fullName,
      email,
      phone,
      service: service || "",
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been submitted successfully.",
        data: contact,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Contact API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit your message.",
      },
      { status: 500 },
    );
  }
}

// ==========================================
// NEW: GET ALL MESSAGES
// ==========================================
export async function GET() {
  try {
    await connectDB();
    const messages = await Contact.find().sort({ createdAt: -1 }); // Newest first
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error loading messages" },
      { status: 500 },
    );
  }
}

// ==========================================
// NEW: DIRECT DELETE MESSAGE
// ==========================================
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID required" },
        { status: 400 },
      );
    }

    await connectDB();
    await Contact.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Deleted" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete" },
      { status: 500 },
    );
  }
}
