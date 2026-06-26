# TanStack AI Qwik City Example

Qwik v2/Qwik Router example for validating the `@tanstack/ai-qwik` workspace
package in a full meta-framework app with SSR routing, an OpenAI-backed
`/api/chat` endpoint, client/server tool calling, and approval flows.

Create an `.env` file with `OPENAI_API_KEY` before starting the app locally.

```bash
pnpm --filter @tanstack/ai-qwik build
pnpm --filter ts-qwik-chat build
```
