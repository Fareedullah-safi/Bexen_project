import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import connectDB from "@/Lib/mongoDB";
import AddAdmin from "@/Models/AdminUsers/AddAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// ==========================================
// 1. GET: Fetch All Admins (Excludes passwords)
// ==========================================
export async function GET() {
  try {
    await connectDB();

    const admins = await AddAdmin.find()
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: admins }, { status: 200 });
  } catch (error) {
    console.error("Get admins error:", error);
    return NextResponse.json(
      { success: false, msg: "Unable to fetch admins." },
      { status: 500 },
    );
  }
}

// ==========================================
// 2. YOUR EXACT POST METHOD (100% UNTOUCHED)
// ==========================================
export async function POST(req) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }
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

// ==========================================
// 3. PATCH: Update Admin Role
// ==========================================
export async function PATCH(req) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }
    await connectDB();
    const { id, role } = await req.json();

    if (!id || !role) {
      return NextResponse.json(
        { success: false, msg: "Admin ID and role are required." },
        { status: 400 },
      );
    }

    const updatedAdmin = await AddAdmin.findByIdAndUpdate(
      id,
      { $set: { role } },
      { returnDocument: "after" },
    ).select("-password -__v");

    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, msg: "Admin not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, msg: "Role updated successfully.", data: updatedAdmin },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { success: false, msg: "Unable to update role." },
      { status: 500 },
    );
  }
}

// ==========================================
// 4. DELETE: Delete Admin by ID
// ==========================================
export async function DELETE(req) {
  try {
    const permission = await requireDeletePermission();

    if (!permission.authorized) {
      return permission.response;
    }
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, msg: "Admin ID is required." },
        { status: 400 },
      );
    }

    const deletedAdmin = await AddAdmin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return NextResponse.json(
        { success: false, msg: "Admin not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, msg: "Admin deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { success: false, msg: "Unable to delete admin." },
      { status: 500 },
    );
  }
}
