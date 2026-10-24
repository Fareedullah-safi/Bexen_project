import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import connectDB from "@/Lib/mongoDB";
import BrandLogoTitle from "@/Models/brand-logo-title";
import { NextResponse } from "next/server";

const LANGUAGES = ["en", "ps", "fa"];

// Get the title for the selected language
export async function GET(request) {
  try {
    await connectDB();

    const lang = request.nextUrl.searchParams.get("lang") || "en";

    if (!LANGUAGES.includes(lang)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid language",
        },
        { status: 400 },
      );
    }

    const document = await BrandLogoTitle.findOne().lean();

    return NextResponse.json({
      success: true,
      lang,
      title: document?.translations?.[lang]?.title || "",
    });
  } catch (error) {
    console.error("Get brand logo title error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch brand logo title",
      },
      { status: 500 },
    );
  }
}

// Update the title for the selected language
export async function POST(request) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 },
      );
    }

    await connectDB();

    const body = await request.json();
    const { translations } = body;

    if (
      !translations ||
      typeof translations.en !== "string" ||
      typeof translations.ps !== "string" ||
      typeof translations.fa !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "English, Pashto, and Dari titles are required",
        },
        { status: 400 },
      );
    }

    let document = await BrandLogoTitle.findOne();

    if (!document) {
      document = new BrandLogoTitle();
    }

    document.set({
      translations: {
        en: { title: translations.en.trim() },
        ps: { title: translations.ps.trim() },
        fa: { title: translations.fa.trim() },
      },
    });

    const savedDocument = await document.save();

    console.log(
      "SAVED BRAND LOGO TRANSLATIONS:",
      JSON.stringify(savedDocument.toObject(), null, 2),
    );

    return NextResponse.json({
      success: true,
      message: "All language titles saved successfully",
      translations: savedDocument.translations,
    });
  } catch (error) {
    console.error("SAVE BRAND LOGO TRANSLATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to save translations",
      },
      { status: 500 },
    );
  }
}
