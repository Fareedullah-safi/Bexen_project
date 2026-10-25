import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import Projects from "@/Models/Projects/Projects";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// GET: Load data
export async function GET() {
  try {
    await connectDB();
    const data = await Projects.findOne({});
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST: Save header and projects
export async function POST(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized)
      return NextResponse.json(
        { message: "Permission denied." },
        { status: 403 },
      );

    await connectDB();

    const { header, projects } = await request.json();
    let data = await Projects.findOne({});
    if (!data) data = await Projects.create({});

    if (header) data.header = header;
    if (Array.isArray(projects)) data.projects = projects;

    await data.save();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE: Remove a project
export async function DELETE(request) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized)
      return NextResponse.json(
        { message: "Permission denied." },
        { status: 403 },
      );

    await connectDB();

    const id = new URL(request.url).searchParams.get("id");
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json(
        { message: "Invalid project ID." },
        { status: 400 },
      );

    const data = await Projects.findOne({});
    const project = data?.projects.id(id);

    if (!project)
      return NextResponse.json(
        { message: "Project not found." },
        { status: 404 },
      );

    if (project.publicId) await cloudinary.uploader.destroy(project.publicId);

    data.projects.pull({ _id: id });
    await data.save();

    return NextResponse.json({ success: true, message: "Project deleted." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
