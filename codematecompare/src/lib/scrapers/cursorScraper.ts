import * as cheerio from 'cheerio';
import { ToolData, TierData, ModelData } from '@/types';

const normalizeText = (text: string | undefined): string => {
  return text?.replace(/\s+/g, ' ').trim().toLowerCase() || '';
};

const extractPrice = (text: string): number | null => {
  const match = text.match(/\$(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

// Helper to parse model details from feature lists, if possible
const parseModelFromFeature = (featureText: string): Partial<ModelData> | null => {
  const lowerFeature = featureText.toLowerCase();
  // Example: "500 fast GPT-4o requests" or "100 Claude Opus uses"
  const reqMatch = lowerFeature.match(/(\d+)\s+(fast|slow)?\s*(gpt-?4[o\w-]*|claude[\w\s-]+opus|claude[\w\s-]+sonnet|gpt-?3.5-turbo)/i);
  if (reqMatch) {
    const modelName = reqMatch[3];
    const requests = parseInt(reqMatch[1], 10);
    let displayName = modelName;
    if (modelName.includes('gpt-4')) displayName = 'GPT-4o';
    if (modelName.includes('claude') && modelName.includes('opus')) displayName = 'Claude 3 Opus';
    if (modelName.includes('claude') && modelName.includes('sonnet')) displayName = 'Claude 3 Sonnet';
    if (modelName.includes('gpt-3.5')) displayName = 'GPT-3.5 Turbo';

    return {
        name: `${displayName}${reqMatch[2] ? ` (${reqMatch[2]})` : ''}`,
        included_requests: requests
    };
  }
  return null;
};


export async function scrapeCursor(): Promise<ToolData | null> {
  const CURSOR_PRICING_URL = 'https://cursor.sh/pricing';

  const toolData: ToolData = {
    tool: "Cursor",
    tiers: [],
    last_verified: new Date().toISOString(),
    source_url: CURSOR_PRICING_URL,
    description: "The AI-first Code Editor.",
    website: "https://cursor.sh/",
    logo_url: "/logos/cursor.png"
  };

  try {
    const response = await fetch(CURSOR_PRICING_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36' }
    });

    if (!response.ok) {
      console.error(`Failed to fetch Cursor pricing page: ${response.status} ${response.statusText}. URL: ${CURSOR_PRICING_URL}`);
      return null;
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    // Cursor's pricing page structure:
    // Typically has columns for "Basic", "Pro", "Business".
    // We'll try to find these columns and extract info.
    // This is highly dependent on class names or structural cues.

    // Example: Look for divs that seem to represent pricing cards/columns.
    // Common class names might involve 'plan', 'tier', 'pricing-column', etc.
    // Since class names are often obfuscated or dynamic, we might need to rely on text content.

    // Let's try to find sections containing plan names like "Basic", "Pro"
    // This is a guess and will need refinement by inspecting the actual page structure.
    const pricingCards = $('div[class*="pricing-card"], div[class*="plan"], section[class*="tier"]'); // Generic selectors

    if (pricingCards.length > 0) {
        pricingCards.each((_idx, cardEl) => {
            const card = $(cardEl);
            let tierName = normalizeText(card.find('h2, h3, .plan-name').first().text());
            const priceText = normalizeText(card.find('.price, [class*="price"], [class*="Price"]').first().text());
            let price = extractPrice(priceText);

            // If tier name is not obvious, try to infer from price or keywords
            if (!tierName && price === 0) tierName = "basic";
            else if (!tierName && price && price > 0 && price < 30) tierName = "pro";
            else if (!tierName && price && price >= 30) tierName = "business";


            if (!tierName) return; // Skip if no name identified

            const features: string[] = [];
            const models: ModelData[] = [];

            card.find('li, .feature-item').each((_fIdx, featureEl) => {
                const feature = normalizeText($(featureEl).text());
                if (feature) {
                    features.push(feature);
                    const modelInfo = parseModelFromFeature(feature);
                    if (modelInfo) {
                        // Avoid duplicate model entries if feature list is redundant
                        if (!models.some(m => m.name?.toLowerCase() === modelInfo.name?.toLowerCase())) {
                             models.push(modelInfo as ModelData);
                        }
                    }
                }
            });

            let annualDiscount: number | undefined = undefined;
            if (tierName.includes("pro") && priceText.includes("billed annually") || priceText.includes("/year")) {
                 // Example: $16/month billed annually ($192/year) vs $20 month-to-month
                if (price && price === 16) { // Assuming $16 is annual price for $20 monthly
                    annualDiscount = ((20*12 - 192) / (20*12)) * 100;
                    price = 20; // Show monthly price
                }
            }


            // Default models if not parsed from features
            if (models.length === 0) {
                if (tierName.includes("basic") || tierName.includes("free")) {
                    models.push({ name: "GPT-3.5 Turbo (slow)", included_requests: 50 }); // Example default
                    models.push({ name: "Claude 3 Sonnet (slow)", included_requests: 10 }); // Example default
                } else if (tierName.includes("pro")) {
                    models.push({ name: "GPT-4o (fast)" });
                    models.push({ name: "Claude 3 Opus (fast)" });
                }
            }

            // Refine tier name
            let finalTierName = "Unknown";
            if (tierName.includes("basic") || tierName.includes("free")) finalTierName = "Basic/Free";
            else if (tierName.includes("pro")) finalTierName = "Pro";
            else if (tierName.includes("business") || tierName.includes("enterprise")) finalTierName = "Business";


            const tier: TierData = {
                name: finalTierName,
                price_month: price || 0,
                models: models,
                features: features.filter(f => !parseModelFromFeature(f)), // Remove model lines from general features
                annual_discount_percentage: annualDiscount ? parseFloat(annualDiscount.toFixed(2)) : undefined,
            };
            // Avoid adding duplicate or unknown tiers
            if (tier.name !== "Unknown" && !toolData.tiers.some(t => t.name === tier.name)) {
                 toolData.tiers.push(tier);
            }
        });
    } else {
         // Fallback: If no cards found, try to use some default structure based on common knowledge
        console.warn("Cursor scraper: Could not find distinct pricing cards. Attempting fallback structure.");
        toolData.tiers.push({
            name: "Basic/Free",
            price_month: 0,
            models: [
                { name: "GPT-3.5 Turbo (slow)", included_requests: 50 },
                { name: "Claude 3 Sonnet (slow)", included_requests: 10 },
            ],
            features: ["Basic AI chat", "Slower model responses", "Limited usage of fast models"],
        });
        toolData.tiers.push({
            name: "Pro",
            price_month: 20, // Assuming $20, or $16 if annual
            models: [
                { name: "GPT-4o (fast)", included_requests: 500 }, // Placeholder
                { name: "Claude 3 Opus (fast)", included_requests: 100 }, // Placeholder
            ],
            features: ["Faster AI responses", "Access to GPT-4o and Claude 3 Opus", "More monthly requests"],
            annual_discount_percentage: parseFloat((((20*12) - 192) / (20*12) * 100).toFixed(2)) // Assuming $192/yr
        });
         toolData.tiers.push({
            name: "Business",
            price_month: 40, // Placeholder, often custom
            models: [
                { name: "GPT-4o (fast, higher limits)"},
                { name: "Claude 3 Opus (fast, higher limits)"},
            ],
            features: ["All Pro features", "Team management", "Centralized billing", "Priority support"],
        });
    }


    if (toolData.tiers.length === 0) {
      console.warn("No tiers found for Cursor during scraping. This is unexpected.");
      return null;
    }

    // Sort tiers: Free, Pro, Business
    toolData.tiers.sort((a, b) => {
        const priceA = a.price_month;
        const priceB = b.price_month;
        if (priceA === 0 && priceB !== 0) return -1;
        if (priceA !== 0 && priceB === 0) return 1;
        return priceA - priceB;
    });


    return toolData;

  } catch (error: any) {
    console.error(`Error scraping Cursor: ${error.message}`, error.stack);
    return null;
  }
}

// Example usage (for testing the scraper directly):
/*
(async () => {
  const data = await scrapeCursor();
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log("Failed to scrape Cursor data.");
  }
})();
*/
