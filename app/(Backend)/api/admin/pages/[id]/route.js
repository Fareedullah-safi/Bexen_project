// ============================================
// PAGE API — Read, Update, and Delete Pages
// ============================================

// --- Import all the tools we need ---
import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectMongo from "@/Lib/mongoDB";
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// ============================================
// SMALL HELPER FUNCTIONS
// ============================================

// Send a "success" reply to the browser
function sendSuccess(data) {
  return NextResponse.json({ success: true, ...data });
}

// Send an "error" reply to the browser
function sendError(message, statusCode) {
  if (!statusCode) statusCode = 500;
  return NextResponse.json(
    { success: false, message: message },
    { status: statusCode },
  );
}

// Turn a slug like "about-us" into a URL like "/about-us"
function makeUrl(slug) {
  if (!slug) return "/";
  let cleanSlug = slug.replace(/^\/+/, "");
  return "/" + cleanSlug;
}

// Tell Next.js to refresh the website so visitors see new data
function refreshWebsite() {
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Could not refresh website:", error.message);
  }
}

// ============================================
// IMAGE HELPERS (Cloudinary photo storage)
// ============================================

// Search through page data and find ALL image IDs
// This digs into nested objects like opening folders inside folders
function findAllImageIds(data, foundIds) {
  if (!foundIds) {
    foundIds = [];
  }

  // If data is empty or not an object, stop searching
  if (!data || typeof data !== "object") {
    return foundIds;
  }

  // If it's a database object, convert to plain JavaScript first
  if (typeof data.toObject === "function") {
    data = data.toObject();
  }

  // If it's a list (array), search each item one by one
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      findAllImageIds(data[i], foundIds);
    }
    return foundIds;
  }

  // If it's an object, check every key inside it
  let keys = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = data[key];

    // Found an image ID! Save it.
    if (key === "publicId" || key === "public_id") {
      if (typeof value === "string" && value.trim() !== "") {
        foundIds.push(value.trim());
      }
    }
    // Value is another object? Dig deeper into it.
    else if (value && typeof value === "object") {
      findAllImageIds(value, foundIds);
    }
  }

  return foundIds;
}

// Delete a list of images from Cloudinary
async function deleteImagesFromCloudinary(imageIds) {
  // First, remove duplicates so we don't delete the same image twice
  let uniqueIds = [];
  for (let i = 0; i < imageIds.length; i++) {
    let id = imageIds[i];
    if (id && !uniqueIds.includes(id)) {
      uniqueIds.push(id);
    }
  }

  // Delete each image one by one
  for (let i = 0; i < uniqueIds.length; i++) {
    try {
      await cloudinary.uploader.destroy(uniqueIds[i], { invalidate: true });
    } catch (error) {
      // If one fails, log it but keep deleting the rest
      console.error("Failed to delete image:", uniqueIds[i], error.message);
    }
  }

  return uniqueIds.length;
}

// ============================================
// NAVBAR HELPER (the website menu at the top)
// ============================================

// This ONE function handles adding, updating, AND removing navbar links
async function updateNavbar(page) {
  try {
    // Step 1: Get the navbar from database (create one if it doesn't exist)
    let menu = await NavMenu.findOne();
    if (!menu) {
      menu = await NavMenu.create({ items: [] });
    }

    // Step 2: Get the URL for this page
    let pageUrl = makeUrl(page.slug);

    // Step 3: Remove any old version of this page from the navbar
    let cleanedItems = [];

    for (let i = 0; i < menu.items.length; i++) {
      let item = menu.items[i];

      // Convert database object to plain JavaScript
      let plainItem = item;
      if (typeof item.toObject === "function") {
        plainItem = item.toObject();
      }

      // Skip this item if it IS the page we're updating (we'll re-add it fresh)
      if (plainItem.href === pageUrl) {
        continue;
      }

      // Also remove this page from any dropdown children
      let cleanedChildren = [];
      let children = plainItem.children || [];
      for (let j = 0; j < children.length; j++) {
        if (children[j].href !== pageUrl) {
          cleanedChildren.push(children[j]);
        }
      }

      plainItem.children = cleanedChildren;
      plainItem.hasDropdown = cleanedChildren.length > 0;
      cleanedItems.push(plainItem);
    }

    // Step 4: If page should NOT show in navbar, save and stop
    if (!page.showInNav) {
      menu.items = cleanedItems;
      await menu.save();
      return;
    }

    // Step 5: Build the new navbar link
    let translations = page.translations || {};

    let englishTitle = page.title || "Untitled";
    if (translations.en && translations.en.title) {
      englishTitle = translations.en.title;
    }

    let pashtoTitle = "";
    if (translations.ps && translations.ps.title) {
      pashtoTitle = translations.ps.title;
    }

    let farsiTitle = "";
    if (translations.fa && translations.fa.title) {
      farsiTitle = translations.fa.title;
    }

    let newNavItem = {
      id: "nav_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      href: pageUrl,
      showInFooter: page.showInFooter ? true : false,
      hasDropdown: false,
      children: [],
      translations: {
        en: { label: englishTitle },
        ps: { label: pashtoTitle },
        fa: { label: farsiTitle },
      },
    };

    // Step 6: Decide WHERE to put this link
    let parentId = page.navParent;
    let hasParent = false;

    if (
      parentId &&
      parentId !== "none" &&
      parentId !== "null" &&
      parentId.trim() !== ""
    ) {
      hasParent = true;
    }

    let addedToParent = false;

    if (hasParent) {
      // Try to find the parent and add this as a dropdown child
      for (let i = 0; i < cleanedItems.length; i++) {
        if (cleanedItems[i].id === parentId) {
          cleanedItems[i].children.push(newNavItem);
          cleanedItems[i].hasDropdown = true;
          addedToParent = true;
          break;
        }
      }
    }

    // If no parent found, add it as a top-level menu item
    if (!addedToParent) {
      cleanedItems.push(newNavItem);
    }

    // Step 7: Save the updated navbar to database
    menu.items = cleanedItems;
    await menu.save();
  } catch (error) {
    console.error("Navbar update failed:", error.message);
  }
}

