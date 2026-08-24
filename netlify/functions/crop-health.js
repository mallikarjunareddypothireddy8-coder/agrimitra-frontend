// Proxies the existing frontend crop-health request to the trained FastAPI model.
// Configure CROP_HEALTH_API_URL in Netlify, for example:
//   https://your-cloud-run-service-xxxxx.a.run.app

export default async (request) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), { status: 405, headers });
  }

  const backendUrl = process.env.CROP_HEALTH_API_URL;
  if (!backendUrl) {
    return new Response(JSON.stringify({ ok: false, error: "crophealth_backend_not_configured" }), { status: 500, headers });
  }

  try {
    const payload = await request.json();
    const upstream = await fetch(`${backendUrl.replace(/\/$/, "")}/crop-health`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await upstream.text();
    return new Response(body, { status: upstream.status, headers });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: "crophealth_backend_unavailable" }), { status: 502, headers });
  }
};
