"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ImageManager from "@/app/admin/home/reusable-components/ImageManager";

export default function HomePage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch slider images
  useEffect(() => {
    const getSlides = async () => {
      try {
        const res = await fetch("/api/homepage");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load slides.");
        }

        setSlides(data.slides || []);
      } catch (error) {
        console.error("Fetch slides:", error);
        toast.error(error.message || "Failed to load slides.");
      } finally {
        setLoading(false);
      }
    };

    getSlides();
  }, []);

  // Upload image to API
  const addImage = async ({ file, url }) => {
    const formData = new FormData();

    if (file) {
      formData.append("image", file);
    }

    if (url) {
      formData.append("imageUrl", url);
    }

    try {
      const res = await fetch("/api/homepage", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      // Add new image to the list
      setSlides((prev) => [...prev, data]);
    } catch (error) {
      console.error("Upload image:", error);
      throw error; // ImageManager shows the error toast
    }
  };

  // Remove image
  const removeImage = async (id) => {
    try {
      const res = await fetch("/api/homepage", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete image");
      }

      setSlides((prev) => prev.filter((slide) => slide._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      throw error; // ImageManager shows the error toast
    }
  };

  return (
    <ImageManager
      items={slides}
      loading={loading}
      onAdd={addImage}
      onDelete={removeImage}
      title="Home Slider"
      description="Manage your homepage slider images."
      addTitle="Add Slider"
      uploadButtonText="Upload Slider Image"
      emptyText="No slider images yet."
      getImageAlt={(_, index) => `Slide ${index + 1}`}
    />
  );
}
