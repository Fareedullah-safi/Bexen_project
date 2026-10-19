import connectDB from "@/Lib/mongoDB";
import AddAdmin from "@/Models/AdminUsers/AddAdmin";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!secret) {
      console.error("ADMIN_SESSION_SECRET is missing.");
      return NextResponse.json(
        { success: false, message: "Server authentication is not configured." },
        { status: 500 },
      );
    }

    await connectDB();

    const { email, password } = await req.json();

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    const admin = await AddAdmin.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!admin || typeof admin.password !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Create a signed session containing the MongoDB UID and email.
    const sessionData = {
      uid: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    const payload = Buffer.from(JSON.stringify(sessionData)).toString(
      "base64url",
    );

    const signature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const sessionToken = `${payload}.${signature}`;

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        admin: {
          uid: admin._id.toString(),
          email: admin.email,
          name: admin.name,
        },
      },
      { status: 200 },
    );

    response.cookies.set("adminSession", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to log in. Please try again." },
      { status: 500 },
    );
  }
}
