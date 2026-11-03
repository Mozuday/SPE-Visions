import { corsHeaders, json } from "../_shared/cors.ts";

// Editor-only type shim; Deno provides these at runtime.
declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = req.headers.get("Authorization");

  if (!url || !anonKey || !serviceKey) {
    return json({ error: "Server is not configured" }, 500);
  }

  if (!authorization) {
    return json({ error: "Please log in first" }, 401);
  }

  // Who is calling? Ask Supabase Auth using the caller's own token.
  const userResponse = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: authorization },
  });

  if (!userResponse.ok) {
    return json({ error: "Please log in first" }, 401);
  }

  const user = await userResponse.json();

  if (!user?.id) {
    return json({ error: "Please log in first" }, 401);
  }

  let courseId = "";

  try {
    courseId = String((await req.json()).courseId ?? "");
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!UUID.test(courseId)) {
    return json({ error: "Invalid course" }, 400);
  }

  const serviceHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  // The course must exist, be published, and really be free.
  const courseResponse = await fetch(
    `${url}/rest/v1/courses?id=eq.${courseId}&is_published=eq.true&select=id,price`,
    { headers: serviceHeaders }
  );

  const courses = courseResponse.ok ? await courseResponse.json() : [];

  if (!Array.isArray(courses) || courses.length === 0) {
    return json({ error: "Course not found" }, 404);
  }

  const price = courses[0].price;

  if (price !== null && Number(price) > 0) {
    return json({ error: "This course is not free" }, 403);
  }

  // Create the enrollment; do nothing if it already exists.
  const insertResponse = await fetch(
    `${url}/rest/v1/enrollments?on_conflict=user_id,course_id`,
    {
      method: "POST",
      headers: {
        ...serviceHeaders,
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify({
        user_id: user.id,
        course_id: courseId,
        source: "free",
      }),
    }
  );

  if (!insertResponse.ok) {
    console.error("Enrollment insert failed:", await insertResponse.text());
    return json({ error: "Couldn't enroll you. Please try again." }, 500);
  }

  return json({ ok: true });
});