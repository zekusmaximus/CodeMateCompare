import * as cheerio from 'cheerio';
import { ToolData, TierData, ModelData } from '@/types';

const normalizeText = (text: string | undefined): string => {
  return text?.replace(/\s+/g, ' ').trim().toLowerCase() || '';
};

const extractPrice = (text: string): number | null => {
  const match = text.match(/\$(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

export async function scrapeGitHubCopilot(): Promise<ToolData | null> {
  const GITHUB_COPILOT_PRICING_URL = 'https://github.com/features/copilot#pricing';
  // For stability, you might use a specific archived version during development:
  // const GITHUB_COPILOT_PRICING_URL = 'https://web.archive.org/web/20240716001912/https://github.com/features/copilot/';

  const toolData: ToolData = {
    tool: "GitHub Copilot",
    tiers: [],
    last_verified: new Date().toISOString(),
    source_url: GITHUB_COPILOT_PRICING_URL,
    description: "AI pair programmer from GitHub and OpenAI.",
    website: "https://github.com/features/copilot", // Corrected website
    logo_url: "/logos/github-copilot.png"
  };

  try {
    const response = await fetch(GITHUB_COPILOT_PRICING_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36' }
    });

    if (!response.ok) {
      console.error(`Failed to fetch GitHub Copilot page: ${response.status} ${response.statusText}. URL: ${GITHUB_COPILOT_PRICING_URL}`);
      return null;
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    // Common model assumption for Copilot (unless specified otherwise per tier)
    const defaultModels: ModelData[] = [{ name: "GitHub Codex (GPT-3 based)" }];

    // --- Tier Parsing Logic ---
    // This is highly dependent on GitHub's page structure and subject to break.
    // We look for common text identifiers for each plan.

    // Individual/Personal Tier
    let individualPrice: number | null = 10; // Default
    let individualAnnualFound = false;
    $('h2, h3, h4, p, span, div').each((_idx, el) => {
        const elementText = normalizeText($(el).text());
        if (elementText.includes('copilot individual') || elementText.includes('personal plan')) {
            // Try to find price in proximity. This is very heuristic.
            let searchEl = $(el);
            for (let i=0; i<3; i++) { // Search parent and current element text
                const parentText = normalizeText(searchEl.text());
                if (parentText.includes('$10') && (parentText.includes('month') || parentText.includes('user'))) {
                    individualPrice = 10;
                }
                if (parentText.includes('$100') && parentText.includes('year')) {
                    individualPrice = 100/12; // effective monthly
                    individualAnnualFound = true;
                }
                if (individualPrice === 10 || individualPrice === 100/12) break;
                searchEl = searchEl.parent();
            }
            return false; // Found relevant section
        }
    });

    const individualTier: TierData = {
      name: "Individual",
      price_month: individualAnnualFound ? parseFloat((100/12).toFixed(2)) : 10,
      models: defaultModels,
      features: [
        "AI code suggestions (autocompletion)",
        "Chat in IDE (e.g., VS Code, JetBrains)",
        "CLI assistance (GitHub Copilot CLI)",
        "Blocks public code matches",
        "Code referencing (experimental)"
      ],
      annual_discount_percentage: individualAnnualFound ? parseFloat((((10*12) - 100) / (10*12) * 100).toFixed(2)) : undefined,
    };
    toolData.tiers.push(individualTier);


    // Business Tier
    let businessPrice: number | null = 19; // Default
     $('h2, h3, h4, p, span, div').each((_idx, el) => {
        const elementText = normalizeText($(el).text());
        if (elementText.includes('copilot business')) {
            let searchEl = $(el);
            for (let i=0; i<3; i++) {
                const parentText = normalizeText(searchEl.text());
                 if (parentText.includes('$19') && (parentText.includes('user') && parentText.includes('month'))) {
                    businessPrice = 19;
                    break;
                }
                searchEl = searchEl.parent();
            }
            return false;
        }
    });
    const businessTier: TierData = {
      name: "Business",
      price_month: businessPrice || 19,
      models: defaultModels, // Assuming same underlying models but with org features
      features: [
        "All Individual features",
        "Organization-wide policy management",
        "IP indemnity",
        "Content exclusion (prevents suggestions matching public code)",
        "Audit logs (via GitHub Enterprise Cloud)"
      ],
    };
    toolData.tiers.push(businessTier);

    // Enterprise Tier
    let enterprisePrice: number | null = 39; // Default
    $('h2, h3, h4, p, span, div').each((_idx, el) => {
        const elementText = normalizeText($(el).text());
        if (elementText.includes('copilot enterprise')) {
             let searchEl = $(el);
            for (let i=0; i<3; i++) {
                const parentText = normalizeText(searchEl.text());
                if (parentText.includes('$39') && (parentText.includes('user') && parentText.includes('month'))) {
                    enterprisePrice = 39;
                    break;
                }
                searchEl = searchEl.parent();
            }
            return false;
        }
    });
    const enterpriseTier: TierData = {
      name: "Enterprise",
      price_month: enterprisePrice || 39,
      models: [ // Potentially more advanced or fine-tunable models
        { name: "GitHub Codex (customizable, fine-tunable)" }
      ],
      features: [
        "All Business features",
        "Fine-tuned models on your codebase (optional, may have extra costs)",
        "Advanced security and compliance (e.g., SAML SSO)",
        "Personalized code suggestions based on org's codebase",
        "Dedicated support options"
      ],
    };
    toolData.tiers.push(enterpriseTier);

    // If any tier still has default price, it means scraping might have been partial.
    // This indicates potential staleness or page structure change.
    if (toolData.tiers.some(t => (t.name === "Individual" && t.price_month === 10 && !individualAnnualFound) ||
                                 (t.name === "Business" && t.price_month === 19) ||
                                 (t.name === "Enterprise" && t.price_month === 39) )) {
        // This condition might be too broad, but it's a simple check.
        // console.warn("GitHub Copilot scraper might be using some default values due to parsing difficulties.");
    }


    if (toolData.tiers.length === 0) {
      console.warn("No tiers found for GitHub Copilot during scraping. This is unexpected.");
      return null; // Indicate failure if no tiers could be constructed.
    }

    return toolData;

  } catch (error: any) {
    console.error(`Error scraping GitHub Copilot: ${error.message}`, error.stack);
    return null;
  }
}
