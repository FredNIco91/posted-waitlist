// Verifies a Cloudflare Turnstile token server-side, using the Secret Key.
// The Secret Key lives ONLY in Netlify's environment variables — never in
// this repo — so it is safe from anyone reading the source.
export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), { status: 405 });
  }

  let token;
  try {
    ({ token } = await req.json());
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid request body" }), { status: 400 });
  }
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: "Missing token" }), { status: 400 });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
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
};
