import connectDB from "@/Lib/mongoDB";
import AddAdmin from "@/Models/AdminUsers/AddAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, msg: "Please fill in all fields." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, msg: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          msg: "Please select an admin role.",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingAdmin = await AddAdmin.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, msg: "Email already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔴 FIX IS HERE: Added `role` below 👇
    const newAdmin = await AddAdmin.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "super-admin", // 👈 NOW SAVES THE SELECTED ROLE!
    });

    return NextResponse.json(
      {
        success: true,
        msg: "Admin created successfully.",
        admin: {
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add admin error:", error);

    return NextResponse.json(
      { success: false, msg: "Unable to create admin." },
      { status: 500 },
    );
  }
}
