"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Not fatal: the app just won't have offline/install support
        // (e.g. running over plain HTTP on a LAN IP during dev).
      });
    }
  }, []);

  return null;
}
