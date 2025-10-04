You are an expert TypeScript/Node.js engineer. Your task is to generate a complete TypeScript project that implements a **locally hosted MCP server** which mimics the functionality of `@morph-llm/morph-fast-apply`, but instead of using a built-in Morph backend, forwards requests to the Morph models hosted on **OpenRouter** (or other base URL). The server should:

- Accept MCP protocol JSON-RPC or HTTP-style requests (whichever MCP spec your target uses) for an `edit_file` tool (or similar) that takes:
  - `target_file`: string path
  - `instructions`: string
  - `editSnippet`: string (lines to change, using `// ... existing code ...` placeholders)
- Read the target file from local disk, embed it in the prompt, call the Morph “fast apply” model via OpenRouter API, get the patched full code, and return it (or write to disk if tool should modify file).
- Support streaming responses if the OpenRouter API supports it.
- Be configurable via environment variables or CLI arguments:
  - `MORPH_API_KEY` (required)
  - `MORPH_BASE_URL` (default `https://openrouter.ai/api/v1`)
  - `MORPH_MODEL` (e.g. `"morph/morph-v2"` or `"morph/morph-v3-large"` or variants)
- Support both Morph v2 and v3 (i.e. the model name string can include either), so that the same server can work with either backend.
- Provide a CLI entrypoint so users can run `npx my-morph-mcp-server` (or similar) and it starts listening on a localhost port (e.g. 3333) or accept arguments like `--port`.
- Be formatted as a modern npm package (with `package.json`, `tsconfig.json`, `src/` folder, a build step to `dist/`, with modern ESM or hybrid module support).
- Include error handling, logging, and validate inputs.
- Export types for MCP requests and responses in a `types.ts`.
- Be minimal and clean so Codex can generate it with minimal scaffolding.

Write a prompt to Codex that ensures it outputs all necessary files (package.json, tsconfig, src/index.ts, src/server.ts, src/handler.ts, src/types.ts, etc.) with comments, and that it’s ready to publish and run via `npx`.

---

**Prompt to Codex (your input to the code model):**

> “Generate a full TypeScript project skeleton for a local MCP server that proxies Morph “fast apply” via OpenRouter. The project must be publishable to npm, support `npx`, use modern ESM (or hybrid) modules, have a CLI entrypoint, and allow configuration via environment variables or CLI flags: `MORPH_API_KEY`, `MORPH_BASE_URL`, `MORPH_MODEL`, and `--port`. The server shall accept an `edit_file` MCP request (target_file, instructions, editSnippet), read the file, form a prompt around `<code>…</code>\n<update>…</update>`, call OpenRouter’s `/chat/completions` or `/v1/chat/completions` endpoint with appropriate headers (Authorization: Bearer), forward streaming if supported, and return the new code. Include error handling, TypeScript types, logging, and tests stub. Output the full directory structure and file contents.”

---

You can feed that prompt to Codex, and it should produce a full TypeScript project. If you like, I can run through a full example including the generated server code here. Do you want me to generate the full code now using that prompt?
::contentReference[oaicite:0]{index=0}

