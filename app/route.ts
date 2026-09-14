import prototypeHtml from "./prototype.html?raw";

export async function GET() {
  return new Response(prototypeHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
