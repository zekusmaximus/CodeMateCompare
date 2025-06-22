"use client";

import { MantineProvider as CoreMantineProvider, createTheme } from "@mantine/core";
import React from "react";

const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <CoreMantineProvider theme={theme} defaultColorScheme="dark">
      {children}
    </CoreMantineProvider>
  );
}
