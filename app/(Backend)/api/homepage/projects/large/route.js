import { NextResponse } from "next/server";
import connectDB from "@/Lib/mongoDB";
import cloudinary from "@/Lib/cloudinary";
import LargeProject from "@/Models/Projects/LargeProject";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const projects = await LargeProject.find().sort({ order: 1 });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("GET Large Projects Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const projectsData = formData.get("projects");

    if (!projectsData) {
      return NextResponse.json(
        { success: false, message: "Projects data is required" },
        { status: 400 },
      );
    }

    const projects = JSON.parse(projectsData);

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

      let image = project.image || "";
      let publicId = project.publicId || "";

      if (file && typeof file === "object" && file.size > 0) {
        if (!file.type.startsWith("image/")) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid image at project ${index + 1}`,
            },
            { status: 400 },
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, message: `Image ${index + 1} exceeds 5MB` },
            { status: 400 },
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "bexon/large-projects",
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
        tag: project.tag || "",
        title: project.title || "",
        image,
        publicId,
        order: index,
      });
    }

    await LargeProject.deleteMany({});
    const result = await LargeProject.insertMany(savedProjects);

    return NextResponse.json({
      success: true,
      message: "Large projects saved successfully",
      projects: result,
    });
  } catch (error) {
    console.error("POST Large Projects Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save large projects" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Project id is required" },
        { status: 400 },
      );
    }

    const project = await LargeProject.findById(id);

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 },
      );
    }

    if (project.publicId) {
      try {
        await cloudinary.uploader.destroy(project.publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
      }
    }

    await LargeProject.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Large project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Large Project Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete project" },
      { status: 500 },
    );
  }
}
