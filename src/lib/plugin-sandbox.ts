import { createSandboxRunner as createCloudflareSandboxRunner } from "@emdash-cms/cloudflare/sandbox";
import type { SandboxRunnerFactory } from "emdash";

// Temporary EmDash 1.0.1 workaround: the integration never supplies runner limits.
// Remove after https://github.com/emdash-cms/emdash/pull/3383 is released and verified.
// Budget 100 probes whether Cloudflare's 32-Worker-invocations-per-request ceiling
// really applies per bridge call (service-bindings docs say so; untested here).
// If it does, calls past ~30 fail with a platform exception just like at 30 —
// no new failure mode. If it doesn't, AI Search admin flows (~26–48 calls) fit.
export const createSandboxRunner: SandboxRunnerFactory = (options) =>
	createCloudflareSandboxRunner({
		...options,
		limits: { ...options.limits, subrequests: 100 },
		// Worker Loader caches code AND limits by name; do not reuse a 30-call isolate.
		isolateKey: [options.isolateKey, "lakefront-subrequests-100-v1"].filter(Boolean).join(":"),
	});
