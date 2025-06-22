# CodeMateCompare

## 🎯 Phase 1 Goal

Build and launch a high-value, low-maintenance comparison site with a filterable table covering 20 of the most-used coding assistants, focused on pricing, usage limits, IDE/language support, and privacy.

## 🛠️ Assistant List (Top 20)

Combining popularity, innovation, and market presence, here are the assistants to include initially:
1. GitHub Copilot – flagship AI completion in IDEs
2. Tabnine – privacy-first, multi-IDE support
3. Cursor – standalone VS Code fork with advanced features
4. Gemini Code Assist – Google’s high-limit, free-for-individual tool
5. Amazon Q Developer (formerly CodeWhisperer)
6. OpenAI Codex (ChatGPT agent) – integrated agent within ChatGPT
7. AskCodi – popular standalone model
8. Codiga – code review-focused assistant
9. Replit Agent – web-based, full-app generation
10. Windsurf – emerging model, on lists
11. Diamond by Graphite – specialized code-review platform
12. CodeGeeX – multilingual code assistant
13. Figstack – productivity tool for code
14. Intellicode – Microsoft’s suggestion engine
15. CodeT5 – open-source pre-trained model
16. Sourcegraph Cody – powerful code search/assist
17. DeepCode AI – automated review and suggestions
18. CodeGPT – chat and AI assistant tool
19. Trae – new AI-first code editor from ByteDance
20. Code Llama / Anthropic Claude Code – open‑source/Anthropic agents

## 📋 Enhanced MVP Features

1.  **Dynamic Comparison Table**
    *   Fields per tool:
        *   Free tier (Yes/No + usage limits)
        *   Paid price (monthly/annual)
        *   Usage caps (completions, chat requests)
        *   IDE & language support
        *   Notable features (chat, test generation, refactoring, reviews)
        *   Privacy / data policy
        *   Last verified date + “verification method” icon (Manual/Semi-auto)

2.  **Advanced Filtering & Sorting**
    *   Filters: Free tier, price range, IDE (e.g. VS Code, JetBrains), key features (chat, local privacy)
    *   Sort by: price, recency, usage limit, popularity
    *   UI: Multi-select and range sliders for granular control

3.  **Responsive Design**
    *   Primary layout: desktop grid
    *   Mobile: accordion-style rows with expandable details
    *   Accessibility: keyboard nav, screen reader labels

4.  **Data Sources & Verifications**
    *   Manual curation from official sources with link citations
    *   Visual badge for each tool indicating verification method (e.g. 🛠️ Manual, ⚙️ Script)
    *   Tooltip explains method and date

5.  **Backend & Data Storage**
    *   Phase 1: data in static JSON or Markdown
    *   Frontend uses Next.js getStaticProps for fast build-time data
    *   Admin interface postponed

6.  **Community Feedback**
    *   Embed Google Form for data corrections / new suggestions
    *   Responses flow to a moderation sheet (Notion or Google Sheets)
    *   Edits integrated manually with timestamps

## 🗂️ Tech & Infrastructure

| Component        | Tech                     | Why It Matters                         |
| ---------------- | ------------------------ | -------------------------------------- |
| Frontend         | Next.js + TailwindCSS    | SEO-friendly, fast, responsive         |
| Hosting          | Vercel                   | Easy deployment + CI/CD                |
| Data Format      | JSON / Markdown          | Human-readable, version-controlled     |
| Data Updates     | Versioned commits in repo| Clear audit trail                      |
| Scraping later   | Python + BeautifulSoup   | For changelog monitoring               |
| Analytics        | Google Analytics / Plausible | Track usage patterns                   |

## 🔄 Workflow & Maintenance

1.  Add/edit data in JSON + pull request for tracking.
2.  Rebuild site via Next.js automatic Vercel deploy.
3.  Weekly review:
    *   Check 2–3 key pricing pages manually
    *   Triage flags from community form
    *   Update JSON, redeploy, update verification icons
4.  Monthly audit:
    *   Run simple scripts against published pages to detect changes
    *   Assess need for scraping more content

## 🚀 Launch & Outreach

*   Soft launch: share site link on r/ChatGPTCoding, r/learnprogramming, IndieHackers
*   Create static launch image with side-by-side price/limit comparison for social
*   Weekly “Tool of the Week” tweet highlighting 1 assistant with key data
*   SEO boost: include individual tool detail pages with FAQs and changelogs

## 📈 Future Expansions

*   AI-powered side-by-side comparison using GPT summarization
*   Historic price charting via stored JSON and charting library
*   Email alerts for pricing limit changes
*   Regional pricing fields (EU, student discounts)
*   Browser extension: hover on tool names and see snapshot from your site

## 🧭 Next Actions

*   Gather official pricing & usage data for the 20 assistants
*   Define JSON schema to capture all fields
*   Scaffold Next.js app structure with table and filters
*   Populate first dataset and verify with sources
