export interface ModelData {
  name: string;
  included_requests?: number; // Optional as not all models/tiers might specify this
  overage_cost?: number;    // Optional
  input_token_cost_per_mln?: number; // For more detailed pricing
  output_token_cost_per_mln?: number; // For more detailed pricing
  context_window_tokens?: number; // Max context window
  // Add any other model-specific details you might need
}

export interface TierData {
  name: string;
  price_month: number;
  models: ModelData[];
  // Tier-specific limits or features can be added here
  annual_discount_percentage?: number;
  features?: string[]; // List of features for this tier
}

export interface ToolData {
  tool: string;
  tiers: TierData[];
  last_verified: string; // ISO 8601 date string (e.g., "2025-06-21")
  source_url: string;
  // Any other top-level info about the tool
  description?: string;
  website?: string;
  logo_url?: string;
}

// For the /api/compare endpoint, the structure might be slightly different
// or could be an array of ToolData, depending on how you want to structure the comparison.
// For now, let's assume the comparison API will return an array of ToolData for the selected tools.
export type ComparisonData = ToolData[];
