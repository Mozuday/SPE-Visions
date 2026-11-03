import { corsHeaders, json } from "../_shared/cors.ts";

// Editor-only type shim; Deno provides these at runtime.
declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

const IMAGE_FOLDERS = ["courses", "blogs", "portfolio", "services", "misc"];
const IMAGE_FORMATS = "jpg,jpeg,png,webp";
const RESUME_FORMATS = "pdf,doc,docx";
const RESUME_FOLDER = "spe/resumes";

const sha1 = async (text: string) => {
  const buffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(text)
  );

  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

/*
 * Cloudinary signature: sorted "key=value" pairs joined with "&",
 * with the API secret appended, then SHA-1.
 */
const sign = (params: Record<string, string | number>, secret: string) =>
  sha1(
    Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&") + secret
  );

/*
 * Ask the database whether the caller is an admin, using the
 * caller's own token so RLS and auth.uid() apply.
 */
const isAdmin = async (req: Request): Promise<boolean> => {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = req.headers.get("Authorization");

  if (!url || !anonKey || !authorization) return false;

  try {
    const response = await fetch(`${url}/rest/v1/rpc/is_admin`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    return response.ok && (await response.json()) === true;
  } catch (err) {
    console.error("is_admin check failed:", err);
    return false;
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
  const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
  const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

  // Report which secret is missing (names only, never values).
  const missing = [
    !cloudName && "CLOUDINARY_CLOUD_NAME",
    !apiKey && "CLOUDINARY_API_KEY",
    !apiSecret && "CLOUDINARY_API_SECRET",
  ].filter(Boolean);

  if (missing.length > 0 || !cloudName || !apiKey || !apiSecret) {
    console.error("Missing secrets:", missing.join(", "));
    return json({ error: "Cloudinary is not configured", missing }, 500);
  }

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // ---------------------------------------------------------
  // Upload signature
  // ---------------------------------------------------------
  if (body.action === "sign") {
    // Resumes: anyone may upload, but the file is stored privately.
    if (body.purpose === "resume") {
      const fields = {
        allowed_formats: RESUME_FORMATS,
        folder: RESUME_FOLDER,
        type: "authenticated",
      };

      const signature = await sign({ ...fields, timestamp }, apiSecret);

      return json({
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        apiKey,
        timestamp,
        signature,
        fields,
      });
    }

    // Images: admins only.
    if (body.purpose === "image") {
      if (!(await isAdmin(req))) {
        return json({ error: "Forbidden" }, 403);
      }

      const folder = IMAGE_FOLDERS.includes(String(body.folder))
        ? String(body.folder)
        : "misc";

      const fields = {
        allowed_formats: IMAGE_FORMATS,
        folder: `spe/${folder}`,
      };

      const signature = await sign({ ...fields, timestamp }, apiSecret);

      return json({
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        apiKey,
        timestamp,
        signature,
        fields,
      });
    }

    return json({ error: "Unknown purpose" }, 400);
  }

  // ---------------------------------------------------------
  // Short-lived download link for a private resume (admins only)
  // ---------------------------------------------------------
  if (body.action === "resume-link") {
    if (!(await isAdmin(req))) {
      return json({ error: "Forbidden" }, 403);
    }

    const publicId = String(body.publicId ?? "");

    if (!publicId.startsWith(`${RESUME_FOLDER}/`) || publicId.includes("..")) {
      return json({ error: "Invalid file" }, 400);
    }

    const params = {
      expires_at: timestamp + 300,
      public_id: publicId,
      timestamp,
      type: "authenticated",
    };

    const signature = await sign(params, apiSecret);

    const query = new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ),
      api_key: apiKey,
      signature,
    });

    return json({
      url: `https://api.cloudinary.com/v1_1/${cloudName}/raw/download?${query}`,
    });
  }

  return json({ error: "Unknown action" }, 400);
});