// ============================================
// API ROUTES (the actual endpoints)
// ============================================

// ── GET: Read a single page ──
// Example: GET /api/pages/123 → returns page with ID 123
export async function GET(request, { params }) {
  try {
    await connectMongo();

    let { id } = await params;
    let page = await Page.findById(id);

    if (!page) {
      return sendError("Page not found", 404);
    }

    return sendSuccess({ page: page });
  } catch (error) {
    return sendError(error.message);
  }
}

// ── PUT: Update an existing page ──
// Example: PUT /api/pages/123 → updates page with ID 123
export async function PUT(request, { params }) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }
    // Step 2: Connect to database
    await connectMongo();

    // Step 3: Get the page ID and new data
    let { id } = await params;
    let body = await request.json();

    // Step 4: Find the existing page
    let existingPage = await Page.findById(id);
    if (!existingPage) {
      return sendError("Page not found", 404);
    }

    // Step 5: Delete old images that are no longer used
    if (Array.isArray(body.blocks)) {
      let oldImageIds = findAllImageIds(existingPage.blocks || []);
      let newImageIds = findAllImageIds(body.blocks || []);

      // Find images that existed before but are NOT in the new data
      let imagesToDelete = [];
      for (let i = 0; i < oldImageIds.length; i++) {
        if (!newImageIds.includes(oldImageIds[i])) {
          imagesToDelete.push(oldImageIds[i]);
        }
      }

      if (imagesToDelete.length > 0) {
        await deleteImagesFromCloudinary(imagesToDelete);
      }
    }

    // Step 6: Prepare the update data
    let updateData = {};

    // Copy simple fields if they were sent
    let simpleFields = [
      "slug",
      "status",
      "showInNav",
      "navParent",
      "showInFooter",
      "parent",
      "blocks",
    ];
    for (let i = 0; i < simpleFields.length; i++) {
      let field = simpleFields[i];
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle the 3-language translations
    if (body.translations) {
      let newT = body.translations;
      let oldT = existingPage.translations || {};

      // English title: use new → fallback to old → fallback to body.title → fallback to existing
      let enTitle = existingPage.title || "";
      if (oldT.en && oldT.en.title) enTitle = oldT.en.title;
      if (body.title) enTitle = body.title;
      if (newT.en && newT.en.title) enTitle = newT.en.title;

      // Pashto title: use new → fallback to old → empty
      let psTitle = "";
      if (oldT.ps && oldT.ps.title) psTitle = oldT.ps.title;
      if (newT.ps && newT.ps.title) psTitle = newT.ps.title;

      // Farsi title: use new → fallback to old → empty
      let faTitle = "";
      if (oldT.fa && oldT.fa.title) faTitle = oldT.fa.title;
      if (newT.fa && newT.fa.title) faTitle = newT.fa.title;

      updateData.translations = {
        en: { title: enTitle.trim() },
        ps: { title: psTitle.trim() },
        fa: { title: faTitle.trim() },
      };

      updateData.title = enTitle.trim() || existingPage.title;
    } else if (body.title !== undefined) {
      updateData.title = body.title;
    }

    // Step 7: Save to database
    let updatedPage = await Page.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedPage) {
      return sendError("Page update failed", 404);
    }

    // Step 8: Update the navbar
    if (body.slug && body.slug !== existingPage.slug) {
      let oldPageData = existingPage.toObject();
      oldPageData.showInNav = false;
      await updateNavbar(oldPageData);
    }
    await updateNavbar(updatedPage);

    // Step 9: Refresh the website
    refreshWebsite();

    // Step 10: Send success
    return sendSuccess({
      message: "Page updated successfully",
      page: updatedPage,
    });
  } catch (error) {
    console.error("PUT error:", error);
    return sendError(error.message);
  }
}

// ── DELETE: Remove a page ──
// Example: DELETE /api/pages/123 → deletes page with ID 123
export async function DELETE(request, { params }) {
  try {
    // Step 1: Check if user is allowed to delete
    let permission = await requireDeletePermission();
    if (!permission.authorized) {
      return permission.response;
    }

    // Step 2: Connect to database
    await connectMongo();

    // Step 3: Get the page ID
    let { id } = await params;

    // Step 4: Find the page
    let page = await Page.findById(id);

    // Already gone? Just say "done"
    if (!page) {
      return sendSuccess({ message: "Page already deleted", deletedImages: 0 });
    }

    // Step 5: Delete all images belonging to this page
    let imageIds = findAllImageIds(page.blocks || []);
    let deletedCount = await deleteImagesFromCloudinary(imageIds);

    // Step 6: Delete the page from database
    await Page.findByIdAndDelete(id);

    // Step 7: Remove the page link from navbar
    await updateNavbar({ slug: page.slug, showInNav: false });

    // Step 8: Refresh the website
    refreshWebsite();

    // Step 9: Send success
    return sendSuccess({ deletedImages: deletedCount });
  } catch (error) {
    console.error("DELETE error:", error);
    return sendError(error.message);
  }
}
