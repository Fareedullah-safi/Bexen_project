import { NextResponse } from "next/server";
import connectDB from "@/Lib/mongoDB";
import Contact from "@/Models/home/Contact";

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
