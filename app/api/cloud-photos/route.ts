import { and, desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { photoFiles } from "../../../db/schema";

function bucket() {
  if (!env.BUCKET) throw new Error("Cloud photo storage is unavailable");
  return env.BUCKET;
}

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  const db = getDb();
  if (!id) {
    const rows = await db.select().from(photoFiles).where(eq(photoFiles.userId, user.userId)).orderBy(desc(photoFiles.createdAt)).limit(30);
    return Response.json({ photos: rows.map((row) => ({ id: row.id, date: row.date, note: row.note, url: `/api/cloud-photos?id=${encodeURIComponent(row.id)}` })) });
  }
  const [row] = await db.select().from(photoFiles).where(and(eq(photoFiles.id, id), eq(photoFiles.userId, user.userId))).limit(1);
  if (!row) return new Response("Not found", { status: 404 });
  const object = await bucket().get(row.objectKey);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "content-type": row.contentType, "cache-control": "private, max-age=300" } });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const date = String(form.get("date") ?? "");
  const note = String(form.get("note") ?? "").slice(0, 500);
  if (!(file instanceof File) || !file.type.startsWith("image/") || !date) return Response.json({ error: "照片或日期无效" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "单张照片不能超过 8MB" }, { status: 413 });
  const id = crypto.randomUUID();
  const objectKey = `${user.userId}/${id}`;
  await bucket().put(objectKey, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  await getDb().insert(photoFiles).values({ id, userId: user.userId, objectKey, filename: file.name || "photo", contentType: file.type, date, note, createdAt: Date.now() });
  return Response.json({ photo: { id, date, note, url: `/api/cloud-photos?id=${encodeURIComponent(id)}` } }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "缺少照片编号" }, { status: 400 });
  const db = getDb();
  const [row] = await db.select().from(photoFiles).where(and(eq(photoFiles.id, id), eq(photoFiles.userId, user.userId))).limit(1);
  if (!row) return Response.json({ deleted: true });
  await bucket().delete(row.objectKey);
  await db.delete(photoFiles).where(and(eq(photoFiles.id, id), eq(photoFiles.userId, user.userId)));
  return Response.json({ deleted: true });
}
