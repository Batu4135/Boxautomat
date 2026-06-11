"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { getOrCreateOwnershipIdentity } from "@/lib/client-ownership";

export function DeviceOwnershipSync() {
  const router = useRouter();
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (hasAttemptedRef.current) {
      return;
    }

    hasAttemptedRef.current = true;

    const { ownerToken, recoveryCode } = getOrCreateOwnershipIdentity();

    void fetch("/api/device-session", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ ownerToken, recoveryCode })
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json() as Promise<{ restored?: boolean }>;
      })
      .then((payload) => {
        if (payload?.restored) {
          router.refresh();
        }
      })
      .catch(() => {
        return null;
      });
  }, [router]);

  return null;
}
