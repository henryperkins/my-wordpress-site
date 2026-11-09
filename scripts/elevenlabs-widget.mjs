import { existsSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { alexAgentId } from "../src/lib/elevenlabs.ts";

// Match DESIGN.md. The public embed reads this appearance from ElevenLabs.
const appearance = {
	variant: "compact",
	placement: "bottom-right",
	dismissible: true,
	bgColor: "#F7FAF9",
	textColor: "#082A3A",
	btnColor: "#F26B5B",
	btnTextColor: "#082A3A",
	borderColor: "#C1DCE4",
	focusColor: "#075459",
	borderRadius: 20,
	btnRadius: 8,
	avatar: { type: "orb", color1: "#075459", color2: "#73AFBC" },
	actionText: "Alex, AI assistant",
	startCallText: "Talk with Alex",
	expandText: "Chat with Alex",
};

function differingFields(widget) {
	return Object.keys(appearance).filter((field) => !isDeepStrictEqual(widget?.[field], appearance[field]));
}

async function configureWidget() {
	if (!process.env.ELEVENLABS_API_KEY && existsSync(".env.local")) {
		process.loadEnvFile(".env.local");
	}
	if (!process.env.ELEVENLABS_API_KEY) {
		throw new Error("Set ELEVENLABS_API_KEY in .env.local or the local environment.");
	}

	const client = new ElevenLabsClient();
	const agents = client.conversationalAi.agents;
	const agent = await agents.get(alexAgentId);
	const widget = agent.platformSettings?.widget;
	if (!widget || agent.platformSettings?.auth?.enableAuth) {
		throw new Error("Alex must have a public widget for the website embed.");
	}

	if (process.argv.includes("--apply") && differingFields(widget).length > 0) {
		const branchId = agent.mainBranchId;
		if (!branchId || branchId !== agent.branchId) {
			throw new Error("Could not identify Alex's main branch.");
		}

		// An agent update can also publish procedure drafts on the branch.
		const { procedures } = await agents.procedures.list(alexAgentId, branchId);
		if (procedures.some(({ hasDraft }) => hasDraft)) {
			throw new Error("Alex has unpublished procedure edits. Resolve those before applying widget styling.");
		}

		await agents.update(alexAgentId, {
			branchId,
			platformSettings: { widget: appearance },
			versionDescription: "Apply Lakefront Digital widget styling",
		}, { maxRetries: 0 });
	}

	const { widgetConfig } = await agents.widget.get(alexAgentId);
	const differences = differingFields(widgetConfig);
	if (differences.length > 0) {
		throw new Error(`Alex's widget differs from the Lakefront settings in: ${differences.join(", ")}.`);
	}
	console.log("Verified Alex's compact widget with the Lakefront palette.");
}

try {
	await configureWidget();
} catch (error) {
	console.error(error instanceof ElevenLabsError ? `ElevenLabs returned HTTP ${error.statusCode}.` : error.message);
	process.exitCode = 1;
}
