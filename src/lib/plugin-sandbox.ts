import { createSandboxRunner as createCloudflareSandboxRunner } from "@emdash-cms/cloudflare/sandbox";
import type { SandboxRunnerFactory } from "emdash";

// Temporary EmDash 1.0.1 workaround: the integration never supplies runner limits.
// Remove after https://github.com/emdash-cms/emdash/pull/3383 is released and verified.
// Budget 100: verified in production on 2026-09-29 (a ~51-call admin action succeeded), so
// Cloudflare's 32-Worker-invocations-per-request ceiling doesn't apply per bridge call.
// See docs/plugin-sandbox.md.
export const createSandboxRunner: SandboxRunnerFactory = (options) =>
	createCloudflareSandboxRunner({
		...options,
		limits: { ...options.limits, subrequests: 100 },
		// Worker Loader caches code AND limits by name; do not reuse a 30-call isolate.
		isolateKey: [options.isolateKey, "lakefront-subrequests-100-v1"].filter(Boolean).join(":"),
	});
