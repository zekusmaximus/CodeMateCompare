import { ToolData } from '@/types';

export const mockToolData: ToolData[] = [
  {
    tool: "GitHub Copilot",
    description: "AI pair programmer from GitHub and OpenAI.",
    website: "https://copilot.github.com/",
    logo_url: "/logos/github-copilot.png", // Assuming you'll add logos later
    tiers: [
      {
        name: "Individual",
        price_month: 10,
        models: [
          { name: "Codex (GPT-3 based)", included_requests: undefined, overage_cost: undefined }
        ],
        features: ["AI code suggestions", "Chat in IDE", "CLI assistance"],
        annual_discount_percentage: 16.67, // Approx $100/year vs $120/year
      },
      {
        name: "Business",
        price_month: 19,
        models: [
          { name: "Codex (GPT-3 based)", included_requests: undefined, overage_cost: undefined }
        ],
        features: ["All Individual features", "Org-wide policy management", "IP indemnity"],
      },
      {
        name: "Enterprise",
        price_month: 39, // Per user per month
        models: [
          { name: "More advanced models (details often custom)", included_requests: undefined, overage_cost: undefined }
        ],
        features: ["All Business features", "Fine-tuned custom models", "Advanced security and compliance"],
      }
    ],
    last_verified: "2024-07-28",
    source_url: "https://github.com/features/copilot#pricing"
  },
  {
    tool: "Cursor",
    description: "The AI-first Code Editor.",
    website: "https://cursor.sh/",
    logo_url: "/logos/cursor.png",
    tiers: [
      {
        name: "Basic/Free",
        price_month: 0,
        models: [
          { name: "GPT-3.5 (slow)", included_requests: 50 }, // Example limit
          { name: "Claude Sonnet (slow)", included_requests: 50 }, // Example limit
        ],
        features: ["Basic AI chat", "Code generation (limited)"],
      },
      {
        name: "Pro",
        price_month: 20,
        models: [
          { name: "GPT-4o (fast)", included_requests: 500 },
          { name: "Claude 3 Opus (fast)", included_requests: 100 },
        ],
        features: ["Faster AI responses", "More advanced model access", "Bring your own OpenAI key option"],
        annual_discount_percentage: 20, // $192/year vs $240/year
      },
      {
        name: "Business",
        price_month: 40, // Placeholder
        models: [
          { name: "GPT-4o (fast)", included_requests: 2000 },
          { name: "Claude 3 Opus (fast)", included_requests: 500 },
        ],
        features: ["All Pro features", "Team collaboration features", "Priority support"],
      }
    ],
    last_verified: "2024-07-28",
    source_url: "https://cursor.sh/pricing"
  },
  {
    tool: "Gemini Code Assist",
    description: "Google's AI-powered coding assistant, part of Google Cloud.",
    website: "https://cloud.google.com/products/gemini/code-assist",
    logo_url: "/logos/gemini-code-assist.png",
    tiers: [
      {
        name: "Standard",
        price_month: 19, // Per user per month, after free trial
        models: [
          { name: "Gemini 1.0 Pro", input_token_cost_per_mln: 0.125, output_token_cost_per_mln: 0.375, context_window_tokens: 128000 }
        ],
        features: ["Code completion", "Code generation", "Chat", "Security vulnerability detection"],
      }
      // Enterprise tiers might be custom or part of broader Google Cloud contracts
    ],
    last_verified: "2024-07-28",
    source_url: "https://cloud.google.com/gemini/pricing#gemini-code-assist-pricing"
  },
  {
    tool: "Amazon Q",
    description: "Amazon's generative AI-powered assistant for business and developers.",
    website: "https://aws.amazon.com/q/",
    logo_url: "/logos/amazon-q.png",
    tiers: [
      {
        name: "Q Developer",
        price_month: 19, // Per user per month
        models: [
          // Amazon Q uses a variety of models, specific model names might not be user-facing in the same way.
          { name: "Amazon Titan family & others", included_requests: undefined }
        ],
        features: ["Code suggestions in IDE", "Customization support", "Security scanning"],
      },
      {
        name: "Q Business",
        price_month: 20, // Per user per month (different features than Developer)
        models: [
           { name: "Amazon Titan family & others", included_requests: undefined }
        ],
        features: ["Connects to company data", "Content generation", "Summarization"],
      }
    ],
    last_verified: "2024-07-28",
    source_url: "https://aws.amazon.com/q/pricing/"
  },
  {
    tool: "Tabnine",
    description: "AI assistant for software developers.",
    website: "https://www.tabnine.com/",
    logo_url: "/logos/tabnine.png",
    tiers: [
      {
        name: "Starter (Free)",
        price_month: 0,
        models: [{ name: "Basic AI Models", included_requests: undefined }],
        features: ["Basic code completions", "Runs locally"],
      },
      {
        name: "Pro",
        price_month: 12, // Per user per month, billed annually
        models: [{ name: "Advanced AI Models", included_requests: undefined }],
        features: ["Whole line and full function code completions", "Natural language to code", "Learns your coding patterns"],
        annual_discount_percentage: 0, // Price is already for annual billing usually
      },
      {
        name: "Enterprise",
        price_month: 39, // Example, often custom pricing
        models: [{ name: "Private code models", included_requests: undefined }],
        features: ["All Pro features", "Self-hosting or VPC", "Centralized policy controls"],
      }
    ],
    last_verified: "2024-07-28",
    source_url: "https://www.tabnine.com/pricing"
  },
  {
    tool: "AskCodi",
    description: "AI coding assistant for developers.",
    website: "https://askcodi.com/",
    logo_url: "/logos/askcodi.png",
    tiers: [
      {
        name: "Free",
        price_month: 0,
        models: [{ name: "Standard Models", included_requests: 100 }], // Example limit
        features: ["Limited code generation", "Basic chat"],
      },
      {
        name: "Premium",
        price_month: 9.99,
        models: [{ name: "Advanced Models", included_requests: 1000 }], // Example limit
        features: ["More extensive code generation", "Advanced chat features", "Multiple languages"],
        annual_discount_percentage: 16.6, // $99.99/year vs $119.88/year
      },
      {
        name: "Enterprise",
        price_month: 29.99, // Example, may vary
        models: [{ name: "Dedicated Models", included_requests: 5000 }],
        features: ["All Premium features", "Team management", "Priority support"],
      }
    ],
    last_verified: "2024-07-28",
    source_url: "https://askcodi.com/pricing/" // Note: URL might change, verify
  }
  // Add more tools like Replit Ghostwriter, Codeium, etc. later if needed.
];

// Example for a tool that might not have clearly distinct models per tier,
// or where model details are abstracted.
export const mockSimpleTool: ToolData = {
  tool: "Hypothetical AI Tool",
  description: "A simple AI tool for comparison.",
  website: "https://example.com/hypothetical",
  logo_url: "/logos/hypothetical.png",
  tiers: [
    {
      name: "Free",
      price_month: 0,
      models: [{ name: "Basic Model", included_requests: 50 }],
      features: ["Limited access"]
    },
    {
      name: "Pro",
      price_month: 15,
      models: [{ name: "Advanced Model", included_requests: 500 }],
      features: ["Full access", "Priority support"]
    }
  ],
  last_verified: "2024-07-28",
  source_url: "https://example.com/hypothetical/pricing"
};
