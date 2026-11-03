import { corsHeaders, json } from "../_shared/cors.ts";

// Editor-only type shim; Deno provides these at runtime.
declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

const basic = (user: string, pass: string) => `Basic ${btoa(`${user}:${pass}`)}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Temporary guard: this function is deleted after the check.
  if (req.headers.get("x-check-key") !== Deno.env.get("CHECK_KEY")) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }

  const results: Record<string, unknown> = {};

  // ---- Telegram ----
  try {
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!token || !chatId) throw new Error("Missing Telegram secrets");

    const me = await (await fetch(`https://api.telegram.org/bot${token}/getMe`)).json();
    if (!me.ok) throw new Error(me.description ?? "getMe failed");

    const sent = await (
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ SPE Visions: Telegram connected.",
        }),
      })
    ).json();
    if (!sent.ok) throw new Error(sent.description ?? "sendMessage failed");

    results.telegram = { ok: true, bot: me.result.username };
  } catch (err) {
    results.telegram = { ok: false, error: String(err) };
  }

  // ---- Cloudinary ----
  try {
    const cloud = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const key = Deno.env.get("CLOUDINARY_API_KEY");
    const secret = Deno.env.get("CLOUDINARY_API_SECRET");

    if (!cloud || !key || !secret) throw new Error("Missing Cloudinary secrets");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/ping`, {
      headers: { Authorization: basic(key, secret) },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);

    results.cloudinary = { ok: true, status: body.status };
  } catch (err) {
    results.cloudinary = { ok: false, error: String(err) };
  }

  // ---- Razorpay (only if secrets are set) ----
  const rzpId = Deno.env.get("RAZORPAY_KEY_ID");
  const rzpSecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (rzpId && rzpSecret) {
    try {
      const res = await fetch("https://api.razorpay.com/v1/orders?count=1", {
        headers: { Authorization: basic(rzpId, rzpSecret) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      results.razorpay = { ok: true, mode: rzpId.startsWith("rzp_test") ? "test" : "live" };
    } catch (err) {
      results.razorpay = { ok: false, error: String(err) };
    }
  } else {
    results.razorpay = { ok: null, note: "Secrets not set yet" };
  }

  return json({ ok: true, results });
});