"use client";

import { MultiSelect, Box, Text } from "@mantine/core";
import React from "react";

interface ToolOption {
  value: string;
  label: string;
}

interface ToolSelectorProps {
  selectedTools: string[];
  onSelectionChange: (selected: string[]) => void;
  toolOptions: ToolOption[]; // Now passed as a prop
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  selectedTools,
  onSelectionChange,
  toolOptions, // Use the passed prop
}) => {
  return (
    <Box mb="md">
      <Text fw={500} mb="xs">Select Tools (1 for detail, 2 for comparison):</Text>
      <MultiSelect
        data={toolOptions}
        value={selectedTools}
        onChange={onSelectionChange}
        placeholder="Select up to 2 tools"
        limit={2}
        searchable
        clearable
      />
    </Box>
  );
};
