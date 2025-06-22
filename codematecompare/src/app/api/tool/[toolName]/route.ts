import { NextResponse } from 'next/server';
import { mockToolData } from '@/data/mock-data';
import { ToolData } from '@/types';
import { scrapeGitHubCopilot } from '@/lib/scrapers/githubCopilotScraper';
import { scrapeCursor } from '@/lib/scrapers/cursorScraper';

// Simple in-memory cache with TTL
const cache = new Map<string, { data: ToolData; timestamp: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const STALE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for stale fallback

async function handleScrapedTool(
    toolName: string,
    scraperFn: () => Promise<ToolData | null>,
    mockDataSource: ToolData[]
): Promise<NextResponse> {
    const lowerToolName = toolName.toLowerCase();
    const cachedEntry = cache.get(lowerToolName);

    try {
        const liveData = await scraperFn();
        if (liveData) {
            cache.set(lowerToolName, { data: liveData, timestamp: Date.now() });
            console.log(`Serving live data for ${toolName}`);
            return NextResponse.json(liveData);
        }
        console.warn(`${toolName} scraper returned null.`);
    } catch (scrapeError) {
        console.error(`Error during ${toolName} scraping:`, scrapeError);
    }

    if (cachedEntry && (Date.now() - cachedEntry.timestamp < STALE_CACHE_TTL_MS)) {
        console.log(`Serving cached data for ${toolName} (live fetch failed/stale allowed).`);
        return NextResponse.json(cachedEntry.data);
    }

    const mockEntry = mockDataSource.find(t => t.tool.toLowerCase() === lowerToolName);
    if (mockEntry) {
        console.warn(`Serving MOCK data for ${toolName} (live fetch and cache failed/unavailable).`);
        // Optionally cache mock data for a short period if it's a fallback for a scraped tool
        // cache.set(lowerToolName, { data: mockEntry, timestamp: Date.now() });
        return NextResponse.json(mockEntry);
    }

    return NextResponse.json({ message: `${toolName} data unavailable.` }, { status: 500 });
}

export async function GET(
  request: Request,
  { params }: { params: { toolName: string } }
) {
  const toolName = params.toolName; // Keep original casing for logs, use lower for keys
  const lowerToolName = toolName.toLowerCase();

  if (lowerToolName === "github copilot") {
    return handleScrapedTool("GitHub Copilot", scrapeGitHubCopilot, mockToolData);
  }

  if (lowerToolName === "cursor") {
    return handleScrapedTool("Cursor", scrapeCursor, mockToolData);
  }

  // --- For other tools: Use existing cache/mock logic from mockToolData ---
  const cachedEntry = cache.get(lowerToolName);
  if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS)) {
    console.log(`Serving cached data for ${toolName}`);
    return NextResponse.json(cachedEntry.data);
  }

  const tool = mockToolData.find(
    (t) => t.tool.toLowerCase() === lowerToolName
  );

  if (tool) {
    console.log(`Serving mock data for ${toolName} (and caching).`);
    cache.set(lowerToolName, { data: tool, timestamp: Date.now() });
    return NextResponse.json(tool);
  } else {
    return NextResponse.json({ message: `Tool ${toolName} not found` }, { status: 404 });
  }
}
