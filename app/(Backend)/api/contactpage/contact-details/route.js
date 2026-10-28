import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import dbConnect from "@/Lib/mongoDB";
import ContactInfo from "@/Models/Contact-Page/contact-details/contact-details";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    let data = await ContactInfo.findOne();

    // Auto-create if database is empty
    if (!data) data = await ContactInfo.create({});

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }

    await dbConnect();
    const body = await req.json();

    const updatedData = await ContactInfo.findOneAndUpdate(
      {},
      { $set: body },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({
      success: true,
      message: "Contact Info updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
