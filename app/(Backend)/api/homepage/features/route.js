import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import Features from "@/Models/Features";
import { NextResponse } from "next/server";

const languages = ["en", "ps", "fa"];

/* ==================== CLOUDINARY HELPERS ==================== */

async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error);
  }
}

/* ==================== GET FEATURES ==================== */

export async function GET(request) {
  try {
    await connectDB();

    const lang = new URL(request.url).searchParams.get("lang") || "en";

    if (!languages.includes(lang)) {
      return NextResponse.json(
        { success: false, message: "Invalid language" },
        { status: 400 },
      );
    }

    const features = await Features.findOne().lean();
    const translation = features?.translations?.[lang] || {};

    return NextResponse.json({
      success: true,
      data: {
        tagline:
          translation.tagline || (lang === "en" ? features?.tagline || "" : ""),
        title:
          translation.title || (lang === "en" ? features?.title || "" : ""),

        cards: (features?.cards || []).map((card) => ({
          _id: String(card._id),
          title:
            card.translations?.[lang]?.title ||
            (lang === "en" ? card.title || "" : ""),
          description:
            card.translations?.[lang]?.description ||
            (lang === "en" ? card.description || "" : ""),
          icon: card.icon || { url: "", publicId: "" },
        })),
      },
    });
  } catch (error) {
    console.error("Get features:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load features" },
      { status: 500 },
    );
  }
}

/* ==================== SAVE FEATURES ==================== */

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

    const form = await request.formData();

    let translations;
    let cards;

    try {
      translations = JSON.parse(form.get("translations") || "{}");
      cards = JSON.parse(form.get("cards") || "[]");
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON form data" },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(cards) ||
      !translations ||
      typeof translations !== "object"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid features data" },
        { status: 400 },
      );
    }

    let features = await Features.findOne();

    if (!features) {
      features = new Features({ cards: [] });
    }

    /* Save section translations */

    for (const lang of languages) {
      features.set(
        `translations.${lang}.tagline`,
        translations[lang]?.tagline || "",
      );

      features.set(
        `translations.${lang}.title`,
        translations[lang]?.title || "",
      );
    }

    /* Save cards and their translations */

    for (let i = 0; i < cards.length; i++) {
      const item = cards[i];

      if (!item || typeof item !== "object") {
        return NextResponse.json(
          { success: false, message: "Invalid feature card" },
          { status: 400 },
        );
      }

      let card = item._id ? features.cards.id(item._id) : null;

      if (item._id && !card) {
        return NextResponse.json(
          { success: false, message: "Feature card not found" },
          { status: 400 },
        );
      }

      if (!card) {
        card = features.cards.create({});
        features.cards.push(card);
      }

      for (const lang of languages) {
        card.set(
          `translations.${lang}.title`,
          item.translations?.[lang]?.title || "",
        );

        card.set(
          `translations.${lang}.description`,
          item.translations?.[lang]?.description || "",
        );
      }

      /*
       * Cloudinary images are uploaded directly from the frontend widget.
       * The API only saves their secure URL and public ID.
       */

      const oldPublicId = card.icon?.publicId || "";
      const iconUrl =
        typeof item.iconUrl === "string" ? item.iconUrl.trim() : "";
      const iconPublicId =
        typeof item.iconPublicId === "string" ? item.iconPublicId.trim() : "";

      if (item.clearIcon === true) {
        card.icon = {
          url: "",
          publicId: "",
        };

        if (oldPublicId) {
          await deleteCloudinaryImage(oldPublicId);
        }
      } else if (iconPublicId) {
        /*
         * Save the new Cloudinary image reference.
         * Delete the old image only if its public ID changed.
         */

        card.icon = {
          url: iconUrl,
          publicId: iconPublicId,
        };

        if (oldPublicId && oldPublicId !== iconPublicId) {
          await deleteCloudinaryImage(oldPublicId);
        }
      } else if (item.iconMode === "url") {
        /*
         * Compatibility with existing external-URL icon records.
         * Do not delete a Cloudinary image unless the icon was changed.
         */

        card.icon = {
          url: iconUrl,
          publicId: "",
        };

        if (oldPublicId) {
          await deleteCloudinaryImage(oldPublicId);
        }
      }
      /*
       * If no new icon or removal was submitted, keep the existing icon.
       */
    }

    await features.save();

    return NextResponse.json({
      success: true,
      message: "Features saved successfully",
      data: {
        translations: features.translations,
        cards: features.cards,
      },
    });
  } catch (error) {
    console.error("Save features:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save features" },
      { status: 500 },
    );
  }
}

/* ==================== DELETE FEATURE CARD ==================== */

export async function DELETE(request) {
  try {
    const permission = await requireDeletePermission();

    if (!permission.authorized) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 },
      );
    }

    await connectDB();

    const { cardId } = await request.json();
    const features = await Features.findOne();
    const card = features?.cards.id(cardId);

    if (!card) {
      return NextResponse.json(
        { success: false, message: "Card not found" },
        { status: 404 },
      );
    }

    const publicId = card.icon?.publicId;

    features.cards.pull({ _id: cardId });

    await features.save();

    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }

    return NextResponse.json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    console.error("Delete feature:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete feature" },
      { status: 500 },
    );
  }
}
