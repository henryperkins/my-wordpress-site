import { createSandboxRunner as createCloudflareSandboxRunner } from "@emdash-cms/cloudflare/sandbox";
import type { SandboxRunnerFactory } from "emdash";

// Temporary EmDash 1.0.1 workaround: the integration never supplies runner limits.
// Remove after https://github.com/emdash-cms/emdash/pull/3383 is released and verified.
// A host + plugin leaves at most 30 of Cloudflare's 32 Worker invocations for
// bridge calls. Other plugins and nested callbacks share that request budget.
export const createSandboxRunner: SandboxRunnerFactory = (options) =>
	createCloudflareSandboxRunner({
		...options,
		limits: { ...options.limits, subrequests: 30 },
		// Worker Loader caches code AND limits by name; do not reuse a 10-call isolate.
		isolateKey: [options.isolateKey, "lakefront-subrequests-30-v1"].filter(Boolean).join(":"),
	});
