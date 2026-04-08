import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createId, now, readDB, updateDB } from "@/lib/store";

export const runtime = "nodejs";

const resolveRoom = (slug: string) => {
  const db = readDB();
  const room = db.rooms.find((item) => item.slug === slug);
  return room || null;
};

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const roomSlug = url.searchParams.get("room") || "general";
  const room = resolveRoom(roomSlug);
  if (!room) {
    return NextResponse.json({ messages: [] });
  }

  const db = readDB();
  const messages = db.messages
    .filter((msg) => msg.roomId === room.id)
    .slice(-50)
    .map((msg) => {
      const author = db.users.find((item) => item.id === msg.userId);
      return {
        id: msg.id,
        body: msg.body,
        createdAt: msg.createdAt,
        username: author?.username || "unknown",
      };
    });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const roomSlug = typeof payload.room === "string" ? payload.room : "general";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";

  if (body.length < 1 || body.length > 500) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  updateDB((db) => {
    let room = db.rooms.find((item) => item.slug === roomSlug);
    if (!room) {
      room = {
        id: createId(),
        slug: roomSlug,
        name: roomSlug.toUpperCase(),
        createdAt: now(),
      };
      db.rooms.push(room);
    }

    db.messages.push({
      id: createId(),
      roomId: room.id,
      userId: user.id,
      body,
      createdAt: now(),
    });
  });

  return NextResponse.json({ ok: true });
}
