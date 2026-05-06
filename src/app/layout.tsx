import React, { Suspense } from "react";
import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";

import "@stellar/design-system/build/styles.min.css";
import "@/styles/globals.scss";

const GA_TRACKING_ENABLED =
  process.env.NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS !== "true" &&
  process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  title: "Stellar Skills",
  description:
    "Agent-readable documentation for building on the Stellar network.",
};

// Automatically generates nonce for script and style tags
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="sds-theme-light" data-sds-theme="sds-theme-light">
        <Suspense>
          <div id="root">{children}</div>
          {GA_TRACKING_ENABLED && <GoogleTagManager gtmId="GTM-KCNDDL3" />}
        </Suspense>
      </body>
    </html>
  );
}
