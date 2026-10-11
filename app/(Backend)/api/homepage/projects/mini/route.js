import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectDB from "@/Lib/mongoDB";
import cloudinary from "@/Lib/cloudinary";
import MiniProject from "@/Models/Projects/MiniProject";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const projects = await MiniProject.find().sort({ order: 1 });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("GET Mini Projects Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch mini projects" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const projectsData = formData.get("projects");

    if (typeof projectsData !== "string") {
      return NextResponse.json(
        { success: false, message: "Projects data is required" },
        { status: 400 },
      );
    }

    let projects;

    try {
      projects = JSON.parse(projectsData);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid projects data" },
        { status: 400 },
      );
    }

    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { success: false, message: "Projects must be an array" },
        { status: 400 },
      );
    }

    const savedProjects = [];

    for (let index = 0; index < projects.length; index++) {
      const project = projects[index];
      const file = formData.get(`image_${index}`);
      const hasFile =
        file && typeof file.arrayBuffer === "function" && file.size > 0;

      const tag = project?.tag?.trim();
      const title = project?.title?.trim();
      let image = project?.image?.trim() || "";
      let publicId = project?.publicId || "";

      if (!tag || !title || (!image && !hasFile)) {
        return NextResponse.json(
          {
            success: false,
            message: `Complete the tag, title, and image for mini project ${index + 1}`,
          },
          { status: 400 },
        );
      }

      if (hasFile) {
        if (!file.type.startsWith("image/")) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid image for mini project ${index + 1}`,
            },
            { status: 400 },
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              success: false,
              message: `Image ${index + 1} exceeds 5MB`,
            },
            { status: 400 },
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "bexon/mini-projects",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );

          stream.end(buffer);
        });

        image = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      }

      savedProjects.push({
        tag,
        title,
        image,
        publicId,
        order: index,
      });
    }

    await MiniProject.deleteMany({});
    const result = await MiniProject.insertMany(savedProjects);

    return NextResponse.json({
      success: true,
      message: "Mini projects saved successfully",
      projects: result,
    });
  } catch (error) {
    console.error("POST Mini Projects Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save mini projects" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const id = new URL(request.url).searchParams.get("id");

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Valid project id is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const project = await MiniProject.findById(id);

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Mini project not found" },
        { status: 404 },
      );
    }

    if (project.publicId) {
      await cloudinary.uploader.destroy(project.publicId);
    }

    await MiniProject.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Mini project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Mini Project Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete mini project" },
      { status: 500 },
    );
  }
}
