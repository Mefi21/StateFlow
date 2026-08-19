"use client";

import { useEffect } from "react";
import { syncPendingSnapshots } from "./queue";

export function OfflineSyncManager() {
  useEffect(() => {
    const sync = () => void syncPendingSnapshots();
    sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, []);
  return null;
}
