export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const usage = `tofile — テキストをファイルとしてダウンロードするサービスです。

使い方:
  POST ${url.origin}/
  リクエストボディにテキストを入れて送信すると .txt ファイルとしてダウンロードできます。

オプション:
  ?filename=<name>  ダウンロードするファイル名を指定（省略時: note-YYYYMMDD-HHmmss.txt）

例:
  curl -X POST "${url.origin}/?filename=memo" -d "メモ内容" -O -J
`;
      return new Response(usage, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const text = await request.text();
    if (!text) {
      return new Response("Bad Request: empty body", { status: 400 });
    }

    const url = new URL(request.url);
    const filenameParam = url.searchParams.get("filename");
    const filename = filenameParam ? sanitizeFilename(filenameParam) : timestampFilename();

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  },
} satisfies ExportedHandler;

function timestampFilename(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const y = now.getUTCFullYear();
  const mo = pad(now.getUTCMonth() + 1);
  const d = pad(now.getUTCDate());
  const h = pad(now.getUTCHours());
  const mi = pad(now.getUTCMinutes());
  const s = pad(now.getUTCSeconds());
  return `note-${y}${mo}${d}-${h}${mi}${s}.txt`;
}

function sanitizeFilename(name: string): string {
  // Strip path separators and ensure .txt extension
  const base = name.replace(/[/\\]/g, "_").replace(/\.txt$/i, "");
  return `${base}.txt`;
}
