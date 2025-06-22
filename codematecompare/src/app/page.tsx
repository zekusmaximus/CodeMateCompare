"use client";

"use client";

import { useState, useEffect } from 'react';
import { Container, Title, Text, Space, Alert, Loader, Center, Paper } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import { ToolSelector } from '@/components/ToolSelector';
import { ToolDetailView } from '@/components/ToolDetailView';
import { CompareModeView } from '@/components/CompareModeView';
// import { mockToolData } from '@/data/mock-data'; // No longer directly using mockData here
import { ToolData } from '@/types';
import { mockToolData } from '@/data/mock-data'; // Keep for ToolSelector options for now

export default function HomePage() {
  const [selectedToolNames, setSelectedToolNames] = useState<string[]>([]);
  const [toolDataForView, setToolDataForView] = useState<ToolData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedToolNames.length === 0) {
        setToolDataForView([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setToolDataForView([]); // Clear previous data

      try {
        let fetchedData: ToolData[] = [];
        if (selectedToolNames.length === 1) {
          const response = await fetch(`/api/tool/${encodeURIComponent(selectedToolNames[0])}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch data for ${selectedToolNames[0]}`);
          }
          const data: ToolData = await response.json();
          fetchedData = [data];
        } else if (selectedToolNames.length === 2) {
          const response = await fetch(`/api/compare?tools=${encodeURIComponent(selectedToolNames[0])},${encodeURIComponent(selectedToolNames[1])}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch comparison data`);
          }
          fetchedData = await response.json();
        }

        // Ensure the order of results matches the order in selectedToolNames for consistency
        const sortedData = selectedToolNames.map(name => fetchedData.find(d => d.tool.toLowerCase() === name.toLowerCase())).filter(Boolean) as ToolData[];
        setToolDataForView(sortedData);

      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred.');
        setToolDataForView([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedToolNames]);

  const handleSelectionChange = (selected: string[]) => {
    setSelectedToolNames(selected);
  };

  // ToolSelector still needs the list of all available tools for its dropdown
  // This part can be optimized later if the list of tools itself should come from an API
  const toolSelectorOptions = mockToolData.map(tool => ({
    value: tool.tool,
    label: tool.tool,
  }));


  return (
    <Container fluid p="lg">
      <Paper shadow="xs" p="md" mb="xl" withBorder bg="var(--mantine-color-body)">
        <Title order={1} ta="center" mb="xs">CodeMateCompare</Title>
        <Text ta="center" c="dimmed" mb="lg">
          Interactive, on-demand coding-assistant comparison. Select one tool to see details, or two to compare side-by-side.
        </Text>
        <ToolSelector
          selectedTools={selectedToolNames}
          onSelectionChange={handleSelectionChange}
          toolOptions={toolSelectorOptions} // Pass the options here
        />
      </Paper>

      {isLoading && (
        <Center mt="xl">
          <Loader />
          <Text ml="sm">Fetching data...</Text>
        </Center>
      )}

      {!isLoading && error && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error Fetching Data" color="red" radius="md" mt="xl">
          {error}
        </Alert>
      )}

      {!isLoading && !error && selectedToolNames.length === 0 && (
         <Alert icon={<IconAlertCircle size="1rem" />} title="No Tools Selected" color="blue" radius="md" mt="xl">
          Please select one or two coding assistant tools from the dropdown above to see their details or compare them.
        </Alert>
      )}

      {!isLoading && !error && toolDataForView.length === 1 && (
        <ToolDetailView tool={toolDataForView[0]} />
      )}

      {!isLoading && !error && toolDataForView.length === 2 && (
        <CompareModeView tool1Data={toolDataForView[0]} tool2Data={toolDataForView[1]} />
      )}

      {!isLoading && !error && selectedToolNames.length > 0 && toolDataForView.length === 0 && (
         <Alert icon={<IconAlertCircle size="1rem" />} title="Data Not Found" color="orange" radius="md" mt="xl">
          Could not retrieve data for the selected tool(s) from the API.
        </Alert>
      )}

      <Space h="xl" />
      <Text size="xs" c="dimmed" ta="center">
        All data is based on publicly available information. Last verified dates and source URLs are provided with each tool's details.
      </Text>
    </Container>
  );
}
