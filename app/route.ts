import prototypeHtml from "./prototype.html?raw";
import { getChatGPTUser } from "./chatgpt-auth";

export async function GET() {
  const user = await getChatGPTUser();
  const bootstrap = `<script>window.__FOOTBALL_USER__=${JSON.stringify(user ? { id: user.userId, email: user.email, name: user.displayName } : null).replace(/</g, "\\u003c")};</script>`;
  const html = prototypeHtml.replace("</head>", `${bootstrap}</head>`);
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}
