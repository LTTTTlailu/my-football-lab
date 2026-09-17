import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { userData } from "../../../db/schema";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });

  const [row] = await getDb().select().from(userData).where(eq(userData.userId, user.userId)).limit(1);
  return Response.json({ user: { email: user.email, name: user.displayName }, state: row ? JSON.parse(row.payload) : {} });
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const state = await request.json();
  const payload = JSON.stringify(state);
  if (payload.length > 900_000) return Response.json({ error: "同步数据过大" }, { status: 413 });

  await getDb()
    .insert(userData)
    .values({ userId: user.userId, email: user.email, payload, updatedAt: Date.now() })
    .onConflictDoUpdate({ target: userData.userId, set: { email: user.email, payload, updatedAt: Date.now() } });
  return Response.json({ saved: true, updatedAt: Date.now() });
}
