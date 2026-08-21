# API Intelligence Layer — Integration Blueprint

## Objective
Add API discovery and routing capabilities incrementally without breaking existing application behavior.

## Sources used for discovery (never trust blindly)
- Public APIs community catalog: https://github.com/public-apis/public-apis
- PublicAPIs.dev catalog: https://publicapis.dev
- Official provider documentation must be the final authority before enabling any API.

## Architecture
User/Agent -> Capability Router -> Internal Tools -> MCP Registry -> API Registry -> API Gateway -> Provider

Fallback path:
Primary provider -> Secondary provider -> MCP/tool -> approved web source -> explicit failure

## Required components
1. Capability Registry: skills, MCPs, internal tools, APIs and model capabilities.
2. API Registry: metadata, purpose, category, base URL, auth type, cost, rate limits, region, trust score, health, CORS compatibility, official docs URL and fallback priority.
3. Discovery Service: finds candidates from catalogs but never auto-enables unverified providers.
4. Evaluation Service: checks official documentation, HTTPS, authentication, data sensitivity, licensing/ToS, reliability, cost and rate limits.
5. Health Monitor: latency, availability, errors and temporary circuit-breaker state.
6. Tool Router: selects the smallest/most reliable capability for the task.
7. Fallback Router: switches providers on retriable failures.
8. Credential Vault: secrets remain server-side and are never exposed to browser code or logs.
9. Rate Limit / Cost Manager: quotas, budgets, retry/backoff and per-provider limits.
10. Response Normalizer: converts provider-specific responses into stable internal schemas.
11. Cache: only where freshness and data policy allow it.
12. Observability: provider chosen, latency, cost, status, fallback and correlation id; redact secrets and sensitive payloads.

## CORS / Browser policy
Reference: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Guides/CORS

Default rule: browser clients call our backend/API gateway. The backend calls third-party APIs.

Do NOT solve CORS by globally enabling `Access-Control-Allow-Origin: *`.

Use an explicit origin allowlist per environment. Handle OPTIONS/preflight correctly. Allow only required methods and headers. Never combine wildcard origins with credentialed browser requests. API keys and provider secrets must never be shipped to frontend code.

Direct browser -> third-party API calls are allowed only when the provider explicitly supports the required CORS policy, no secret is exposed, and the integration has been reviewed.

## Minimal API Registry schema
```ts
type ApiProvider = {
  id: string;
  name: string;
  category: string;
  capabilities: string[];
  baseUrl: string;
  docsUrl: string;
  auth: 'none' | 'api-key' | 'oauth2' | 'other';
  secretRef?: string;
  cors: 'supported' | 'server-only' | 'unknown';
  cost: 'free' | 'freemium' | 'paid' | 'unknown';
  rateLimit?: string;
  region?: string[];
  trustScore: number;
  enabled: boolean;
  health: 'unknown' | 'healthy' | 'degraded' | 'down';
  fallbackPriority: number;
};
```

## Router rules
- Prefer an existing trusted internal tool/MCP when it already solves the task.
- Do not call an external API merely because it exists in a catalog.
- Prefer official/government sources for authoritative government data.
- Prefer providers with known documentation, stable HTTPS endpoints and clear ToS.
- Never send sensitive data to a provider unless explicitly approved for that data class.
- Apply timeouts, bounded retries with backoff and circuit breakers.
- Record why a provider was selected.

## Incremental rollout
Phase 1 — registry + router interfaces + server-side gateway + CORS allowlist.
Phase 2 — register only APIs required by existing use cases.
Phase 3 — health checks, fallback and normalization.
Phase 4 — discovery/evaluation workflow for proposing new providers.
Phase 5 — cost/quality telemetry and automated ranking.

Do not refactor unrelated working features during this rollout.

## Definition of done for each new API
- Official documentation reviewed.
- Purpose/capabilities documented.
- Auth stored server-side.
- CORS decision documented.
- Timeout/retry/rate-limit behavior configured.
- Input/output schema validated.
- Error mapping and fallback defined.
- Logs redact credentials and sensitive data.
- Health check or operational signal available.
- Tests cover success, provider failure, timeout and malformed response.
