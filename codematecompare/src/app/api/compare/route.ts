import { NextResponse, NextRequest } from 'next/server';
import { ToolData } from '@/types';
import { mockToolData } from '@/data/mock-data'; // Keep for tool list and fallback if internal fetch fails badly

// Helper function to fetch data for a single tool using its own API route
// This ensures we use the same scraping/caching logic as the single tool view.
async function fetchToolDataFromApi(toolName: string, req: NextRequest): Promise<ToolData | null> {
  // Construct the full URL for the API endpoint
  // In Vercel/Next.js, internal API calls might need absolute URLs.
  // For local dev, relative often works. Let's try to build a robust URL.
  const host = req.headers.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  // If running in a Vercel environment, VERCEL_URL might be available.
  // For now, relying on host header.
  const baseUrl = host ? `${protocol}://${host}` : '';


  if (!baseUrl) {
    console.error("Could not determine base URL for internal API call in /api/compare");
    // Fallback to direct mock data if base URL is missing (e.g. some test environments)
    return mockToolData.find(t => t.tool.toLowerCase() === toolName.toLowerCase()) || null;
  }

  try {
    const response = await fetch(`${baseUrl}/api/tool/${encodeURIComponent(toolName)}`, {
        headers: {
            // Pass along any necessary headers if needed, e.g., for auth in future
            'Content-Type': 'application/json',
        },
        // If your Next.js version supports it and you need to avoid caching at this level for some reason:
        // cache: 'no-store', // But the /api/tool endpoint has its own caching, so this might be okay
    });
    if (!response.ok) {
      console.error(`Internal API call to /api/tool/${toolName} failed: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching tool data for ${toolName} via internal API:`, error);
    return null; // Fallback to null, could also try mock data here
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const toolsQuery = searchParams.get('tools');

  if (!toolsQuery) {
    return NextResponse.json({ message: 'Please provide tool names in the "tools" query parameter (e.g., tools=ToolA,ToolB)' }, { status: 400 });
  }

  const toolNames = toolsQuery.split(',').map(name => name.trim());

  if (toolNames.length === 0 || toolNames.length > 2) {
    return NextResponse.json({ message: 'Please provide one or two tool names.' }, { status: 400 });
  }
  if (toolNames.length === 1 && toolNames[0] === '') { // handle "?tools="
     return NextResponse.json({ message: 'Please provide one or two tool names.' }, { status: 400 });
  }


  const resultDataPromises: Promise<ToolData | null>[] = toolNames.map(name => fetchToolDataFromApi(name, request));
  const results = await Promise.all(resultDataPromises);

  const foundData: ToolData[] = [];
  const notFoundTools: string[] = [];

  results.forEach((data, index) => {
    if (data) {
      foundData.push(data);
    } else {
      // If internal fetch failed, try mock as a last resort for this specific tool
      const mockFallback = mockToolData.find(t => t.tool.toLowerCase() === toolNames[index].toLowerCase());
      if (mockFallback) {
        console.warn(`Serving MOCK data for ${toolNames[index]} in /api/compare due to internal fetch failure.`);
        foundData.push(mockFallback);
      } else {
        notFoundTools.push(toolNames[index]);
      }
    }
  });

  if (notFoundTools.length > 0) {
    // If some tools were found and some not, you might return a partial success
    // For MVP, if any requested tool is completely unavailable (even mock), return error.
    // However, if we found some from mock, it's better to show them.
    if (foundData.length === 0) {
        return NextResponse.json({ message: `Tool(s) not found: ${notFoundTools.join(', ')}` }, { status: 404 });
    }
  }

  if (foundData.length === 0 && toolNames.length > 0) {
     return NextResponse.json({ message: `Could not retrieve data for the specified tools: ${toolNames.join(', ')}` }, { status: 404 });
  }

  // Ensure the order of results matches the order in the query params
  const sortedResultData = toolNames.map(name => foundData.find(d => d.tool.toLowerCase() === name.toLowerCase())).filter(Boolean) as ToolData[];

  return NextResponse.json(sortedResultData);
}
