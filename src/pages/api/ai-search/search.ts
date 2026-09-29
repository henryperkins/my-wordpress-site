// Answers the header's AI search modal, which posts to <apiUrl>/search (AISearchSnippet in Header.astro).
// The aiSearch() plugin queries AI Search through the AI_SEARCH binding and hides scheduled content until it goes live.
export { POST, prerender } from "@emdash-cms/cloudflare/plugins/ai-search";
