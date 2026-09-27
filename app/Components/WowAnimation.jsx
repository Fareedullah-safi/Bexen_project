"use client";

import { useEffect } from "react";
import "animate.css"; // 👈 REQUIRED — otherwise nothing animates

export default function WowAnimation({
  boxClass = "wow",
  animateClass = "animate__animated", // animate.css v4 prefix
  offset = 0,
  mobile = true,
  live = true,
} = {}) {
  useEffect(() => {
    let wowInstance;

    const init = async () => {
      const mod = await import("wowjs");
      const WOW = mod.WOW ?? mod.default?.WOW; // handle both interop cases

      wowInstance = new WOW({
        boxClass,
        animateClass,
        offset,
        mobile,
        live,
      });

      wowInstance.init();
    };

    init();

    // Cleanup: stop WOW from firing on unmounted route
    return () => {
      if (wowInstance?.stop) wowInstance.stop();
      if (typeof wowInstance?.sync === "function") wowInstance.sync();
    };
  }, [boxClass, animateClass, offset, mobile, live]);

  return null;
}
