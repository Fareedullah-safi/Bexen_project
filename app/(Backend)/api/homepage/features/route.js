import dbConnect from "@/Lib/mongoDB";
import Features from "@/Models/Features";
import cloudinary from "@/Lib/cloudinary";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];

const MAX_SIZE_IN_BYTES = 2 * 1024 * 1024;

async function uploadToCloudinary(file, folder) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      )
      .end(buffer);
  });

  const { secure_url, public_id } = result;

  return {
    url: secure_url,
    publicId: public_id,
  };
}

async function deleteFromCloudinary(publicId) {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
}

export async function GET() {
  try {
    await dbConnect();

    const doc = await Features.findOne({}).lean();

    return Response.json({
      success: true,
      data: doc || null,
    });
  } catch (err) {
    console.error("GET FEATURES ERROR:", err);

    return Response.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const tagline = (formData.get("tagline") || "").toString();
    const title = (formData.get("title") || "").toString();
    const cardsRaw = formData.get("cards");

    if (!cardsRaw) {
      return Response.json(
        {
          success: false,
          error: "Missing cards data",
        },
        {
          status: 400,
        },
      );
    }

    const cardsMeta = JSON.parse(cardsRaw);

    await dbConnect();

    const existing = await Features.findOne({});

    const cards = [];

    for (let i = 0; i < cardsMeta.length; i++) {
      const {
        title: cardTitle,
        description,
        iconMode,
        iconUrl,
        iconPublicId,
      } = cardsMeta[i];

      let icon = {
        url: "",
        publicId: "",
      };

      if (iconMode === "file") {
        const file = formData.get(`icon_${i}`);

        if (file && typeof file === "object" && file.size > 0) {
          if (!ALLOWED_TYPES.includes(file.type)) {
            return Response.json(
              {
                success: false,
                error: `Invalid icon type for card ${i + 1}`,
              },
              {
                status: 400,
              },
            );
          }

          if (file.size > MAX_SIZE_IN_BYTES) {
            return Response.json(
              {
                success: false,
                error: `Icon too large for card ${i + 1} (max 2MB)`,
              },
              {
                status: 400,
              },
            );
          }

          icon = await uploadToCloudinary(file, "admin-uploads/icons");
        }
      } else if (iconMode === "url") {
        icon = {
          url: (iconUrl || "").trim(),
          publicId: (iconPublicId || "").trim(),
        };
      }

      cards.push({
        title: (cardTitle || "").trim(),
        description: (description || "").trim(),
        icon,
      });
    }

    const newPublicIds = cards
      .map(({ icon }) => icon?.publicId)
      .filter(Boolean);

    const oldPublicIds = (existing?.cards || [])
      .map(({ icon }) => icon?.publicId)
      .filter(Boolean);

    const toDelete = oldPublicIds.filter((id) => !newPublicIds.includes(id));

    let saved;

    if (existing) {
      existing.tagline = tagline.trim();
      existing.title = title.trim();
      existing.cards = cards;

      saved = await existing.save();
    } else {
      saved = await Features.create({
        tagline: tagline.trim(),
        title: title.trim(),
        cards,
      });
    }

    await Promise.all(
      toDelete.map((publicId) => deleteFromCloudinary(publicId)),
    );

    return Response.json({
      success: true,
      data: saved,
    });
  } catch (err) {
    console.error("POST FEATURES ERROR:", err);

    return Response.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      },
    );
  }
}
