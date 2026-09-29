import { createSandboxRunner as createCloudflareSandboxRunner } from "@emdash-cms/cloudflare/sandbox";
import type { SandboxedPluginInstance, SandboxRunnerFactory } from "emdash";
import { adaptAdminRequest, normalizeAdminResponse } from "./plugin-admin-compat";

// The runner returns the same instance for every load of a plugin version; patch it once.
const patched = new WeakSet<SandboxedPluginInstance>();

// Temporary: repairs admin pages of registry plugins with invalid Block Kit (plugin-admin-compat.ts).
function withAdminCompat(plugin: SandboxedPluginInstance): SandboxedPluginInstance {
	if (patched.has(plugin)) return plugin;
	patched.add(plugin);
	const invokeRoute = plugin.invokeRoute.bind(plugin);
	plugin.invokeRoute = async (routeName, input, request, options) =>
		routeName === "admin"
			? normalizeAdminResponse(await invokeRoute(routeName, adaptAdminRequest(input), request, options))
			: invokeRoute(routeName, input, request, options);
	return plugin;
}

// Temporary EmDash 1.0.1 workaround: the integration never supplies runner limits.
// Remove after https://github.com/emdash-cms/emdash/pull/3383 is released and verified.
// Budget 100: verified in production on 2026-09-29 (a ~51-call admin action succeeded), so
// Cloudflare's 32-Worker-invocations-per-request ceiling doesn't apply per bridge call.
// See docs/plugin-sandbox.md.
export const createSandboxRunner: SandboxRunnerFactory = (options) => {
	const runner = createCloudflareSandboxRunner({
		...options,
		limits: { ...options.limits, subrequests: 100 },
		// Worker Loader caches code AND limits by name; do not reuse a 30-call isolate.
		isolateKey: [options.isolateKey, "lakefront-subrequests-100-v1"].filter(Boolean).join(":"),
	});
	const load = runner.load.bind(runner);
	runner.load = async (manifest, code) => withAdminCompat(await load(manifest, code));
	return runner;
};
