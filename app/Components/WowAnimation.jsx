"use client";

import { useEffect } from "react";

export default function WowAnimation() {
  useEffect(() => {
    let wowInstance;

    const initWOW = async () => {
      try {
        const WOWModule = await import("wow.js");

        const WOWConstructor = WOWModule.default || WOWModule.WOW;

        if (typeof WOWConstructor !== "function") {
          console.error("WOW.js constructor was not found:", WOWModule);
          return;
        }

        wowInstance = new WOWConstructor({
          boxClass: "wow",
          animateClass: "animate__animated",
          offset: 60,
          mobile: true,
          live: true,
        });

        wowInstance.init();
      } catch (error) {
        console.error("WOW.js initialization failed:", error);
      }
    };

    initWOW();

    return () => {
      if (wowInstance?.stop) {
        wowInstance.stop();
      }
    };
  }, []);

  return null;
}
