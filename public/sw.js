self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === "/share" && event.request.method === "POST") {
    event.respondWith(handleShare(event.request));
  }
});

async function handleShare(request) {
  try {
    const formData = await request.formData();
    const text = formData.get("text") || formData.get("url") || formData.get("title") || "";

    const filename = timestampFilename();

    // Open or focus the client page and trigger download there
    const clients = await self.clients.matchAll({ type: "window" });
    const client = clients.find((c) => c.focused) || clients[0];

    if (client) {
      client.postMessage({ type: "download", text: String(text), filename });
      return Response.redirect("/", 303);
    }

    // No open client: open a new window and pass data via URL (fallback)
    const params = new URLSearchParams({ text: String(text), filename });
    await self.clients.openWindow(`/?${params.toString()}`);
    return Response.redirect("/", 303);
  } catch (err) {
    const errorText = `Error: ${err?.message ?? String(err)}\n\nStack:\n${err?.stack ?? "(no stack)"}`;
    const filename = `error-${timestampFilename().replace("note-", "")}`;

    const clients = await self.clients.matchAll({ type: "window" });
    const client = clients.find((c) => c.focused) || clients[0];
    if (client) {
      client.postMessage({ type: "download", text: errorText, filename });
      return Response.redirect("/", 303);
    }

    const params = new URLSearchParams({ text: errorText, filename });
    await self.clients.openWindow(`/?${params.toString()}`);
    return Response.redirect("/", 303);
  }
}

function timestampFilename() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const y = now.getUTCFullYear();
  const mo = pad(now.getUTCMonth() + 1);
  const d = pad(now.getUTCDate());
  const h = pad(now.getUTCHours());
  const mi = pad(now.getUTCMinutes());
  const s = pad(now.getUTCSeconds());
  return `note-${y}${mo}${d}-${h}${mi}${s}.txt`;
}
