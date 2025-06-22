"use client";

import { ToolData, TierData, ModelData } from "@/types";
import { Table, Text, Title, Paper, Badge, Group, Anchor, Box, SimpleGrid } from "@mantine/core";
import React from "react";

interface CompareModeViewProps {
  tool1Data: ToolData;
  tool2Data: ToolData;
}

const formatPrice = (price: number): string => {
  if (price === 0) return "Free";
  return `$${price}/month`;
};

const renderModelsForCompare = (models: ModelData[]) => {
  if (!models || models.length === 0) return <Text size="xs">N/A</Text>;
  return (
    <ul style={{ paddingLeft: '15px', margin: 0, fontSize: 'var(--mantine-font-size-xs)' }}>
      {models.map((m, i) => (
        <li key={i}>
          {m.name}
          {m.included_requests !== undefined && ` (${m.included_requests} req)`}
          {m.overage_cost !== undefined && ` ($${m.overage_cost.toFixed(2)} overage)`}
          {(m.input_token_cost_per_mln !== undefined || m.output_token_cost_per_mln !== undefined) &&
           ` (In: $${m.input_token_cost_per_mln?.toFixed(3) ?? 'N/A'}/M, Out: $${m.output_token_cost_per_mln?.toFixed(3) ?? 'N/A'}/M)`}
          {m.context_window_tokens !== undefined && ` (${(m.context_window_tokens/1000).toLocaleString()}k ctx)`}
        </li>
      ))}
    </ul>
  );
};

const renderTierFeatures = (features?: string[]) => {
  if (!features || features.length === 0) return <Text size="xs">N/A</Text>;
  return (
    <ul style={{ paddingLeft: '15px', margin: 0, fontSize: 'var(--mantine-font-size-xs)' }}>
      {features.map((f, i) => <li key={i}>{f}</li>)}
    </ul>
  );
};

const ToolComparisonCard: React.FC<{ tool: ToolData, color: string }> = ({ tool, color }) => (
    <Paper shadow="xs" p="sm" withBorder style={{height: '100%'}}>
        <Group justify="space-between" align="center" mb="sm">
            <Title order={3} c={color}>
                 {tool.logo_url && <img src={tool.logo_url} alt={`${tool.tool} logo`} style={{ maxHeight: '24px', marginRight: '8px', verticalAlign: 'middle' }} />}
                {tool.tool}
            </Title>
            <Anchor href={tool.website} target="_blank" size="xs">Visit Site</Anchor>
        </Group>
        {tool.tiers.map(tier => (
            <Box key={tier.name} mb="md" >
                <Paper p="xs" withBorder radius="md" bg={ tier.price_month === 0 ? 'gray.1' : `${color}.0`}>
                    <Group justify="space-between">
                        <Text fw={700} size="sm">{tier.name}</Text>
                        <Badge color={color} variant="light" size="md">
                            {formatPrice(tier.price_month)}
                        </Badge>
                    </Group>
                    {tier.annual_discount_percentage && tier.price_month > 0 && (
                        <Text size="xs" c="dimmed" ta="right">
                            approx. ${ (tier.price_month * 12 * (1 - tier.annual_discount_percentage/100) / 12).toFixed(2) }/mo annually
                        </Text>
                    )}
                    <Text size="xs" mt="xs" fw={500}>Models:</Text>
                    {renderModelsForCompare(tier.models)}
                    {tier.features && tier.features.length > 0 && (
                        <>
                            <Text size="xs" mt="xs" fw={500}>Features:</Text>
                            {renderTierFeatures(tier.features)}
                        </>
                    )}
                </Paper>
            </Box>
        ))}
        <Box mt="auto" pt="sm" style={{borderTop: '1px solid var(--mantine-color-gray-3)'}}>
            <Text size="xs" c="dimmed">
                Last Verified: {new Date(tool.last_verified).toLocaleDateString()}
            </Text>
            <Text size="xs" c="dimmed">
                Source: <Anchor href={tool.source_url} target="_blank" rel="noopener noreferrer" size="xs">{tool.source_url}</Anchor>
            </Text>
        </Box>
    </Paper>
);


export const CompareModeView: React.FC<CompareModeViewProps> = ({ tool1Data, tool2Data }) => {
  if (!tool1Data || !tool2Data) {
    return <Text>Please select two tools to compare.</Text>;
  }

  return (
    <Box>
      <Title order={2} mb="lg" ta="center">Comparison: {tool1Data.tool} vs {tool2Data.tool}</Title>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <ToolComparisonCard tool={tool1Data} color="blue" />
        <ToolComparisonCard tool={tool2Data} color="grape" />
      </SimpleGrid>
    </Box>
  );
};
