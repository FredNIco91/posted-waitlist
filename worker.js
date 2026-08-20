export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/verify-turnstile" && request.method === "POST") {
      return verifyTurnstile(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

// Verifies a Cloudflare Turnstile token server-side, using the Secret Key.
// The Secret Key lives ONLY in this Worker's environment variables — never
// in the repo — so it is safe from anyone reading the source.
async function verifyTurnstile(request, env) {
  let token;
  try {
    ({ token } = await request.json());
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid request body" }), { status: 400 });
  }
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: "Missing token" }), { status: 400 });
  }

  const secretKey = env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), { status: 500 });
  }

  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: secretKey, response: token }),
  });
  const verifyData = await verifyRes.json();

  return new Response(JSON.stringify({ success: verifyData.success === true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
