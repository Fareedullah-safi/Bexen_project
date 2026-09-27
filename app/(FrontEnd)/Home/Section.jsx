"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Section() {
  const images = [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  ];

  const [image, setImage] = useState(images[0]);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImage((current) => {
        const index = images.indexOf(current);
        const nextImage = images[(index + 1) % images.length];

        setImageKey((key) => key + 1);

        return nextImage;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (img) => {
    setImage(img);
    setImageKey((key) => key + 1);
  };

  return (
    <main className="z-7 h-full w-full px-4">
      <div className="relative mx-auto h-125 w-full overflow-hidden">
        {/* IMAGE */}
        <div
          key={imageKey}
          className="wow animate__animated animate__fadeIn h-full w-full"
          data-wow-duration="1.2s"
        >
          <Image src={image} alt="Nature Image" fill priority className="rounded-lg object-cover" />
        </div>
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-3">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleImageChange(img)}
              className={`h-3 w-3 cursor-pointer rounded-full transition-all duration-300 hover:bg-cyan-700 ${
                image === img ? "scale-125 bg-cyan-700" : "bg-white"
              }`}
              aria-label={`Show image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
