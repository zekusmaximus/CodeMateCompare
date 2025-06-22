"use client";

import { ToolData, TierData, ModelData } from "@/types";
import { Accordion, Badge, Box, Card, Group, Paper, Table, Text, Title, Anchor } from "@mantine/core";
import React from "react";

interface ToolDetailViewProps {
  tool: ToolData;
}

const formatPrice = (price: number): string => {
  if (price === 0) return "Free";
  return `$${price}/month`;
};

const renderModelTable = (models: ModelData[]) => {
  if (!models || models.length === 0) {
    return <Text size="sm">Model details not specified for this tier.</Text>;
  }

  const hasAnyDetail = models.some(m =>
    m.included_requests !== undefined ||
    m.overage_cost !== undefined ||
    m.input_token_cost_per_mln !== undefined ||
    m.output_token_cost_per_mln !== undefined ||
    m.context_window_tokens !== undefined
  );

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders mt="xs" mb="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Model Name</Table.Th>
          {hasAnyDetail && <Table.Th>Included Requests</Table.Th>}
          {hasAnyDetail && <Table.Th>Overage Cost (per req/token)</Table.Th>}
          {hasAnyDetail && <Table.Th>Input (per M tokens)</Table.Th>}
          {hasAnyDetail && <Table.Th>Output (per M tokens)</Table.Th>}
          {hasAnyDetail && <Table.Th>Context Window</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {models.map((model, index) => (
          <Table.Tr key={`${model.name}-${index}`}>
            <Table.Td>{model.name}</Table.Td>
            {hasAnyDetail && <Table.Td>{model.included_requests ?? 'N/A'}</Table.Td>}
            {hasAnyDetail && <Table.Td>{model.overage_cost !== undefined ? `$${model.overage_cost.toFixed(2)}` : 'N/A'}</Table.Td>}
            {hasAnyDetail && <Table.Td>{model.input_token_cost_per_mln !== undefined ? `$${model.input_token_cost_per_mln.toFixed(3)}` : 'N/A'}</Table.Td>}
            {hasAnyDetail && <Table.Td>{model.output_token_cost_per_mln !== undefined ? `$${model.output_token_cost_per_mln.toFixed(3)}` : 'N/A'}</Table.Td>}
            {hasAnyDetail && <Table.Td>{model.context_window_tokens ? `${(model.context_window_tokens / 1000).toLocaleString()}k` : 'N/A'}</Table.Td>}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export const ToolDetailView: React.FC<ToolDetailViewProps> = ({ tool }) => {
  if (!tool) return <Text>Select a tool to see details.</Text>;

  return (
    <Paper shadow="md" p="md" withBorder>
      <Group justify="space-between" align="flex-start" mb="md">
        <Box>
          <Title order={2}>{tool.tool}</Title>
          {tool.description && <Text size="sm" c="dimmed">{tool.description}</Text>}
        </Box>
        {tool.logo_url && <img src={tool.logo_url} alt={`${tool.tool} logo`} style={{ maxHeight: '50px', maxWidth: '150px' }} />}
      </Group>

      <Accordion variant="separated" defaultValue={tool.tiers[0]?.name}>
        {tool.tiers.map((tier) => (
          <Accordion.Item key={tier.name} value={tier.name}>
            <Accordion.Control>
              <Group justify="space-between">
                <Text fw={500}>{tier.name}</Text>
                <Badge color="teal" variant="light">
                  {formatPrice(tier.price_month)}
                  {tier.annual_discount_percentage && tier.price_month > 0 && (
                    <Text span size="xs" c="dimmed"> (approx. ${ (tier.price_month * 12 * (1 - tier.annual_discount_percentage/100) / 12).toFixed(2) }/mo if paid annually)</Text>
                  )}
                </Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {tier.features && tier.features.length > 0 && (
                <Box mb="sm">
                  <Text size="sm" fw={500}>Features:</Text>
                  <ul>
                    {tier.features.map((feature, idx) => <li key={idx}><Text size="sm">{feature}</Text></li>)}
                  </ul>
                </Box>
              )}
              <Text size="sm" fw={500}>Models:</Text>
              {renderModelTable(tier.models)}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <Box mt="lg">
        <Text size="xs" c="dimmed">
          Last Verified: {new Date(tool.last_verified).toLocaleDateString()}
        </Text>
        <Text size="xs" c="dimmed">
          Source: <Anchor href={tool.source_url} target="_blank" rel="noopener noreferrer">{tool.source_url}</Anchor>
        </Text>
        {tool.website && (
          <Text size="xs" c="dimmed">
            Website: <Anchor href={tool.website} target="_blank" rel="noopener noreferrer">{tool.website}</Anchor>
          </Text>
        )}
      </Box>
    </Paper>
  );
};
