// Temporary fixes for sandboxed registry plugins whose admin pages use Block Kit field names that
// EmDash has never accepted. Since EmDash 0.39 the host rejects those responses, and the whole
// admin page fails with "502 INVALID_BLOCK_RESPONSE". See docs/plugin-sandbox.md.
//
// - Webhook Notifier 0.2.2: button `text`, banner `text`/`style` (emdash-cms/emdash#3362, unmerged)
// - audit-log 0.2.2 and 0.2.3: camelCase table keys, raw paging cursor (emdash-cms/emdash#3616)
//
// Only a missing field is filled in, so valid responses pass through unchanged.

type JsonObject = Record<string, unknown>;

// Marks a table page action from a camelCase table so its paging request can be adapted.
const CURSOR_ACTION_PREFIX = "lakefront-compat:cursor:";

const BANNER_VARIANTS: Record<string, string> = { error: "error", warning: "alert" };

const isNode = (value: unknown): value is JsonObject =>
	typeof value === "object" && value !== null && !Array.isArray(value);

function rename(node: JsonObject, from: string, to: string): void {
	if (node[to] === undefined && node[from] !== undefined) {
		node[to] = node[from];
		delete node[from];
	}
}

function fix(node: JsonObject): void {
	rename(node, "blockId", "block_id");
	switch (node.type) {
		case "button":
			if (typeof node.text === "string") rename(node, "text", "label");
			break;
		case "banner":
			if (node.description === undefined) rename(node, "text", "title");
			if (node.variant === undefined && typeof node.style === "string") {
				node.variant = BANNER_VARIANTS[node.style] ?? "default";
				delete node.style;
			}
			break;
		case "table":
			// These tables' handlers read `value` as the cursor, not `value.cursor`.
			if (node.page_action_id === undefined && typeof node.pageActionId === "string") {
				node.page_action_id = CURSOR_ACTION_PREFIX + node.pageActionId;
				delete node.pageActionId;
			}
			rename(node, "nextCursor", "next_cursor");
			rename(node, "emptyText", "empty_text");
			break;
	}
}

function walk(value: unknown, seen: WeakSet<object>): void {
	if (typeof value !== "object" || value === null || seen.has(value)) return;
	seen.add(value);
	if (isNode(value)) fix(value);
	for (const child of Object.values(value)) walk(child, seen);
}

/** Fills in the Block Kit fields a plugin's admin response spells the old way. */
export function normalizeAdminResponse(response: unknown): unknown {
	try {
		walk(response, new WeakSet());
	} catch {
		// Leave whatever is left to the host's own validation.
	}
	return response;
}

/** Hands a "Load more" action from an adapted table back in the shape its plugin reads. */
export function adaptAdminRequest(input: unknown): unknown {
	if (
		!isNode(input) ||
		input.type !== "block_action" ||
		typeof input.action_id !== "string" ||
		!input.action_id.startsWith(CURSOR_ACTION_PREFIX)
	) {
		return input;
	}
	const { value } = input;
	return {
		...input,
		action_id: input.action_id.slice(CURSOR_ACTION_PREFIX.length),
		value: isNode(value) ? value.cursor : value,
	};
}
