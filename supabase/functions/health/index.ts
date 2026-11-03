import { corsHeaders, json } from "../_shared/cors.ts";

// Editor-only type shim; Deno provides this at runtime.
// Remove this line once the Deno VS Code extension is working.
declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return json({ ok: true, service: "spe-visions", time: new Date().toISOString() });
});