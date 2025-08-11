"use client"

import React from "react"
import MiniDrawerMUI from "@/app/components/mui/MiniDrawer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <MiniDrawerMUI>
      {children}
    </MiniDrawerMUI>
  );
}
