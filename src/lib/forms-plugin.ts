import { createPlugin as createFormsPlugin } from "@emdash-cms/plugin-forms";
import type { FormsPluginOptions, FormDefinition } from "@emdash-cms/plugin-forms";
import type { ResolvedPlugin, StorageCollection } from "emdash";
import { initialEnquiryForms } from "./enquiry-forms";
import { updateEnquiryTriage, type StoredEnquiry } from "./enquiry-inbox";

/** Official Forms admin/inbox, with Lakefront's existing endpoint handling all public submissions. */
export function createPlugin(options: FormsPluginOptions = {}): ResolvedPlugin {
	const plugin = createFormsPlugin(options);
	const activate = plugin.hooks["plugin:activate"]!;
	const { submit: _submit, definition: _definition, ...routes } = plugin.routes;
	routes["submissions/update"] = {
		...routes["submissions/update"]!,
		handler: async (ctx) => {
			const { id, status, starred, notes } = ctx.input as { id: string; status?: StoredEnquiry["status"]; starred?: boolean; notes?: string };
			const submissions = ctx.storage.submissions as StorageCollection<StoredEnquiry>;
			return { id, ...await updateEnquiryTriage(id, { status, starred, notes }, submissions) };
		},
	};
	return {
		...plugin,
		capabilities: ["email:send"],
		allowedHosts: [],
		routes,
		// These are inbox definitions for CMS-owned Lakefront blocks, not additional public embeds.
		admin: { ...plugin.admin, portableTextBlocks: [] },
		hooks: {
			...plugin.hooks,
			"plugin:activate": {
				...activate,
				handler: async (event, ctx) => {
					const forms = ctx.storage.forms as StorageCollection<FormDefinition>;
					for (const { id, form } of initialEnquiryForms()) {
						await forms.compareAndSet(id, null, form);
					}
					await activate.handler(event, ctx);
				},
			},
		},
	};
}

export default createPlugin;
