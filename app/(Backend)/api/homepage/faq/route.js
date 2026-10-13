import { NextResponse } from "next/server";
import dbConnect from "@/Lib/mongoDB";
import Faq from "@/Models/faq/FAQ";

export async function GET() {
  try {
    await dbConnect();

    const data = await Faq.findOne();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();

    const body = await request.json();

    const data = await Faq.findOneAndUpdate(
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
      message: "FAQ updated successfully",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
